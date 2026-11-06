"""Petit U-Net périodique (padding circulaire) pour le flow matching de champs 2D sur grille.

Conditionnement par le temps t et le paramètre physique c via FiLM (échelle, décalage).
"""
from __future__ import annotations

import torch
import torch.nn as nn
import torch.nn.functional as F

from common import Fourier


def conv(cin, cout, k=3):
    return nn.Conv2d(cin, cout, k, padding=k // 2, padding_mode="circular")


class ResBlock(nn.Module):
    def __init__(self, cin, cout, emb):
        super().__init__()
        self.n1 = nn.GroupNorm(8, cin)
        self.c1 = conv(cin, cout)
        self.n2 = nn.GroupNorm(8, cout)
        self.c2 = conv(cout, cout)
        self.film = nn.Linear(emb, 2 * cout)
        self.skip = nn.Conv2d(cin, cout, 1) if cin != cout else nn.Identity()

    def forward(self, x, e):
        h = self.c1(F.silu(self.n1(x)))
        s, b = self.film(e).chunk(2, dim=1)
        h = self.n2(h) * (1 + s[:, :, None, None]) + b[:, :, None, None]
        h = self.c2(F.silu(h))
        return h + self.skip(x)


class UNet(nn.Module):
    def __init__(self, cin=4, cout=4, ch=(32, 64, 128), emb=128):
        super().__init__()
        self.temb = Fourier(16)
        self.cemb = Fourier(16, scale=8.0)
        self.emb = nn.Sequential(nn.Linear(2 * 33, emb), nn.SiLU(), nn.Linear(emb, emb))
        self.inp = conv(cin, ch[0])
        self.down = nn.ModuleList()
        self.up = nn.ModuleList()
        c = ch[0]
        skips = []
        for i, co in enumerate(ch):
            self.down.append(ResBlock(c, co, emb))
            skips.append(co)
            c = co
        self.mid = ResBlock(c, c, emb)
        for i, co in reversed(list(enumerate(ch))):
            self.up.append(ResBlock(c + skips[i], co, emb))
            c = co
        self.out = nn.Sequential(nn.GroupNorm(8, c), nn.SiLU(), conv(c, cout))

    def forward(self, x, t, c):
        e = self.emb(torch.cat([self.temb(t), self.cemb(c)], dim=1))
        h = self.inp(x)
        hs = []
        for i, blk in enumerate(self.down):
            h = blk(h, e)
            hs.append(h)
            if i < len(self.down) - 1:
                h = F.avg_pool2d(h, 2)
        h = self.mid(h, e)
        for i, blk in enumerate(self.up):
            skip = hs.pop()
            if h.shape[-1] != skip.shape[-1]:
                h = F.interpolate(h, scale_factor=2, mode="nearest")
            h = blk(torch.cat([h, skip], dim=1), e)
        return self.out(h)
