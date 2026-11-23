"""Generate 100% native, deep, strict Russian Colonel voice lines locally on GPU via Silero TTS v4 (eugene)."""
import hashlib
import json
import re
import time
import urllib.request
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf
import torch

ROOT = Path(__file__).resolve().parents[2]
LINES_PATH = ROOT / "tools" / "voice" / "sova-lines.json"
OUT_DIR = ROOT / "audio" / "office-chatterbox"
MANIFEST_PATH = ROOT / "audio" / "office" / "manifest.json"
CACHE_DIR = Path.home() / ".cache" / "silero"
MODEL_URL = "https://models.silero.ai/models/tts/ru/v4_ru.pt"
MODEL_PATH = CACHE_DIR / "v4_ru.pt"

SPEAKER = "eugene"   # Глубокий, строгий мужской голос (родной русский)
SR = 48000

def norm_key(text: str) -> str:
    return re.sub(r"\s+", " ", str(text or "")).strip().lower()

def num_ru_digits(text: str) -> str:
    # Silero v4 requires Russian words instead of digits/Latin
    repl = [
        ("SB-4471", "эс-би, четыре, четыре, семь, один"),
        ("№07", "номер ноль семь"),
        ("21:40", "двадцать один сорок"),
        ("18:30", "восемнадцать тридцать"),
        ("18:15", "восемнадцать пятнадцать"),
        ("10:00", "десять ноль-ноль"),
        ("9:10", "девять десять"),
        ("5:30", "пять тридцать"),
        ("14 Bay Street", "четырнадцать, Б+эй-стрит"),
        ("Bay Street", "Б+эй-стрит"),
        ("Mission Street", "М+ишн-стрит"),
        ("Pine Street", "П+айн-стрит"),
        ("квартира 3", "квартира три"),
        ("Small talk", "Смол ток"),
        ("Half past five", "Хаф паст файв"),
        ("Twenty to ten", "Тв+енти ту тен"),
        ("recycling", "рис+айклинг"),
        ("Hi, I'm Alex", "Хай, айм +Алекс"),
        ("I'm new here", "Айм нью х+иа"),
        ("Murmur", "М+ёрмур"),
        ("SwiftBox", "Свифтб+окс"),
        ("IT", "ай-ти"),
        ("harmless", "х+армлесс"),
        ("Friday's fine.", "Фр+айдейз файн."),
        ("Half six", "Хаф сикс"),
        ("half six", "хаф сикс"),
        ("Alex Frost", "+Алекс Фрост"),
        ("Иней", "+Иней"),
        ("успел(а)", "успел"),
        ("«", ""), ("»", ""), ("\"", ""),
        (" — ", ", "), ("—", ", "),
    ]
    t = str(text or "").strip()
    for a, b in repl:
        t = t.replace(a, b)
    # Replace any leftover standalone numbers
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

def write_ogg_chunked(path: Path, samples: np.ndarray, sr: int) -> None:
    tmp = path.with_suffix(".tmp.ogg")
    with sf.SoundFile(str(tmp), mode="w", samplerate=sr, channels=1, format="OGG", subtype="VORBIS") as f:
        for i in range(0, len(samples), 4096):
            f.write(samples[i:i + 4096])
    tmp.replace(path)

def main() -> None:
    t0 = time.time()
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    if not MODEL_PATH.exists() or MODEL_PATH.stat().st_size < 10_000_000:
        print(f"Downloading Silero v4 Russian model -> {MODEL_PATH}...", flush=True)
        urllib.request.urlretrieve(MODEL_URL, str(MODEL_PATH))

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = torch.package.PackageImporter(str(MODEL_PATH)).load_pickle("tts_models", "model")
    model.to(device)
    print(f"Silero v4 Russian loaded on {device} in {time.time()-t0:.1f}s.", flush=True)

    # Remove old sova_*.mp3 / sova_*.ogg
    for old in list(OUT_DIR.glob("sova_*.ogg")) + list(OUT_DIR.glob("sova_*.mp3")):
        old.unlink()

    lines = json.loads(LINES_PATH.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8")) if MANIFEST_PATH.exists() else {}

    for idx, item in enumerate(lines, 1):
        text = item["text"]
        nk = norm_key(text)
        h = hashlib.sha1(f"sova|{nk}".encode("utf-8")).hexdigest()[:12]
        fname = f"sova_{h}.ogg"
        fpath = OUT_DIR / fname
        rel = f"audio/office-chatterbox/{fname}"
        manifest[f"sova|{nk}"] = rel

        spoken = num_ru_digits(text)
        ssml = f'<speak><prosody rate="92%" pitch="low">{spoken}</prosody></speak>'
        with torch.inference_mode():
            wav = model.apply_tts(
                ssml_text=ssml,
                speaker=SPEAKER,
                sample_rate=SR,
                put_accent=True,
                put_yo=True,
            )
        arr = wav.detach().cpu().numpy().astype(np.float32)
        trimmed, _ = librosa.effects.trim(arr, top_db=38, frame_length=1024, hop_length=256)
        if trimmed.size > int(SR * 0.2):
            arr = trimmed
        pad = np.zeros(int(SR * 0.04), dtype=np.float32)
        arr = np.concatenate([pad, arr, pad])
        peak = float(np.max(np.abs(arr)))
        if peak > 1e-6:
            arr = arr * (0.85 / peak)
        write_ogg_chunked(fpath, arr, SR)
        if idx % 20 == 0 or idx == len(lines):
            print(f"[{idx}/{len(lines)}] generated ({time.time()-t0:.1f}s)", flush=True)

    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"DONE! {len(lines)} native Russian Colonel lines (Silero v4 {SPEAKER}, 48kHz) in {time.time()-t0:.1f}s.", flush=True)

if __name__ == "__main__":
    main()
