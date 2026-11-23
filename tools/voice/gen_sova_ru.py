"""Generate 100% native-accent, deep Russian Colonel voice via ChatterboxMultilingualTTS + silero-stress."""
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
from silero_stress import load_accentor
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

ROOT = Path(__file__).resolve().parents[2]
LINES_PATH = ROOT / "tools" / "voice" / "sova-lines.json"
REFS_DIR = ROOT / "tools" / "voice" / "refs"
OUT_DIR = ROOT / "audio" / "office-chatterbox"
MANIFEST_PATH = ROOT / "audio" / "office" / "manifest.json"
SILERO_MODEL = Path.home() / ".cache" / "silero" / "v4_ru.pt"

def norm_key(text: str) -> str:
    return re.sub(r"\s+", " ", str(text or "")).strip().lower()

def prep_ru_base(text: str) -> str:
    repl = [
        ("SB-4471", "эс-би, четыре, четыре, семь, один"),
        ("№07", "номер ноль семь"),
        ("21:40", "двадцать один сорок"),
        ("18:30", "восемнадцать тридцать"),
        ("18:15", "восемнадцать пятнадцать"),
        ("10:00", "десять ноль-ноль"),
        ("9:10", "девять десять"),
        ("5:30", "пять тридцать"),
        ("14 Bay Street", "четырнадцать, Бэй-стрит"),
        ("Bay Street", "Бэй-стрит"),
        ("Mission Street", "Мишн-стрит"),
        ("Pine Street", "Пайн-стрит"),
        ("квартира 3", "квартира три"),
        ("Small talk", "Смол ток"),
        ("Half past five", "Хаф паст файв"),
        ("Twenty to ten", "Твенти ту тен"),
        ("recycling", "рисайклинг"),
        ("Hi, I'm Alex", "Хай, айм Алекс"),
        ("I'm new here", "Айм нью хиа"),
        ("Murmur", "Мёрмур"),
        ("SwiftBox", "Свифтбокс"),
        ("IT", "ай-ти"),
        ("harmless", "хармлесс"),
        ("Friday's fine.", "Фрайдейз файн."),
        ("Half six", "Хаф сикс"),
        ("half six", "хаф сикс"),
        ("Alex Frost", "Алекс Фрост"),
        ("успел(а)", "успел"),
        ("«", ""), ("»", ""), ("\"", ""),
        (" — ", ", "), ("—", ", "),
    ]
    t = str(text or "").strip()
    for a, b in repl:
        t = t.replace(a, b)
    nums = {
        "0": "ноль", "1": "один", "2": "два", "3": "три", "4": "четыре",
        "5": "пять", "6": "шесть", "7": "семь", "8": "восемь", "9": "девять",
        "10": "десять", "22": "двадцать два", "60": "шестьдесят", "100": "сто"
    }
    t = re.sub(r"\b(\d+)\b", lambda m: nums.get(m.group(1), " ".join(nums.get(c, c) for c in m.group(1))), t)
    t = re.sub(r"\s+", " ", t).strip()
    if t and t[-1] not in ".!?":
        t += "."
    return t

def add_unicode_stress(accentor, text: str) -> str:
    stressed = accentor(text)
    # Convert silero-stress "+а" -> "а\u0301" (exact format Chatterbox MTLTokenizer was trained on)
    return re.sub(r"\+([а-яА-ЯёЁ])", lambda m: m.group(1) + "\u0301", stressed)

def build_native_ru_colonel_ref() -> Path:
    ref_out = REFS_DIR / "sova_ru_colonel.wav"
    REFS_DIR.mkdir(parents=True, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    silero = torch.package.PackageImporter(str(SILERO_MODEL)).load_pickle("tts_models", "model")
    silero.to(device)
    ref_text = (
        '<speak><prosody rate="92%" pitch="low">'
        "Слушай внимательно, +Иней. Я видел много операций, но эта требует особой выдержки. "
        "Никакой спешки, никаких лишних вопросов. Держи легенду, запоминай детали и докладывай чётко по факту."
        "</prosody></speak>"
    )
    with torch.inference_mode():
        wav = silero.apply_tts(ssml_text=ref_text, speaker="eugene", sample_rate=48000, put_accent=True, put_yo=True)
    arr = wav.detach().cpu().numpy().astype(np.float32)
    arr24 = librosa.resample(arr, orig_sr=48000, target_sr=24000)
    peak = float(np.max(np.abs(arr24)))
    if peak > 1e-6:
        arr24 = arr24 * (0.88 / peak)
    sf.write(str(ref_out), arr24, 24000, subtype="PCM_16")
    del silero
    torch.cuda.empty_cache()
    print(f"Built NATIVE Russian Colonel ref -> {ref_out} ({len(arr24)/24000:.2f}s)", flush=True)
    return ref_out

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
    trimmed, _ = librosa.effects.trim(arr, top_db=36, frame_length=1024, hop_length=256)
    if trimmed.size > int(sr * 0.2):
        arr = trimmed
    pad = np.zeros(int(sr * 0.04), dtype=np.float32)
    arr = np.concatenate([pad, arr, pad])
    peak = float(np.max(np.abs(arr)))
    if peak > 1e-6:
        arr = arr * (0.84 / peak)
    return arr

def looks_bad(arr: np.ndarray, sr: int, text: str) -> bool:
    dur = len(arr) / sr
    words = max(1, len(re.findall(r"[а-яА-ЯёЁ]+", text)))
    rms = float(np.sqrt(np.mean(arr ** 2))) if arr.size else 0.0
    if rms < 0.015 or dur < 0.45:
        return True
    max_dur = max(6.0, words * 0.85 + 3.2)
    if dur > max_dur:
        return True
    return False

def main() -> None:
    t0 = time.time()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    accentor = load_accentor()
    colonel_ref = build_native_ru_colonel_ref()

    # Clear previous sova_* files so all 105 are generated fresh with native RU ref + stress
    for old in list(OUT_DIR.glob("sova_*.ogg")) + list(OUT_DIR.glob("sova_*.mp3")):
        old.unlink()

    lines = json.loads(LINES_PATH.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8")) if MANIFEST_PATH.exists() else {}

    print(f"Loading ChatterboxMultilingualTTS on CUDA ({torch.cuda.get_device_name(0)})...", flush=True)
    model = ChatterboxMultilingualTTS.from_pretrained(device="cuda")
    model.prepare_conditionals(str(colonel_ref), exaggeration=0.42)
    sr = model.sr
    print(f"Chatterbox RU Colonel ready in {time.time() - t0:.1f}s (sr={sr}). Generating {len(lines)} lines...", flush=True)

    retried = 0
    t_gen = time.time()

    for idx, item in enumerate(lines, 1):
        text = item["text"]
        nk = norm_key(text)
        h = hashlib.sha1(f"sova|{nk}".encode("utf-8")).hexdigest()[:12]
        fname = f"sova_{h}.ogg"
        fpath = OUT_DIR / fname
        rel_url = f"audio/office-chatterbox/{fname}"
        manifest[f"sova|{nk}"] = rel_url

        base_ru = prep_ru_base(text)
        stressed_ru = add_unicode_stress(accentor, base_ru)

        best_arr = None
        for attempt in range(3):
            with torch.inference_mode():
                wav = model.generate(
                    stressed_ru,
                    language_id="ru",
                    exaggeration=0.42,
                    cfg_weight=0.52 + (0.04 * attempt),
                    temperature=max(0.55, 0.70 - 0.06 * attempt),
                    repetition_penalty=1.22,
                )
            arr = postprocess(wav.squeeze(0).detach().cpu().numpy(), sr)
            best_arr = arr
            if not looks_bad(arr, sr, base_ru):
                break
            retried += 1
            print(f"  [retry {attempt+1}] sova: {base_ru[:55]} (dur={len(arr)/sr:.2f}s)", flush=True)

        write_ogg_chunked(fpath, best_arr, sr)
        if idx % 15 == 0 or idx == len(lines):
            el = time.time() - t_gen
            rate = idx / max(0.1, el)
            rem = (len(lines) - idx) / max(0.05, rate)
            print(f"[{idx}/{len(lines)}] retried={retried} ({rate:.2f} lines/s, ETA ~{rem/60:.1f}m)", flush=True)
            MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nDONE! {len(lines)} Chatterbox RU Colonel lines (retried={retried}) in {(time.time()-t0)/60:.1f}m.", flush=True)

if __name__ == "__main__":
    main()
