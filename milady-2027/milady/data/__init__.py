"""Données MilaDy : format MFF 1.0 (HDF5 compatible The Well, variante Zarr), validation et convertisseurs.

Interface principale (voir ``milady.data.format`` et ``specs/format-donnees.md``) :

    from milady.data import write_mff, read_mff, validate
    sha = write_mff("sim.h5", {"velocity": u, "magnetic_field": b}, {"time": t, "x": x, "y": y, "z": z},
                    {"Rm": 20.0, "Re": 100.0}, meta={"code": "mhd3d_torch", "uuid": sim_id})
    data = read_mff("sim.h5", fields=["magnetic_field"], t=slice(-10, None))
    assert validate("sim.h5") == []
"""

from __future__ import annotations

from milady.data.format import (
    FORMAT_VERSION,
    STANDARD_FIELDS,
    describe,
    grid_info,
    open_mff,
    read_mff,
    sha256_file,
    to_zarr,
    validate,
    write_mff,
)

__all__ = [
    "FORMAT_VERSION",
    "STANDARD_FIELDS",
    "describe",
    "grid_info",
    "open_mff",
    "read_mff",
    "sha256_file",
    "to_zarr",
    "validate",
    "write_mff",
]
