#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Dict, Iterable, List

ROOT = Path(__file__).resolve().parents[1]
VOCAB_DIR = ROOT / "src" / "assets" / "vocab" / "reiwa3_7"

# Phrase-specific mean corrections (English -> natural Japanese)
MEAN_MAP: Dict[str, str] = {
    "english": "英語",
    "japanese": "日本語",
    "peppers": "唐辛子",
    "option": "選択肢",
    "electronic": "電子",
    "morning": "朝",
    "friends": "友だち",
    "giraffe": "キリン",
    "tolerance": "耐性",
    "kasumi": "カスミ",
}

# Generic katakana -> natural replacements for mean if exactly matching
MEAN_EXACT_REPLACE: Dict[str, str] = {
    "イングリッシュ": "英語",
    "ジャパニーズ": "日本語",
    "エレクトロニック": "電子",
    "モーニング": "朝",
    "インフォメーション": "情報",
    "レギュラー": "定期的な",
}

BAD_FRAGMENTS = {
    "cid", "∞", "—", "A m", "p m", "am.", "pm.", "pm", "am",
}

TOKEN_RE = re.compile(r"\s+")


def sanitize_one_phrase(text: str, max_tokens: int = 10) -> str:
    if not text:
        return text
    # Trim whitespace noise
    s = " ".join(text.strip().split())
    # Drop well-known garbage fragments
    for frag in BAD_FRAGMENTS:
        s = s.replace(frag, " ")
    s = " ".join(s.split())
    # Cap tokens
    tokens = s.split(" ")
    if len(tokens) > max_tokens:
        tokens = tokens[:max_tokens]
    s = " ".join(tokens)
    # Ensure sentence punctuation
    if not re.search(r"[.!?]$", s):
        s += "."
    return s


def sanitize_one_phrase_ja(text: str) -> str:
    if not text:
        return text
    s = text.strip()
    # Compact spaces (including accidental double spaces from OCR)
    s = re.sub(r"\s+", " ", s)
    # Normalize ASCII punctuations
    s = s.replace("..", "。")
    # Ensure it ends with 。
    if not re.search(r"[。！？]$", s):
        s += "。"
    return s


def normalize_entry(e: dict) -> dict:
    phrase = (e.get("phrase") or "").strip()
    # Fix mean
    mean = e.get("mean")
    if phrase in MEAN_MAP:
        e["mean"] = MEAN_MAP[phrase]
    elif isinstance(mean, str) and mean in MEAN_EXACT_REPLACE:
        e["mean"] = MEAN_EXACT_REPLACE[mean]

    # Fix onePhrase (English)
    op = e.get("onePhrase")
    if isinstance(op, str) and op:
        e["onePhrase"] = sanitize_one_phrase(op)

    # Fix onePhraseJa (Japanese)
    opj = e.get("onePhraseJa")
    if isinstance(opj, str) and opj:
        e["onePhraseJa"] = sanitize_one_phrase_ja(opj)
    return e


def process_unigram_file(path: Path) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    new = [normalize_entry(dict(e)) for e in data]
    path.write_text(json.dumps(new, ensure_ascii=False, indent=2), encoding="utf-8")


def process_frequent_words(path: Path) -> None:
    content = json.loads(path.read_text(encoding="utf-8"))
    for year, groups in content.items():
        for group_name, entries in groups.items():
            content[year][group_name] = [normalize_entry(dict(e)) for e in entries]
    path.write_text(json.dumps(content, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> int:
    if not VOCAB_DIR.exists():
        raise SystemExit(f"Not found: {VOCAB_DIR}")
    # All per-year unigram files
    for p in sorted(VOCAB_DIR.glob("reiwa*.unigram.json")):
        process_unigram_file(p)
    # Aggregated file
    agg = VOCAB_DIR / "frequent-words.json"
    if agg.exists():
        process_frequent_words(agg)
    print("Cleaned:")
    for p in sorted(VOCAB_DIR.glob("*.json")):
        print("  ", p.relative_to(VOCAB_DIR))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

