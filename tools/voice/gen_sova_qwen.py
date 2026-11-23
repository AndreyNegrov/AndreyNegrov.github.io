"""Generate a commanding, deep, native Russian Colonel voice for Sova via Qwen3-TTS 1.7B (VoiceDesign -> Base clone)."""
import gc
import hashlib
import json
import os
import re
import time
from pathlib import Path

os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

import librosa
import numpy as np
import scipy.signal as sig
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

ROOT = Path(__file__).resolve().parents[2]
LINES_PATH = ROOT / "tools" / "voice" / "sova-lines.json"
REFS_DIR = ROOT / "tools" / "voice" / "refs"
OUT_DIR = ROOT / "audio" / "office-chatterbox"
MANIFEST_PATH = ROOT / "audio" / "office" / "manifest.json"
COLONEL_REF = REFS_DIR / "qwen_colonel_ref_v2.wav"

REF_TEXT = (
    "Слушай приказ, Иней! Я прошёл не одну операцию и знаю цену каждой секунды. "
    "Отставить сомнения! Держи легенду жёстко, собирай факты и докладывай чётко, без лишних слов!"
)
COLONEL_INSTRUCT = (
    "A very deep, heavy, raspy, gravelly bass-baritone male voice of a battle-hardened 58-year-old "
    "Russian intelligence colonel giving strict orders in a command center. Commanding, stern, intense, "
    "powerful chest resonance, crisp forceful consonants, zero softness, cinematic Russian military authority."
)

def norm_key(text: str) -> str:
    return re.sub(r"\s+", " ", str(text or "")).strip().lower()

def prep_ru(text: str) -> str:
    t = str(text or "").strip()
    t = t.replace("успел(а)", "успел")
    t = t.replace("Murmur", "Мёрмур")
    t = t.replace("SwiftBox", "СвифтБокс")
    t = t.replace("Bay Street", "Бэй-стрит")
    t = t.replace("SB-4471", "Эс-Би 44-71")
    t = t.replace("harmless", "хармлесс")
    t = re.sub(r"\s+", " ", t).strip()
    return t

def write_ogg_chunked(path: Path, samples: np.ndarray, sr: int) -> None:
    tmp = path.with_suffix(".tmp.ogg")
    with sf.SoundFile(str(tmp), mode="w", samplerate=sr, channels=1, format="OGG", subtype="VORBIS") as f:
        for i in range(0, len(samples), 4096):
            f.write(samples[i:i + 4096])
    tmp.replace(path)

def biquad_peaking(sr: int, f0: float, gain_db: float, q: float = 1.0):
    A = 10 ** (gain_db / 40.0)
    w0 = 2.0 * np.pi * f0 / sr
    alpha = np.sin(w0) / (2.0 * q)
    b0 = 1.0 + alpha * A
    b1 = -2.0 * np.cos(w0)
    b2 = 1.0 - alpha * A
    a0 = 1.0 + alpha / A
    a1 = -2.0 * np.cos(w0)
    a2 = 1.0 - alpha / A
    return np.array([b0 / a0, b1 / a0, b2 / a0]), np.array([1.0, a1 / a0, a2 / a0])

def master_colonel(arr: np.ndarray, sr: int) -> np.ndarray:
    """Cinema command-post vocal mastering: chest bass + mud cut + vocal bite + broadcast compression."""
    x = np.asarray(arr, dtype=np.float64).reshape(-1)
    if x.size < 64:
        return arr.astype(np.float32)
    # 1. Clean sub-rumble highpass at 55 Hz
    b, a = sig.butter(2, 55.0 / (sr / 2.0), btype="highpass")
    x = sig.lfilter(b, a, x)
    # 2. Heavy chest bass warmth (+4.2 dB @ 125 Hz)
    b, a = biquad_peaking(sr, 125.0, +4.2, q=0.85)
    x = sig.lfilter(b, a, x)
    # 3. Clear boxiness (-2.2 dB @ 340 Hz)
    b, a = biquad_peaking(sr, 340.0, -2.2, q=1.1)
    x = sig.lfilter(b, a, x)
    # 4. Authoritative presence & rasp (+3.2 dB @ 2800 Hz)
    b, a = biquad_peaking(sr, 2800.0, +3.2, q=1.0)
    x = sig.lfilter(b, a, x)
    # 5. RMS-driven broadcast compression (punchy, dense, close-mic feel)
    rms = float(np.sqrt(np.mean(x ** 2))) + 1e-8
    x = x * (0.20 / rms)
    # Smooth soft-knee tanh saturation/limiter for cinematic weight
    x = np.tanh(x * 1.45) / np.tanh(1.45)
    peak = float(np.max(np.abs(x)))
    if peak > 1e-6:
        x = x * (0.90 / peak)
    return x.astype(np.float32)

def postprocess(arr: np.ndarray, sr: int, master: bool = True) -> np.ndarray:
    arr = np.asarray(arr, dtype=np.float32).reshape(-1)
    if arr.size == 0:
        return arr
    trimmed, _ = librosa.effects.trim(arr, top_db=36, frame_length=1024, hop_length=256)
    if trimmed.size > int(sr * 0.2):
        arr = trimmed
    if master:
        arr = master_colonel(arr, sr)
    pad = np.zeros(int(sr * 0.04), dtype=np.float32)
    arr = np.concatenate([pad, arr, pad])
    return arr

def stage1_design_colonel() -> tuple[np.ndarray, int]:
    REFS_DIR.mkdir(parents=True, exist_ok=True)
    if COLONEL_REF.exists() and COLONEL_REF.stat().st_size > 20_000:
        data, sr = sf.read(str(COLONEL_REF), dtype="float32")
        print(f"Reusing existing Qwen VoiceDesign Colonel ref: {COLONEL_REF} ({len(data)/sr:.2f}s)", flush=True)
        return data, sr

    t0 = time.time()
    print("Stage 1: Loading Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign on CUDA (bf16)...", flush=True)
    vd = Qwen3TTSModel.from_pretrained(
        "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign",
        device_map="cuda:0",
        dtype=torch.bfloat16,
    )
    print(f"VoiceDesign loaded in {time.time()-t0:.1f}s. Designing Colonel voice...", flush=True)
    wavs, sr = vd.generate_voice_design(
        text=REF_TEXT,
        language="Russian",
        instruct=COLONEL_INSTRUCT,
    )
    ref = postprocess(wavs[0], sr)
    sf.write(str(COLONEL_REF), ref, sr, subtype="PCM_16")
    print(f"Saved commanding Colonel ref -> {COLONEL_REF} ({len(ref)/sr:.2f}s, sr={sr})", flush=True)

    del vd
    gc.collect()
    torch.cuda.empty_cache()
    return ref, sr

def stage2_clone_all(ref_wav: np.ndarray, ref_sr: int) -> None:
    t0 = time.time()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in list(OUT_DIR.glob("sova_*.ogg")) + list(OUT_DIR.glob("sova_*.mp3")):
        old.unlink()

    lines = json.loads(LINES_PATH.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8")) if MANIFEST_PATH.exists() else {}

    print("Stage 2: Loading Qwen/Qwen3-TTS-12Hz-1.7B-Base on CUDA (bf16)...", flush=True)
    base = Qwen3TTSModel.from_pretrained(
        "Qwen/Qwen3-TTS-12Hz-1.7B-Base",
        device_map="cuda:0",
        dtype=torch.bfloat16,
    )
    print(f"Base model loaded in {time.time()-t0:.1f}s. Creating Colonel clone prompt...", flush=True)
    clone_prompt = base.create_voice_clone_prompt(
        ref_audio=(ref_wav, ref_sr),
        ref_text=REF_TEXT,
    )

    t_gen = time.time()
    batch_size = 4
    total = len(lines)
    for start in range(0, total, batch_size):
        chunk = lines[start:start + batch_size]
        texts = [prep_ru(x["text"]) for x in chunk]
        langs = ["Russian"] * len(chunk)
        with torch.inference_mode():
            wavs, sr = base.generate_voice_clone(
                text=texts,
                language=langs,
                voice_clone_prompt=clone_prompt,
            )
        for item, wav in zip(chunk, wavs):
            nk = norm_key(item["text"])
            h = hashlib.sha1(f"sova|{nk}".encode("utf-8")).hexdigest()[:12]
            fname = f"sova_{h}.ogg"
            fpath = OUT_DIR / fname
            arr = postprocess(wav, sr)
            write_ogg_chunked(fpath, arr, sr)
            manifest[f"sova|{nk}"] = f"audio/office-chatterbox/{fname}"

        done = min(total, start + batch_size)
        if done % 16 == 0 or done == total:
            el = time.time() - t_gen
            rate = done / max(0.1, el)
            rem = (total - done) / max(0.05, rate)
            print(f"[{done}/{total}] ({rate:.2f} lines/s, ETA ~{rem/60:.1f}m)", flush=True)
            MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nDONE! {total} Qwen3-TTS Russian Colonel lines in {(time.time()-t0)/60:.1f}m.", flush=True)

def main() -> None:
    ref_wav, ref_sr = stage1_design_colonel()
    stage2_clone_all(ref_wav, ref_sr)

if __name__ == "__main__":
    main()
