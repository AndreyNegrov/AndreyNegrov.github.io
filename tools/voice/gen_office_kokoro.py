"""Generate natural local neural voice lines for Onboarding using Kokoro-82M (kokoro-onnx)."""
import hashlib
import json
import os
import re
import time
import urllib.request
import soundfile as sf
from kokoro_onnx import Kokoro

CACHE_DIR = os.path.join(os.path.expanduser("~"), ".cache", "kokoro")
MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx"
VOICES_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin"
MODEL_PATH = os.path.join(CACHE_DIR, "kokoro-v1.0.onnx")
VOICES_PATH = os.path.join(CACHE_DIR, "voices-v1.0.bin")

CAST = {
    "priya": {"voice": "af_bella", "lang": "en-us", "speed": 1.04},
    "grace": {"voice": "bf_isabella", "lang": "en-gb", "speed": 0.94},
    "tom": {"voice": "bm_george", "lang": "en-gb", "speed": 0.93},
    "max": {"voice": "bm_lewis", "lang": "en-gb", "speed": 1.05},
    "dev": {"voice": "bm_fable", "lang": "en-gb", "speed": 1.04},
    "guest": {"voice": "bf_emma", "lang": "en-gb", "speed": 0.98},
}

OUT_DIR = "audio/office-kokoro"


def download(url: str, dst: str):
    if os.path.exists(dst) and os.path.getsize(dst) > 1_000_000:
        return
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    print(f"Downloading {os.path.basename(dst)}...", flush=True)
    tmp = dst + ".part"
    urllib.request.urlretrieve(url, tmp)
    os.replace(tmp, dst)
    print(f"Downloaded {os.path.basename(dst)} ({os.path.getsize(dst) / 1e6:.1f} MB)", flush=True)


def norm_key(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip()).lower()


def main():
    download(MODEL_URL, MODEL_PATH)
    download(VOICES_URL, VOICES_PATH)

    print("Loading Kokoro-82M...", flush=True)
    kokoro = Kokoro(MODEL_PATH, VOICES_PATH)
    avail = set(kokoro.get_voices())
    for who, cfg in CAST.items():
        if cfg["voice"] not in avail:
            raise RuntimeError(f"Voice {cfg['voice']} for {who} not found in {sorted(avail)}")

    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs("audio/office", exist_ok=True)
    lines = json.load(open("tools/voice/office-lines.json", encoding="utf-8"))

    t0 = time.time()
    manifest = {}
    for idx, it in enumerate(lines, 1):
        who = it["who"]
        text = it["text"]
        cfg = CAST.get(who, CAST["guest"])
        h = hashlib.sha1(f"kokoro|{who}|{cfg['voice']}|{text}".encode("utf-8")).hexdigest()[:10]
        fname = f"{who}-{h}.ogg"
        fpath = os.path.join(OUT_DIR, fname)

        if not (os.path.exists(fpath) and os.path.getsize(fpath) > 500):
            samples, sr = kokoro.create(text, voice=cfg["voice"], speed=cfg["speed"], lang=cfg["lang"])
            sf.write(fpath, samples, sr, format="OGG", subtype="VORBIS")

        rel = f"{OUT_DIR}/{fname}"
        nk = norm_key(text)
        manifest[f"{who}|{nk}"] = rel
        if f"*|{nk}" not in manifest or who == "guest":
            manifest[f"*|{nk}"] = rel

        if idx % 25 == 0 or idx == len(lines):
            print(f"Progress: {idx}/{len(lines)} ({time.time() - t0:.1f}s)", flush=True)

    with open("audio/office/manifest.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=0)

    print(f"Done! {len(lines)} Kokoro OGG files in {time.time() - t0:.1f}s -> audio/office/manifest.json", flush=True)


if __name__ == "__main__":
    main()
