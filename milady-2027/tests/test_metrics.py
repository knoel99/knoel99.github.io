"""Tests des métriques physiques et des distances entre lois (milady.eval.metrics), champs analytiques."""

from __future__ import annotations

import math

import numpy as np
import pytest

from milady.eval import metrics as M

N = 16


def _grid(n: int = N) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    x = 2 * np.pi * np.arange(n) / n
    return np.meshgrid(x, x, x, indexing="ij")


# ---------------------------------------------------------------------------------------------
# Divergence et spectres
# ---------------------------------------------------------------------------------------------
def test_divergence_solenoidal_and_gradient() -> None:
    abc = M.abc_field((N, N, N))
    assert M.divergence_relative(abc) < 1e-13
    X, Y, Z = _grid()
    # gradient de φ = sin x cos 2y sin 3z : divergence relative exactement 1
    grad = np.stack(
        [
            np.cos(X) * np.cos(2 * Y) * np.sin(3 * Z),
            -2 * np.sin(X) * np.sin(2 * Y) * np.sin(3 * Z),
            3 * np.sin(X) * np.cos(2 * Y) * np.cos(3 * Z),
        ],
        axis=-1,
    )
    assert M.divergence_relative(grad) == pytest.approx(1.0, rel=1e-12)
    per = M.divergence_relative(np.stack([abc, grad]), per_sample=True)
    assert per.shape == (2,) and per[0] < 1e-13 and per[1] == pytest.approx(1.0)
    # 2D : u = (∂yψ, −∂xψ)
    x = 2 * np.pi * np.arange(N) / N
    XX, YY = np.meshgrid(x, x, indexing="ij")
    u2 = np.stack([2 * np.cos(XX) * np.cos(2 * YY), np.sin(XX) * np.sin(2 * YY)], axis=-1)
    assert M.divergence_relative(u2) < 1e-13


def test_spectrum_single_mode() -> None:
    X, _, _ = _grid()
    u = np.zeros((N, N, N, 3))
    u[..., 2] = np.sin(3 * X)  # E = ½⟨sin²⟩ = 1/4, tout en k = 3
    spec = M.energy_spectrum(u)
    assert spec[3] == pytest.approx(0.25, rel=1e-12)
    assert np.sum(np.delete(spec, 3)) < 1e-25
    # mode oblique (1, 1, 1) : |m| = √3 → couronne 2 ; somme = ½⟨|u|²⟩ ; forme avec dimensions de tête
    X, Y, Z = _grid()
    v = np.zeros((2, N, N, N, 3))
    v[1, ..., 0] = np.cos(X + Y + Z)
    s2 = M.energy_spectrum(v, n_shells=6)
    assert s2.shape == (2, 6)
    assert s2[1, 2] == pytest.approx(0.25) and s2[0].sum() == 0.0
    assert s2[1].sum() == pytest.approx(0.5 * np.mean(np.sum(v[1] ** 2, -1)))


# ---------------------------------------------------------------------------------------------
# Hélicités (champs ABC : valeurs connues)
# ---------------------------------------------------------------------------------------------
@pytest.mark.parametrize("coeffs", [(1.0, 1.0, 1.0), (1.0, 0.5, 0.25)])
def test_helicities_abc(coeffs: tuple[float, float, float]) -> None:
    s2 = sum(c * c for c in coeffs)
    u = M.abc_field((N, N, N), coeffs=coeffs)  # ∇×u = u : ⟨u·ω⟩ = ⟨|u|²⟩ = A² + B² + C²
    h = M.helicities(u, u)
    assert h["kinetic_energy"] == pytest.approx(0.5 * s2, rel=1e-12)
    assert h["kinetic_helicity"] == pytest.approx(s2, rel=1e-12)
    assert h["magnetic_helicity"] == pytest.approx(s2, rel=1e-12)  # A = B (Beltrami, k = 1)
    assert h["cross_helicity"] == pytest.approx(s2, rel=1e-12)
    for key in ("relative_kinetic_helicity", "relative_magnetic_helicity", "relative_cross_helicity"):
        assert h[key] == pytest.approx(1.0, rel=1e-12)
    # kf = 2 : ∇×u = 2u → H_K = 2⟨|u|²⟩, A = B/2 → H_M = ⟨|B|²⟩/2 ; B → −B change le signe de H_C seulement
    u2 = M.abc_field((N, N, N), kf=2, coeffs=coeffs)
    h2 = M.helicities(u2, -u2)
    assert h2["kinetic_helicity"] == pytest.approx(2 * s2, rel=1e-12)
    assert h2["magnetic_helicity"] == pytest.approx(0.5 * s2, rel=1e-12)
    assert h2["cross_helicity"] == pytest.approx(-s2, rel=1e-12)


# ---------------------------------------------------------------------------------------------
# Bilans d'énergie
# ---------------------------------------------------------------------------------------------
def test_budget_stokes_taylor_green() -> None:
    """Solution de Stokes du forçage TG : −νΔu = f avec Δu = −3u (kf = 1) ⇒ injection = dissipation."""
    nu = 0.1
    u = M.taylor_green_field((N, N, N))
    params = {
        "mode": "dynamic",
        "forcing": "tg",
        "kf": 1,
        "nu": nu,
        "eta": 0.05,
        "forcing_amp": 3 * nu,
        "forcing_rule": "fixed",
    }
    bud = M.energy_budget(u, None, params)
    assert bud["injection"] == pytest.approx(3 * nu * np.mean(np.sum(u**2, -1)), rel=1e-12)
    assert abs(bud["residual_total"]) < 1e-14
    assert abs(M.budget_summary(bud)["residu_bilan_total"]) < 1e-12
    # forçage aléatoire : injection = eps
    rnd = M.energy_budget(
        np.stack([u, u]), None, {"mode": "dynamic", "forcing": "random", "eps": 0.3, "nu": nu}
    )
    assert np.allclose(rnd["injection"], 0.3)


def test_budget_kinematic_abc_eigen() -> None:
    """u = B = ABC (k = 1) : u × B = 0, donc production nulle et taux de croissance −η k²."""
    eta = 0.07
    b = M.abc_field((N, N, N))
    params = {"mode": "kinematic", "flow": "abc", "kf": 1, "U_ref": 1.0, "eta": eta}
    bud = M.energy_budget(None, b, params)  # u : écoulement imposé
    assert abs(bud["magnetic_production"]) < 1e-13
    assert bud["growth_rate"] == pytest.approx(-eta, rel=1e-12)
    assert bud["residual_magnetic"] == pytest.approx(-eta * 3.0, rel=1e-12)  # −η⟨|j|²⟩, ⟨|B|²⟩ = 3


def test_budget_matches_solver_diagnostics() -> None:
    """Termes du bilan recalculés depuis les champs = diagnostics du solveur pseudo-spectral 3D."""
    mhd3d = pytest.importorskip("milady.sim.mhd3d")
    sim = mhd3d.MHD3D(
        n=16,
        mode="dynamic",
        forcing="tg",
        nu=0.05,
        eta=0.04,
        kf=1,
        u_noise=0.1,
        b0_amp=0.3,
        n_traj=2,
        seed=3,
        dtype="float64",
    )
    sim.advance_to(0.05, 0.01)
    f = sim.fields(dtype=np.float64)
    params = {
        "mode": "dynamic",
        "forcing": "tg",
        "kf": 1,
        "nu": 0.05,
        "eta": 0.04,
        "U_ref": 1.0,
        "forcing_amp": sim.forcing_amp,
        "forcing_rule": "fixed",
    }
    bud = M.energy_budget(f["velocity"], f["magnetic_field"], params)
    diag = sim.diagnostics()
    for key in ("kinetic_dissipation", "magnetic_dissipation", "injection", "magnetic_production"):
        np.testing.assert_allclose(bud[key], diag[key], rtol=1e-9, atol=1e-12)
    h = M.helicities(f["velocity"], f["magnetic_field"])
    for key in ("kinetic_helicity", "magnetic_helicity", "cross_helicity"):
        np.testing.assert_allclose(h[key], diag[key], rtol=1e-9, atol=1e-12)
    # forçage : même champ que le solveur (règle laminaire)
    lam = M.forcing_field(
        {"mode": "dynamic", "forcing": "tg", "kf": 1, "nu": 0.05, "U_ref": 1.0, "forcing_rule": "laminar"},
        (16, 16, 16),
    )
    np.testing.assert_allclose(lam, sim.f_phys.permute(1, 2, 3, 0).cpu().numpy(), atol=1e-12)


# ---------------------------------------------------------------------------------------------
# Distances entre lois
# ---------------------------------------------------------------------------------------------
def test_energy_distance() -> None:
    rng = np.random.default_rng(0)
    x = rng.normal(size=(400, 3))
    assert abs(M.energy_distance(x, x)) < 1e-12
    same = M.energy_distance(x, rng.normal(size=(400, 3)))
    near = M.energy_distance(x, rng.normal(size=(400, 3)) + 0.5)
    far = M.energy_distance(x, rng.normal(size=(400, 3)) + 2.0)
    assert 0 <= same < near < far
    # 1D, décalage δ grand devant l'écart-type : D² → 2δ
    assert M.energy_distance(1e-3 * x[:, :1], 1e-3 * x[:, :1] + 5.0) == pytest.approx(10.0, rel=1e-3)


def test_sliced_wasserstein() -> None:
    rng = np.random.default_rng(1)
    x = rng.normal(size=(300, 1))
    assert M.sliced_wasserstein(x, x + 0.7) == pytest.approx(0.7, rel=1e-12)  # 1D : W1 = |δ|
    assert M.sliced_w1(x, x) == 0.0
    y = rng.normal(size=(500, 4))
    z = rng.normal(size=(300, 4)) + 1.0  # tailles différentes
    d = M.sliced_wasserstein(y, z, n_proj=128)
    # E_θ |θ·(1,1,1,1)| avec θ uniforme sur S³ : 2·E|θ₁| = 2 × 4/(3π)… ≈ 0.85 (bruit d'échantillonnage)
    assert 0.6 < d < 1.1


def test_features_and_compare() -> None:
    rng = np.random.default_rng(2)
    base = M.abc_field((8, 8, 8))
    u = base[None] * (1 + 0.1 * rng.normal(size=(6, 1, 1, 1, 1)))
    b = np.roll(base, 1, axis=0)[None] * (1 + 0.1 * rng.normal(size=(6, 1, 1, 1, 1)))
    feats, names = M.features(u, b, n_shells=3)
    assert feats.shape == (6, len(names)) and len(names) == 2 * 3 + 3 + 2
    neg, _ = M.features(u, -b, n_shells=3)
    ic = names.index("relative_cross_helicity")
    np.testing.assert_allclose(np.delete(neg, ic, 1), np.delete(feats, ic, 1))
    np.testing.assert_allclose(neg[:, ic], -feats[:, ic])
    params = {
        "mode": "dynamic",
        "forcing": "abc",
        "kf": 1,
        "nu": 0.1,
        "eta": 0.1,
        "forcing_amp": 0.1,
        "forcing_rule": "fixed",
    }
    res = M.compare_ensembles(
        {"velocity": u, "magnetic_field": b}, {"velocity": u, "magnetic_field": b}, params, n_shells=3
    )
    m = res["metrics"]
    assert m["div_rel_u"] < 1e-12 and m["div_rel_b"] < 1e-12
    assert abs(m["dist_energie"]) < 1e-12 and m["err_spectre_u_log10"] == 0.0 and m["err_Eb_rel"] == 0.0
    assert math.isfinite(m["residu_bilan_total"]) and "plancher_dist_energie" not in m  # < 8 échantillons
