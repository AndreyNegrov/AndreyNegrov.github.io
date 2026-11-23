"""Generate a real 30-second stereo soundtrack using facebook/musicgen-stereo-medium on CUDA GPU."""
import os
import time
import wave
import numpy as np
import torch
from transformers import AutoProcessor, MusicgenForConditionalGeneration

MODEL_ID = "facebook/musicgen-stereo-medium"
PROMPT = (
    "Modern upbeat indie electronic pop instrumental, stylish London spy comedy video game menu soundtrack, "
    "warm Rhodes electric piano, groovy melodic bassline, crisp clean modern drums, bright catchy synth hook, "
    "light playful uplifting atmosphere, clean studio stereo mix, no vocals"
)
OUT_WAV = "audio/office/menu-theme-raw.wav"


def make_seamless_loop(stereo: np.ndarray, sr: int, xfade_s: float = 2.0) -> np.ndarray:
    """Equal-power crossfade tail into head so the track loops smoothly without clicks."""
    n = stereo.shape[1]
    xf = min(int(xfade_s * sr), n // 4)
    if xf < 100:
        return stereo
    t = np.linspace(0.0, np.pi * 0.5, xf, dtype=np.float32)
    fade_in = np.sin(t)[None, :]
    fade_out = np.cos(t)[None, :]
    body = stereo[:, : n - xf].copy()
    tail = stereo[:, n - xf :]
    body[:, :xf] = body[:, :xf] * fade_in + tail * fade_out
    return body


def write_wav_stereo(path: str, stereo: np.ndarray, sr: int):
    # stereo: shape (2, N) float in [-1, 1]
    peak = float(np.max(np.abs(stereo))) or 1.0
    norm = np.clip(stereo * (0.92 / peak), -1.0, 1.0)
    pcm = (norm.T * 32767.0).astype("<i2")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(pcm.tobytes())


def main():
    t0 = time.time()
    print(f"Loading {MODEL_ID} on CUDA...", flush=True)
    processor = AutoProcessor.from_pretrained(MODEL_ID)
    model = MusicgenForConditionalGeneration.from_pretrained(
        MODEL_ID,
        torch_dtype=torch.float16,
    ).to("cuda")
    model.eval()
    print(f"Model loaded in {time.time() - t0:.1f}s. Generating 30s stereo track...", flush=True)

    torch.manual_seed(42)
    inputs = processor(text=[PROMPT], padding=True, return_tensors="pt").to("cuda")
    t1 = time.time()
    # 50 tokens ≈ 1 second -> 1500 tokens ≈ 30 seconds
    with torch.no_grad():
        audio = model.generate(
            **inputs,
            do_sample=True,
            guidance_scale=3.2,
            max_new_tokens=1500,
        )
    print(f"Generated in {time.time() - t1:.1f}s!", flush=True)

    # MusicGen stereo returns shape (batch*2, 1, samples) or (batch, 2, samples)
    arr = audio.detach().float().cpu().numpy()
    if arr.ndim == 3 and arr.shape[0] == 2 and arr.shape[1] == 1:
        stereo = np.stack([arr[0, 0], arr[1, 0]], axis=0)
    elif arr.ndim == 3 and arr.shape[1] == 2:
        stereo = arr[0]
    else:
        mono = arr.reshape(-1)
        stereo = np.stack([mono, mono], axis=0)

    sr = model.config.audio_encoder.sampling_rate
    looped = make_seamless_loop(stereo, sr, xfade_s=2.0)
    write_wav_stereo(OUT_WAV, looped, sr)
    print(f"Saved {OUT_WAV}: {looped.shape[1] / sr:.2f}s @ {sr}Hz", flush=True)


if __name__ == "__main__":
    main()
