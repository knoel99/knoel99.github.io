"""Tests du format MFF 1.0 : aller-retour, structure The Well, validation, Zarr, convertisseurs E2 et SFEMaNS."""

from __future__ import annotations

import hashlib
import itertools
import json
import os
from pathlib import Path

import h5py
import numpy as np
import pytest

from milady.data import convert, read_mff, to_zarr, validate, write_mff
from milady.data import format as mff

RNG = np.random.default_rng(1234)


def _fields3d(B: int = 2, T: int = 3, shape: tuple[int, int, int] = (8, 6, 4)) -> dict[str, np.ndarray]:
    u = RNG.normal(size=(B, T, *shape, 3))
    b = RNG.normal(size=(B, T, *shape, 3))
    p = RNG.normal(size=(B, T, *shape))
    s = RNG.normal(size=(B, T, *shape, 3, 3))
    return {"velocity": u, "magnetic_field": b, "pressure": p, "strain_rate": s + np.swapaxes(s, -1, -2)}


def _coords3d(T: int = 3, shape: tuple[int, int, int] = (8, 6, 4)) -> dict[str, np.ndarray]:
    return {"time": 0.5 * np.arange(T), **{d: 2 * np.pi * np.arange(n) / n for d, n in zip("xyz", shape)}}


@pytest.fixture()
def mff3d(tmp_path: Path) -> tuple[Path, dict[str, np.ndarray], str]:
    fields = _fields3d()
    path = tmp_path / "sim.h5"
    sha = write_mff(
        path,
        fields,
        _coords3d(),
        {"Rm": 12.5, "Re": 100, "mu_r": 1.0, "forcing": "ABC"},
        meta={
            "code": "mhd3d_torch",
            "code_version": "0.1.0",
            "git_commit": "0123456789ab",
            "nondimensionalization": "L = 2π, unités d'Alfvén",
            "uuid": "1b4e28ba-2fa1-11d2-883f-0016d3cca427",
            "solver": {"dt": 1e-3, "scheme": "RK4"},
        },
        diagnostics={"kinetic_energy": RNG.random((2, 3)), "max_div_b": RNG.random(3) * 1e-12},
        scalars={"injection": RNG.random(3), "seed": np.array([1.0, 2.0])},
        spectral=True,
    )
    return path, fields, sha


# ---------------------------------------------------------------------------------------------
# Aller-retour
# ---------------------------------------------------------------------------------------------
def test_roundtrip_3d(mff3d: tuple[Path, dict[str, np.ndarray], str]) -> None:
    path, fields, sha = mff3d
    assert sha == hashlib.sha256(path.read_bytes()).hexdigest()
    assert validate(path) == []
    d = read_mff(path)
    for name, arr in fields.items():
        np.testing.assert_array_equal(d["fields"][name], arr.astype(np.float32))
        assert d["fields"][name].dtype == np.float32
    assert d["params"] == {"Rm": 12.5, "Re": 100, "mu_r": 1.0, "forcing": "ABC"}
    assert d["meta"]["uuid"] == "1b4e28ba-2fa1-11d2-883f-0016d3cca427"
    assert d["meta"]["code"] == "mhd3d_torch" and d["meta"]["format_version"] == "1.0"
    assert d["meta"]["solver"] == {"dt": 1e-3, "scheme": "RK4"}
    assert d["meta"]["spatial_dims"] == ["x", "y", "z"]
    assert set(d["meta"]["boundary_conditions"]) == {"x_periodic", "y_periodic", "z_periodic"}
    np.testing.assert_allclose(d["coords"]["time"], [0.0, 0.5, 1.0])
    assert d["coords"]["x"].shape == (8,) and d["coords"]["z"].shape == (4,)
    assert d["diagnostics"]["kinetic_energy"].shape == (2, 3)
    assert d["scalars"]["Rm"] == pytest.approx(12.5)
    assert d["scalars"]["injection"].shape == (3,) and d["scalars"]["seed"].shape == (2,)


def test_read_selection(mff3d: tuple[Path, dict[str, np.ndarray], str]) -> None:
    path, fields, _ = mff3d
    d = read_mff(path, fields=["t1_fields/magnetic_field"], t=slice(1, 3), traj=1)
    assert list(d["fields"]) == ["magnetic_field"]
    np.testing.assert_array_equal(
        d["fields"]["magnetic_field"], fields["magnetic_field"][1:2, 1:3].astype(np.float32)
    )
    np.testing.assert_allclose(d["coords"]["time"], [0.5, 1.0])
    d = read_mff(path, fields=["pressure"], t=[2, 0])
    np.testing.assert_array_equal(d["fields"]["pressure"], fields["pressure"][:, [2, 0]].astype(np.float32))
    d = read_mff(path, fields=["velocity"], t=-1)
    assert d["fields"]["velocity"].shape == (2, 1, 8, 6, 4, 3)
    with pytest.raises(KeyError):
        read_mff(path, fields=["absent"])


def test_spectral_consistency(mff3d: tuple[Path, dict[str, np.ndarray], str]) -> None:
    path, fields, _ = mff3d
    d = read_mff(path, fields=["velocity"], spectral=["velocity"], t=0)
    spec = d["spectral"]["velocity"]
    assert spec.shape == (2, 1, 8, 6, 3, 3) and np.iscomplexobj(spec)
    rec = np.fft.irfftn(spec, s=(8, 6, 4), axes=(2, 3, 4))
    np.testing.assert_allclose(rec, fields["velocity"][:, :1], atol=1e-5)
    assert d["spectral_meta"]["real_shape"] == [8, 6, 4]
    assert d["spectral_meta"]["domain_lengths"] == pytest.approx([2 * np.pi] * 3)


# ---------------------------------------------------------------------------------------------
# Structure The Well (docs/data_format.md de PolymathicAI/the_well)
# ---------------------------------------------------------------------------------------------
def test_well_structure(mff3d: tuple[Path, dict[str, np.ndarray], str]) -> None:
    path, _, _ = mff3d
    with h5py.File(path, "r") as f:
        a = f.attrs
        assert a["dataset_name"] == "milady" and a["grid_type"] == "cartesian"
        assert int(a["n_spatial_dims"]) == 3 and int(a["n_trajectories"]) == 2
        assert list(mff._str_list(a["simulation_parameters"])) == ["Rm", "Re", "mu_r"]
        assert (
            float(a["Rm"]) == 12.5 and "forcing" not in a
        )  # non numérique : seulement dans milady_parameters
        assert json.loads(a["milady_parameters"])["forcing"] == "ABC"
        for g in mff.WELL_GROUPS:
            assert isinstance(f[g], h5py.Group)
        dims = f["dimensions"]
        assert mff._str_list(dims.attrs["spatial_dims"]) == ["x", "y", "z"]
        assert dims["time"].dtype == np.float32 and dims["time"].attrs["sample_varying"] == np.False_
        assert dims["x"].attrs["time_varying"] == np.False_
        bc = f["boundary_conditions/x_periodic"]
        assert mff._str_list(bc.attrs["associated_dims"]) == ["x"] and bc.attrs["bc_type"] == "periodic"
        mask = bc["mask"][()]
        assert mask.dtype == bool and mask.shape == (8,) and mask[0] and mask[-1] and not mask[1:-1].any()
        assert bc["values"].shape == (2,)
        sc = f["scalars"]
        assert mff._str_list(sc.attrs["field_names"]) == ["Rm", "Re", "mu_r", "injection", "seed"]
        assert sc["Rm"].shape == () and sc["Rm"].attrs["time_varying"] == np.False_
        assert (
            sc["injection"].attrs["time_varying"] == np.True_
            and sc["seed"].attrs["sample_varying"] == np.True_
        )
        assert mff._str_list(f["t0_fields"].attrs["field_names"]) == ["pressure"]
        assert mff._str_list(f["t1_fields"].attrs["field_names"]) == ["velocity", "magnetic_field"]
        assert mff._str_list(f["t2_fields"].attrs["field_names"]) == ["strain_rate"]
        u = f["t1_fields/velocity"]
        assert u.shape == (2, 3, 8, 6, 4, 3) and u.dtype == np.float32
        assert u.chunks == (1, 1, 8, 6, 4, 3) and u.compression == "gzip" and u.compression_opts == 4
        assert list(u.attrs["dim_varying"]) == [True, True, True]
        assert u.attrs["sample_varying"] == np.True_ and u.attrs["time_varying"] == np.True_
        s = f["t2_fields/strain_rate"]
        assert s.shape == (2, 3, 8, 6, 4, 3, 3) and s.attrs["symmetric"] == np.True_
        assert s.attrs["antisymmetric"] == np.False_


def _well_metadata(path: Path) -> dict[str, object]:
    """Reprend la lecture des métadonnées de WellDataset._build_metadata (the_well/data/datasets.py)."""
    with h5py.File(path, "r") as f:
        out: dict[str, object] = {
            "n_trajectories": int(f.attrs["n_trajectories"]),
            "steps": f["dimensions"]["time"].shape[-1],
            "size_tuple": [f["dimensions"][d].shape[-1] for d in f["dimensions"].attrs["spatial_dims"]],
            "bc_types": {
                f["boundary_conditions"][bc].attrs["bc_type"].upper() for bc in f["boundary_conditions"]
            },
            "scalars": [
                s for s in f["scalars"].attrs["field_names"] if not f["scalars"][s].attrs["time_varying"]
            ],
        }
        names = []
        for i in range(3):
            ti = f"t{i}_fields"
            dims = [
                "".join(xyz) for xyz in itertools.product(f["dimensions"].attrs["spatial_dims"], repeat=i)
            ]
            for field in f[ti].attrs["field_names"]:
                for d in dims:
                    names.append(f"{field}_{d}" if d else field)
                ds = f[ti][field]
                # _reconstruct_fields : index (trajectoire, tranche de temps) puis pavage par dim_varying
                data = ds[(0, slice(0, 2, 1))]
                assert data.shape[1 : 1 + len(ds.attrs["dim_varying"])] == tuple(out["size_tuple"])
        out["field_names"] = names
    return out


def test_well_reader_logic(mff3d: tuple[Path, dict[str, np.ndarray], str]) -> None:
    md = _well_metadata(mff3d[0])
    assert md["steps"] == 3 and md["size_tuple"] == [8, 6, 4] and md["bc_types"] == {"PERIODIC"}
    assert "velocity_x" in md["field_names"] and "strain_rate_xz" in md["field_names"]
    assert "pressure" in md["field_names"] and md["scalars"] == ["Rm", "Re", "mu_r", "seed"]


def test_the_well_dummy_file_is_readable(tmp_path: Path) -> None:
    """Fichier écrit comme the_well/utils/dummy_data.py : lisible et conforme (partie The Well)."""
    path = tmp_path / "dummy.hdf5"
    nx = ny = 16
    nt = 5
    with h5py.File(path, "w") as file:
        file.attrs.update(
            {
                "a": 0.25,
                "b": 0.75,
                "dataset_name": "dummy_dataset",
                "grid_type": "cartesian",
                "n_spatial_dims": 2,
                "n_trajectories": 2,
                "simulation_parameters": ["a", "b"],
            }
        )
        g = file.create_group("boundary_conditions")
        for key in ("x_periodic", "y_periodic"):
            sub = g.create_group(key)
            sub.attrs.update(
                {
                    "associated_dims": key[0],
                    "associated_fields": [],
                    "bc_type": "PERIODIC",
                    "sample_varying": False,
                    "time_varying": False,
                }
            )
            sub.create_dataset("mask", data=np.zeros(nx, bool))
        g = file.create_group("dimensions")
        g.attrs["spatial_dims"] = ["x", "y"]
        for key, val in zip(
            ["time", "x", "y"], [np.linspace(0, 1, nt), np.linspace(0, 1, nx), np.linspace(0, 1, ny)]
        ):
            g.create_dataset(key, data=val.astype(np.float32))
            g[key].attrs["sample_varying"] = False
            if key != "time":
                g[key].attrs["time_varying"] = False
        g = file.create_group("scalars")
        g.attrs["field_names"] = ["a", "b", "time_varying_scalar"]
        for key, val in (("a", 0.25), ("b", 0.75)):
            g.create_dataset(key, data=np.array(val))
            g[key].attrs.update({"time_varying": False, "sample_varying": False})
        d = g.create_dataset("time_varying_scalar", data=np.random.rand(nt))
        d.attrs.update({"time_varying": True, "sample_varying": False})
        g = file.create_group("t0_fields")
        g.attrs["field_names"] = ["constant_field"]
        d = g.create_dataset("constant_field", data=np.random.rand(2, nx, ny).astype(np.float32))
        d.attrs.update({"dim_varying": [True, True], "sample_varying": True, "time_varying": False})
        g = file.create_group("t1_fields")
        g.attrs["field_names"] = ["field"]
        d = g.create_dataset("field", data=np.random.rand(2, nt, nx, ny, 2).astype(np.float32))
        d.attrs.update({"dim_varying": [True, True], "sample_varying": True, "time_varying": True})
        file.create_group("t2_fields").attrs["field_names"] = []
    assert validate(path, well_only=True) == []
    errors = validate(path)
    assert any("milady_format_version" in e for e in errors)  # pas un fichier MilaDy
    d = read_mff(path, t=slice(0, 2))
    assert d["fields"]["field"].shape == (2, 2, nx, ny, 2)
    assert d["fields"]["constant_field"].shape == (2, nx, ny)  # non dépendant du temps : t ignoré
    assert d["params"] == {"a": 0.25, "b": 0.75}
    assert d["scalars"]["time_varying_scalar"].shape == (2,)


# ---------------------------------------------------------------------------------------------
# 2D, erreurs d'écriture, validation
# ---------------------------------------------------------------------------------------------
def test_2d_vectors_and_write_errors(tmp_path: Path) -> None:
    coords = {"time": np.arange(4.0), "x": np.arange(6.0), "y": np.arange(5.0)}
    u = RNG.normal(size=(1, 4, 6, 5, 2))
    write_mff(
        tmp_path / "ok.h5",
        {"velocity": u},
        coords,
        {"nu": 1e-3},
        meta={"code": "mhd2d_numpy"},
        boundary={"x": "periodic", "y": "wall"},
        compression="lzf",
    )
    assert validate(tmp_path / "ok.h5") == []
    with h5py.File(tmp_path / "ok.h5") as f:
        assert (
            f["t1_fields/velocity"].shape == (1, 4, 6, 5, 2) and f["t1_fields/velocity"].compression == "lzf"
        )
        assert f["boundary_conditions/y_wall"].attrs["bc_type"] == "wall"
    bad = [
        ({"velocity": RNG.normal(size=(1, 4, 6, 5, 3))}, "composantes"),  # 3 composantes en 2D
        ({"velocity": RNG.normal(size=(1, 3, 6, 5, 2))}, "n_t"),  # temps incohérent
        ({"velocity": RNG.normal(size=(1, 4, 6, 4, 2))}, "dimensions spatiales"),
        ({"pressure": RNG.normal(size=(1, 4, 6, 5, 2))}, "champ standard"),  # pressure vectoriel
        ({"t0_fields/velocity": u}, "groupe"),
    ]
    for fields, msg in bad:
        with pytest.raises(ValueError, match=msg):
            write_mff(tmp_path / "bad.h5", fields, coords, {"nu": 1e-3})
    with pytest.raises(ValueError, match="réservé"):
        write_mff(tmp_path / "bad.h5", {"velocity": u}, coords, {"grid_type": 1.0})
    assert not (tmp_path / "bad.h5").exists()  # écriture atomique : rien sous le nom final


def test_validate_detects_problems(mff3d: tuple[Path, dict[str, np.ndarray], str], tmp_path: Path) -> None:
    src, _, _ = mff3d

    def broken(edit) -> list[str]:
        dst = tmp_path / f"broken_{len(list(tmp_path.iterdir()))}.h5"
        dst.write_bytes(src.read_bytes())
        with h5py.File(dst, "r+") as f:
            edit(f)
        return validate(dst)

    assert any("n_trajectories" in e for e in broken(lambda f: f.attrs.__delitem__("n_trajectories")))
    assert any(
        "milady_uuid" in e for e in broken(lambda f: f.attrs.__setitem__("milady_uuid", "pas-un-uuid"))
    )
    assert any(
        "field_names" in e
        for e in broken(lambda f: mff._set_attr(f["t1_fields"], "field_names", ["velocity"]))
    )
    assert any(
        "dim_varying" in e
        for e in broken(lambda f: f["t1_fields/velocity"].attrs.__setitem__("dim_varying", np.ones(2, bool)))
    )
    assert any("milady_parameters" in e for e in broken(lambda f: f.attrs.__setitem__("Rm", 99.0)))
    assert any("croissant" in e for e in broken(lambda f: f["dimensions/time"].__setitem__(1, -5.0)))
    assert any("irfftn" in e for e in broken(lambda f: f["milady_spectral/velocity"].__setitem__((0, 0), 0)))
    assert any(
        "finies" in e for e in broken(lambda f: f["t0_fields/pressure"].__setitem__((0, 0, 0, 0, 0), np.nan))
    )
    assert any("mask" in e for e in broken(lambda f: f["boundary_conditions/x_periodic"].__delitem__("mask")))
    assert any("illisible" in e for e in validate(tmp_path / "absent.h5"))
    # Valeur non finie sur la 2e trajectoire : invisible à l'échantillonnage par défaut, vue par full_scan.
    dst = tmp_path / "nan_traj1.h5"
    dst.write_bytes(src.read_bytes())
    with h5py.File(dst, "r+") as f:
        f["t1_fields/velocity"][1, 1, 0, 0, 0, 0] = np.inf
    assert validate(dst) == []
    assert any("finies" in e for e in validate(dst, full_scan=True))


# ---------------------------------------------------------------------------------------------
# Zarr
# ---------------------------------------------------------------------------------------------
def test_zarr_roundtrip(mff3d: tuple[Path, dict[str, np.ndarray], str], tmp_path: Path) -> None:
    path, fields, _ = mff3d
    uri = to_zarr(path, str(tmp_path / "sim.zarr"))
    assert validate(uri) == []
    dz, dh = read_mff(uri, t=slice(1, 3), spectral=True), read_mff(path, t=slice(1, 3), spectral=True)
    for name in fields:
        np.testing.assert_array_equal(dz["fields"][name], dh["fields"][name])
        np.testing.assert_array_equal(dz["spectral"][name], dh["spectral"][name])
    assert dz["params"] == dh["params"] and dz["meta"]["uuid"] == dh["meta"]["uuid"]
    with pytest.raises(FileExistsError):
        to_zarr(path, str(tmp_path / "sim.zarr"))
    to_zarr(path, str(tmp_path / "sim.zarr"), overwrite=True)


def test_describe(mff3d: tuple[Path, dict[str, np.ndarray], str]) -> None:
    text = mff.describe(mff3d[0])
    assert text.startswith("/") and "t1_fields/" in text and "chunks=(1, 1, 8, 6, 4, 3) gzip(4)" in text


# ---------------------------------------------------------------------------------------------
# Convertisseur E2
# ---------------------------------------------------------------------------------------------
def _synthetic_e2(tmp_path: Path, n: int = 32, members: int = 2, n_snap: int = 3) -> Path:
    """npz au format de e2_donnees.py pour ψ = cos(2x + 3y) et a = sin(x − 2y) (disposition [ky, kx])."""
    x = 2 * np.pi * np.arange(n) / n
    X, Y = np.meshgrid(x, x)  # tableaux [y, x], comme irfft2 de mhd2d.py
    omega = 13 * np.cos(2 * X + 3 * Y)  # ω = −Δψ
    a = np.sin(X - 2 * Y)
    w_hat, a_hat = np.fft.rfft2(omega), np.fft.rfft2(a)
    amp = np.arange(1, members * n_snap + 1, dtype=float)[:, None, None]  # amplitude = indice global + 1
    src = tmp_path / "e2_src"
    src.mkdir()
    np.savez_compressed(
        src / "eta_0.004000_train.npz",
        w=(amp * w_hat).astype(np.complex64),
        a=(amp * a_hat).astype(np.complex64),
        inj_u=0.045,
        inj_b=0.045,
        eta=0.004,
    )
    meta = dict(convert.E2_DEFAULTS, membres=members, eta_train=[0.004], eta_test=[])
    (src / "meta.json").write_text(json.dumps(meta))
    return src


def test_e2_converter_synthetic(tmp_path: Path) -> None:
    src = _synthetic_e2(tmp_path)
    recs = convert.convert_e2(src, tmp_path / "out", verbose=False)
    assert len(recs) == 1 and recs[0]["split"] == "train"
    path = Path(recs[0]["path"])
    assert validate(path) == []
    d = read_mff(path, spectral=True)
    n = 32
    x = 2 * np.pi * np.arange(n) / n
    X, Y = np.meshgrid(x, x, indexing="ij")  # disposition The Well [x, y]
    s = np.sin(2 * X + 3 * Y)
    u_exact = np.stack([-3 * s, 2 * s], -1)  # u = (∂yψ, −∂xψ)
    c = np.cos(X - 2 * Y)
    b_exact = np.stack([-2 * c, -c], -1)  # B = (∂y a, −∂x a)
    u, b = d["fields"]["velocity"], d["fields"]["magnetic_field"]
    assert u.shape == (2, 3, n, n, 2)
    # Disposition « regroupé par membre » : membre m, instantané j ↔ indice global m × 3 + j.
    for m, j in ((0, 0), (1, 2)):
        amp = m * 3 + j + 1
        np.testing.assert_allclose(u[m, j], amp * u_exact, atol=1e-4 * amp)
        np.testing.assert_allclose(b[m, j], amp * b_exact, atol=1e-4 * amp)
    np.testing.assert_allclose(d["coords"]["time"], [31.0, 32.0, 33.0])
    assert d["params"]["eta"] == 0.004 and d["params"]["Pm"] == pytest.approx(2.0)
    assert d["meta"]["seed"] == 100 and d["meta"]["split"] == "train" and d["meta"]["code"] == "mhd2d_numpy"
    om = np.fft.irfftn(d["spectral"]["vorticity"][0, 0], s=(n, n), axes=(0, 1))
    np.testing.assert_allclose(om, 13 * np.cos(2 * X + 3 * Y), atol=1e-4)
    np.testing.assert_allclose(
        d["diagnostics"]["kinetic_energy"][0, 0], 0.5 * 13 / 2, rtol=1e-5
    )  # ½⟨|u|²⟩ = 13/4
    assert np.max(d["diagnostics"]["max_div_b"]) < 1e-4
    # Idempotence : deuxième passage sans réécriture, même identifiant.
    again = convert.convert_e2(src, tmp_path / "out", verbose=False)
    assert again[0]["uuid"] == recs[0]["uuid"] and again[0].get("reused")


def test_e2_converter_cli_with_catalog(tmp_path: Path) -> None:
    from milady.catalog.api import Catalog

    src = _synthetic_e2(tmp_path)
    db = tmp_path / "cat.sqlite"
    store = tmp_path / "store"
    assert (
        convert.main(
            ["e2", str(src), str(tmp_path / "out"), "--catalog", f"sqlite:///{db}", "--store", store.as_uri()]
        )
        == 0
    )
    cat = Catalog(f"sqlite:///{db}")
    sims = cat.query_simulations(campaign="e2_mhd2d", status="done", eta=0.004)
    assert len(sims) == 1 and sims[0]["code"] == "mhd2d_numpy"
    (f,) = sims[0]["files"]
    assert f["uri"] == store.as_uri() + f"/e2_mhd2d/{sims[0]['id']}/fields.h5"
    assert f["sha256"] == mff.sha256_file(store / "e2_mhd2d" / sims[0]["id"] / "fields.h5") and f["n_t"] == 3
    assert "kinetic_energy" in cat.get_diagnostics(sims[0]["id"])
    assert [r["split"] for r in cat.dataset_files("e2_mhd2d", "1.0")] == ["train"]
    assert convert.main(["validate", str(tmp_path / "out" / "e2_eta0.004000_train.h5")]) == 0


E2_DATA = Path(os.environ.get("E2_DATA", Path(__file__).resolve().parents[1] / "experiences" / "donnees_e2"))


@pytest.mark.skipif(not any(E2_DATA.glob("eta_*_ref.npz")), reason="données E2 absentes (variable E2_DATA)")
def test_e2_converter_real_data(tmp_path: Path) -> None:
    """Fichier réel réduit : bilan d'énergie en loi ⟨dissipation⟩ ≈ injection (à ~10 % sur 2 × 20 instantanés)."""
    npz = min(E2_DATA.glob("eta_*_ref.npz"))
    rec = convert.convert_e2_file(npz, tmp_path / "e2.h5", max_members=4, max_snapshots=20)
    assert validate(tmp_path / "e2.h5") == []
    d = read_mff(tmp_path / "e2.h5", fields=[])
    inj = d["scalars"]["injection_rate_u"] + d["scalars"]["injection_rate_b"]
    assert np.mean(d["diagnostics"]["dissipation"]) == pytest.approx(inj, rel=0.25)
    assert rec["grid"]["shape"] == [32, 32] and rec["n_t"] == 20


# ---------------------------------------------------------------------------------------------
# Extension SFEMaNS (fourier_fe_axisym)
# ---------------------------------------------------------------------------------------------
def _fe_mesh(nr: int = 9, nz: int = 11) -> tuple[np.ndarray, np.ndarray]:
    r, z = np.linspace(0, 1, nr), np.linspace(-1, 1, nz)
    R, Z = np.meshgrid(r, z, indexing="ij")
    nodes = np.stack([R.ravel(), Z.ravel()], -1)
    idx = np.arange(nr * nz).reshape(nr, nz)
    tri = []
    for i in range(nr - 1):
        for j in range(nz - 1):
            a, b, c, d = idx[i, j], idx[i + 1, j], idx[i + 1, j + 1], idx[i, j + 1]
            tri += [(a, b, c), (a, c, d)]
    return nodes, np.array(tri)


def test_fourier_fe_extension(tmp_path: Path) -> None:
    nodes, conn = _fe_mesh()
    r, z = nodes[:, 0], nodes[:, 1]
    modes = [0, 1, 2]
    M, N = len(modes), len(nodes)
    p = np.zeros((1, 2, M, 2, N))
    p[0, :, 0, 0] = z  # mode 0 (cos) : z
    p[0, :, 1, 0] = r  # mode 1 (cos) : r cos θ = x
    p[0, :, 2, 1] = 0.5 * r  # mode 2 (sin) : 0.5 r sin 2θ
    u = np.zeros((1, 2, M, 2, N, 3))
    u[0, :, 0, 0, :, 0] = r  # u = r e_r (mode 0) → (x, y, 0) en cartésien
    u[0, :, 0, 0, :, 2] = 1.0
    path = tmp_path / "sfemans.h5"
    convert.write_fourier_fe_mff(
        path,
        {"fluid": {"nodes": nodes, "connectivity": conn, "element_type": "P1"}},
        modes,
        {"pressure": {"data": p, "mesh": "fluid"}, "velocity": {"data": u, "mesh": "fluid"}},
        [0.0, 1.0],
        {"Rm": 50.0, "mu_r": 50.0},
        meta={"code": "sfemans"},
    )
    assert validate(path) == []
    d = read_mff(path)
    assert d["fields"]["velocity"].shape == (1, 2, 3, 2, N, 3) and list(d["coords"]["modes"]) == modes
    theta = np.linspace(0, 2 * np.pi, 7, endpoint=False)
    pg = convert.fourier_fe_to_grid(path, "pressure", [0.2, 0.5], theta, [0.0, 0.3])
    R, TH, Z = np.meshgrid([0.2, 0.5], theta, [0.0, 0.3], indexing="ij")
    np.testing.assert_allclose(pg, Z + R * np.cos(TH) + 0.5 * R * np.sin(2 * TH), atol=1e-5)
    xs = np.array([-0.4, 0.1, 0.5])
    uc = convert.fourier_fe_to_cartesian(path, "velocity", xs, xs, [0.2])
    X, Y = np.meshgrid(xs, xs, indexing="ij")
    np.testing.assert_allclose(uc[..., 0, 0], X, atol=1e-5)
    np.testing.assert_allclose(uc[..., 0, 1], Y, atol=1e-5)
    np.testing.assert_allclose(uc[..., 0, 2], 1.0, atol=1e-5)
    with h5py.File(path, "r+") as f:  # incohérence détectée
        f["milady_fourier_fe/meshes/fluid"].attrs["n_nodes"] = 3
    assert any("n_nodes" in e for e in validate(path))
