#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VOCAB_DIR = ROOT / "src" / "assets" / "vocab" / "reiwa3_7"

# 人名として除外する語（小文字で格納されている前提）
PERSON_NAMES = {
    # reiwa3 関連
    "sabine", "berger", "roberts", "hobbs", "leigh", "wells", "liz",
    # reiwa4 関連
    "farnsworth",
    # reiwa7 関連
    "takuya", "kasumi",
}


def filter_list(entries: list[dict]) -> list[dict]:
    return [e for e in entries if (e.get("phrase") or "").lower() not in PERSON_NAMES]


def process_unigrams() -> dict[str, int]:
    removed: dict[str, int] = {}
    for p in sorted(VOCAB_DIR.glob("reiwa*.unigram.json")):
        data = json.loads(p.read_text(encoding="utf-8"))
        before = len(data)
        data = filter_list(data)
        after = len(data)
        if after != before:
            p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        removed[p.name] = before - after
    return removed


def process_aggregate() -> int:
    agg_path = VOCAB_DIR / "frequent-words.json"
    if not agg_path.exists():
        return 0
    content = json.loads(agg_path.read_text(encoding="utf-8"))
    total_removed = 0
    for year, groups in content.items():
        for group_name, entries in list(groups.items()):
            before = len(entries)
            entries = filter_list(entries)
            total_removed += before - len(entries)
            content[year][group_name] = entries
    agg_path.write_text(json.dumps(content, ensure_ascii=False, indent=2), encoding="utf-8")
    return total_removed


def main() -> int:
    removed_map = process_unigrams()
    agg_removed = process_aggregate()
    print("Removed per file:")
    for k, v in removed_map.items():
        print(f"  {k}: {v}")
    print(f"Aggregate removed: {agg_removed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

