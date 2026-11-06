"""Data for the « vks » figure (qualitative curves, no value is printed on the figure).

1. Field lines of the axial dipole (panel a, right view): contours of the flux function Psi = r A_phi of a
   uniform sheet of azimuthal currents filling the sodium volume (r = 0.8 R, |x| <= 0.9 R), the textbook source of a
   field that is nearly uniform and axial inside and dipolar outside.
2. D(t), Q(t) (panels b and c): Pétrélis–Fauve normal form dA/dt = mu A + nu conj(A) - |A|^2 A + sigma (xi1 + i xi2),
   A = D + iQ (Pétrélis & Fauve 2008; Pétrélis, Fauve, Dormy & Valet 2009). Parameters chosen by hand for a
   qualitative picture: rare reversals through the quadrupole-dominated saddles, one excursion.
Run: python make_data.py  (writes vks.json next to this file)
"""
import json
import os

import numpy as np
from scipy.special import ellipe, ellipk
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
out = {}

# ---------------------------------------------------------------- 1. dipole field lines (units of R)
A_LOOP, XMAX, NLOOP = 0.80, 0.90, 41


def psi_loop(r, x, a, x0):
    """r * A_phi of a unit current loop of radius a at axial position x0 (mu0 I / 4 pi = 1)."""
    r = np.maximum(r, 1e-9)
    m = 4 * a * r / ((a + r) ** 2 + (x - x0) ** 2)
    m = np.minimum(m, 1 - 1e-12)
    k = np.sqrt(m)
    aphi = (4.0 / k) * np.sqrt(a / r) * ((1 - m / 2) * ellipk(m) - ellipe(m))
    return r * aphi


xs = np.linspace(-4.0, 4.0, 801)
rs = np.linspace(0.0, 3.4, 341)
X, Rg = np.meshgrid(xs, rs)
PSI = sum(psi_loop(Rg, X, A_LOOP, x0) for x0 in np.linspace(-XMAX, XMAX, NLOOP))
norm = PSI.max()
PSI /= norm

# levels fixed by where the line crosses the mid-plane inside the sodium (r_in, in units of R)
psi_mid = sum(psi_loop(rs, 0.0, A_LOOP, x0) for x0 in np.linspace(-XMAX, XMAX, NLOOP)) / norm
j = int(np.argmax(psi_mid))
lines = []
for r_in in (0.30, 0.52, 0.67):   # equal flux steps (Psi ~ r^2 inside)
    lev = float(np.interp(r_in, rs[:j + 1], psi_mid[:j + 1]))
    r_out = round(float(np.interp(-lev, -psi_mid[j:], rs[j:])), 3)
    cs = plt.contour(X, Rg, PSI, levels=[lev])
    segs = cs.allsegs[0]
    plt.close("all")
    seg = max(segs, key=len)
    lines.append({"r_in": round(r_in, 3), "r_out": r_out, "level": round(lev, 5),
                  "pts": [[round(float(p[0]), 4), round(float(p[1]), 4)] for p in seg[::2]]})
out["fieldlines"] = lines

# ---------------------------------------------------------------- 2. Pétrélis–Fauve normal form
MU = 1.0 + 0.2j
NU = 0.5
SIG = 0.36
DT = 0.01
T = 60000.0
rng = np.random.default_rng(7)
n = int(T / DT)
A = np.empty(n, dtype=complex)
a = np.sqrt(1 + NU * np.cos(2 * 0.5 * np.arcsin(MU.imag / NU))) * np.exp(1j * 0.5 * np.arcsin(MU.imag / NU))
noise = (rng.standard_normal(n) + 1j * rng.standard_normal(n)) * SIG * np.sqrt(DT)
for i in range(n):
    A[i] = a
    a = a + (MU * a + NU * np.conj(a) - abs(a) ** 2 * a) * DT + noise[i]

# fixed points
ths = 0.5 * np.arcsin(MU.imag / NU)                # stable
thu = np.pi / 2 - ths                              # saddle
rad = lambda th: np.sqrt(MU.real + NU * np.cos(2 * th))
Ds, Qs = rad(ths) * np.cos(ths), rad(ths) * np.sin(ths)
Du, Qu = rad(thu) * np.cos(thu), rad(thu) * np.sin(thu)
out["fixed"] = {"stable": [round(Ds, 4), round(Qs, 4)], "saddle": [round(Du, 4), round(Qu, 4)]}
th = np.linspace(0, 2 * np.pi, 361)
out["manifold"] = [[round(float(rad(t) * np.cos(t)), 4), round(float(rad(t) * np.sin(t)), 4)] for t in th]

# light smoothing (moving average over 1.0 time unit), then decimate to 0.2
k = int(1.0 / DT)
ker = np.ones(k) / k
Dsm = np.convolve(A.real, ker, mode="same")
Qsm = np.convolve(A.imag, ker, mode="same")
step = int(0.2 / DT)
t = np.arange(n)[::step] * DT
D = Dsm[::step]
Q = Qsm[::step]

# polarity state with hysteresis (|D| > 0.5 D*)
state = np.zeros(len(D), dtype=int)
s = 1
for i, d in enumerate(D):
    if d > 0.5 * Ds:
        s = 1
    elif d < -0.5 * Ds:
        s = -1
    state[i] = s
rev = np.nonzero(np.diff(state))[0] + 1           # first sample of the new state


def zero_cross_before(i):
    j = i
    while j > 0 and np.sign(D[j]) == state[i]:
        j -= 1
    return j


# candidate windows: [+ ... R1 ... - (excursion) ... R2 ... +] or the mirror
W = int(260 / 0.2)
best = None
for a_i in range(len(rev) - 1):
    i1, i2 = rev[a_i], rev[a_i + 1]
    if (t[i2] - t[i1]) < 120 or (t[i2] - t[i1]) > 260:
        continue
    # excursion inside the middle phase: |D| dips below 0.35 D* without crossing zero
    mid = slice(i1 + int(15 / 0.2), i2 - int(25 / 0.2))
    dm = D[mid] * state[i1]
    if len(dm) == 0:
        continue
    jmin = np.argmin(dm)
    if not (0.05 * Ds < dm[jmin] < 0.35 * Ds):
        continue
    # only one dip: elsewhere in the middle phase stay above 0.6 D*
    jj = np.arange(len(dm))
    far = np.abs(jj - jmin) > int(12 / 0.2)
    if far.any() and dm[far].min() < 0.5 * Ds:
        continue
    start = i1 - int(70 / 0.2)
    end = i2 + int(60 / 0.2)
    if start < 0 or end >= len(D):
        continue
    # outer phases quiet
    outer = np.concatenate([D[start:i1 - int(8 / 0.2)] * state[i1 - 1], D[i2 + int(10 / 0.2):end] * state[i2]])
    if outer.min() < 0.45 * Ds:
        continue
    # excursion roughly centred in the middle phase
    centre = abs((mid.start + jmin) - (i1 + i2) / 2) / (i2 - i1)
    score = centre + 0.2 * abs(dm[jmin] - 0.25 * Ds)
    if best is None or score < best[0]:
        best = (score, start, end, i1, i2, mid.start + jmin, int(state[i1 - 1]))
print("windows found:", best is not None, "reversals in run:", len(rev))
assert best is not None, "no window: change the seed"
_, s0, s1, i1, i2, ie, sgn0 = best
sl = slice(s0, s1)


def event_span(i, kind):
    """indices [a, b) of an event: from where |D| leaves 0.8 D* to where it is back above 0.8 D*."""
    a_, b_ = i, i
    while a_ > s0 and abs(D[a_]) < 0.8 * Ds:
        a_ -= 1
    while b_ < s1 - 1 and abs(D[b_]) < 0.8 * Ds:
        b_ += 1
    return [int(a_ - s0), int(b_ - s0)]


z1, z2 = zero_cross_before(i1), zero_cross_before(i2)
events = [
    {"kind": "renversement", "span": event_span(z1, "r")},
    {"kind": "excursion", "span": event_span(ie, "e")},
    {"kind": "renversement", "span": event_span(z2, "r")},
]
out["series"] = {
    "t": [round(float(v - t[s0]), 2) for v in t[sl]],
    "D": [round(float(v), 4) for v in D[sl]],
    "Q": [round(float(v), 4) for v in Q[sl]],
    "sign0": sgn0,
    "events": events,
}
out["params"] = {"mu": [MU.real, MU.imag], "nu": NU, "sigma": SIG, "dt": DT, "seed": 7, "smooth": 1.0}

with open(os.path.join(HERE, "vks.json"), "w") as f:
    json.dump(out, f, separators=(",", ":"))
print("D*, Q* =", Ds, Qs, " saddle =", Du, Qu)
print("events:", events, "window length", t[s1] - t[s0])
print("field lines r_in:", [l["r_in"] for l in lines], [len(l["pts"]) for l in lines])
