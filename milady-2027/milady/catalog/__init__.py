"""Catalogue MilaDy : campagnes, simulations, fichiers, diagnostics, jeux de données, modèles, évaluations, tâches.

PostgreSQL 16 en production (service ``db`` du docker-compose, schéma ``infra/db/schema.sql``) ; SQLite en
mode portable ou sur un cluster sans base joignable. Voir :class:`milady.catalog.api.Catalog`.
"""

from __future__ import annotations

from milady.catalog.api import Catalog, default_url, normalize_url

__all__ = ["Catalog", "default_url", "normalize_url"]
