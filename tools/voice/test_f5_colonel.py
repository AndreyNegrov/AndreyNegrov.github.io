"""Download Misha24-10/F5-TTS_RUSSIAN (v2 accent-tuned) and generate 2 sample Russian Colonel clips."""
import os
import time
from pathlib import Path

os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

import soundfile as sf
from huggingface_hub import hf_hub_download
from silero_stress import load_accentor
from f5_tts.api import F5TTS

ROOT = Path(__file__).resolve().parents[2]
REFS = ROOT / "tools" / "voice" / "refs"

t0 = time.time()
print("Downloading F5-TTS_RUSSIAN v2 checkpoint & vocab...", flush=True)
ckpt = hf_hub_download("Misha24-10/F5-TTS_RUSSIAN", "F5TTS_v1_Base_v2/model_last_inference.safetensors")
vocab = hf_hub_download("Misha24-10/F5-TTS_RUSSIAN", "F5TTS_v1_Base/vocab.txt")
print(f"Downloaded in {time.time()-t0:.1f}s. Loading F5TTS on CUDA...", flush=True)

accentor = load_accentor()
f5 = F5TTS(model="F5TTS_v1_Base", ckpt_file=ckpt, vocab_file=vocab, device="cuda")

TEST_RAW = "Иней, доброе утро. Кремниевая долина, Сан-Франциско, стартап Мёрмур. Кто-то внутри продаёт прототип. Сделка в эту пятницу. Найди: кто, где и когда."
TEST_STRESSED = accentor(TEST_RAW)
print("Stressed test text:", TEST_STRESSED, flush=True)

TAKES = [
    ("f5_colonel_1.wav",
     REFS / "qwen_colonel_ref_v2.wav",
     accentor("Слушай приказ, Иней! Я прошёл не одну операцию и знаю цену каждой секунды. Отставить сомнения! Держи легенду жёстко, собирай факты и докладывай чётко, без лишних слов!")),
    ("f5_colonel_2.wav",
     REFS / "colonel_smoky_3.wav",
     accentor("Иней, доброе утро. Слушай меня внимательно. Я видел немало таких дел. Не торопись. Держи легенду, запоминай мелочи, и не задавай лишних вопросов.")),
]

for out_name, ref_wav, ref_txt in TAKES:
    t1 = time.time()
    wav, sr, _ = f5.infer(
        ref_file=str(ref_wav),
        ref_text=ref_txt,
        gen_text=TEST_STRESSED,
        speed=0.92,
        nfe_step=32,
        cfg_strength=2.0,
    )
    out_path = REFS / out_name
    sf.write(str(out_path), wav, sr, subtype="PCM_16")
    print(f"Saved {out_name} ({len(wav)/sr:.2f}s) in {time.time()-t1:.1f}s", flush=True)

print(f"DONE in {time.time()-t0:.1f}s", flush=True)
