# Library gaps — figure « flow-matching »

Parts drawn in `figure/parts.js` because no library part fitted:
- **Sideways density profile** (`profile`): `L.density` draws a density above a horizontal baseline; here the variable runs vertically and the density must grow left (t = 0) or right (t = 1) of a vertical time slice. A `side`/`vertical` option on `L.density` would cover it.
- **Space-time direction field** (`fieldArrow` + `frame`): a quiver of fixed-length arrows along the tangent (1, v(x, t)) of a 1D ODE in the (t, x) plane, with per-arrow opacity. No quiver / slope-field part exists; `L.arrow` applies `opacity` to the shaft only, so each arrow was wrapped in an `L.group({opacity})` to fade its head too.
- **Time axis with tick labels** (`timeAxis`): `L.plot` draws axes but no ticks; a small axis-with-ticks helper would be reused often.
