#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Dict, List, Optional

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "src" / "assets" / "raw"
VOCAB_DIR = ROOT / "src" / "assets" / "vocab" / "reiwa3_7"

BAD_FRAGS = {"cid", "∞", "—"}


def load_sentences(year: str) -> List[str]:
    raw_path = RAW_DIR / f"{year}.txt"
    text = raw_path.read_text(encoding="utf-8")
    # Normalize whitespace and split to rough sentences
    text = re.sub(r"\s+", " ", text)
    # Split on . ! ? plus Japanese 。！？ and semicolons/colons as fallback
    parts = re.split(r"(?<=[\.!?。！？:;])\s+", text)
    # De-duplicate while preserving order
    seen = set()
    out: List[str] = []
    for p in parts:
        s = p.strip()
        if not s:
            continue
        if s in seen:
            continue
        seen.add(s)
        out.append(s)
    return out


def best_snippet(sentences: List[str], phrase: str, max_tokens: int = 10) -> Optional[str]:
    p = phrase.lower()
    best: Optional[str] = None
    for s in sentences:
        s_clean = s
        for frag in BAD_FRAGS:
            s_clean = s_clean.replace(frag, " ")
        s_clean = " ".join(s_clean.split())
        tokens = s_clean.split(" ")
        lower = [t.lower() for t in tokens]
        if p not in lower:
            continue
        idx = lower.index(p)
        # Try to center around the match
        start = max(0, idx - (max_tokens // 2))
        end = min(len(tokens), start + max_tokens)
        if end - start < max_tokens and start > 0:
            start = max(0, end - max_tokens)
        snippet = " ".join(tokens[start:end])
        # Prefer snippets that start/end with alphabetic tokens and include punctuation at end
        if not snippet:
            continue
        if best is None or len(snippet) > len(best):
            best = snippet
    if best:
        if not re.search(r"[\.!?]$", best):
            best += "."
    return best


def needs_fix(entry: dict) -> bool:
    op = entry.get("onePhrase") or ""
    opja = entry.get("onePhraseJa") or ""
    # Too long or missing punctuation or has garbage
    if len(op.split()) > 10:
        return True
    if op and not op.strip().endswith((".", "!", "?")):
        return True
    if any(frag in op for frag in BAD_FRAGS):
        return True
    if any(frag in opja for frag in BAD_FRAGS):
        return True
    # Japanese with roman uppercase tokens (heuristic): keep as-is
    return False


def process_unigram(year: str, path: Path, sentences: List[str]) -> int:
    data = json.loads(path.read_text(encoding="utf-8"))
    changed = 0
    for e in data:
        if not needs_fix(e):
            continue
        phrase = e.get("phrase")
        if not phrase:
            continue
        snip = best_snippet(sentences, phrase)
        if snip:
            e["onePhrase"] = snip
            # Invalidate Ja so後で翻訳スクリプトで再生成できる
            # 既に手動で自然な訳が入っている場合は保持
            if not e.get("onePhraseJa") or any(frag in e.get("onePhraseJa", "") for frag in BAD_FRAGS):
                e["onePhraseJa"] = e.get("onePhraseJa") or None
            changed += 1
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return changed


def process_aggregate(year: str, content: dict, sentences: List[str]) -> int:
    changed = 0
    groups = content.get(year, {})
    for name, entries in groups.items():
        for e in entries:
            if not needs_fix(e):
                continue
            phrase = e.get("phrase")
            if not phrase:
                continue
            snip = best_snippet(sentences, phrase)
            if snip:
                e["onePhrase"] = snip
                if not e.get("onePhraseJa") or any(frag in e.get("onePhraseJa", "") for frag in BAD_FRAGS):
                    e["onePhraseJa"] = e.get("onePhraseJa") or None
                changed += 1
    return changed


def main() -> int:
    years = ["reiwa3", "reiwa4", "reiwa5", "reiwa6", "reiwa7"]
    agg_path = VOCAB_DIR / "frequent-words.json"
    agg = json.loads(agg_path.read_text(encoding="utf-8")) if agg_path.exists() else None
    total = 0
    for y in years:
        sentences = load_sentences(y)
        unigram_path = VOCAB_DIR / f"{y}.unigram.json"
        if unigram_path.exists():
            total += process_unigram(y, unigram_path, sentences)
        if agg is not None:
            total += process_aggregate(y, agg, sentences)
    if agg is not None:
        agg_path.write_text(json.dumps(agg, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"updated snippets: {total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

