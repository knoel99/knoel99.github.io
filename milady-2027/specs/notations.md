# Notations communes

| Objet | Notation | Remarque |
|---|---|---|
| Domaine, bord | $\Omega \subset \mathbb{R}^d$, $\partial\Omega$, normale sortante $\mathbf{n}$ | $d = 2$ ou $3$ |
| Vitesse, champ magnétique | $\mathbf{u}(\mathbf{x}, t)$, $\mathbf{B}(\mathbf{x}, t)$ | $\mathbf{B}$ en unités d'Alfvén ($\mathbf{B}/\sqrt{\mu_0 \rho}$) |
| Vorticité, densité de courant | $\boldsymbol{\omega} = \nabla\times\mathbf{u}$, $\mathbf{j} = \nabla\times\mathbf{B}$ | en 2D : scalaires $\omega$, $j$ |
| Potentiels | fonction de courant $\psi$ ($\mathbf{u} = \nabla^\perp\psi = (\partial_y\psi, -\partial_x\psi)$), potentiel magnétique $a$ ($\mathbf{B} = \nabla^\perp a$) ; potentiel vecteur $\mathbf{A}$ ($\mathbf{B} = \nabla\times\mathbf{A}$) en 3D | |
| Viscosité, diffusivité magnétique | $\nu$, $\eta = 1/(\mu_0\sigma)$ | |
| Nombres sans dimension | $Re = UL/\nu$, $Rm = UL/\eta$, $Pm = \nu/\eta = Rm/Re$ | |
| Moyenne spatiale | $\langle f \rangle = \frac{1}{|\Omega|}\int_\Omega f\,\mathrm{d}\mathbf{x}$ | |
| Énergie | $E = \tfrac12\langle |\mathbf{u}|^2 + |\mathbf{B}|^2\rangle$ | |
| Hélicités | cinétique $H_K = \langle \mathbf{u}\cdot\boldsymbol\omega\rangle$, magnétique $H_M = \langle \mathbf{A}\cdot\mathbf{B}\rangle$, croisée $H_C = \langle \mathbf{u}\cdot\mathbf{B}\rangle$ | |
| Paramètres de contrôle | $\boldsymbol{\lambda}$ (ex. $Re$, $Rm$, $Pm$, $\Gamma$) | conditionnement du modèle |
| État discret | $\mathbf{x} \in \mathbb{R}^D$ | champ discrétisé |
| Loi des données, loi générée | $\mu_{\boldsymbol\lambda}$, $q_{\boldsymbol\lambda}$ (ou $q_\theta(\cdot\mid\boldsymbol\lambda)$) | |
| Bruit, temps du flot | $\mathbf{x}_0 \sim \mathcal{N}(0, I)$, $t \in [0, 1]$, $\mathbf{x}_t = (1-t)\mathbf{x}_0 + t\mathbf{x}_1$ | convention flow matching ($t=1$ : données) |
| Champ de vitesse du flot | $v_\theta(\mathbf{x}, t, \boldsymbol\lambda)$ | ne pas confondre avec la vitesse physique $\mathbf{u}$ |
| Dynamique physique | $\dot{\mathbf{x}} = F_{\boldsymbol\lambda}(\mathbf{x})$ (+ bruit $\sigma\,\mathrm{d}W$) | générateur $\mathcal{L}_{\boldsymbol\lambda}\varphi = F\cdot\nabla\varphi + \tfrac{\sigma^2}{2}\Delta\varphi$ |
| Divergences entre lois | $\mathrm{KL}(p\,\|\,q)$, $W_p$, distance d'énergie $\mathcal{E}$ | |
