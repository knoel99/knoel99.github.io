"""Vérification numérique du modèle de Gissinger (2012) citée dans specs/sources/dynamo.md.

RK4, dt = 0,01, t ∈ [0 ; 2·10⁴], transitoire de 500 retiré, condition initiale (0,1 ; 0,1 ; 0) ;
un renversement est compté quand D franchit ±0,5 avec changement de signe.
Usage : python3 specs/sources/scripts/gissinger_check.py 0.119 0.12 0.15 0.25 0.101 0.065
"""
import math, sys
def run(mu, nu=0.1, G=0.9, T=2e4, dt=0.01, y0=(0.1, 0.1, 0.0), thr=0.5):
    Q, D, V = y0
    def f(Q, D, V):
        return (mu*Q - V*D, -nu*D + V*Q, G - V + Q*D)
    n = int(T/dt); last=None; nrev=0; Dmin=1e9; Dmax=-1e9; Vmin=1e9; Vmax=-1e9
    trans = int(500/dt)
    for i in range(n):
        k1 = f(Q, D, V)
        k2 = f(Q+0.5*dt*k1[0], D+0.5*dt*k1[1], V+0.5*dt*k1[2])
        k3 = f(Q+0.5*dt*k2[0], D+0.5*dt*k2[1], V+0.5*dt*k2[2])
        k4 = f(Q+dt*k3[0], D+dt*k3[1], V+dt*k3[2])
        Q += dt/6*(k1[0]+2*k2[0]+2*k3[0]+k4[0])
        D += dt/6*(k1[1]+2*k2[1]+2*k3[1]+k4[1])
        V += dt/6*(k1[2]+2*k2[2]+2*k3[2]+k4[2])
        if i < trans: continue
        Dmin=min(Dmin,D); Dmax=max(Dmax,D); Vmin=min(Vmin,V); Vmax=max(Vmax,V)
        p = 1 if D > thr else (-1 if D < -thr else None)
        if p is None: continue
        if last is not None and p != last: nrev += 1
        last = p
    return dict(nrev=nrev, Dmin=round(Dmin,3), Dmax=round(Dmax,3), Vmin=round(Vmin,3), Vmax=round(Vmax,3))
for mu in [float(x) for x in sys.argv[1:]]:
    print(mu, run(mu), flush=True)
