"""Generate expressive, crisp GPU neural voices for all Onboarding lines using Chatterbox TTS."""
import hashlib
import json
import os
import re
import time
from pathlib import Path

os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

import librosa
import numpy as np
import soundfile as sf
import torch
from chatterbox.tts import ChatterboxTTS

ROOT = Path(__file__).resolve().parents[2]
LINES_PATH = ROOT / "tools" / "voice" / "office-lines.json"
REFS_DIR = ROOT / "tools" / "voice" / "refs"
OUT_DIR = ROOT / "audio" / "office-chatterbox"
MANIFEST_PATH = ROOT / "audio" / "office" / "manifest.json"

# Per-character acting parameters:
# exaggeration = emotional expressiveness; cfg_weight = articulation/pacing fidelity (higher = crisper, less mumbled)
CAST = {
    "priya": dict(exaggeration=0.58, cfg_weight=0.56, temperature=0.72),
    "grace": dict(exaggeration=0.52, cfg_weight=0.58, temperature=0.70),
    "tom":   dict(exaggeration=0.42, cfg_weight=0.62, temperature=0.68),
    "max":   dict(exaggeration=0.64, cfg_weight=0.56, temperature=0.74),
    "dev":   dict(exaggeration=0.48, cfg_weight=0.62, temperature=0.68),
    "guest": dict(exaggeration=0.38, cfg_weight=0.64, temperature=0.65),
}

def norm_key(text: str) -> str:
    return re.sub(r"\s+", " ", str(text or "")).strip().lower()

def prep_tts(text: str) -> str:
    t = str(text or "").strip()
    # Expand booking code & letter-by-letter spelling so Chatterbox enunciates every symbol crisply
    t = re.sub(r"\bSB-4471\b", "S B, four four seven one", t)
    t = re.sub(r"\bH-O-L-L-I-S\b", "H, O, L, L, I, S", t)
    t = re.sub(r"\b([A-Z])-([A-Z](?:-[A-Z])+)\b", lambda m: ", ".join(m.group(0).split("-")), t)
    t = t.replace("…", ", ").replace("...", ", ").replace("—", ", ")
    t = re.sub(r"\s+", " ", t).strip()
    if t and t[-1] not in ".!?":
        t += "."
    return t

def write_ogg_chunked(path: Path, samples: np.ndarray, sr: int) -> None:
    tmp = path.with_suffix(".tmp.ogg")
    with sf.SoundFile(str(tmp), mode="w", samplerate=sr, channels=1, format="OGG", subtype="VORBIS") as f:
        for i in range(0, len(samples), 4096):
            f.write(samples[i:i + 4096])
    tmp.replace(path)

def postprocess(arr: np.ndarray, sr: int) -> np.ndarray:
    arr = np.asarray(arr, dtype=np.float32).reshape(-1)
    if arr.size == 0:
        return arr
    # Trim excess leading/trailing silence while keeping natural breathing room
    trimmed, _ = librosa.effects.trim(arr, top_db=36, frame_length=1024, hop_length=256)
    if trimmed.size > int(sr * 0.15):
        arr = trimmed
    # Gentle 40ms pad on both ends so browser audio never clips first/last phoneme
    pad = np.zeros(int(sr * 0.04), dtype=np.float32)
    arr = np.concatenate([pad, arr, pad])
    # Peak normalize to -1.5 dBFS
    peak = float(np.max(np.abs(arr)))
    if peak > 1e-6:
        arr = arr * (0.84 / peak)
    return arr

def looks_bad(arr: np.ndarray, sr: int, text: str) -> bool:
    dur = len(arr) / sr
    words = max(1, len(re.findall(r"[a-zA-Z0-9']+", text)))
    rms = float(np.sqrt(np.mean(arr ** 2))) if arr.size else 0.0
    if rms < 0.015 or dur < 0.35:
        return True
    # Guard against runaway babble/hallucination on short lines
    max_dur = max(4.5, words * 0.72 + 2.8)
    if dur > max_dur:
        return True
    return False

def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    lines = json.loads(LINES_PATH.read_text(encoding="utf-8"))
    # Group by speaker so we only compute speaker conditionals 6 times total!
    lines.sort(key=lambda x: (x["who"], x["text"]))

    t0 = time.time()
    print(f"Loading ChatterboxTTS on CUDA ({torch.cuda.get_device_name(0)})...", flush=True)
    model = ChatterboxTTS.from_pretrained(device="cuda")
    sr = model.sr
    print(f"Model ready in {time.time() - t0:.1f}s (sr={sr}). Processing {len(lines)} lines...", flush=True)

    manifest = {}
    cur_who = None
    done = 0
    skipped = 0
    retried = 0
    t_gen = time.time()

    for idx, item in enumerate(lines, 1):
        who = item["who"]
        text = item["text"]
        nk = norm_key(text)
        h = hashlib.sha1(f"{who}|{nk}".encode("utf-8")).hexdigest()[:12]
        fname = f"{who}_{h}.ogg"
        fpath = OUT_DIR / fname
        rel_url = f"audio/office-chatterbox/{fname}"

        manifest[f"{who}|{nk}"] = rel_url
        if who == "guest" and f"*|{nk}" not in manifest:
            manifest[f"*|{nk}"] = rel_url

        if fpath.exists() and fpath.stat().st_size > 1500:
            skipped += 1
            continue

        cfg = CAST.get(who, CAST["guest"])
        if who != cur_who:
            ref_wav = REFS_DIR / f"{who}.wav"
            model.prepare_conditionals(str(ref_wav), exaggeration=cfg["exaggeration"])
            cur_who = who
            print(f"\n=== Speaker: {who} (ref={ref_wav.name}, exag={cfg['exaggeration']}, cfg={cfg['cfg_weight']}) ===", flush=True)

        tts_text = prep_tts(text)
        best_arr = None
        for attempt in range(3):
            with torch.inference_mode():
                wav = model.generate(
                    tts_text,
                    exaggeration=cfg["exaggeration"],
                    cfg_weight=cfg["cfg_weight"] + (0.04 * attempt),
                    temperature=max(0.55, cfg["temperature"] - 0.06 * attempt),
                    repetition_penalty=1.18,
                )
            arr = postprocess(wav.squeeze(0).detach().cpu().numpy(), sr)
            best_arr = arr
            if not looks_bad(arr, sr, tts_text):
                break
            retried += 1
            print(f"  [retry {attempt+1}] {who}: {tts_text[:55]} (dur={len(arr)/sr:.2f}s)", flush=True)

        write_ogg_chunked(fpath, best_arr, sr)
        done += 1
        if done % 15 == 0 or idx == len(lines):
            el = time.time() - t_gen
            rate = done / max(0.1, el)
            rem = (len(lines) - idx) / max(0.05, rate)
            print(f"[{idx}/{len(lines)}] generated={done} skipped={skipped} retried={retried} ({rate:.2f} lines/s, ETA ~{rem/60:.1f}m)", flush=True)

        # Save manifest periodically so progress is always safe
        if done % 40 == 0:
            MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
            MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nDONE! {len(lines)} lines ({done} newly generated, {skipped} reused, {retried} retries) in {(time.time()-t0)/60:.1f}m.", flush=True)

if __name__ == "__main__":
    main()
