"""Solveur pseudo-spectral de la MHD incompressible 2D forcée, en potentiels.

Domaine [0, 2π)², périodique, grille N×N, désaliasage 2/3.
Inconnues : vorticité ω et potentiel magnétique a, avec
    u = (∂y ψ, -∂x ψ),  ω = -Δψ,      B = (∂y a, -∂x a),  j = -Δa.
Équations (forçage aléatoire blanc en temps f_ω, f_a ; frottement linéaire α aux grandes échelles) :
    ∂t ω + u·∇ω = B·∇j + ν Δω - α ω + f_ω
    ∂t a + u·∇a = η Δa - α a + f_a
Par construction ∇·u = ∇·B = 0 exactement.

Bilan d'énergie E = ½⟨|u|² + |B|²⟩ (⟨·⟩ = moyenne spatiale) :
    dE/dt = -ν⟨ω²⟩ - η⟨j²⟩ - α⟨|u|²⟩ - α⟨|B|²⟩ + (injection par le forçage).
Le forçage est blanc en temps : son taux d'injection moyen est une constante connue ε_inj
(formule d'Itô), indépendante de l'état. En régime statistiquement stationnaire :
    E[ν⟨ω²⟩ + η⟨j²⟩ + α⟨|u|²⟩ + α⟨|B|²⟩] = ε_inj,u + ε_inj,b.
C'est une contrainte sur la LOI des instantanés, pas sur chaque instantané.
"""
from __future__ import annotations

import numpy as np


class MHD2D:
    def __init__(self, n=64, nu=2e-3, eta=2e-3, alpha=0.02, kf=(2.0, 3.0), eps_u=0.05, eps_b=0.05,
                 batch=8, seed=0):
        self.n, self.nu, self.eta, self.alpha = n, nu, eta, alpha
        self.batch = batch
        self.rng = np.random.default_rng(seed)
        k = np.fft.fftfreq(n, 1.0 / n)
        kr = np.fft.rfftfreq(n, 1.0 / n)
        self.kx, self.ky = np.meshgrid(kr, k)          # (n, n//2+1) ; kx = indice rfft
        self.k2 = self.kx ** 2 + self.ky ** 2
        self.k2i = np.where(self.k2 > 0, 1.0 / np.maximum(self.k2, 1e-30), 0.0)
        kmax = n // 3
        self.dealias = (np.abs(self.kx) <= kmax) & (np.abs(self.ky) <= kmax)
        kk = np.sqrt(self.k2)
        self.fmask = (kk >= kf[0]) & (kk <= kf[1])
        # Amplitude du forçage blanc : injection moyenne ε = Σ_k |f̂_k|² var / (k² ...) — calibrée ci-dessous
        self.eps_u, self.eps_b = eps_u, eps_b
        self._calibrate_forcing()
        self.w = np.zeros((batch, n, n // 2 + 1), complex)
        self.a = np.zeros_like(self.w)

    # -- outils spectraux ------------------------------------------------------------
    def to_phys(self, fh):
        return np.fft.irfft2(fh, s=(self.n, self.n))

    def to_spec(self, f):
        return np.fft.rfft2(f)

    def _weights(self):
        """Poids des modes rfft (les colonnes intérieures comptent double)."""
        w = np.full(self.k2.shape, 2.0)
        w[:, 0] = 1.0
        if self.n % 2 == 0:
            w[:, -1] = 1.0
        return w

    def _calibrate_forcing(self):
        # Forçage f̂ = σ ξ / sqrt(dt) sur les modes de la bande. Injection moyenne (Itô) :
        #   pour ω : ε_u = ½ Σ_k w_k σ_u² / k² / N⁴ × N² … on calibre numériquement sur la norme ⟨·⟩.
        # Avec ⟨|u|²⟩ = Σ_k w_k |ω̂_k|²/k² / N⁴ et un bruit ξ complexe de variance 1 par mode,
        # l'injection d'énergie cinétique vaut ½ σ_u² Σ_{k∈bande} w_k / k² / N⁴ (et idem pour a avec k²→1/k²).
        wk = self._weights() * self.fmask
        n4 = self.n ** 4
        su = np.sum(wk * self.k2i) / n4          # pour ω : énergie = |ω̂|²/k²
        sb = np.sum(wk * self.k2) / n4           # pour a : énergie = k² |â|²
        self.sig_u = np.sqrt(2 * self.eps_u / su)
        self.sig_b = np.sqrt(2 * self.eps_b / sb)

    def _noise(self, sig, dt):
        xi = (self.rng.normal(size=self.w.shape) + 1j * self.rng.normal(size=self.w.shape)) / np.sqrt(2)
        f = sig * xi * self.fmask
        f[:, 0, 0] = 0
        # symétrie hermitienne de la colonne kx = 0 : on symétrise en passant par l'espace physique
        return self.to_spec(self.to_phys(f)) / np.sqrt(dt)

    # -- dynamique --------------------------------------------------------------------
    def fields(self, w=None, a=None):
        w = self.w if w is None else w
        a = self.a if a is None else a
        psi = w * self.k2i
        ux = self.to_phys(1j * self.ky * psi)
        uy = self.to_phys(-1j * self.kx * psi)
        bx = self.to_phys(1j * self.ky * a)
        by = self.to_phys(-1j * self.kx * a)
        return ux, uy, bx, by

    def nonlinear(self, w, a):
        psi = w * self.k2i
        j = self.k2 * a
        ux = self.to_phys(1j * self.ky * psi); uy = self.to_phys(-1j * self.kx * psi)
        bx = self.to_phys(1j * self.ky * a); by = self.to_phys(-1j * self.kx * a)
        wx = self.to_phys(1j * self.kx * w); wy = self.to_phys(1j * self.ky * w)
        jx = self.to_phys(1j * self.kx * j); jy = self.to_phys(1j * self.ky * j)
        ax = self.to_phys(1j * self.kx * a); ay = self.to_phys(1j * self.ky * a)
        nw = self.to_spec(-(ux * wx + uy * wy) + (bx * jx + by * jy)) * self.dealias
        na = self.to_spec(-(ux * ax + uy * ay)) * self.dealias
        return nw, na

    def step(self, dt):
        """Un pas : RK4 à facteur intégrant (Lawson) pour la partie déterministe, puis forçage (Euler–Maruyama)."""
        Lw = -(self.nu * self.k2 + self.alpha)
        La = -(self.eta * self.k2 + self.alpha)
        Ew, Ew2 = np.exp(Lw * dt), np.exp(Lw * dt / 2)
        Ea, Ea2 = np.exp(La * dt), np.exp(La * dt / 2)
        w, a = self.w, self.a
        k1w, k1a = self.nonlinear(w, a)
        k2w, k2a = self.nonlinear(Ew2 * (w + 0.5 * dt * k1w), Ea2 * (a + 0.5 * dt * k1a))
        k3w, k3a = self.nonlinear(Ew2 * w + 0.5 * dt * k2w, Ea2 * a + 0.5 * dt * k2a)
        k4w, k4a = self.nonlinear(Ew * w + dt * Ew2 * k3w, Ea * a + dt * Ea2 * k3a)
        w = Ew * w + dt / 6 * (Ew * k1w + 2 * Ew2 * (k2w + k3w) + k4w)
        a = Ea * a + dt / 6 * (Ea * k1a + 2 * Ea2 * (k2a + k3a) + k4a)
        self.w = w + dt * self._noise(self.sig_u, dt)
        self.a = a + dt * self._noise(self.sig_b, dt)
        self.w[:, 0, 0] = 0
        self.a[:, 0, 0] = 0

    def injection_rate(self, dt=1e-2, n_draw=200):
        """Taux d'injection moyen exact (Itô) des deux forçages, estimé sur des tirages du bruit."""
        wt = self._weights()
        n4 = self.n ** 4
        eu, eb = 0.0, 0.0
        for _ in range(n_draw):
            dw = dt * self._noise(self.sig_u, dt)
            da = dt * self._noise(self.sig_b, dt)
            eu += np.mean(0.5 * np.sum(wt * self.k2i * np.abs(dw) ** 2, axis=(-2, -1)) / n4) / dt
            eb += np.mean(0.5 * np.sum(wt * self.k2 * np.abs(da) ** 2, axis=(-2, -1)) / n4) / dt
        return eu / n_draw, eb / n_draw

    def injection_rates_all(self, dt=1e-2, n_draw=400):
        """Taux d'injection (Itô) de ½⟨|u|²⟩, ½⟨|B|²⟩ et ½⟨a²⟩ par le forçage blanc."""
        wt = self._weights()
        n4 = self.n ** 4
        eu = eb = ea = 0.0
        for _ in range(n_draw):
            dw = dt * self._noise(self.sig_u, dt)
            da = dt * self._noise(self.sig_b, dt)
            eu += np.mean(0.5 * np.sum(wt * self.k2i * np.abs(dw) ** 2, axis=(-2, -1)) / n4) / dt
            eb += np.mean(0.5 * np.sum(wt * self.k2 * np.abs(da) ** 2, axis=(-2, -1)) / n4) / dt
            ea += np.mean(0.5 * np.sum(wt * np.abs(da) ** 2, axis=(-2, -1)) / n4) / dt
        return eu / n_draw, eb / n_draw, ea / n_draw

    # -- diagnostics ------------------------------------------------------------------
    def diagnostics(self, w=None, a=None):
        w = self.w if w is None else w
        a = self.a if a is None else a
        wt = self._weights()
        n4 = self.n ** 4
        m = lambda f: np.sum(wt * np.abs(f) ** 2, axis=(-2, -1)) / n4   # ⟨f²⟩ (Parseval)
        Eu = 0.5 * m(w * np.sqrt(self.k2i))
        Eb = 0.5 * m(a * np.sqrt(self.k2))
        Zw = m(w)
        Jj = m(self.k2 * a)
        diss = self.nu * Zw + self.eta * Jj + self.alpha * 2 * Eu + self.alpha * 2 * Eb
        return {"Eu": Eu, "Eb": Eb, "enstrophie": Zw, "j2": Jj, "dissipation": diss}


def leray_project(ux, uy):
    """Projection de Leray d'un champ 2D périodique sur les champs à divergence nulle (en Fourier)."""
    n = ux.shape[-1]
    k = np.fft.fftfreq(n, 1.0 / n)
    kx, ky = np.meshgrid(k, k)
    k2 = kx ** 2 + ky ** 2
    k2[0, 0] = 1.0
    fx, fy = np.fft.fft2(ux), np.fft.fft2(uy)
    div = kx * fx + ky * fy
    fx = fx - kx * div / k2
    fy = fy - ky * div / k2
    return np.real(np.fft.ifft2(fx)), np.real(np.fft.ifft2(fy))
