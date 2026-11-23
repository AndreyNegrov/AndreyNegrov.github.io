"""Batch generator for Onboarding art via local ComfyUI (reuses gen.py)."""
import argparse
import io
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import uuid

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen  # noqa: E402


def generate_one(host, style_text, prompt_file, w, h, seed, out_path, steps=8, quality=90):
    prompt = open(prompt_file, encoding="utf-8").read().strip()
    if style_text:
        prompt = style_text + "\n\n" + prompt
    prompt = " ".join(prompt.split())

    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    body = json.dumps({
        "prompt": gen.workflow(prompt, w, h, seed, steps, "iney/office"),
        "client_id": uuid.uuid4().hex,
    }).encode()

    try:
        pid = json.loads(gen.http(host + "/prompt", body))["prompt_id"]
    except urllib.error.HTTPError as e:
        raise RuntimeError("ComfyUI rejected job: " + e.read().decode("utf-8", "replace")[:2000])

    t0 = time.time()
    while True:
        hist = json.loads(gen.http(f"{host}/history/{pid}"))
        if pid in hist:
            item = hist[pid]
            status = item.get("status", {})
            if status.get("status_str") == "error":
                raise RuntimeError("Generation error: " + json.dumps(status.get("messages"), ensure_ascii=False)[:3000])
            images = [im for out in item.get("outputs", {}).values() for im in out.get("images", [])]
            if images:
                break
            if status.get("completed"):
                raise RuntimeError("Completed without image: " + json.dumps(item, ensure_ascii=False)[:2000])
        if time.time() - t0 > 600:
            raise RuntimeError("Timed out waiting for ComfyUI")
        time.sleep(0.7)

    im = images[0]
    q = urllib.parse.urlencode({"filename": im["filename"], "subfolder": im.get("subfolder", ""), "type": im.get("type", "output")})
    png = gen.http(f"{host}/view?{q}", timeout=120)

    from PIL import Image
    Image.open(io.BytesIO(png)).convert("RGB").save(out_path, "JPEG", quality=quality, optimize=True, progressive=True)
    print(f"OK  {out_path}  {w}x{h}  seed={seed}  {time.time() - t0:.1f}s", flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--jobs", required=True, help="JSON file with list of jobs")
    ap.add_argument("--only", help="Comma-separated output basenames to generate")
    a = ap.parse_args()

    jobs = json.loads(open(a.jobs, encoding="utf-8").read())
    only = set(x.strip() for x in a.only.split(",") if x.strip()) if a.only else None
    host = gen.find_host(None)
    print(f"Connected to ComfyUI at {host}", flush=True)

    for j in jobs:
        base = os.path.basename(j["out"])
        if only and base not in only:
            continue
        style_text = open(j["style"], encoding="utf-8").read().strip() if j.get("style") else ""
        generate_one(
            host=host,
            style_text=style_text,
            prompt_file=j["prompt"],
            w=j.get("w", 1280),
            h=j.get("h", 720),
            seed=j.get("seed", 11),
            out_path=j["out"],
            steps=j.get("steps", 8),
            quality=j.get("quality", 90),
        )


if __name__ == "__main__":
    main()
