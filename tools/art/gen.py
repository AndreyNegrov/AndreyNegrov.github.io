"""Рисует одну картинку через запущенный ComfyUI (модель Z-Image Turbo).

Пример:
  python gen.py --prompt-file cafe.txt --w 1280 --h 720 --seed 7 --out cafe.jpg
"""
import argparse
import io
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid

PORTS = (8188, 8000, 8189, 8001)


def http(url, data=None, timeout=30):
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"} if data else {})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def find_host(explicit):
    if explicit:
        return explicit.rstrip("/")
    for port in PORTS:
        host = f"http://127.0.0.1:{port}"
        try:
            json.loads(http(host + "/system_stats", timeout=3))
            return host
        except Exception:
            continue
    sys.exit("ComfyUI не отвечает: откройте Comfy Desktop и запустите ComfyUI.")


def workflow(prompt, w, h, seed, steps, prefix):
    return {
        "1": {"class_type": "UNETLoader", "inputs": {"unet_name": "z_image_turbo_bf16.safetensors", "weight_dtype": "default"}},
        "2": {"class_type": "CLIPLoader", "inputs": {"clip_name": "qwen_3_4b.safetensors", "type": "lumina2", "device": "default"}},
        "3": {"class_type": "VAELoader", "inputs": {"vae_name": "ae.safetensors"}},
        "4": {"class_type": "ModelSamplingAuraFlow", "inputs": {"model": ["1", 0], "shift": 3.0}},
        "5": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["2", 0], "text": prompt}},
        "6": {"class_type": "ConditioningZeroOut", "inputs": {"conditioning": ["5", 0]}},
        "7": {"class_type": "EmptySD3LatentImage", "inputs": {"width": w, "height": h, "batch_size": 1}},
        "8": {"class_type": "KSampler", "inputs": {
            "model": ["4", 0], "positive": ["5", 0], "negative": ["6", 0], "latent_image": ["7", 0],
            "seed": seed, "steps": steps, "cfg": 1.0, "sampler_name": "res_multistep", "scheduler": "simple", "denoise": 1.0}},
        "9": {"class_type": "VAEDecode", "inputs": {"samples": ["8", 0], "vae": ["3", 0]}},
        "10": {"class_type": "SaveImage", "inputs": {"images": ["9", 0], "filename_prefix": prefix}},
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt")
    ap.add_argument("--prompt-file")
    ap.add_argument("--style-file", help="общий стиль: дописывается в начало описания")
    ap.add_argument("--w", type=int, default=1280)
    ap.add_argument("--h", type=int, default=720)
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--steps", type=int, default=8)
    ap.add_argument("--out", required=True)
    ap.add_argument("--quality", type=int, default=90)
    ap.add_argument("--host")
    a = ap.parse_args()

    prompt = a.prompt or open(a.prompt_file, encoding="utf-8").read()
    if a.style_file:
        prompt = open(a.style_file, encoding="utf-8").read().strip() + "\n\n" + prompt.strip()
    prompt = " ".join(prompt.split())

    host = find_host(a.host)
    body = json.dumps({"prompt": workflow(prompt, a.w, a.h, a.seed, a.steps, "iney/gen"), "client_id": uuid.uuid4().hex}).encode()
    try:
        pid = json.loads(http(host + "/prompt", body))["prompt_id"]
    except urllib.error.HTTPError as e:
        sys.exit("ComfyUI отклонил задание: " + e.read().decode("utf-8", "replace")[:2000])

    t0 = time.time()
    while True:
        hist = json.loads(http(f"{host}/history/{pid}"))
        if pid in hist:
            item = hist[pid]
            status = item.get("status", {})
            if status.get("status_str") == "error":
                sys.exit("Ошибка генерации: " + json.dumps(status.get("messages"), ensure_ascii=False)[:3000])
            images = [im for out in item.get("outputs", {}).values() for im in out.get("images", [])]
            if images:
                break
            if status.get("completed"):
                sys.exit("Генерация закончилась без картинки: " + json.dumps(item, ensure_ascii=False)[:2000])
        if time.time() - t0 > 1200:
            sys.exit("Не дождался картинки за 20 минут.")
        time.sleep(1)

    im = images[0]
    q = urllib.parse.urlencode({"filename": im["filename"], "subfolder": im.get("subfolder", ""), "type": im.get("type", "output")})
    png = http(f"{host}/view?{q}", timeout=120)

    if a.out.lower().endswith((".jpg", ".jpeg")):
        from PIL import Image
        Image.open(io.BytesIO(png)).convert("RGB").save(a.out, "JPEG", quality=a.quality, optimize=True, progressive=True)
    else:
        open(a.out, "wb").write(png)
    print(f"{a.out}  {a.w}x{a.h}  seed={a.seed}  {time.time() - t0:.0f}s")


if __name__ == "__main__":
    main()
