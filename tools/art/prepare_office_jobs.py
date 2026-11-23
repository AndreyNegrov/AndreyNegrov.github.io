"""Writes all Onboarding prompt files and office-jobs.json with consistent character descriptions."""
import json
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
PROMPTS = os.path.join(ROOT, "prompts")
os.makedirs(PROMPTS, exist_ok=True)
STYLE = "tools/art/style-office-anim.txt"

CHARACTERS = {
    "grace": {
        "seed": 107,
        "base": (
            "Head-and-shoulders portrait centered in frame, face positioned in the upper half. "
            "A fifty-two-year-old British woman office manager with a warm friendly presence, "
            "honey-blonde bob haircut with subtle silver strands, fine laugh lines around her eyes, "
            "stylish tortoiseshell eyeglasses, wearing a cozy slate-blue knitted cardigan over a cream blouse. "
            "{expr} "
            "Soft stylized warm mint-teal and sunlit cream painted background with gentle geometric light shafts, "
            "clean crisp 2D animation character design."
        ),
        "exprs": {
            "happy": "Warm cheerful open smile, eyes crinkling happily behind her glasses, looking directly at the viewer.",
            "sus": "Narrowed suspicious eyes behind her glasses, subtly guarded raised eyebrow, tight skeptical lips, looking directly at the viewer.",
            "worried": "Caught off guard, worried wide eyes behind her glasses, tense anxious frown and slightly parted lips, looking directly at the viewer.",
        },
    },
    "priya": {
        "seed": 204,
        "base": (
            "Head-and-shoulders portrait centered in frame, face positioned in the upper half. "
            "A thirty-year-old British-Indian woman HR lead with energetic modern charisma, "
            "long wavy dark brown hair past her shoulders, expressive dark eyes, small gold hoop earrings, "
            "wearing a sharp coral-magenta tailored blazer over a clean white crew-neck top. "
            "{expr} "
            "Soft stylized warm golden-amber and sunlit apricot painted background with gentle geometric light shafts, "
            "clean crisp 2D animation character design."
        ),
        "exprs": {
            "calm": "Friendly confident professional smile, attentive warm gaze, looking directly at the viewer.",
            "happy": "Bright enthusiastic grin, eyebrows lifted cheerfully, radiating energy, looking directly at the viewer.",
            "sus": "Skeptical raised eyebrow, thoughtful questioning gaze, lips pressed together, looking directly at the viewer.",
        },
    },
    "tom": {
        "seed": 311,
        "base": (
            "Head-and-shoulders portrait centered in frame, face positioned in the upper half. "
            "A thirty-five-year-old Irish male IT engineer, messy tousled copper-red hair, "
            "neat scruffy ginger beard and mustache, slightly tired expressive eyes, "
            "wearing a dark indigo zip hoodie over a charcoal t-shirt. "
            "{expr} "
            "Soft stylized cool periwinkle-blue and soft slate painted background with gentle geometric light shafts, "
            "clean crisp 2D animation character design."
        ),
        "exprs": {
            "calm": "Dry grumpy deadpan expression, slightly furrowed brow, unimpressed gaze, looking directly at the viewer.",
            "happy": "Subtle dry amused smirk, one corner of mouth lifted, relaxed eyes, looking directly at the viewer.",
            "sus": "Squinting suspiciously, deep skeptical frown, head tilted slightly forward, looking directly at the viewer.",
        },
    },
    "max": {
        "seed": 418,
        "base": (
            "Head-and-shoulders portrait centered in frame, face positioned in the upper half. "
            "A thirty-two-year-old Australian male sales lead, sun-tanned warm skin, "
            "styled dark brown hair with a neat quiff, light designer stubble, "
            "wearing a crisp white button-down shirt with the top button open. "
            "{expr} "
            "Soft stylized warm coral-peach and sunlit orange painted background with gentle geometric light shafts, "
            "clean crisp 2D animation character design."
        ),
        "exprs": {
            "calm": "Easygoing charming relaxed half-smile, friendly confident gaze, looking directly at the viewer.",
            "happy": "Big charismatic toothy grin, cheerful lively eyes, looking directly at the viewer.",
            "sus": "Awkward nervous glance, tense uncomfortable tight smile, slightly raised shoulders, looking directly at the viewer.",
        },
    },
    "dev": {
        "seed": 525,
        "base": (
            "Head-and-shoulders portrait centered in frame, face positioned in the upper half. "
            "A twenty-eight-year-old British South Asian male courier dispatcher, "
            "short neat buzz cut, trimmed short black beard, "
            "wearing a bright amber-yellow safety vest over a dark navy t-shirt and a sleek black call-center headset with a thin boom microphone. "
            "{expr} "
            "Soft stylized crisp sky-cyan and cool teal painted background with gentle geometric light shafts, "
            "clean crisp 2D animation character design."
        ),
        "exprs": {
            "calm": "Focused friendly professional expression, attentive slight smile, looking directly at the viewer.",
            "happy": "Warm helpful open smile, cheerful relaxed eyes, looking directly at the viewer.",
        },
    },
    "sova": {
        "seed": 632,
        "base": (
            "Head-and-shoulders portrait centered in frame, face positioned in the upper half. "
            "A sleek stylized animated horned owl spy-handler character, crisp silver-white and deep midnight-indigo plumage, "
            "sharp intelligent glowing amber eyes, subtle ironic raised brow tuft, wearing a minimal dark charcoal spy collar. "
            "{expr} "
            "Soft stylized deep twilight-indigo and violet painted background with gentle geometric light shafts, "
            "clean crisp 2D animation character design."
        ),
        "exprs": {
            "calm": "Dry ironic knowing expression, calm sharp gaze looking directly at the viewer.",
        },
    },
}

BACKGROUNDS = [
    (
        "bg-title",
        71,
        "Wide establishing shot of a stylish modern London tech district at twilight night, seen from a high loft terrace. "
        "On the left two-thirds: sleek brick-and-glass startup buildings with warm glowing amber office windows, "
        "iconic modern London skyline silhouettes across the river, glowing streetlamps reflecting on rain-kissed pavement, "
        "and a deep indigo-violet evening sky with luminous twilight clouds. "
        "The right third has calmer darker twilight sky and soft city glow to leave room for UI cards. "
        "Empty of people, crisp sharp architectural detail, rich cinematic 2D animation lighting, zero text or signs anywhere.",
    ),
    (
        "bg-home-dawn",
        82,
        "Wide interior shot of a cozy modern London flat in soft golden-pink early morning dawn light. "
        "On the left two-thirds: a clean wooden desk by a large sash window overlooking London rooftops and a pastel sunrise sky, "
        "an open sleek silver laptop glowing softly with abstract light, a ceramic coffee mug with gentle steam, "
        "a small potted plant, and a notebook with a pen. "
        "The right third shows a calmer sunlit wall with warm morning window shadows to leave room for UI. "
        "Empty of people, crisp sharp focus everywhere, vibrant warm morning palette, zero readable text or logos anywhere.",
    ),
    (
        "bg-office-dusk",
        93,
        "Wide interior shot of a stylish modern London tech startup office at golden-hour sunset dusk. "
        "On the left two-thirds: exposed warm brick wall, tall arched industrial windows glowing with rich orange-magenta sunset clouds over London rooftops, "
        "a glass phone booth, lush indoor plants, birchwood desks with warm desk lamps switched on and softly glowing monitors. "
        "The right third shows a calmer twilight-tinted wall with warm sunset light streaks to leave room for UI. "
        "Empty of people, crisp sharp focus everywhere, cinematic warm dusk and cool indigo shadows, zero readable text or logos anywhere.",
    ),
    (
        "bg-office-night",
        104,
        "Wide interior shot of an empty modern London tech startup office reception on Friday evening at night. "
        "On the left two-thirds: tall arched windows looking out onto deep blue night London lights, "
        "a sleek reception desk lit by a single warm brass desk lamp, a sealed blank brown cardboard box sitting prominently on the counter with clean packing tape, "
        "a dark hallway and glass meeting room glowing softly behind it. "
        "The right third shows calmer deep indigo night shadows and soft ambient glow to leave room for UI. "
        "Empty of people, tense cozy espionage atmosphere, crisp sharp focus everywhere, zero text or labels on the box or walls.",
    ),
]

portrait_jobs = []
for who, cfg in CHARACTERS.items():
    for expr, desc in cfg["exprs"].items():
        fname = f"office-p-{who}-{expr}.txt"
        fpath = os.path.join(PROMPTS, fname)
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(cfg["base"].format(expr=desc))
        portrait_jobs.append({
            "style": STYLE,
            "prompt": f"tools/art/prompts/{fname}",
            "w": 1024,
            "h": 1024,
            "seed": cfg["seed"],
            "out": f"art/office/p-{who}-{expr}.jpg",
        })

bg_jobs = []
for name, seed, desc in BACKGROUNDS:
    fname = f"office-{name}.txt"
    fpath = os.path.join(PROMPTS, fname)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(desc)
    bg_jobs.append({
        "style": STYLE,
        "prompt": f"tools/art/prompts/{fname}",
        "w": 1280,
        "h": 720,
        "seed": seed,
        "out": f"art/office/{name}.jpg",
    })

with open(os.path.join(ROOT, "office-portraits.json"), "w", encoding="utf-8") as f:
    json.dump(portrait_jobs, f, indent=2, ensure_ascii=False)
with open(os.path.join(ROOT, "office-bgs.json"), "w", encoding="utf-8") as f:
    json.dump(bg_jobs, f, indent=2, ensure_ascii=False)

print(f"Wrote {len(portrait_jobs)} portrait jobs and {len(bg_jobs)} background jobs.")
