"""Render a light, bright, modern Indie-Pop / Chill-Electronic menu theme for Onboarding (114 BPM, G major, stereo OGG)."""
import os
import numpy as np
import soundfile as sf

SR = 44100
BPM = 114.0
BEAT = 60.0 / BPM
STEP = BEAT / 4.0  # 16th note
BARS = 16
STEPS = BARS * 16  # 256 steps (~33.68s seamless loop)
DUR = STEPS * STEP
N_SAMPLES = int(round(DUR * SR))

rng = np.random.default_rng(888)


def midi_to_hz(m):
    return 440.0 * (2.0 ** ((m - 69) / 12.0))


def add_stereo(buf, sig_l, sig_r, start_s):
    i0 = int(round(start_s * SR))
    n = len(sig_l)
    idx = (np.arange(n) + i0) % N_SAMPLES
    buf[0, idx] += sig_l
    buf[1, idx] += sig_r


def lowpass_fft(x, cutoff_hz, order=2):
    n = len(x)
    freqs = np.fft.rfftfreq(n, d=1.0 / SR)
    X = np.fft.rfft(x)
    H = 1.0 / (1.0 + (freqs / cutoff_hz) ** (2 * order))
    return np.fft.irfft(X * H, n=n)


def highpass_fft(x, cutoff_hz):
    return x - lowpass_fft(x, cutoff_hz, order=1)


def bandpass_fft(x, lo_hz, hi_hz):
    return lowpass_fft(highpass_fft(x, lo_hz), hi_hz, order=1)


def synth_warm_ep(chord, dur, vel=0.17):
    """Silky, bright modern indie-pop electric piano chord."""
    n = int(round((dur + 0.45) * SR))
    t = np.arange(n) / SR
    l = np.zeros(n)
    r = np.zeros(n)
    for idx, m in enumerate(chord):
        f = midi_to_hz(m)
        s = (
            np.sin(2 * np.pi * f * t) * np.exp(-t * 1.9)
            + np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 7.5) * 0.24
            + np.sin(2 * np.pi * f * 3 * t) * np.exp(-t * 14.0) * 0.08
            + np.sin(2 * np.pi * f * 7 * t) * np.exp(-t * 32.0) * 0.04
        )
        pan = -0.45 + 0.9 * (idx / max(1, len(chord) - 1))
        # Subtle rolled chord feel
        off = int(idx * 0.014 * SR)
        m_len = n - off
        if m_len > 0:
            l[off:] += s[:m_len] * (0.5 - 0.32 * pan)
            r[off:] += s[:m_len] * (0.5 + 0.32 * pan)
    na = max(1, int(0.008 * SR))
    nr = max(1, int(0.30 * SR))
    e = np.ones(n)
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] = np.linspace(1, 0, nr)
    v = vel / (len(chord) ** 0.5)
    return l * e * v, r * e * v


def synth_round_bass(midi, dur, vel=0.34):
    """Clean, warm, bouncy indie-pop bass (not heavy or aggressive)."""
    n = int(round((dur + 0.07) * SR))
    t = np.arange(n) / SR
    f = midi_to_hz(midi)
    sig = (
        np.sin(2 * np.pi * f * t) * 0.82
        + np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 6.5) * 0.26
        + np.sin(2 * np.pi * f * 3 * t) * np.exp(-t * 14.0) * 0.08
    )
    e = np.exp(-t * 2.8)
    na = max(1, int(0.006 * SR))
    nr = max(1, int(0.05 * SR))
    e[:na] *= np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    out = np.tanh(sig * 1.15) * e * vel
    return out, out


def synth_bright_pluck(midi, dur, vel=0.22, pan=0.0):
    """Light, airy modern pop marimba/kalimba-bell lead."""
    n = int(round((dur + 0.32) * SR))
    t = np.arange(n) / SR
    f = midi_to_hz(midi)
    s = (
        np.sin(2 * np.pi * f * t) * np.exp(-t * 3.8) * 0.78
        + np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 10.0) * 0.26
        + np.sin(2 * np.pi * f * 3 * t) * np.exp(-t * 20.0) * 0.08
        + np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 34.0) * 0.05
    )
    na = max(1, int(0.004 * SR))
    s[:na] *= np.linspace(0, 1, na)
    sig = s * vel
    return sig * (0.5 - 0.32 * pan), sig * (0.5 + 0.32 * pan)


def synth_silky_lead(midi, dur, vel=0.18, slide_from=None, pan=0.0):
    """Gentle, warm, smiling modern synth-flute / soft bell lead for Section B."""
    n = int(round((dur + 0.30) * SR))
    t = np.arange(n) / SR
    f1 = midi_to_hz(midi)
    if slide_from is not None:
        f0 = midi_to_hz(slide_from)
        f_inst = f1 + (f0 - f1) * np.exp(-t * 28.0)
    else:
        f_inst = np.full(n, f1)
    vib = 1.0 + 0.003 * np.sin(2 * np.pi * 5.0 * t) * np.clip((t - 0.12) / 0.18, 0, 1)
    ph = 2 * np.pi * np.cumsum(f_inst * vib) / SR
    s = np.sin(ph) * 0.80 + np.sin(2 * ph) * 0.20 * np.exp(-t * 5.0)
    breath = bandpass_fft(rng.normal(0, 1, n), 2200, 5200) * np.exp(-t * 18.0) * 0.035
    na = max(1, int(0.016 * SR))
    nr = max(1, int(0.22 * SR))
    e = np.exp(-t * 2.2)
    e[:na] *= np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    sig = (s + breath) * e * vel
    return sig * (0.5 - 0.3 * pan), sig * (0.5 + 0.3 * pan)


def synth_airy_pad(chord, dur, vel=0.042):
    n = int(round((dur + 0.6) * SR))
    t = np.arange(n) / SR
    l = np.zeros(n)
    r = np.zeros(n)
    for idx, m in enumerate(chord):
        f = midi_to_hz(m)
        s1 = np.sin(2 * np.pi * f * 0.9985 * t)
        s2 = np.sin(2 * np.pi * f * 1.0015 * t)
        l += s1 * (0.65 if idx % 2 == 0 else 0.35)
        r += s2 * (0.35 if idx % 2 == 0 else 0.65)
    na = max(1, int(0.35 * SR))
    nr = max(1, int(0.45 * SR))
    e = np.ones(n)
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] = np.linspace(1, 0, nr)
    return l * e * vel, r * e * vel


def synth_soft_kick(vel=0.44):
    """Warm, friendly, rounded kick (not club-heavy)."""
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    freq = 50.0 + 85.0 * np.exp(-t * 40.0)
    ph = 2 * np.pi * np.cumsum(freq) / SR
    sig = np.sin(ph) * np.exp(-t * 16.0) * vel
    return sig, sig


def synth_soft_snap(vel=0.20):
    """Light, crisp modern finger snap + soft brush."""
    n = int(0.11 * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * 75.0) + 0.7 * np.exp(-np.maximum(0, t - 0.009) * 48.0) * (t >= 0.009)
    nl = bandpass_fft(rng.normal(0, 1, n), 1800, 6800) * env
    nr = bandpass_fft(rng.normal(0, 1, n), 1800, 6800) * env
    pop = np.sin(2 * np.pi * 1150 * t) * np.exp(-t * 95.0) * 0.28
    return (nl * 0.4 + pop) * vel, (nr * 0.4 + pop) * vel


def synth_shaker(vel=0.052, accent=False, pan=0.2):
    dur = 0.065 if accent else 0.038
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.sin(np.pi * t / dur) ** 1.5
    noise = bandpass_fft(rng.normal(0, 1, n), 5500, 12000) * env
    return noise * vel * (1.0 - pan * 0.35), noise * vel * (1.0 + pan * 0.35)


def add_airy_reverb(buf, wet=0.24):
    out = buf.copy()
    taps_l = [(0.029, 0.30), (0.067, 0.23), (0.119, 0.16), (0.181, 0.10)]
    taps_r = [(0.035, 0.30), (0.073, 0.23), (0.131, 0.16), (0.193, 0.10)]
    rl = np.zeros(N_SAMPLES)
    rr = np.zeros(N_SAMPLES)
    for dt, g in taps_l:
        rl += np.roll(buf[0], int(dt * SR)) * g
        rl += np.roll(buf[1], int((dt + 0.015) * SR)) * (g * 0.35)
    for dt, g in taps_r:
        rr += np.roll(buf[1], int(dt * SR)) * g
        rr += np.roll(buf[0], int((dt + 0.019) * SR)) * (g * 0.35)
    out[0] += lowpass_fft(rl, 4800, order=1) * wet
    out[1] += lowpass_fft(rr, 4800, order=1) * wet
    return out


def groove_time(s):
    return s * STEP + (STEP * 0.09 if s % 2 == 1 else 0.0)


def main():
    drums = np.zeros((2, N_SAMPLES), dtype=np.float64)
    bass = np.zeros((2, N_SAMPLES), dtype=np.float64)
    chords_bus = np.zeros((2, N_SAMPLES), dtype=np.float64)
    melody_bus = np.zeros((2, N_SAMPLES), dtype=np.float64)

    # Bright, uplifting, effortless modern pop progression in G major:
    # Cmaj7 | D6 | Bm7 | Em9  (4 bars × 4 = 16 bars, zero tension, warm & inviting!)
    PROG_4 = [
        ([60, 64, 67, 71], 48),  # Cmaj7 (C3)
        ([62, 66, 69, 71], 50),  # D6    (D3)
        ([59, 62, 66, 69], 47),  # Bm7   (B2)
        ([59, 62, 64, 67], 40),  # Em7   (E2)
    ]
    PROG = PROG_4 * 4

    # 1. Warm bouncy indie-pop EP chords + airy pad in Section B
    for bar, (ch, _root) in enumerate(PROG):
        base = bar * 16
        # Light, sunny rhythmic chord comping
        for off, dur_s, vel in [(0, 5.5, 0.18), (6, 3.5, 0.13), (10, 5.0, 0.16)]:
            el, er = synth_warm_ep(ch, dur_s * STEP, vel=vel)
            add_stereo(chords_bus, el, er, groove_time(base + off))
        if bar >= 8:
            pl, pr = synth_airy_pad(ch, 16 * STEP, vel=0.045)
            add_stereo(chords_bus, pl, pr, base * STEP)

    # 2. Friendly, melodic, light bassline
    BASS_4 = [
        [(0, 48, 4.0), (6, 48, 2.2), (10, 52, 2.5), (14, 48, 1.8)],  # C
        [(0, 50, 4.0), (6, 50, 2.2), (10, 54, 2.5), (14, 50, 1.8)],  # D
        [(0, 47, 4.0), (6, 47, 2.2), (10, 50, 2.5), (14, 45, 1.8)],  # Bm
        [(0, 40, 4.0), (6, 43, 2.2), (10, 47, 2.5), (14, 43, 1.8)],  # Em
    ]
    for bar, notes in enumerate(BASS_4 * 4):
        base = bar * 16
        for off, midi, dur_s in notes:
            bl, br = synth_round_bass(midi, dur_s * STEP, vel=0.33)
            add_stereo(bass, bl, br, groove_time(base + off))

    # 3. Sunny, catchy, effortless modern pluck melody (Section A: bars 0-7)
    MELODY_A = [
        # Bar 0 (Cmaj7): E G B A G
        (0, 76, 2.0), (3, 79, 1.8), (6, 83, 2.4), (10, 81, 1.8), (13, 79, 2.0),
        # Bar 1 (D6): F# A B A F#
        (16, 78, 2.0), (19, 81, 1.8), (22, 83, 2.6), (26, 81, 1.8), (29, 78, 2.0),
        # Bar 2 (Bm7): D F# A G F#
        (32, 74, 2.0), (35, 78, 1.8), (38, 81, 2.4), (42, 79, 1.8), (45, 78, 2.0),
        # Bar 3 (Em7): G E D E G
        (48, 79, 2.4), (52, 76, 1.8), (54, 74, 2.2), (58, 76, 1.8), (60, 79, 2.4),
        # Bar 4 (Cmaj7): B A G E G
        (64, 83, 2.2), (68, 81, 1.8), (70, 79, 2.4), (74, 76, 1.8), (76, 79, 2.2),
        # Bar 5 (D6): A B D6 B A
        (80, 81, 2.0), (83, 83, 1.8), (86, 86, 2.6), (90, 83, 1.8), (93, 81, 2.0),
        # Bar 6 (Bm7): B A F# D F#
        (96, 83, 2.0), (99, 81, 1.8), (102, 78, 2.4), (106, 74, 1.8), (109, 78, 2.0),
        # Bar 7 (Em7): G F# E D E
        (112, 79, 2.2), (116, 78, 1.8), (118, 76, 2.6), (122, 74, 1.8), (124, 76, 2.2),
    ]
    for s, midi, dur_s in MELODY_A:
        t0 = groove_time(s)
        pan = 0.25 * np.sin(s * 0.25)
        pl, pr = synth_bright_pluck(midi, dur_s * STEP, vel=0.23, pan=pan)
        add_stereo(melody_bus, pl, pr, t0)
        # Soft sparkle echo
        el, er = synth_bright_pluck(midi, dur_s * STEP * 0.7, vel=0.06, pan=-pan)
        add_stereo(melody_bus, el, er, t0 + 3 * STEP)

    # 4. Warm smiling silky lead in Section B (bars 8-15) + gentle background plucks
    MELODY_B = [
        # Bar 8 (Cmaj7)
        (128, 83, 3.0, 81), (134, 86, 2.2, None), (138, 83, 2.6, None), (142, 79, 2.0, None),
        # Bar 9 (D6)
        (144, 81, 3.2, 79), (150, 83, 2.2, None), (154, 81, 2.8, None), (158, 78, 1.8, None),
        # Bar 10 (Bm7)
        (160, 79, 2.6, 78), (164, 81, 2.0, None), (166, 83, 3.2, None), (172, 81, 2.2, None),
        # Bar 11 (Em7)
        (176, 79, 3.4, 81), (182, 76, 2.4, None), (186, 79, 3.0, None),
        # Bar 12 (Cmaj7)
        (192, 88, 3.0, 86), (198, 86, 2.2, None), (202, 83, 2.8, None), (206, 79, 1.8, None),
        # Bar 13 (D6)
        (208, 86, 2.6, 83), (212, 83, 2.0, None), (214, 81, 3.4, None), (220, 78, 2.0, None),
        # Bar 14 (Bm7)
        (224, 83, 2.6, 81), (228, 81, 2.0, None), (230, 78, 3.0, None), (236, 79, 2.2, None),
        # Bar 15 (Em7)
        (240, 76, 3.8, 78), (246, 79, 2.2, None), (250, 81, 2.6, None), (254, 79, 1.8, None),
    ]
    for s, midi, dur_s, sl in MELODY_B:
        t0 = groove_time(s)
        pan = 0.18 * np.cos(s * 0.2)
        ll, lr = synth_silky_lead(midi, dur_s * STEP, vel=0.22, slide_from=sl, pan=pan)
        add_stereo(melody_bus, ll, lr, t0)
    # Soft off-beat pluck sparkles in Section B
    for bar in range(8, 16):
        ch = PROG[bar][0]
        for off, idx in [(2, 3), (6, 2), (10, 3), (14, 1)]:
            pl, pr = synth_bright_pluck(ch[idx] + 12, 1.8 * STEP, vel=0.09, pan=0.35 if off % 4 == 2 else -0.35)
            add_stereo(melody_bus, pl, pr, groove_time(bar * 16 + off))

    # 5. Light, airy, modern chill-pop percussion (no heavy club pounding!)
    sidechain = np.ones(N_SAMPLES, dtype=np.float64)
    sc_len = int(0.16 * SR)
    sc_curve = 1.0 - 0.24 * np.exp(-np.arange(sc_len) / (0.05 * SR))

    for s in range(STEPS):
        in_bar = s % 16
        bar = s // 16
        t0 = groove_time(s)
        # Light warm kick on 1 and syncopated "and" of 3 (classic chill-pop groove!)
        if in_bar in (0, 10) or (bar >= 8 and in_bar == 8):
            kl, kr = synth_soft_kick(vel=0.42 if in_bar == 0 else 0.34)
            add_stereo(drums, kl, kr, t0)
            i0 = int(round(t0 * SR))
            idx = (np.arange(sc_len) + i0) % N_SAMPLES
            sidechain[idx] = np.minimum(sidechain[idx], sc_curve)
        # Soft crisp finger snap on 2 & 4
        if in_bar in (4, 12):
            sl, sr = synth_soft_snap(vel=0.21)
            add_stereo(drums, sl, sr, t0)
        # Airy rhythmic shaker on 8ths
        if in_bar % 2 == 0:
            hl, hr = synth_shaker(vel=0.052 if in_bar % 4 == 2 else 0.032, accent=(in_bar == 14), pan=0.22 if in_bar % 4 == 2 else -0.22)
            add_stereo(drums, hl, hr, t0)

    chords_bus[0] *= sidechain
    chords_bus[1] *= sidechain

    chords_bus = add_airy_reverb(chords_bus, wet=0.25)
    melody_bus = add_airy_reverb(melody_bus, wet=0.28)
    drums = add_airy_reverb(drums, wet=0.06)

    mix = drums + bass + chords_bus + melody_bus
    mix = np.tanh(mix * 1.12)
    peak = np.max(np.abs(mix))
    if peak > 0:
        mix = mix * (0.90 / peak)

    os.makedirs("audio/office", exist_ok=True)
    out_path = "audio/office/menu-theme.ogg"
    data = np.ascontiguousarray(mix.T, dtype=np.float32)
    with sf.SoundFile(out_path, mode="w", samplerate=SR, channels=2, format="OGG", subtype="VORBIS") as f:
        for i in range(0, len(data), 4096):
            f.write(data[i:i + 4096])
    print(f"Rendered chill-pop {out_path}: {DUR:.2f}s, {os.path.getsize(out_path) / 1024:.0f} KB")


if __name__ == "__main__":
    main()
