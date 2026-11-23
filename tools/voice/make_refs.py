"""Generate 6 clean studio-quality speaker reference WAVs for Chatterbox TTS voice cloning."""
from pathlib import Path
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

CACHE = Path.home() / ".cache" / "kokoro"
OUT = Path("tools/voice/refs")
OUT.mkdir(parents=True, exist_ok=True)

REFS = {
    "priya": ("af_bella", "en-us",
        "Hi there! Welcome to Murmur in San Francisco. We are a small, friendly team, and we are really excited to have you join us this week."),
    "grace": ("bf_isabella", "en-gb",
        "Oh, lovely to see you again! Let me grab you a cup of tea and show you around the office. Everything you need is right by the front desk."),
    "tom": ("am_onyx", "en-us",
        "Look, I handle the servers, the laptops, and the Wi-Fi. If something breaks, come find me at the corner desk, and please do not touch the cables."),
    "max": ("am_adam", "en-us",
        "Hey! Great to meet you, mate. First day is always a whirlwind, right? Grab a coffee, settle in, and let me know if you need anything at all."),
    "dev": ("am_michael", "en-us",
        "SwiftBox Couriers, Dev speaking. I have your pickup confirmed for Friday evening at twenty-two Mission Street. Just give me the booking number when you are ready."),
    "guest": ("af_heart", "en-us",
        "Please listen carefully and repeat the phrase clearly. Every word is pronounced at a steady, natural pace so you can understand it easily."),
}

kokoro = Kokoro(str(CACHE / "kokoro-v1.0.onnx"), str(CACHE / "voices-v1.0.bin"))
for who, (voice, lang, text) in REFS.items():
    samples, sr = kokoro.create(text, voice=voice, speed=0.96, lang=lang)
    samples = np.asarray(samples, dtype=np.float32)
    peak = float(np.max(np.abs(samples)))
    if peak > 1e-6:
        samples = samples * (0.88 / peak)
    out_path = OUT / f"{who}.wav"
    sf.write(str(out_path), samples, sr, subtype="PCM_16")
    print(f"ref {who:6s} ({voice:11s}) -> {out_path} ({len(samples)/sr:.2f}s)", flush=True)
