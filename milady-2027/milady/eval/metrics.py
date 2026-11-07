"""Métriques physiques et distances entre lois pour les champs MHD 3D (palier 2 de la thèse).

Toutes les fonctions prennent des champs **physiques** sur grille périodique régulière, dans la convention
du format MFF : dernière dimension = composantes (``(..., nx, ny, nz, 3)`` en 3D, ``(..., nx, ny, 2)`` en 2D),
dimensions de tête = échantillons. Les transformées de Fourier sont normalisées « forward »
(``f̂ = moyenne de f e^{-ik·x}``), ce qui rend les coefficients indépendants de la résolution ; la moyenne
spatiale ⟨f g⟩ vaut alors Σ_k w_k Re(f̂_k ĝ_k*) (poids w = 2 pour les plans rfft 0 < kz < nz/2, 1 sinon).

Contenu :

- contrainte : :func:`divergence_relative` (‖∇·f‖ / ‖∇f‖, nulle pour un champ solénoïdal) ;
- spectres en couronnes : :func:`energy_spectrum` (E(k), k = arrondi de |m|, Σ_k E(k) = ½⟨|f|²⟩) ;
- invariants : :func:`helicities` (énergies, hélicités cinétique ⟨u·ω⟩, magnétique ⟨A·B⟩ en jauge de
  Coulomb, croisée ⟨u·B⟩, et leurs versions relatives) ;
- bilans d'énergie : :func:`energy_budget` (injection, dissipations, production magnétique ⟨j·(u×B)⟩,
  taux de croissance, résidus des bilans total, cinétique et magnétique) et :func:`budget_summary`
  (résidus **en loi**, normalisés) ; champs analytiques : :func:`abc_field`, :func:`taylor_green_field`,
  :func:`forcing_field`, :func:`imposed_flow` (mêmes définitions que ``milady.sim.mhd3d``) ;
- lois : :func:`features` (spectres logarithmiques, hélicités relatives, énergies),
  :func:`energy_distance` (Székely), :func:`sliced_wasserstein` (Wasserstein tranché),
  :func:`compare_ensembles` (toutes les métriques entre un ensemble généré et une référence).

Ligne de commande (évaluation d'un modèle entraîné par ``milady.train.fm3d``) ::

    python -m milady.eval.metrics --model <uuid du catalogue | chemin ou URI du point de contrôle> \\
        --params Re=50 Pm=1 --params Re=70 Pm=1.5 [--n-samples 64] [--reference URI…] [--no-catalog]
    python -m milady.eval --config infra/configs/train_fm3d.yaml [--model <uuid>]

Les résultats vont dans la table ``evaluation`` du catalogue (une ligne par point de paramètres et par
métrique) et dans un rapport JSON.
"""

from __future__ import annotations

import argparse
import datetime as _dt
import json
import logging
import math
import sys
import time
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Any

import numpy as np

__all__ = [
    "abc_field",
    "budget_summary",
    "compare_ensembles",
    "divergence_relative",
    "energy_budget",
    "energy_distance",
    "energy_spectrum",
    "evaluate_model",
    "features",
    "forcing_field",
    "helicities",
    "imposed_flow",
    "main",
    "parse_params",
    "relative_divergence",
    "sliced_w1",
    "sliced_wasserstein",
    "spectral_grid",
    "taylor_green_field",
]

LOG = logging.getLogger("milady.eval")
TWO_PI = 2.0 * math.pi
_TINY = 1e-300


# =============================================================================================
# Outils spectraux (numpy, float64)
# =============================================================================================
def _as_np(x: Any, dtype: Any = np.float64) -> np.ndarray:
    """Convertit un tableau numpy ou un tenseur torch en tableau numpy (copie sur CPU si besoin)."""
    if hasattr(x, "detach"):
        x = x.detach().to("cpu").numpy()
    return np.asarray(x, dtype=dtype)


def _lengths(spatial: Sequence[int], lengths: float | Sequence[float] | None) -> tuple[float, ...]:
    """Longueurs de la boîte périodique (défaut : 2π dans chaque direction)."""
    if lengths is None:
        return (TWO_PI,) * len(spatial)
    if np.isscalar(lengths):
        return (float(lengths),) * len(spatial)  # type: ignore[arg-type]
    out = tuple(float(v) for v in lengths)  # type: ignore[union-attr]
    if len(out) != len(spatial):
        raise ValueError(f"{len(out)} longueurs pour {len(spatial)} dimensions spatiales")
    return out


def spectral_grid(spatial: Sequence[int], lengths: float | Sequence[float] | None = None) -> dict[str, Any]:
    """Nombres d'onde de la disposition ``rfftn`` d'une grille ``spatial`` (2D ou 3D).

    Renvoie ``m`` (indices entiers, liste de tableaux diffusables), ``k`` (k_i = 2π m_i / L_i), ``k2``,
    ``shell`` (couronne = arrondi de |m|, entier) et ``w`` (poids de Parseval de la demi-grille rfft).
    """
    spatial = tuple(int(n) for n in spatial)
    D = len(spatial)
    L = _lengths(spatial, lengths)
    ms, ks = [], []
    for i, n in enumerate(spatial):
        m = np.fft.rfftfreq(n, 1.0 / n) if i == D - 1 else np.fft.fftfreq(n, 1.0 / n)
        shape = [1] * D
        shape[i] = m.size
        ms.append(m.reshape(shape))
        ks.append((TWO_PI / L[i]) * m.reshape(shape))
    k2 = sum(k * k for k in ks)
    m2 = sum(m * m for m in ms)
    nlast = spatial[-1]
    w = np.full(nlast // 2 + 1, 2.0)
    w[0] = 1.0
    if nlast % 2 == 0:
        w[-1] = 1.0
    w = w.reshape([1] * (D - 1) + [-1])
    return {"m": ms, "k": ks, "k2": k2, "shell": np.rint(np.sqrt(m2)).astype(np.int64), "w": w, "lengths": L}


def _fft(field: np.ndarray, D: int) -> np.ndarray:
    """``(..., *spatial, D)`` → coefficients ``(..., D, *spatial_rfft)`` (norme « forward »)."""
    f = np.moveaxis(field, -1, -(D + 1))
    return np.fft.rfftn(f, axes=tuple(range(-D, 0)), norm="forward")


def _ifft(fh: np.ndarray, spatial: Sequence[int]) -> np.ndarray:
    """Inverse de :func:`_fft` : ``(..., D, *spatial_rfft)`` → ``(..., *spatial, D)``."""
    D = len(spatial)
    f = np.fft.irfftn(fh, s=tuple(spatial), axes=tuple(range(-D, 0)), norm="forward")
    return np.moveaxis(f, -(D + 1), -1)


def _inner(ah: np.ndarray, bh: np.ndarray, w: np.ndarray, D: int, vector: bool = True) -> np.ndarray:
    """⟨a·b⟩ (moyenne spatiale) à partir des coefficients rfft ; forme : dimensions de tête."""
    axes = tuple(range(-(D + 1), 0)) if vector else tuple(range(-D, 0))
    return np.sum(w * (ah * np.conj(bh)).real, axis=axes)


def _curl(fh: np.ndarray, k: Sequence[np.ndarray]) -> np.ndarray:
    """Rotationnel spectral i k × f̂ (3D), composantes sur l'axe ``-4``."""
    f0, f1, f2 = fh[..., 0, :, :, :], fh[..., 1, :, :, :], fh[..., 2, :, :, :]
    kx, ky, kz = k
    return 1j * np.stack((ky * f2 - kz * f1, kz * f0 - kx * f2, kx * f1 - ky * f0), axis=-4)


def _split(field: np.ndarray) -> tuple[int, tuple[int, ...], tuple[int, ...]]:
    """Nombre de composantes D, forme spatiale et dimensions de tête d'un champ vectoriel."""
    D = int(field.shape[-1])
    if D not in (2, 3) or field.ndim < D + 1:
        raise ValueError(f"champ vectoriel (..., *spatial, D) avec D = 2 ou 3 attendu, forme {field.shape}")
    return D, tuple(field.shape[-(D + 1) : -1]), tuple(field.shape[: -(D + 1)])


# =============================================================================================
# Contrainte et spectres
# =============================================================================================
def divergence_relative(
    field: Any, lengths: float | Sequence[float] | None = None, per_sample: bool = False
) -> float | np.ndarray:
    """Divergence relative ‖∇·f‖ / ‖∇f‖ = (Σ|k·f̂|² / Σ|k|²|f̂|²)^½ d'un champ vectoriel périodique.

    ``field`` : ``(..., nx, ny, nz, 3)`` ou ``(..., nx, ny, 2)``. Vaut 0 pour un champ solénoïdal (précision
    machine pour un champ décodé depuis un potentiel vecteur) et 1 pour un gradient pur.
    ``per_sample=False`` : un nombre (sommes sur tous les échantillons) ; ``True`` : tableau de la forme
    des dimensions de tête.
    """
    f = _as_np(field)
    D, spatial, _ = _split(f)
    g = spectral_grid(spatial, lengths)
    fh = _fft(f, D)
    div = sum(g["k"][i] * np.take(fh, i, axis=-(D + 1)) for i in range(D))
    num = np.sum(g["w"] * np.abs(div) ** 2, axis=tuple(range(-D, 0)))
    den = np.sum(g["w"] * g["k2"] * np.sum(np.abs(fh) ** 2, axis=-(D + 1)), axis=tuple(range(-D, 0)))
    if per_sample:
        return np.sqrt(num / np.maximum(den, _TINY))
    return float(np.sqrt(np.sum(num) / max(float(np.sum(den)), _TINY)))


#: Alias (nom alternatif utilisé par certains scripts).
relative_divergence = divergence_relative


def energy_spectrum(
    field: Any, lengths: float | Sequence[float] | None = None, n_shells: int | None = None
) -> np.ndarray:
    """Spectre d'énergie en couronnes E(k) = ½ Σ_{arrondi(|m|) = k} |f̂_m|², forme ``(..., n_shells)``.

    k est l'indice entier de couronne (k = |m| arrondi ; égal au nombre d'onde physique dans une boîte 2π) ;
    Σ_k E(k) = ½⟨|f|²⟩. ``n_shells`` (défaut : toutes les couronnes de la grille) tronque ou complète par 0.
    """
    f = _as_np(field)
    D, spatial, lead = _split(f)
    g = spectral_grid(spatial, lengths)
    fh = _fft(f, D)
    dens = 0.5 * g["w"] * np.sum(np.abs(fh) ** 2, axis=-(D + 1))
    shell = np.broadcast_to(g["shell"], dens.shape[-D:]).reshape(-1)
    ns = int(shell.max()) + 1 if n_shells is None else int(n_shells)
    dens = dens.reshape(-1, shell.size)
    keep = shell < ns
    rows = np.repeat(np.arange(dens.shape[0]), int(keep.sum()))
    idx = rows * ns + np.tile(shell[keep], dens.shape[0])
    out = np.bincount(idx, weights=dens[:, keep].reshape(-1), minlength=dens.shape[0] * ns)
    return out.reshape(*lead, ns)


def helicities(
    u: Any | None = None, b: Any | None = None, lengths: float | Sequence[float] | None = None
) -> dict[str, np.ndarray]:
    """Énergies et hélicités par échantillon (champs 3D ``(..., nx, ny, nz, 3)``).

    Avec ``u`` : ``kinetic_energy`` ½⟨|u|²⟩, ``enstrophy`` ⟨|ω|²⟩, ``kinetic_helicity`` ⟨u·ω⟩,
    ``relative_kinetic_helicity`` ⟨u·ω⟩ / (⟨|u|²⟩⟨|ω|²⟩)^½ ∈ [−1, 1].
    Avec ``b`` : ``magnetic_energy``, ``mean_square_current`` ⟨|j|²⟩, ``magnetic_helicity`` ⟨A·B⟩ avec A en
    jauge de Coulomb (Â = i k × B̂ / |k|², champ moyen exclu), ``relative_magnetic_helicity``.
    Avec les deux : ``cross_helicity`` ⟨u·B⟩ et ``relative_cross_helicity``.
    """
    out: dict[str, np.ndarray] = {}
    uh = bh = None
    g: dict[str, Any] | None = None
    for name, arr in (("u", u), ("b", b)):
        if arr is None:
            continue
        a = _as_np(arr)
        D, spatial, _ = _split(a)
        if D != 3:
            raise ValueError("helicities : champs 3D attendus")
        g = spectral_grid(spatial, lengths)
        if name == "u":
            uh = _fft(a, 3)
        else:
            bh = _fft(a, 3)
    if g is None:
        raise ValueError("helicities : fournir u, b ou les deux")
    w, k = g["w"], g["k"]
    inv_k2 = np.where(g["k2"] > 0, 1.0 / np.where(g["k2"] > 0, g["k2"], 1.0), 0.0)
    if uh is not None:
        wh = _curl(uh, k)
        u2, w2 = _inner(uh, uh, w, 3), _inner(wh, wh, w, 3)
        hk = _inner(uh, wh, w, 3)
        out.update(
            kinetic_energy=0.5 * u2,
            enstrophy=w2,
            kinetic_helicity=hk,
            relative_kinetic_helicity=hk / np.sqrt(np.maximum(u2 * w2, _TINY)),
        )
    if bh is not None:
        jh = _curl(bh, k)
        ah = jh * inv_k2
        b2, j2, a2 = _inner(bh, bh, w, 3), _inner(jh, jh, w, 3), _inner(ah, ah, w, 3)
        hm = _inner(ah, bh, w, 3)
        out.update(
            magnetic_energy=0.5 * b2,
            mean_square_current=j2,
            magnetic_helicity=hm,
            relative_magnetic_helicity=hm / np.sqrt(np.maximum(a2 * b2, _TINY)),
        )
    if uh is not None and bh is not None:
        hc = _inner(uh, bh, w, 3)
        out.update(
            cross_helicity=hc,
            relative_cross_helicity=hc / np.sqrt(np.maximum(2 * out["kinetic_energy"] * b2, _TINY)),
        )
    return out


# =============================================================================================
# Champs analytiques (mêmes définitions que milady.sim.mhd3d)
# =============================================================================================
def _mesh(spatial: Sequence[int], lengths: float | Sequence[float] | None) -> tuple[np.ndarray, ...]:
    L = _lengths(spatial, lengths)
    axes = [np.arange(n) * (Li / n) for n, Li in zip(spatial, L, strict=True)]
    return tuple(np.meshgrid(*axes, indexing="ij"))


def abc_field(
    spatial: Sequence[int],
    lengths: float | Sequence[float] | None = None,
    kf: float = 1,
    coeffs: Sequence[float] = (1.0, 1.0, 1.0),
    amp: float = 1.0,
) -> np.ndarray:
    """Écoulement ABC (A sin kz + C cos ky, B sin kx + A cos kz, C sin ky + B cos kx) × ``amp``.

    k_i = 2π kf / L_i ; champ de Beltrami ∇×u = k u (boîte cubique), ⟨|u|²⟩ = A² + B² + C² (amp = 1).
    Forme ``(nx, ny, nz, 3)``.
    """
    X, Y, Z = _mesh(spatial, lengths)
    L = _lengths(spatial, lengths)
    kx, ky, kz = (TWO_PI * kf / Li for Li in L)
    A, B, C = (float(c) for c in coeffs)
    return amp * np.stack(
        (
            A * np.sin(kz * Z) + C * np.cos(ky * Y),
            B * np.sin(kx * X) + A * np.cos(kz * Z),
            C * np.sin(ky * Y) + B * np.cos(kx * X),
        ),
        axis=-1,
    )


def taylor_green_field(
    spatial: Sequence[int], lengths: float | Sequence[float] | None = None, kf: float = 1, amp: float = 1.0
) -> np.ndarray:
    """Taylor–Green (sin kx cos ky cos kz, −cos kx sin ky cos kz, 0) × ``amp``, forme ``(nx, ny, nz, 3)``."""
    X, Y, Z = _mesh(spatial, lengths)
    L = _lengths(spatial, lengths)
    kx, ky, kz = (TWO_PI * kf / Li for Li in L)
    return amp * np.stack(
        (
            np.sin(kx * X) * np.cos(ky * Y) * np.cos(kz * Z),
            -np.cos(kx * X) * np.sin(ky * Y) * np.cos(kz * Z),
            np.zeros_like(X),
        ),
        axis=-1,
    )


def _shape_field(kind: str, params: Mapping[str, Any], spatial: Sequence[int], lengths: Any) -> np.ndarray:
    kf = float(params.get("kf", 1))
    if kind == "abc":
        coeffs = tuple(float(params.get(k, 1.0)) for k in ("abc_A", "abc_B", "abc_C"))
        return abc_field(spatial, lengths, kf, coeffs)
    if kind == "tg":
        return taylor_green_field(spatial, lengths, kf)
    raise ValueError(f"champ analytique {kind!r} inconnu (abc, tg)")


def forcing_amplitude(params: Mapping[str, Any], lengths: float | Sequence[float] | None = None) -> float:
    """Amplitude du forçage constant, mêmes règles que ``milady.sim``.

    ``laminar`` : ν |k|² U ; ``turbulent`` : |k| U² (|k|² = valeur propre de −∇² de la forme : k_f² pour ABC,
    3 k_f² pour TG) ; sinon la valeur fixe ``forcing_amp``.
    """
    L = _lengths((1, 1, 1), lengths)[0]
    k_phys = TWO_PI * float(params.get("kf", 1)) / L
    k_shape2 = k_phys**2 * (1.0 if str(params.get("forcing", "abc")) == "abc" else 3.0)
    U = float(params.get("U_ref", 1.0))
    rule = str(params.get("forcing_rule", "fixed" if "forcing_amp" in params else "laminar"))
    if rule == "laminar":
        return float(params.get("nu", 0.0)) * k_shape2 * U
    if rule == "turbulent":
        return math.sqrt(k_shape2) * U * U
    return float(params["forcing_amp"])


def forcing_field(
    params: Mapping[str, Any], spatial: Sequence[int], lengths: float | Sequence[float] | None = None
) -> np.ndarray | None:
    """Forçage constant f du mode dynamique (``forcing`` = ``abc`` ou ``tg``), ``None`` sinon."""
    if str(params.get("mode", "dynamic")) != "dynamic" or str(params.get("forcing", "")) not in ("abc", "tg"):
        return None
    return forcing_amplitude(params, lengths) * _shape_field(str(params["forcing"]), params, spatial, lengths)


def imposed_flow(
    params: Mapping[str, Any], spatial: Sequence[int], lengths: float | Sequence[float] | None = None
) -> np.ndarray | None:
    """Écoulement imposé (mode cinématique ; ``flow`` : ``abc``, ``tg`` ; amplitude ``U_ref``) ou ``None``."""
    if str(params.get("mode", "dynamic")) != "kinematic":
        return None
    amp = float(params.get("flow_amp", params.get("U_ref", 1.0)))
    return amp * _shape_field(str(params.get("flow", "abc")), params, spatial, lengths)


# =============================================================================================
# Bilans d'énergie
# =============================================================================================
def energy_budget(
    u: Any | None,
    b: Any | None,
    params: Mapping[str, Any],
    lengths: float | Sequence[float] | None = None,
    dealias: bool = True,
    growth_rate: float | None = None,
) -> dict[str, np.ndarray]:
    """Termes des bilans d'énergie par échantillon (champs 3D ``(..., nx, ny, nz, 3)``).

    Équations (unités d'Alfvén) : ∂u/∂t = u×ω + j×B − ∇p + ν∇²u + f, ∂B/∂t = ∇×(u×B) + η∇²B.
    Termes : ``injection`` ⟨f·u⟩ (forçage constant ABC/TG de ``params``, ou ``eps`` pour le forçage
    aléatoire, 0 sinon), ``kinetic_dissipation`` ν⟨|ω|²⟩, ``magnetic_dissipation`` η⟨|j|²⟩,
    ``magnetic_production`` ⟨j·(u×B)⟩ = ⟨B·∇×(u×B)⟩ (produit pseudo-spectral, désaliasé par la règle des
    2/3 si ``dealias``), ``growth_rate`` = (production − η⟨|j|²⟩)/⟨|B|²⟩ = d ln‖B‖/dt.
    Résidus (nuls en moyenne dans un régime statistiquement stationnaire) : ``residual_total`` =
    injection − ν⟨|ω|²⟩ − η⟨|j|²⟩ ; ``residual_kinetic`` = injection − production − ν⟨|ω|²⟩ ;
    ``residual_magnetic`` = production − η⟨|j|²⟩ − λ⟨|B|²⟩ (λ = ``growth_rate`` ou ``params["growth_rate"]``,
    0 par défaut). En mode cinématique, ``u`` absent est remplacé par l'écoulement imposé.
    """
    mode = str(params.get("mode", "dynamic"))
    nu, eta = float(params.get("nu", 0.0) or 0.0), float(params.get("eta", 0.0) or 0.0)
    arrs = [_as_np(a) for a in (u, b) if a is not None]
    if not arrs:
        raise ValueError("energy_budget : fournir u, b ou les deux")
    D, spatial, lead = _split(arrs[0])
    if D != 3:
        raise ValueError("energy_budget : champs 3D attendus")
    g = spectral_grid(spatial, lengths)
    w, k = g["w"], g["k"]
    ua = _as_np(u) if u is not None else None
    if ua is None and mode == "kinematic":
        flow = imposed_flow(params, spatial, lengths)
        ua = np.broadcast_to(flow, (*lead, *spatial, 3)) if flow is not None else None
    out: dict[str, np.ndarray] = {}
    zeros = np.zeros(lead)
    uh = _fft(ua, 3) if ua is not None else None
    bh = _fft(_as_np(b), 3) if b is not None else None
    if uh is not None:
        wh = _curl(uh, k)
        out["kinetic_energy"] = 0.5 * _inner(uh, uh, w, 3) + zeros
        out["kinetic_dissipation"] = nu * _inner(wh, wh, w, 3) + zeros
        f = forcing_field(params, spatial, lengths)
        if f is not None:
            out["injection"] = _inner(uh, _fft(f, 3), w, 3) + zeros
        elif mode == "dynamic" and str(params.get("forcing", "")) == "random":
            out["injection"] = np.full(lead, float(params.get("eps", 0.0)))
        else:
            out["injection"] = zeros.copy()
    if bh is not None:
        jh = _curl(bh, k)
        b2 = _inner(bh, bh, w, 3) + zeros
        out["magnetic_energy"] = 0.5 * b2
        out["magnetic_dissipation"] = eta * _inner(jh, jh, w, 3) + zeros
        if uh is not None:
            e = np.cross(_ifft(uh, spatial), _as_np(b), axis=-1)
            eh = _fft(e, 3)
            if dealias:
                keep = np.ones(eh.shape[-3:], dtype=bool)
                for i, n in enumerate(spatial):
                    keep &= np.abs(g["m"][i]) <= (n - 1) // 3
                eh = eh * keep
            prod = _inner(jh, eh, w, 3) + zeros
            out["magnetic_production"] = prod
            out["growth_rate"] = (prod - out["magnetic_dissipation"]) / np.maximum(b2, _TINY)
            lam = growth_rate if growth_rate is not None else float(params.get("growth_rate", 0.0) or 0.0)
            out["residual_magnetic"] = prod - out["magnetic_dissipation"] - lam * b2
    if uh is not None:
        diss = out["kinetic_dissipation"] + out.get("magnetic_dissipation", 0.0)
        out["residual_total"] = out["injection"] - diss
        if "magnetic_production" in out:
            out["residual_kinetic"] = (
                out["injection"] - out["magnetic_production"] - out["kinetic_dissipation"]
            )
        elif bh is None:
            out["residual_kinetic"] = out["injection"] - out["kinetic_dissipation"]
    return out


def budget_summary(budget: Mapping[str, np.ndarray]) -> dict[str, float]:
    """Résidus **en loi** des bilans : (moyenne des sources − moyenne des puits) / moyenne des puits.

    ``residu_bilan_total`` = E[injection − Dν − Dη] / E[Dν + Dη] ; ``residu_bilan_cinetique`` =
    E[injection − P − Dν] / E[Dν + |P|] ; ``residu_bilan_magnetique`` = E[P − Dη − λ|B|²] / E[Dη + |P|].
    Un modèle qui respecte la stationnarité en loi donne des résidus de l'ordre de l'erreur Monte-Carlo.
    """
    mean = {k: float(np.mean(v)) for k, v in budget.items()}
    out: dict[str, float] = {}
    dnu, deta = mean.get("kinetic_dissipation", 0.0), mean.get("magnetic_dissipation", 0.0)
    if "residual_total" in mean:
        out["residu_bilan_total"] = mean["residual_total"] / max(dnu + deta, _TINY)
    if "residual_kinetic" in mean:
        scale = dnu + abs(mean.get("magnetic_production", 0.0))
        out["residu_bilan_cinetique"] = mean["residual_kinetic"] / max(scale, _TINY)
    if "residual_magnetic" in mean:
        scale = deta + abs(mean.get("magnetic_production", 0.0))
        out["residu_bilan_magnetique"] = mean["residual_magnetic"] / max(scale, _TINY)
    if "growth_rate" in budget:
        out["taux_croissance_moyen"] = float(np.mean(budget["growth_rate"]))
    return out


# =============================================================================================
# Caractéristiques et distances entre lois
# =============================================================================================
def features(
    u: Any | None,
    b: Any | None,
    lengths: float | Sequence[float] | None = None,
    n_shells: int = 8,
) -> tuple[np.ndarray, list[str]]:
    """Vecteur de caractéristiques physiques par échantillon et noms des colonnes.

    log10 E_u(k), log10 E_B(k) pour k = 1…``n_shells``, hélicités relatives (cinétique, magnétique, croisée),
    log10 des énergies. Invariant par B → −B sauf l'hélicité croisée (qui change de signe).
    """
    cols, names = [], []
    for tag, arr in (("u", u), ("b", b)):
        if arr is None:
            continue
        spec = energy_spectrum(arr, lengths, n_shells=n_shells + 1)[..., 1:]
        cols.append(np.log10(spec + 1e-30))
        names += [f"log10_E{tag}_k{s}" for s in range(1, n_shells + 1)]
    h = helicities(u, b, lengths)
    for key in ("relative_kinetic_helicity", "relative_magnetic_helicity", "relative_cross_helicity"):
        if key in h:
            cols.append(h[key][..., None])
            names.append(key)
    for key in ("kinetic_energy", "magnetic_energy"):
        if key in h:
            cols.append(np.log10(h[key][..., None] + 1e-30))
            names.append(f"log10_{key}")
    if not cols:
        raise ValueError("features : fournir u, b ou les deux")
    x = np.concatenate([np.reshape(c, (-1, c.shape[-1])) for c in cols], axis=1)
    return x, names


def _mean_pdist(a: np.ndarray, b: np.ndarray, chunk: int = 1024) -> float:
    """Moyenne des distances euclidiennes entre toutes les paires (a_i, b_j) (statistique en V)."""
    nb = np.sum(b * b, axis=1)
    tot = 0.0
    for i in range(0, a.shape[0], chunk):
        ai = a[i : i + chunk]
        d2 = np.sum(ai * ai, axis=1)[:, None] + nb[None, :] - 2.0 * ai @ b.T
        tot += float(np.sqrt(np.maximum(d2, 0.0)).sum())
    return tot / (a.shape[0] * b.shape[0])


def energy_distance(x: Any, y: Any, n: int = 4000, seed: int = 0, standardize: bool = False) -> float:
    """Distance d'énergie de Székely D² = 2E|X−Y| − E|X−X'| − E|Y−Y'| (≥ 0, nulle ssi même loi).

    ``x`` : ``(n_x, d)``, ``y`` : ``(n_y, d)`` ; au plus ``n`` points tirés sans remise dans chaque ensemble.
    ``standardize`` : centre-réduit chaque colonne par la moyenne et l'écart-type de ``y`` (référence).
    Estimateur en V (diagonales comprises), toujours positif ; biais O(1/n).
    """
    xa, ya = _as_np(x), _as_np(y)
    xa = xa.reshape(xa.shape[0], -1)
    ya = ya.reshape(ya.shape[0], -1)
    if standardize:
        mu, sd = ya.mean(0), ya.std(0) + 1e-12
        xa, ya = (xa - mu) / sd, (ya - mu) / sd
    rng = np.random.default_rng(seed)
    a = xa[rng.choice(len(xa), size=min(n, len(xa)), replace=False)]
    b = ya[rng.choice(len(ya), size=min(n, len(ya)), replace=False)]
    return 2.0 * _mean_pdist(a, b) - _mean_pdist(a, a) - _mean_pdist(b, b)


def sliced_wasserstein(
    x: Any, y: Any, n_proj: int = 256, seed: int = 0, p: int = 1, standardize: bool = False
) -> float:
    """Distance de Wasserstein-p tranchée : moyenne sur ``n_proj`` directions aléatoires de W_p en 1D.

    Les fonctions quantiles des deux ensembles projetés sont comparées sur une grille commune de niveaux
    (tailles différentes acceptées). Renvoie (E_θ W_p^p)^{1/p}.
    """
    xa, ya = _as_np(x), _as_np(y)
    xa = xa.reshape(xa.shape[0], -1)
    ya = ya.reshape(ya.shape[0], -1)
    if standardize:
        mu, sd = ya.mean(0), ya.std(0) + 1e-12
        xa, ya = (xa - mu) / sd, (ya - mu) / sd
    rng = np.random.default_rng(seed)
    th = rng.normal(size=(n_proj, xa.shape[1]))
    th /= np.linalg.norm(th, axis=1, keepdims=True)
    px, py = np.sort(xa @ th.T, axis=0), np.sort(ya @ th.T, axis=0)
    m = max(len(px), len(py))
    levels = (np.arange(m) + 0.5) / m
    qx = np.quantile(px, levels, axis=0, method="inverted_cdf") if len(px) != m else px
    qy = np.quantile(py, levels, axis=0, method="inverted_cdf") if len(py) != m else py
    return float(np.mean(np.abs(qx - qy) ** p) ** (1.0 / p))


def sliced_w1(x: Any, y: Any, n_proj: int = 256, seed: int = 0) -> float:
    """Wasserstein-1 tranché (raccourci de :func:`sliced_wasserstein` avec p = 1)."""
    return sliced_wasserstein(x, y, n_proj=n_proj, seed=seed, p=1)


def _ensemble_stats(
    fields: Mapping[str, np.ndarray], params: Mapping[str, Any], lengths: Any, n_shells: int
) -> dict[str, Any]:
    u, b = fields.get("velocity"), fields.get("magnetic_field")
    out: dict[str, Any] = {}
    for tag, arr in (("u", u), ("b", b)):
        if arr is not None:
            out[f"div_rel_{tag}"] = divergence_relative(arr, lengths)
            out[f"spectrum_{tag}"] = energy_spectrum(arr, lengths, n_shells=n_shells + 1).mean(0)
    h = helicities(u, b, lengths)
    for key, val in h.items():
        out[f"{key}_mean"] = float(np.mean(val))
        out[f"{key}_std"] = float(np.std(val))
    out["budget"] = budget_summary(energy_budget(u, b, params, lengths))
    out["features"], out["feature_names"] = features(u, b, lengths, n_shells)
    return out


def compare_ensembles(
    gen: Mapping[str, Any],
    ref: Mapping[str, Any] | None,
    params: Mapping[str, Any],
    lengths: float | Sequence[float] | None = None,
    n_shells: int = 8,
    seed: int = 0,
) -> dict[str, Any]:
    """Toutes les métriques d'un ensemble généré (et sa comparaison à une référence au même point).

    ``gen`` / ``ref`` : ``{"velocity": (n, nx, ny, nz, 3), "magnetic_field": …}`` (référence facultative).
    Renvoie ``metrics`` (nombres, une ligne du catalogue chacun) et ``details`` (spectres moyens…).
    Métriques : ``div_rel_u``, ``div_rel_b``, énergies et hélicités moyennes, résidus des bilans en loi ;
    avec référence : ``err_spectre_u_log10``, ``err_spectre_b_log10`` (écart moyen des log10 E(k), k = 1…
    ``n_shells``), ``err_Eu_rel``, ``err_Eb_rel``, ``dist_energie`` (Székely, caractéristiques
    centrées-réduites
    par la référence), ``wasserstein_tranche``, et ``plancher_dist_energie`` (deux moitiés de la référence).
    """
    g = _ensemble_stats({k: _as_np(v) for k, v in gen.items()}, params, lengths, n_shells)
    metrics: dict[str, float] = {}
    for key in ("div_rel_u", "div_rel_b"):
        if key in g:
            metrics[key] = float(g[key])
    for key in (
        "kinetic_energy",
        "magnetic_energy",
        "kinetic_helicity",
        "magnetic_helicity",
        "cross_helicity",
        "relative_kinetic_helicity",
        "relative_magnetic_helicity",
        "relative_cross_helicity",
    ):
        if f"{key}_mean" in g:
            metrics[f"{key}_mean"] = g[f"{key}_mean"]
    metrics.update(g["budget"])
    details: dict[str, Any] = {
        "spectrum_u": g.get("spectrum_u", np.zeros(0)).tolist(),
        "spectrum_b": g.get("spectrum_b", np.zeros(0)).tolist(),
        "n_gen": int(g["features"].shape[0]),
    }
    if ref is not None:
        r = _ensemble_stats({k: _as_np(v) for k, v in ref.items()}, params, lengths, n_shells)
        for tag in ("u", "b"):
            if f"spectrum_{tag}" in g and f"spectrum_{tag}" in r:
                sg, sr = g[f"spectrum_{tag}"][1:], r[f"spectrum_{tag}"][1:]
                floor = 1e-12 * float(sr.max()) if sr.size else 0.0
                ok = sr > floor  # couronnes vides de la référence (arrondi) exclues
                metrics[f"err_spectre_{tag}_log10"] = (
                    float(np.mean(np.abs(np.log10(sg[ok] + floor) - np.log10(sr[ok] + floor))))
                    if ok.any()
                    else float("nan")
                )
                details[f"spectrum_{tag}_ref"] = r[f"spectrum_{tag}"].tolist()
        for key, tag in (("kinetic_energy", "Eu"), ("magnetic_energy", "Eb")):
            if f"{key}_mean" in g and f"{key}_mean" in r:
                metrics[f"err_{tag}_rel"] = abs(g[f"{key}_mean"] / max(r[f"{key}_mean"], _TINY) - 1.0)
        fg, fr = g["features"], r["features"]
        mu, sd = fr.mean(0), fr.std(0) + 1e-9
        zg, zr = (fg - mu) / sd, (fr - mu) / sd
        metrics["dist_energie"] = energy_distance(zg, zr, seed=seed)
        metrics["wasserstein_tranche"] = sliced_wasserstein(zg, zr, seed=seed)
        if len(zr) >= 8:
            half = len(zr) // 2
            metrics["plancher_dist_energie"] = energy_distance(zr[:half], zr[half:], seed=seed)
        for key, val in r["budget"].items():
            details[f"ref_{key}"] = val
        details["n_ref"] = int(fr.shape[0])
        details["feature_names"] = g["feature_names"]
    return {"metrics": metrics, "details": details}


# =============================================================================================
# Évaluation d'un modèle entraîné (ligne de commande)
# =============================================================================================
def parse_params(items: Sequence[str]) -> dict[str, Any]:
    """``["Re=50", "Pm=1"]`` → ``{"Re": 50.0, "Pm": 1.0}`` (valeurs YAML : nombres, chaînes, booléens)."""
    import yaml

    out: dict[str, Any] = {}
    for item in items:
        for part in str(item).replace(",", " ").split():
            if "=" not in part:
                raise ValueError(f"paramètre {part!r} : forme nom=valeur attendue")
            key, val = part.split("=", 1)
            v = yaml.safe_load(val)
            out[key.strip()] = float(v) if isinstance(v, int) and not isinstance(v, bool) else v
    return out


def _match(
    params: Mapping[str, Any], point: Mapping[str, Any], names: Sequence[str], rtol: float = 1e-6
) -> bool:
    from milady.train.data import param_value

    for name in names:
        try:
            a, b = param_value(params, name), float(point[name])
        except (KeyError, TypeError, ValueError):
            return False
        if not math.isclose(a, b, rel_tol=rtol, abs_tol=1e-12):
            return False
    return True


def _reference_fields(
    model: Any, uris: Sequence[str], point: Mapping[str, Any], n_max: int, grid: Sequence[int], cache_dir: Any
) -> dict[str, np.ndarray] | None:
    """Instantanés de référence au point ``point`` (fichiers dont les paramètres coïncident), tronqués à kmax.

    La référence est projetée sur la même base de Fourier tronquée que le modèle (|m| ≤ kmax) puis
    reconstruite sur la même grille, pour comparer ce qui est comparable.
    """
    import torch

    from milady.train.data import iter_snapshots

    names = [c.name for c in model.cond_specs]
    lat = []
    count = 0
    for uri, params, chunk in iter_snapshots(
        uris, model.space.fields, cache_dir=cache_dir, select=lambda p: _match(p, point, names)
    ):
        del uri, params
        x = model.space.encode({k: torch.as_tensor(v) for k, v in chunk.items()})
        lat.append(x)
        count += x.shape[0]
        if count >= n_max:
            break
    if not lat:
        return None
    x = torch.cat(lat)[:n_max]
    return {k: v.numpy() for k, v in model.space.decode(x.to(model.space.k.device), grid).items()}


def evaluate_model(
    model: Any,
    points: Sequence[Mapping[str, Any]],
    *,
    n_samples: int = 64,
    seed: int = 0,
    steps: int = 50,
    grid: int | None = None,
    reference: Sequence[str] = (),
    n_ref: int = 256,
    n_shells: int | None = None,
    batch_size: int = 16,
    cache_dir: str | None = None,
    catalog: Any | None = None,
    model_id: str | None = None,
) -> list[dict[str, Any]]:
    """Échantillonne ``model`` (``fm3d.GenerativeModel``) en chaque point et calcule les métriques.

    ``points`` : valeurs brutes des paramètres de conditionnement (``{"Re": 50, "Pm": 1}``) ; ``grid`` :
    résolution de reconstruction (défaut : plus petite grille paire ≥ 3 kmax + 1, produits sans repliement) ;
    ``reference`` : URI de fichiers MFF dont ceux aux mêmes paramètres servent de référence.
    Avec ``catalog`` et ``model_id``, chaque métrique est enregistrée (table ``evaluation``).
    """
    kmax = model.space.kmax
    n_grid = grid or model.default_grid()
    shape = (n_grid, n_grid, n_grid)
    ns = n_shells or math.floor(kmax)
    results = []
    for i, point in enumerate(points):
        t0 = time.time()
        point = {k: float(v) for k, v in point.items()}
        phys = model.physical_parameters(point)
        gen: dict[str, list[np.ndarray]] = {}
        for start in range(0, n_samples, batch_size):
            nb = min(batch_size, n_samples - start)
            fields = model.sample_fields(
                point, nb, seed=seed * 1_000_003 + i * 7919 + start, steps=steps, grid=shape
            )
            for key, val in fields.items():
                gen.setdefault(key, []).append(val)
        gen_np = {k: np.concatenate(v) for k, v in gen.items()}
        ref = _reference_fields(model, reference, point, n_ref, shape, cache_dir) if reference else None
        res = compare_ensembles(gen_np, ref, phys, model.space.lengths, n_shells=ns, seed=seed)
        res["point"] = point
        res["physical_parameters"] = {k: v for k, v in phys.items() if isinstance(v, (int, float, str, bool))}
        res["seconds"] = time.time() - t0
        results.append(res)
        LOG.info("point %s : %s", point, {k: round(v, 5) for k, v in res["metrics"].items()})
        if catalog is not None and model_id:
            for metric, value in res["metrics"].items():
                if value is None or not np.isfinite(value):
                    continue
                catalog.add_evaluation(
                    model_id,
                    point,
                    metric,
                    float(value),
                    n_samples,
                    seed,
                    details={
                        "steps": steps,
                        "grid": n_grid,
                        "kmax": kmax,
                        **(res["details"] if metric == "dist_energie" else {}),
                    },
                )
    return results


def _default_points(model: Any, cfg_eval: Mapping[str, Any]) -> list[dict[str, Any]]:
    pts = list(cfg_eval.get("points") or [])
    if pts:
        return [dict(p) for p in pts]
    pts = list(model.meta.get("eval_points") or [])
    if not pts:
        raise ValueError(
            "aucun point d'évaluation : --params nom=valeur … ou eval.points dans la configuration"
        )
    return pts[: int(cfg_eval.get("max_points", 12))]


def main(argv: Sequence[str] | None = None) -> int:
    """Point d'entrée de ``python -m milady.eval.metrics`` et ``python -m milady.eval``."""
    ap = argparse.ArgumentParser(
        prog="python -m milady.eval.metrics",
        description="Évalue un modèle génératif 3D : divergence, spectres, hélicités, bilans, distances.",
    )
    ap.add_argument("--config", default=None, help="YAML d'entraînement (section eval) ; facultatif")
    ap.add_argument(
        "--model",
        default=None,
        help="identifiant du modèle au catalogue, ou chemin/URI d'un point de contrôle",
    )
    ap.add_argument(
        "--params",
        action="append",
        nargs="+",
        default=None,
        metavar="NOM=VALEUR",
        help="un point d'évaluation (répéter l'option pour plusieurs points)",
    )
    ap.add_argument("--n-samples", type=int, default=None)
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--steps", type=int, default=None, help="pas de Heun à l'échantillonnage")
    ap.add_argument(
        "--grid", type=int, default=None, help="résolution de reconstruction (défaut ≈ 3 kmax + 2)"
    )
    ap.add_argument("--reference", nargs="*", default=None, help="URI de fichiers MFF de référence")
    ap.add_argument("--ref-dataset", default=None, help="jeu de données de référence au catalogue")
    ap.add_argument("--ref-split", default=None, help="partition de référence (test, val, train)")
    ap.add_argument("--device", default=None)
    ap.add_argument("--no-catalog", action="store_true", help="n'enregistre rien au catalogue")
    ap.add_argument("--db-url", default=None, help="URL du catalogue (défaut MILADY_DB_URL)")
    ap.add_argument("--out", default=None, help="rapport JSON (chemin local ou URI)")
    ap.add_argument("-v", "--verbose", action="store_true")
    args = ap.parse_args(argv)
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s : %(message)s",
    )

    from milady import storage
    from milady.train import fm3d

    cfg = fm3d.load_config(args.config) if args.config else fm3d.default_config()
    ev = dict(cfg.get("eval") or {})
    cat = None
    if not args.no_catalog:
        try:
            from milady.catalog.api import Catalog

            cat = Catalog(args.db_url)
        except Exception as exc:  # noqa: BLE001 — l'évaluation reste possible sans catalogue
            LOG.warning("catalogue indisponible (%s) : résultats seulement dans le rapport JSON", exc)
    model_ref = args.model or ev.get("model")
    if not model_ref:
        model_ref = fm3d.latest_model_id(cat, cfg["name"]) if cat is not None else None
        if not model_ref:
            ap.error("préciser --model (identifiant du catalogue ou point de contrôle)")
    model, model_id = fm3d.load_model(model_ref, device=args.device or ev.get("device"), catalog=cat)
    points = [parse_params(p) for p in args.params] if args.params else _default_points(model, ev)

    reference: list[str] = list(args.reference or ev.get("reference_files") or [])
    ref_ds = args.ref_dataset or ev.get("reference_dataset")
    ref_split = args.ref_split or ev.get("reference_split")
    if not reference and (ref_ds or model.meta.get("dataset_name")) and cat is not None:
        name = ref_ds or model.meta.get("dataset_name")
        try:
            rows = cat.dataset_files(
                str(name), version=None if ref_ds else model.meta.get("dataset_version"), split=ref_split
            )
            reference = [r["uri"] for r in rows]
        except KeyError as exc:
            LOG.warning("référence indisponible : %s", exc)
    if not reference and model.meta.get("data_uris"):
        reference = list(model.meta["data_uris"])

    results = evaluate_model(
        model,
        points,
        n_samples=int(args.n_samples or ev.get("n_samples", 64)),
        seed=int(args.seed if args.seed is not None else ev.get("seed", 0)),
        steps=int(args.steps or ev.get("steps", cfg.get("sampling", {}).get("steps", 50))),
        grid=args.grid or ev.get("grid"),
        reference=reference,
        n_ref=int(ev.get("n_ref", 256)),
        batch_size=int(ev.get("batch_size", 16)),
        cache_dir=cfg.get("data", {}).get("cache_dir"),
        catalog=cat,
        model_id=model_id,
    )
    report = {
        "model": model_ref,
        "model_id": model_id,
        "created": _dt.datetime.now(_dt.UTC).isoformat(timespec="seconds"),
        "results": [{k: v for k, v in r.items()} for r in results],
    }
    text = json.dumps(
        report, indent=1, ensure_ascii=False, default=lambda o: o.tolist() if hasattr(o, "tolist") else str(o)
    )
    if args.out:
        if storage.is_local(args.out):
            Path(storage.local_path(args.out)).parent.mkdir(parents=True, exist_ok=True)
            Path(storage.local_path(args.out)).write_text(text, encoding="utf-8")
        else:
            with storage.open(args.out, "w") as fh:
                fh.write(text)
        LOG.info("rapport : %s", args.out)
    for r in results:
        print(
            json.dumps(
                {"point": r["point"], **{k: round(v, 6) for k, v in r["metrics"].items()}}, ensure_ascii=False
            )
        )
    if cat is not None and model_id:
        print(f"évaluations enregistrées au catalogue pour le modèle {model_id}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
