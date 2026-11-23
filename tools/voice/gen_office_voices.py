"""Generate expressive neural MP3 voice lines for Onboarding using edge-tts."""
import asyncio
import hashlib
import json
import os
import re
import time
import edge_tts

CAST = {
    "priya": {"voice": "en-IN-NeerjaExpressiveNeural", "rate": "+5%", "pitch": "+2Hz"},
    "grace": {"voice": "en-GB-SoniaNeural", "rate": "-3%", "pitch": "-3Hz"},
    "tom": {"voice": "en-IE-ConnorNeural", "rate": "-5%", "pitch": "-4Hz"},
    "max": {"voice": "en-AU-WilliamMultilingualNeural", "rate": "+7%", "pitch": "+2Hz"},
    "dev": {"voice": "en-GB-RyanNeural", "rate": "+6%", "pitch": "+0Hz"},
    "guest": {"voice": "en-GB-LibbyNeural", "rate": "+0%", "pitch": "+0Hz"},
}

OUT_DIR = "audio/office"


def norm_key(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip()).lower()


async def synth_one(sem, item, done_counter, total):
    who = item["who"]
    text = item["text"]
    cfg = CAST.get(who, CAST["guest"])
    h = hashlib.sha1(f"{who}|{text}".encode("utf-8")).hexdigest()[:10]
    fname = f"{who}-{h}.mp3"
    fpath = os.path.join(OUT_DIR, fname)

    if not (os.path.exists(fpath) and os.path.getsize(fpath) > 500):
        async with sem:
            last_err = None
            for attempt in range(4):
                try:
                    comm = edge_tts.Communicate(
                        text=text,
                        voice=cfg["voice"],
                        rate=cfg["rate"],
                        pitch=cfg["pitch"],
                    )
                    await comm.save(fpath)
                    if os.path.exists(fpath) and os.path.getsize(fpath) > 500:
                        break
                except Exception as e:
                    last_err = e
                    await asyncio.sleep(1.0 * (attempt + 1))
            else:
                raise RuntimeError(f"Failed to synthesize {who}: {text!r}: {last_err}")

    done_counter[0] += 1
    if done_counter[0] % 40 == 0 or done_counter[0] == total:
        print(f"Progress: {done_counter[0]}/{total}", flush=True)
    return who, text, f"{OUT_DIR}/{fname}"


async def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    lines = json.load(open("tools/voice/office-lines.json", encoding="utf-8"))
    t0 = time.time()
    sem = asyncio.Semaphore(6)
    counter = [0]
    results = await asyncio.gather(*(synth_one(sem, it, counter, len(lines)) for it in lines))

    manifest = {}
    for who, text, rel in results:
        nk = norm_key(text)
        manifest[f"{who}|{nk}"] = rel
        if f"*|{nk}" not in manifest or who == "guest":
            manifest[f"*|{nk}"] = rel

    with open(os.path.join(OUT_DIR, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=0)

    print(f"Done! {len(results)} MP3 files in {time.time() - t0:.1f}s -> {OUT_DIR}/manifest.json", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
