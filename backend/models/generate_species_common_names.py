"""
Generate species common-name mapping using the existing Groq resolver pipeline.

Run:
  cd backend
  python models/generate_species_common_names.py

Optional:
  python models/generate_species_common_names.py --limit 500 --sleep 0.1
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from services.rag_service import get_species_common_name


DASHBOARD_DATA_PATH = os.path.join(BASE_DIR, "data", "dashboard_data.json")
SPECIES_MAPPING_PATH = os.path.join(BASE_DIR, "data", "species_mapping.json")


def normalize_species_key(value: str) -> str:
    return (value or "").strip().replace(" ", "_").replace("-", "_")


def load_dashboard_species() -> list[str]:
    if not os.path.exists(DASHBOARD_DATA_PATH):
        raise FileNotFoundError(f"Missing dashboard data: {DASHBOARD_DATA_PATH}")

    with open(DASHBOARD_DATA_PATH, "r") as f:
        payload = json.load(f)

    unique = []
    seen = set()
    for item in payload.get("species_data", []):
        key = normalize_species_key(item.get("binomial", ""))
        if key and key not in seen:
            seen.add(key)
            unique.append(key)

    return unique


def load_existing_mapping() -> dict[str, str]:
    if not os.path.exists(SPECIES_MAPPING_PATH):
        return {}

    try:
        with open(SPECIES_MAPPING_PATH, "r") as f:
            data = json.load(f)
        if isinstance(data, dict):
            return {normalize_species_key(k): str(v).strip() for k, v in data.items() if str(v).strip()}
        return {}
    except Exception:
        return {}


def save_mapping(mapping: dict[str, str]) -> None:
    os.makedirs(os.path.dirname(SPECIES_MAPPING_PATH), exist_ok=True)
    ordered = dict(sorted(mapping.items(), key=lambda kv: kv[0]))
    with open(SPECIES_MAPPING_PATH, "w") as f:
        json.dump(ordered, f, indent=2)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate common names using Groq pipeline")
    parser.add_argument("--limit", type=int, default=0, help="Process at most N unresolved species (0 = all)")
    parser.add_argument("--sleep", type=float, default=0.05, help="Delay between requests")
    args = parser.parse_args()

    all_species = load_dashboard_species()
    mapping = load_existing_mapping()

    unresolved = [s for s in all_species if not mapping.get(s)]
    if args.limit > 0:
        unresolved = unresolved[: args.limit]

    print(f"Total species in dashboard: {len(all_species)}")
    print(f"Already mapped: {len(mapping)}")
    print(f"To process now: {len(unresolved)}")

    resolved_now = 0
    skipped_now = 0

    for idx, scientific_name in enumerate(unresolved, start=1):
        common_name = (get_species_common_name(scientific_name) or "").strip()

        if common_name and common_name.lower() != "unknown":
            mapping[scientific_name] = common_name
            resolved_now += 1
            print(f"[{idx}/{len(unresolved)}] OK   {scientific_name} -> {common_name}")
        else:
            skipped_now += 1
            print(f"[{idx}/{len(unresolved)}] SKIP {scientific_name} -> Unknown")

        if idx % 100 == 0:
            save_mapping(mapping)
            print(f"Checkpoint saved at item {idx}")

        if args.sleep > 0:
            time.sleep(args.sleep)

    save_mapping(mapping)
    print("\nDone.")
    print(f"Resolved this run: {resolved_now}")
    print(f"Skipped this run : {skipped_now}")
    print(f"Total mapped now : {len(mapping)}")
    print(f"Saved to         : {SPECIES_MAPPING_PATH}")


if __name__ == "__main__":
    main()
