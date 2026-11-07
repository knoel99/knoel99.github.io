"""Données d'entraînement 3D : fichiers MFF → représentation latente « potentiel vecteur de Fourier ».

Représentation (contrainte dure ∇·u = ∇·B = 0, voir ``specs/infra.md`` § 6) :

1. coefficients de Fourier (``rfftn``, norme « forward » : indépendants de la résolution) des champs u et B,
   tronqués à la boule |m| ≤ ``kmax`` (m = indices entiers, k = 2π m / L) et à un demi-espace (chaque mode
   représente aussi son conjugué −m ; le mode m = 0, champ moyen, est exclu) ;
2. potentiel vecteur en jauge de Coulomb, Â = i k × B̂ / |k|² (idem Â_u = i k × û / |k|² pour la vitesse) ;
3. composantes de Â dans la base orthonormée de Craya–Herring (e₁, e₂) du plan ⟂ k : k·Â = 0 exactement,
   deux coefficients complexes par mode et par champ, soit 4 réels (canaux ``a1.re, a1.im, a2.re, a2.im``) ;
4. normalisation par mode : moyenne par coordonnée (nulle pour B si la symétrie B → −B est imposée) et
   écart-type par mode et par champ (mis en commun sur les 4 canaux, plancher relatif 1e-6).

Le décodage B̂ = i k × Â (puis transformée inverse) donne un champ à divergence nulle **par construction**
(k·(k × Â) = 0) ; la divergence résiduelle est l'arrondi flottant (≈ 1e-7 en float32).

Le tenseur latent d'un instantané a la forme ``(M, C)`` : M modes (triés par |m| croissant), C = 4 × nombre
de champs. Le jeu de données renvoie ``(x normalisé (M, C), condition normalisée (n_cond,))``.

Sources des fichiers : liste d'URI (locales, ``s3://``, ``.zarr``), ou jeu de données du catalogue
(``Catalog.dataset_files``), créé au besoin à partir d'une campagne (simulations terminées).
"""

from __future__ import annotations

import dataclasses
import hashlib
import logging
import math
import os
from collections.abc import Callable, Iterator, Mapping, Sequence
from pathlib import Path
from typing import Any

import numpy as np
import torch
from torch import nn

from milady import storage
from milady.data.format import read_mff

__all__ = [
    "FIELD_NAMES",
    "CondSpec",
    "DataBundle",
    "EpochSampler",
    "FourierPotentialSpace",
    "LatentDataset",
    "build_data",
    "craya_basis",
    "fixed_parameters",
    "half_ball_modes",
    "iter_snapshots",
    "load_latents",
    "local_copy",
    "param_value",
    "physical_parameters",
    "resolve_uris",
]

LOG = logging.getLogger("milady.train")
FIELD_NAMES = ("velocity", "magnetic_field")
TWO_PI = 2.0 * math.pi
_DIFFUSIVITY_KEYS = ("nu", "eta", "Re", "Rm", "Pm")


# =============================================================================================
# Paramètres physiques et conditionnement
# =============================================================================================
def _num(v: Any) -> float | None:
    """Valeur numérique finie ou ``None``."""
    if isinstance(v, bool) or v is None:
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    return f if math.isfinite(f) else None


def param_value(params: Mapping[str, Any], name: str) -> float:
    """Valeur numérique du paramètre ``name``, déduite au besoin (Rm = U L/η, Re = U L/ν, Pm = ν/η…)."""
    v = _num(params.get(name))
    if v is not None:
        return v
    U, L = _num(params.get("U_ref")) or 1.0, _num(params.get("L_ref")) or 1.0
    nu, eta = _num(params.get("nu")), _num(params.get("eta"))
    Re, Rm = _num(params.get("Re")), _num(params.get("Rm"))
    if name == "Rm" and eta:
        return U * L / eta
    if name == "Re" and nu:
        return U * L / nu
    if name == "Pm":
        if nu is not None and eta:
            return nu / eta
        if Re and Rm:
            return Rm / Re
    if name == "eta" and Rm:
        return U * L / Rm
    if name == "nu" and Re:
        return U * L / Re
    raise KeyError(f"paramètre {name!r} absent (et non déductible) de {sorted(params)}")


def fixed_parameters(params_list: Sequence[Mapping[str, Any]]) -> dict[str, Any]:
    """Paramètres de même valeur dans tous les fichiers (forçage, kf, U_ref…) : contexte des conditions."""
    if not params_list:
        return {}
    out = dict(params_list[0])
    for p in params_list[1:]:
        for key in list(out):
            a, b = out[key], p.get(key)
            na, nb = _num(a), _num(b)
            same = (
                na is not None and nb is not None and math.isclose(na, nb, rel_tol=1e-9, abs_tol=0.0)
            ) or (na is None and a == b)
            if not same:
                del out[key]
    out.pop("seed", None)
    return out


def physical_parameters(
    cond: Mapping[str, float], fixed: Mapping[str, Any], lengths: Sequence[float] | None = None
) -> dict[str, Any]:
    """Paramètres physiques complets en un point de conditionnement (éventuellement non vu à l'entraînement).

    ``cond`` (ex. ``{"Re": 70, "Pm": 1.5}``) prime ; ν, η, Re, Rm, Pm sont recalculés de façon cohérente
    à partir des conditions et, pour compléter, des valeurs fixes du jeu de données (priorité Pm, Rm, η,
    Re, ν) ; l'amplitude d'un forçage « laminaire » (ν k_f² U) suit ν.
    """
    from milady.eval.metrics import forcing_amplitude

    groups = {"Re": "nu", "nu": "nu", "Rm": "eta", "eta": "eta", "Pm": "Pm"}
    base: dict[str, float] = {k: float(v) for k, v in cond.items()}
    have = {groups[k] for k in base if k in groups}
    for key in ("Pm", "Rm", "eta", "Re", "nu"):
        if len(have) >= 2:
            break
        v = _num(fixed.get(key))
        if v is not None and groups[key] not in have:
            base[key] = v
            have.add(groups[key])
    p: dict[str, Any] = {k: v for k, v in fixed.items() if k not in _DIFFUSIVITY_KEYS}
    p.update({k: v for k, v in base.items() if k not in _DIFFUSIVITY_KEYS})
    U, L = _num(p.get("U_ref")) or 1.0, _num(p.get("L_ref")) or 1.0
    nu, eta = base.get("nu"), base.get("eta")
    Re, Rm, Pm = base.get("Re"), base.get("Rm"), base.get("Pm")
    for _ in range(3):
        if nu is None and Re:
            nu = U * L / Re
        if eta is None and Rm:
            eta = U * L / Rm
        if eta is None and Pm and nu:
            eta = nu / Pm
        if nu is None and Pm is not None and eta:
            nu = Pm * eta
        if Rm is None and Re and Pm:
            Rm = Re * Pm
        if Re is None and Rm and Pm:
            Re = Rm / Pm
    if nu is not None:
        p["nu"] = nu
        if nu > 0:
            p["Re"] = U * L / nu
    if eta is not None and eta > 0:
        p["eta"] = eta
        p["Rm"] = U * L / eta
    if nu is not None and eta:
        p["Pm"] = nu / eta
    constant_forcing = str(p.get("mode", "dynamic")) == "dynamic" and str(p.get("forcing", "")) in (
        "abc",
        "tg",
    )
    if constant_forcing and (str(p.get("forcing_rule", "")) == "laminar" or "forcing_amp" not in p):
        p["forcing_rule"] = p.get("forcing_rule", "laminar")
        p["forcing_amp"] = forcing_amplitude(p, lengths)
    return p


@dataclasses.dataclass
class CondSpec:
    """Paramètre de conditionnement : nom, transformation (``log`` ou ``lin``) et plage de normalisation.

    La valeur normalisée vaut (T(p) − T(lo)) / (T(hi) − T(lo)) ∈ [0, 1] sur la plage d'entraînement ;
    ``lo``/``hi`` absents sont pris sur les données d'entraînement (min et max).
    """

    name: str
    transform: str = "log"
    lo: float | None = None
    hi: float | None = None

    def __post_init__(self) -> None:
        if self.transform not in ("log", "lin"):
            raise ValueError(f"conditionnement {self.name} : transformation 'log' ou 'lin' attendue")

    def _t(self, v: Any) -> Any:
        return np.log(v) if self.transform == "log" else v

    def _ti(self, v: Any) -> Any:
        return np.exp(v) if self.transform == "log" else v

    def fit(self, values: Sequence[float] | np.ndarray) -> CondSpec:
        """Fixe ``lo``/``hi`` manquants d'après les valeurs d'entraînement ; renvoie ``self``."""
        arr = np.asarray(values, dtype=np.float64)
        if self.lo is None:
            self.lo = float(arr.min())
        if self.hi is None:
            self.hi = float(arr.max())
        return self

    def _span(self) -> tuple[float, float]:
        if self.lo is None or self.hi is None:
            raise RuntimeError(f"conditionnement {self.name} : plage non initialisée (fit)")
        a, b = float(self._t(self.lo)), float(self._t(self.hi))
        return a, (b - a) if abs(b - a) > 1e-12 else 1.0

    def normalize(self, v: Any) -> Any:
        """Valeur brute → valeur normalisée."""
        a, s = self._span()
        return (self._t(np.asarray(v, dtype=np.float64)) - a) / s

    def denormalize(self, c: Any) -> Any:
        """Valeur normalisée → valeur brute."""
        a, s = self._span()
        return self._ti(np.asarray(c, dtype=np.float64) * s + a)

    def to_dict(self) -> dict[str, Any]:
        """Dictionnaire sérialisable."""
        return dataclasses.asdict(self)

    @classmethod
    def parse(cls, spec: str | Mapping[str, Any] | CondSpec) -> CondSpec:
        """``"Rm"``, ``"Rm:lin"`` ou ``{"name": "Rm", "transform": "log", "lo": …, "hi": …}``."""
        if isinstance(spec, CondSpec):
            return dataclasses.replace(spec)
        if isinstance(spec, str):
            name, _, tr = spec.partition(":")
            return cls(name.strip(), tr.strip() or "log")
        return cls(**{k: spec[k] for k in ("name", "transform", "lo", "hi") if k in spec})


# =============================================================================================
# Base de Fourier tronquée et potentiel vecteur
# =============================================================================================
def half_ball_modes(kmax: float) -> np.ndarray:
    """Indices entiers m de la boule 0 < |m| ≤ kmax, un représentant par paire (m, −m), triés par |m|.

    Demi-espace : m_z > 0, ou m_z = 0 et (m_y > 0, ou m_y = 0 et m_x > 0) — compatible avec ``rfftn``.
    """
    r = math.floor(kmax)
    if r < 1:
        raise ValueError("kmax ≥ 1 requis")
    g = np.arange(-r, r + 1)
    mx, my, mz = (a.ravel() for a in np.meshgrid(g, g, g, indexing="ij"))
    m2 = mx**2 + my**2 + mz**2
    half = (mz > 0) | ((mz == 0) & ((my > 0) | ((my == 0) & (mx > 0))))
    keep = half & (m2 > 0) & (m2 <= kmax * kmax + 1e-9)
    m = np.stack([mx[keep], my[keep], mz[keep]], axis=1)
    order = np.lexsort((m[:, 2], m[:, 1], m[:, 0], m2[keep]))
    return m[order].astype(np.int64)


def craya_basis(k: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Base orthonormée (e₁, e₂) du plan ⟂ k (Craya–Herring).

    e₁ = k × ẑ / |k × ẑ| (k × x̂ si k ∥ ẑ), e₂ = k × e₁ / |k|.
    """
    k = np.asarray(k, dtype=np.float64)
    kn = np.linalg.norm(k, axis=1, keepdims=True)
    e1 = np.cross(k, np.array([0.0, 0.0, 1.0]))
    n1 = np.linalg.norm(e1, axis=1, keepdims=True)
    par = n1[:, 0] < 1e-9 * kn[:, 0]
    if par.any():
        e1[par] = np.cross(k[par], np.array([1.0, 0.0, 0.0]))
        n1 = np.linalg.norm(e1, axis=1, keepdims=True)
    e1 /= n1
    e2 = np.cross(k, e1) / kn
    return e1, e2


def _cross(a: torch.Tensor, b: torch.Tensor) -> torch.Tensor:
    """Produit vectoriel sur la dernière dimension (réel ou complexe, diffusion des formes)."""
    a0, a1, a2 = a[..., 0], a[..., 1], a[..., 2]
    b0, b1, b2 = b[..., 0], b[..., 1], b[..., 2]
    return torch.stack((a1 * b2 - a2 * b1, a2 * b0 - a0 * b2, a0 * b1 - a1 * b0), dim=-1)


class FourierPotentialSpace(nn.Module):
    """Représentation latente « potentiel vecteur de Fourier » et sa normalisation (tampons du module).

    Paramètres : ``kmax`` (rayon de troncature en indices entiers), ``fields`` (``velocity``,
    ``magnetic_field`` ou un seul des deux), ``lengths`` (boîte périodique, défaut 2π), ``symmetric_b``
    (moyenne de B nulle, pour un modèle équivariant par B → −B).
    """

    m: torch.Tensor
    k: torch.Tensor
    e1: torch.Tensor
    e2: torch.Tensor
    shell: torch.Tensor
    mean: torch.Tensor
    std: torch.Tensor
    sign: torch.Tensor

    def __init__(
        self,
        kmax: float,
        fields: Sequence[str] = FIELD_NAMES,
        lengths: Sequence[float] = (TWO_PI, TWO_PI, TWO_PI),
        symmetric_b: bool = False,
    ) -> None:
        super().__init__()
        fields = tuple(fields)
        unknown = set(fields) - set(FIELD_NAMES)
        if unknown or not fields:
            raise ValueError(f"champs {fields} : sous-ensemble non vide de {FIELD_NAMES} attendu")
        self.kmax = float(kmax)
        self.fields = fields
        self.lengths = tuple(float(v) for v in lengths)
        self.symmetric_b = bool(symmetric_b)
        m = half_ball_modes(self.kmax)
        k = TWO_PI * m / np.asarray(self.lengths)[None, :]
        e1, e2 = craya_basis(k)
        self.register_buffer("m", torch.as_tensor(m))
        self.register_buffer("k", torch.as_tensor(k))
        self.register_buffer("e1", torch.as_tensor(e1))
        self.register_buffer("e2", torch.as_tensor(e2))
        self.register_buffer("shell", torch.as_tensor(np.rint(np.linalg.norm(m, axis=1)).astype(np.int64)))
        M, C = m.shape[0], 4 * len(fields)
        self.register_buffer("mean", torch.zeros(M, C))
        self.register_buffer("std", torch.ones(M, C))
        sign = torch.ones(C)
        if self.symmetric_b and "magnetic_field" in fields:
            i = fields.index("magnetic_field")
            sign[4 * i : 4 * i + 4] = -1.0
        self.register_buffer("sign", sign)

    # -- description -------------------------------------------------------------------------
    @property
    def n_modes(self) -> int:
        """Nombre de modes M."""
        return int(self.m.shape[0])

    @property
    def n_channels(self) -> int:
        """Nombre de canaux C = 4 × nombre de champs."""
        return 4 * len(self.fields)

    def config(self) -> dict[str, Any]:
        """Arguments du constructeur (sérialisables)."""
        return {
            "kmax": self.kmax,
            "fields": list(self.fields),
            "lengths": list(self.lengths),
            "symmetric_b": self.symmetric_b,
        }

    def field_slice(self, name: str) -> slice:
        """Canaux du champ ``name``."""
        i = self.fields.index(name)
        return slice(4 * i, 4 * i + 4)

    def default_grid(self) -> int:
        """Plus petite grille paire ≥ 3 kmax + 1 : produits quadratiques sans repliement sur |m| ≤ kmax."""
        n = math.floor(3 * self.kmax) + 1
        return n + (n % 2)

    # -- grille ↔ modes ----------------------------------------------------------------------
    def modes_from_grid(self, field: torch.Tensor) -> torch.Tensor:
        """Coefficients (norme « forward ») aux modes : ``(..., nx, ny, nz, 3)`` → ``(..., M, 3)``."""
        nx, ny, nz = field.shape[-4:-1]
        mmax = self.m.abs().amax(0).tolist()
        for i, n in enumerate((nx, ny, nz)):
            if 2 * mmax[i] >= n:
                raise ValueError(
                    f"kmax = {self.kmax} trop grand pour la grille {(nx, ny, nz)} (|m| < n/2 requis)"
                )
        fh = torch.fft.rfftn(field.movedim(-1, -4), dim=(-3, -2, -1), norm="forward")
        m = self.m
        hat = fh[..., m[:, 0] % nx, m[:, 1] % ny, m[:, 2]]
        return hat.movedim(-2, -1)

    def to_grid(self, hat: torch.Tensor, shape: Sequence[int]) -> torch.Tensor:
        """Champ physique ``(..., nx, ny, nz, 3)`` des coefficients ``(..., M, 3)`` (différentiable)."""
        nx, ny, nz = (int(n) for n in shape)
        nzr = nz // 2 + 1
        mmax = self.m.abs().amax(0).tolist()
        if 2 * mmax[0] >= nx or 2 * mmax[1] >= ny or 2 * mmax[2] >= nz:
            raise ValueError(f"grille {shape} trop petite pour kmax = {self.kmax}")
        lead = hat.shape[:-2]
        vals = hat.movedim(-1, -2).reshape(-1, self.n_modes)
        m = self.m
        lin = ((m[:, 0] % nx) * ny + (m[:, 1] % ny)) * nzr + m[:, 2]
        z0 = m[:, 2] == 0
        lin_c = (((-m[z0, 0]) % nx) * ny + ((-m[z0, 1]) % ny)) * nzr
        # Dispersion en parties réelle/imaginaire (index_add réel : tous appareils, différentiable) ; le plan
        # kz = 0 reçoit aussi les conjugués (symétrie hermitienne attendue par irfftn).
        vr = torch.view_as_real(vals)
        conj = torch.tensor([1.0, -1.0], dtype=vr.dtype, device=vr.device)
        full = torch.zeros(vals.shape[0], nx * ny * nzr, 2, dtype=vr.dtype, device=vr.device)
        full = full.index_add(1, lin, vr).index_add(1, lin_c, vr[:, z0] * conj)
        full = torch.view_as_complex(full).view(*lead, 3, nx, ny, nzr)
        f = torch.fft.irfftn(full, s=(nx, ny, nz), dim=(-3, -2, -1), norm="forward")
        return f.movedim(-4, -1)

    # -- potentiel vecteur -------------------------------------------------------------------
    def encode(self, fields: Mapping[str, Any]) -> torch.Tensor:
        """Champs ``{nom: (b, nx, ny, nz, 3)}`` → latent brut ``(b, M, C)`` (float32, non normalisé)."""
        cols = []
        k = self.k
        k2 = (k * k).sum(-1)
        for name in self.fields:
            if name not in fields:
                raise KeyError(f"champ {name!r} absent (fournis : {sorted(fields)})")
            f = torch.as_tensor(fields[name], dtype=torch.float64, device=k.device)
            hat = self.modes_from_grid(f)
            a = 1j * _cross(k.to(hat.dtype), hat) / k2[:, None]
            a1 = (a * self.e1).sum(-1)
            a2 = (a * self.e2).sum(-1)
            cols += [a1.real, a1.imag, a2.real, a2.imag]
        return torch.stack(cols, dim=-1).to(torch.float32)

    def potential_hat(self, x: torch.Tensor) -> torch.Tensor:
        """Latent brut ``(b, M, C)`` → potentiels Â ``(b, F, M, 3)`` complexes (k·Â = 0 par construction)."""
        b = x.shape[0]
        xr = x.reshape(b, self.n_modes, len(self.fields), 4).movedim(2, 1)
        e1, e2 = self.e1.to(x.dtype), self.e2.to(x.dtype)
        a1 = torch.complex(xr[..., 0], xr[..., 1])[..., None]
        a2 = torch.complex(xr[..., 2], xr[..., 3])[..., None]
        return a1 * e1 + a2 * e2

    def field_hat(self, x: torch.Tensor) -> torch.Tensor:
        """Coefficients des champs ``(b, F, M, 3)`` : f̂ = i k × Â (divergence nulle exacte)."""
        a = self.potential_hat(x)
        return 1j * _cross(self.k.to(x.dtype).to(a.dtype), a)

    def decode(self, x: torch.Tensor, shape: Sequence[int] | int | None = None) -> dict[str, torch.Tensor]:
        """Latent brut → champs physiques ``{nom: (b, nx, ny, nz, 3)}`` (u = ∇×A_u, B = ∇×A_B)."""
        n = shape if shape is not None else self.default_grid()
        grid = (n, n, n) if isinstance(n, int) else tuple(n)
        f = self.to_grid(self.field_hat(x), grid)
        return {name: f[:, i] for i, name in enumerate(self.fields)}

    # -- normalisation -----------------------------------------------------------------------
    @torch.no_grad()
    def fit(self, x: torch.Tensor) -> None:
        """Moyenne (par coordonnée) et écart-type (par mode et champ) du latent brut ``(N, M, C)``."""
        x64 = x.to(torch.float64)
        mean = x64.mean(0)
        if self.symmetric_b and "magnetic_field" in self.fields:
            mean[:, self.field_slice("magnetic_field")] = 0.0
        xc = x64 - mean
        std = torch.empty_like(mean)
        for name in self.fields:
            sl = self.field_slice(name)
            s = xc[:, :, sl].pow(2).mean(dim=(0, 2)).sqrt()
            s = torch.clamp(s, min=1e-6 * float(s.max()) + 1e-30)
            std[:, sl] = s[:, None]
        self.mean.copy_(mean.to(self.mean.dtype))
        self.std.copy_(std.to(self.std.dtype))

    def normalize(self, x: torch.Tensor) -> torch.Tensor:
        """Latent brut → latent normalisé."""
        return (x - self.mean) / self.std

    def denormalize(self, z: torch.Tensor) -> torch.Tensor:
        """Latent normalisé → latent brut."""
        return z * self.std + self.mean

    # -- grandeurs physiques depuis le latent (différentiables) -------------------------------
    def vector_modes(self, field: Any) -> torch.Tensor:
        """Champ vectoriel physique ``(nx, ny, nz, 3)`` (numpy) → coefficients aux modes ``(M, 3)``."""
        f = torch.as_tensor(np.asarray(field), dtype=torch.float64, device=self.k.device)
        return self.modes_from_grid(f)

    def budget_terms(
        self,
        x: torch.Tensor,
        nu: torch.Tensor,
        eta: torch.Tensor,
        *,
        forcing_hat: torch.Tensor | None = None,
        flow_hat: torch.Tensor | None = None,
        injection: torch.Tensor | None = None,
        production: bool = False,
        grid: int | None = None,
    ) -> dict[str, torch.Tensor]:
        """Termes des bilans d'énergie par échantillon depuis le latent brut ``x`` (b, M, C), dérivables.

        Termes quadratiques par Parseval sur les modes (chaque mode compte deux fois) ; production
        ⟨j·(u×B)⟩ sur une grille sans repliement (``grid`` ≥ 3 kmax + 1). ``forcing_hat`` (M, 3) : forçage
        d'amplitude 1 aux modes, multiplié par ``injection`` (amplitude par échantillon) ; sans
        ``forcing_hat``, ``injection`` est directement la puissance injectée. ``flow_hat`` : écoulement
        imposé (mode cinématique) quand u n'est pas généré.
        """
        k = self.k.to(x.dtype)
        k2 = (k * k).sum(-1)
        a = self.potential_hat(x)
        out: dict[str, torch.Tensor] = {}
        uh = bh = None
        if "velocity" in self.fields:
            i = self.fields.index("velocity")
            au = a[:, i]
            a2 = (au.abs() ** 2).sum(-1)
            out["kinetic_energy"] = (k2 * a2).sum(-1)
            out["kinetic_dissipation"] = nu * 2.0 * (k2 * k2 * a2).sum(-1)
            uh = 1j * _cross(k.to(au.dtype), au)
        elif flow_hat is not None:
            uh = flow_hat.to(a.dtype).expand(x.shape[0], -1, -1)
        if "magnetic_field" in self.fields:
            i = self.fields.index("magnetic_field")
            ab = a[:, i]
            a2 = (ab.abs() ** 2).sum(-1)
            out["magnetic_energy"] = (k2 * a2).sum(-1)
            out["magnetic_dissipation"] = eta * 2.0 * (k2 * k2 * a2).sum(-1)
            bh = 1j * _cross(k.to(ab.dtype), ab)
        if forcing_hat is not None and uh is not None:
            amp = injection if injection is not None else torch.ones_like(nu)
            out["injection"] = amp * 2.0 * (uh * forcing_hat.to(uh.dtype).conj()).real.sum(dim=(-2, -1))
        elif injection is not None:
            out["injection"] = injection
        else:
            out["injection"] = torch.zeros_like(nu)
        if production:
            if uh is None or bh is None:
                raise ValueError("production magnétique : u (généré ou imposé) et B requis")
            n = grid or self.default_grid()
            jh = k2[:, None] * a[:, self.fields.index("magnetic_field")]
            fields = self.to_grid(torch.stack([uh, bh, jh], dim=1), (n, n, n))
            u, b, j = fields[:, 0], fields[:, 1], fields[:, 2]
            out["magnetic_production"] = (j * _cross(u, b)).sum(-1).mean(dim=(-3, -2, -1))
        return out

    def shell_spectra(self, x: torch.Tensor) -> dict[str, torch.Tensor]:
        """Spectres en couronnes E(k) (k = 1…kmax) depuis le latent brut : ``{nom: (b, n_shells)}``."""
        k2 = (self.k.to(x.dtype) ** 2).sum(-1)
        a = self.potential_hat(x)
        ns = int(self.shell.max()) + 1
        out = {}
        for i, name in enumerate(self.fields):
            dens = k2 * (a[:, i].abs() ** 2).sum(-1)
            spec = torch.zeros(x.shape[0], ns, dtype=dens.dtype, device=x.device)
            out[name] = spec.index_add(1, self.shell, dens)[:, 1:]
        return out


# =============================================================================================
# Lecture des fichiers MFF
# =============================================================================================
def local_copy(uri: str, cache_dir: str | os.PathLike[str] | None) -> str:
    """Chemin lisible localement : ``uri`` (locale ou sans cache) ou sa copie dans ``cache_dir``."""
    if storage.is_local(uri) or not cache_dir or uri.rstrip("/").endswith(".zarr"):
        return uri
    key = hashlib.sha1(uri.encode("utf-8")).hexdigest()[:16]
    dst = (
        Path(os.path.expandvars(os.fspath(cache_dir))).expanduser()
        / f"{key}-{Path(storage.split_uri(uri)[1]).name}"
    )
    if not dst.exists():
        storage.get(uri, dst)
    return str(dst)


def grid_lengths(coords: Mapping[str, np.ndarray]) -> tuple[float, float, float]:
    """Longueurs de la boîte périodique depuis les coordonnées (x_j = j L / n)."""
    out = []
    for d in ("x", "y", "z"):
        if d not in coords:
            raise ValueError("fichier 3D (coordonnées x, y, z) attendu")
        c = np.asarray(coords[d], dtype=np.float64)
        out.append(float(c.size * (c[1] - c[0])) if c.size > 1 else TWO_PI)
    return out[0], out[1], out[2]


def iter_snapshots(
    uris: Sequence[str],
    fields: Sequence[str],
    *,
    t_min: float | None = None,
    stride: int = 1,
    max_per_file: int | None = None,
    chunk: int = 8,
    cache_dir: str | None = None,
    select: Callable[[Mapping[str, Any]], bool] | None = None,
) -> Iterator[tuple[str, dict[str, Any], dict[str, np.ndarray]]]:
    """Parcourt les instantanés des fichiers par blocs de ``chunk`` pas de temps (mémoire bornée).

    Rend ``(uri, paramètres, {champ: (n_traj × n_t_bloc, nx, ny, nz, 3)})`` ; ``t_min`` écarte le transitoire,
    ``stride`` sous-échantillonne en temps, ``select(params)`` filtre les fichiers. Les longueurs de boîte
    sont dans ``params["_lengths"]``.
    """
    for uri in uris:
        path = local_copy(uri, cache_dir)
        head = read_mff(path, fields=[])
        params = dict(head["params"])
        if select is not None and not select(params):
            continue
        params["_lengths"] = grid_lengths(head["coords"])
        times = np.asarray(head["coords"]["time"], dtype=np.float64).reshape(-1)
        first = int(np.searchsorted(times, t_min, side="left")) if t_min is not None else 0
        idx = list(range(first, times.size, max(1, int(stride))))
        if max_per_file is not None:
            idx = idx[: int(max_per_file)]
        if not idx:
            LOG.warning("%s : aucun instantané après t_min = %s", uri, t_min)
            continue
        step = max(1, int(stride))
        for i in range(0, len(idx), chunk):
            sub = idx[i : i + chunk]
            try:
                d = read_mff(path, fields=list(fields), t=slice(sub[0], sub[-1] + 1, step))
            except KeyError as exc:
                raise KeyError(f"{uri} : {exc}") from exc
            out = {}
            for name in fields:
                arr = np.asarray(d["fields"][name])
                if arr.ndim != 6 or arr.shape[-1] != 3:
                    raise ValueError(f"{uri} : {name} de forme {arr.shape}, (B, T, nx, ny, nz, 3) attendu")
                out[name] = arr.reshape(-1, *arr.shape[2:])
            yield uri, params, out


@dataclasses.dataclass
class LatentData:
    """Latents bruts d'une partition : ``latents`` (N, M, C), ``file_index`` (N,), paramètres par fichier."""

    latents: torch.Tensor
    file_index: torch.Tensor
    params: list[dict[str, Any]]
    uris: list[str]


def load_latents(
    uris: Sequence[str],
    space: FourierPotentialSpace,
    *,
    t_min: float | None = None,
    stride: int = 1,
    max_per_file: int | None = None,
    chunk: int = 8,
    cache_dir: str | None = None,
) -> LatentData:
    """Lit et encode tous les instantanés de ``uris`` (vérifie que la boîte est celle de ``space``)."""
    lat: list[torch.Tensor] = []
    fidx: list[torch.Tensor] = []
    params: list[dict[str, Any]] = []
    used: list[str] = []
    for uri, p, chunk_fields in iter_snapshots(
        uris,
        space.fields,
        t_min=t_min,
        stride=stride,
        max_per_file=max_per_file,
        chunk=chunk,
        cache_dir=cache_dir,
    ):
        if not np.allclose(p["_lengths"], space.lengths, rtol=1e-5):
            raise ValueError(f"{uri} : boîte {p['_lengths']} ≠ {space.lengths} (un jeu = une géométrie)")
        if not used or used[-1] != uri:
            used.append(uri)
            params.append({k: v for k, v in p.items() if k != "_lengths"})
        x = space.encode(chunk_fields)
        lat.append(x.cpu())
        fidx.append(torch.full((x.shape[0],), len(used) - 1, dtype=torch.long))
    if not lat:
        raise ValueError(f"aucun instantané lu dans {len(uris)} fichier(s)")
    return LatentData(torch.cat(lat), torch.cat(fidx), params, used)


class LatentDataset(torch.utils.data.Dataset):
    """Jeu de données en mémoire : ``x`` normalisé (N, M, C) et condition normalisée (N, n_cond), float32."""

    def __init__(
        self,
        x: torch.Tensor,
        cond: torch.Tensor,
        file_index: torch.Tensor,
        params: list[dict[str, Any]],
        uris: list[str],
    ) -> None:
        self.x = x
        self.cond = cond
        self.file_index = file_index
        self.params = params
        self.uris = uris

    def __len__(self) -> int:
        return int(self.x.shape[0])

    def __getitem__(self, i: int) -> tuple[torch.Tensor, torch.Tensor]:
        return self.x[i], self.cond[i]

    def to(self, device: torch.device | str) -> LatentDataset:
        """Copie des tenseurs sur ``device`` (le jeu tient en mémoire : quelques Mo à quelques Go)."""
        return LatentDataset(
            self.x.to(device), self.cond.to(device), self.file_index.to(device), self.params, self.uris
        )


class EpochSampler:
    """Lots d'une époque : permutation commune à tous les processus (graine, époque), partagée par rang.

    La permutation est complétée pour que chaque rang ait le même nombre de lots (exigence de DDP).
    """

    def __init__(self, n: int, batch_size: int, rank: int = 0, world: int = 1, seed: int = 0) -> None:
        self.n, self.batch_size, self.rank, self.world, self.seed = n, int(batch_size), rank, world, seed

    def __len__(self) -> int:
        per_rank = math.ceil(self.n / self.world)
        return max(1, math.ceil(per_rank / self.batch_size))

    def epoch(self, epoch: int) -> list[torch.Tensor]:
        """Indices des lots de l'époque ``epoch`` pour ce rang."""
        g = torch.Generator().manual_seed(int(self.seed) * 100_003 + int(epoch))
        perm = torch.randperm(self.n, generator=g)
        total = math.ceil(self.n / self.world) * self.world
        if total > self.n:
            perm = torch.cat([perm, perm[: total - self.n]])
        mine = perm[self.rank :: self.world]
        return [mine[i : i + self.batch_size] for i in range(0, len(mine), self.batch_size)][: len(self)]


# =============================================================================================
# Résolution des sources (catalogue, campagne, URI)
# =============================================================================================
def _matches(params: Mapping[str, Any], spec: Mapping[str, Any]) -> bool:
    for key, val in spec.items():
        try:
            if not math.isclose(param_value(params, key), float(val), rel_tol=1e-6, abs_tol=1e-12):
                return False
        except (KeyError, TypeError, ValueError):
            if params.get(key) != val:
                return False
    return True


def resolve_uris(
    cfg_data: Mapping[str, Any],
    *,
    files: Sequence[str] | None = None,
    dataset: str | None = None,
    catalog: Any | None = None,
) -> dict[str, Any]:
    """URI par partition ``{"train": […], "val": […], "test": […]}`` et provenance (``dataset_id``…).

    Priorité : ``files`` (ligne de commande) ; ``data.files`` ; jeu de données (``dataset`` ou
    ``data.dataset``, forme ``nom`` ou ``nom:version``) au catalogue ; s'il n'existe pas et que
    ``data.campaign`` est donné, il est créé à partir des simulations terminées de la campagne, les
    partitions ``val``/``test`` étant désignées par ``data.auto_dataset.val/test`` (listes de jeux de
    paramètres). Une liste explicite de fichiers va entièrement en ``train`` (``data.val_files``,
    ``data.test_files`` pour les autres partitions).
    """
    out: dict[str, Any] = {
        "train": [],
        "val": [],
        "test": [],
        "dataset_id": None,
        "dataset_name": None,
        "dataset_version": None,
    }
    explicit = list(files or []) or list(cfg_data.get("files") or [])
    if explicit and not dataset:
        out["train"] = [os.path.expandvars(u) for u in explicit]
        out["val"] = [os.path.expandvars(u) for u in cfg_data.get("val_files") or []]
        out["test"] = [os.path.expandvars(u) for u in cfg_data.get("test_files") or []]
        return out
    name = dataset or cfg_data.get("dataset")
    if not name:
        raise ValueError(
            "aucune donnée : --files URI…, --dataset NOM, ou data.files / data.dataset dans la configuration"
        )
    version = cfg_data.get("version")
    if ":" in str(name):
        name, version = str(name).split(":", 1)
    if catalog is None:
        from milady.catalog.api import Catalog

        catalog = Catalog()
    try:
        rows = catalog.dataset_files(name, version=version)
    except KeyError:
        campaign = cfg_data.get("campaign")
        if not campaign:
            raise
        rows = _create_dataset(
            catalog, str(name), str(version or "1"), str(campaign), cfg_data.get("auto_dataset") or {}
        )
    for r in rows:
        out[r["split"]].append(r["uri"])
    if rows:
        out["dataset_id"] = rows[0]["dataset_id"]
    out["dataset_name"], out["dataset_version"] = name, version
    return out


def _create_dataset(
    catalog: Any, name: str, version: str, campaign: str, rule: Mapping[str, Any]
) -> list[dict[str, Any]]:
    """Crée le jeu ``name`` v``version`` : fichiers ``fields`` des simulations terminées d'une campagne."""
    sims = catalog.query_simulations(campaign=campaign, status="done")
    members = []
    for sim in sims:
        split = "train"
        for part in ("test", "val"):
            if any(_matches(sim["parameters"], spec) for spec in rule.get(part) or []):
                split = part
                break
        for f in sim.get("files", []):
            if f.get("kind") == "fields":
                members.append((f["id"], split))
    if not members:
        raise ValueError(f"campagne {campaign!r} : aucune simulation terminée avec un fichier « fields »")
    catalog.register_dataset(
        name, version, members, description=f"créé par milady.train depuis la campagne {campaign}"
    )
    LOG.info("jeu de données %s v%s créé : %d fichiers", name, version, len(members))
    return catalog.dataset_files(name, version=version)


# =============================================================================================
# Assemblage
# =============================================================================================
@dataclasses.dataclass
class DataBundle:
    """Espace latent ajusté, conditionnement, partitions et contexte physique d'un entraînement."""

    space: FourierPotentialSpace
    cond_specs: list[CondSpec]
    splits: dict[str, LatentDataset]
    fixed_params: dict[str, Any]
    eval_points: list[dict[str, float]]
    info: dict[str, Any]


def _cond_matrix(data: LatentData, specs: Sequence[CondSpec]) -> np.ndarray:
    per_file = np.array([[param_value(p, s.name) for s in specs] for p in data.params], dtype=np.float64)
    return per_file.reshape(len(data.params), len(specs))


def build_data(
    cfg_data: Mapping[str, Any],
    uris: Mapping[str, Sequence[str]],
    *,
    symmetric_b: bool = False,
    space_state: Mapping[str, Any] | None = None,
    cond_specs: Sequence[CondSpec | Mapping[str, Any] | str] | None = None,
) -> DataBundle:
    """Lit les partitions, ajuste la normalisation sur ``train`` et rend les jeux de données normalisés.

    ``space_state`` (``{"config": …, "state": …}``) et ``cond_specs`` : reprise d'un modèle existant
    (réglage fin) — la normalisation et les plages de conditionnement du modèle sont alors conservées.
    """
    fields = tuple(cfg_data.get("fields") or FIELD_NAMES)
    opts: dict[str, Any] = {
        "t_min": cfg_data.get("t_min"),
        "stride": int(cfg_data.get("stride") or 1),
        "max_per_file": cfg_data.get("max_snapshots_per_file"),
        "chunk": int(cfg_data.get("read_chunk") or 8),
        "cache_dir": cfg_data.get("cache_dir"),
    }
    train_uris = list(uris.get("train") or [])
    if not train_uris:
        raise ValueError("partition « train » vide")
    if space_state is not None:
        space = FourierPotentialSpace(**space_state["config"])
        space.load_state_dict(space_state["state"])
    else:
        first = next(iter_snapshots(train_uris[:1], fields, **{**opts, "max_per_file": 1}))
        space = FourierPotentialSpace(
            float(cfg_data.get("kmax", 8)), fields, first[1]["_lengths"], symmetric_b
        )
    raw = {"train": load_latents(train_uris, space, **opts)}
    for split in ("val", "test"):
        if uris.get(split):
            raw[split] = load_latents(list(uris[split]), space, **opts)
    if space_state is None:
        space.fit(raw["train"].latents)
    specs = [
        CondSpec.parse(s)
        for s in (cond_specs if cond_specs is not None else cfg_data.get("conditioning") or [])
    ]
    cond_train = _cond_matrix(raw["train"], specs)
    for j, s in enumerate(specs):
        s.fit(cond_train[:, j])
    splits: dict[str, LatentDataset] = {}
    for split, data in raw.items():
        per_file = _cond_matrix(data, specs)
        cn = (
            np.stack([s.normalize(per_file[:, j]) for j, s in enumerate(specs)], axis=1)
            if specs
            else per_file
        )
        cond = torch.as_tensor(cn, dtype=torch.float32)[data.file_index]
        x = space.normalize(data.latents)
        splits[split] = LatentDataset(x.to(torch.float32), cond, data.file_index, data.params, data.uris)
    fixed = fixed_parameters(raw["train"].params)
    points: list[dict[str, float]] = []
    for split in ("train", "val", "test"):
        if split in raw:
            for p in raw[split].params:
                pt = {s.name: param_value(p, s.name) for s in specs}
                if pt not in points:
                    points.append(pt)
    info = {
        "n_snapshots": {k: int(v.latents.shape[0]) for k, v in raw.items()},
        "n_files": {k: len(v.uris) for k, v in raw.items()},
        "n_modes": space.n_modes,
        "n_channels": space.n_channels,
        "latent_dim": space.n_modes * space.n_channels,
        "lengths": list(space.lengths),
        "data_uris": [u for v in raw.values() for u in v.uris],
    }
    LOG.info(
        "données : %s instantanés, %d modes × %d canaux (dimension %d)",
        info["n_snapshots"],
        space.n_modes,
        space.n_channels,
        info["latent_dim"],
    )
    return DataBundle(space, specs, splits, fixed, points, info)
