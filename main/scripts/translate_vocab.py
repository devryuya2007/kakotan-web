#!/usr/bin/env python3
"""Populate vocabulary JSON files with DeepL translations.

Prerequisites
-------------
1. Install the official DeepL SDK:

       python3 -m pip install deepl --break-system-packages

2. Export your API key (never commit this value):

       export DEEPL_API_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx"

3. Run this script from the project root:

       python3 scripts/translate_vocab.py

By default the script looks for vocabulary files under
`src/assets/vocab/reiwa3_7`.  Use `--vocab-dir` to target a different folder.
Existing `mean` / `onePhraseJa` values are left intact unless you pass
`--overwrite`.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Sequence, Tuple

try:
    import deepl  # type: ignore
except ImportError as exc:  # pragma: no cover - missing optional dependency
    raise SystemExit(
        "deepl パッケージが見つかりません。先に "
        "`python3 -m pip install deepl --break-system-packages` を実行してください。"
    ) from exc


DEFAULT_TARGET_LANG = "JA"
DEFAULT_SOURCE_LANG = None  # e.g. "EN"
DEFAULT_CHUNK_SIZE = 40
DEFAULT_DELAY = 0.0
CACHE_FILENAME = ".translation_cache.json"


@dataclass(frozen=True)
class TranslationRequest:
    text: str
    kind: str  # "phrase" or "sentence"


def load_cache(cache_path: Path) -> Dict[str, str]:
    if cache_path.is_file():
        try:
            return json.loads(cache_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {}
    return {}


def save_cache(cache_path: Path, cache: Dict[str, str]) -> None:
    cache_path.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")


def batched(seq: Sequence[TranslationRequest], size: int) -> Iterable[List[TranslationRequest]]:
    chunk: List[TranslationRequest] = []
    for item in seq:
        chunk.append(item)
        if len(chunk) >= size:
            yield chunk
            chunk = []
    if chunk:
        yield chunk


def translate_requests(
    translator: deepl.Translator,
    requests: Sequence[TranslationRequest],
    *,
    target_lang: str,
    source_lang: str | None,
    chunk_size: int,
    delay: float,
    cache: Dict[str, str],
) -> Dict[str, str]:
    translations: Dict[str, str] = {}

    for batch in batched(list(requests), chunk_size):
        to_translate: List[str] = []
        indices: List[int] = []

        for idx, req in enumerate(batch):
            cached = cache.get(req.text)
            if cached is not None:
                translations[req.text] = cached
            else:
                indices.append(idx)
                to_translate.append(req.text)

        if to_translate:
            result = translator.translate_text(
                to_translate,
                target_lang=target_lang,
                source_lang=source_lang,
            )

            translated = (
                [item.text for item in result] if isinstance(result, list) else [result.text]
            )

            for text, translated_text in zip(to_translate, translated, strict=True):
                translations[text] = translated_text
                cache[text] = translated_text

        if delay:
            time.sleep(delay)

        # Include cached translations gathered earlier.
        for req in batch:
            if req.text in translations:
                continue
            cached = cache.get(req.text)
            if cached is not None:
                translations[req.text] = cached

    return translations


def collect_vocab_files(vocab_dir: Path) -> Tuple[List[Path], Path]:
    unigram_files = sorted(vocab_dir.glob("reiwa*.unigram.json"))
    frequent_words_path = vocab_dir / "frequent-words.json"
    if not frequent_words_path.is_file():
        raise FileNotFoundError(f"集約ファイルが見つかりません: {frequent_words_path}")
    return unigram_files, frequent_words_path


def collect_requests_from_unigram(
    data: List[dict],
    *,
    overwrite: bool,
) -> Tuple[List[TranslationRequest], List[dict]]:
    requests: List[TranslationRequest] = []
    for entry in data:
        phrase = entry.get("phrase")
        if phrase and (overwrite or not entry.get("mean")):
            requests.append(TranslationRequest(phrase, "phrase"))
        sentence = entry.get("onePhrase")
        if sentence and (overwrite or not entry.get("onePhraseJa")):
            requests.append(TranslationRequest(sentence, "sentence"))
    return requests, data


def apply_translations_unigram(
    data: List[dict],
    translations: Dict[str, str],
    *,
    overwrite: bool,
) -> List[dict]:
    updated: List[dict] = []
    for entry in data:
        new_entry = dict(entry)
        phrase = entry.get("phrase")
        if phrase and (overwrite or not entry.get("mean")):
            translated = translations.get(phrase)
            if translated:
                new_entry["mean"] = translated
        sentence = entry.get("onePhrase")
        if sentence and (overwrite or not entry.get("onePhraseJa")):
            translated = translations.get(sentence)
            if translated:
                new_entry["onePhraseJa"] = translated
        updated.append(new_entry)
    return updated


def collect_requests_from_frequent_words(
    content: dict,
    *,
    overwrite: bool,
) -> Tuple[List[TranslationRequest], dict]:
    requests: List[TranslationRequest] = []
    for year_data in content.values():
        for entries in year_data.values():
            for entry in entries:
                phrase = entry.get("phrase")
                if phrase and (overwrite or not entry.get("mean")):
                    requests.append(TranslationRequest(phrase, "phrase"))
                sentence = entry.get("onePhrase")
                if sentence and (overwrite or not entry.get("onePhraseJa")):
                    requests.append(TranslationRequest(sentence, "sentence"))
    return requests, content


def apply_translations_frequent_words(
    content: dict,
    translations: Dict[str, str],
    *,
    overwrite: bool,
) -> dict:
    for year_data in content.values():
        for entries in year_data.values():
            for entry in entries:
                phrase = entry.get("phrase")
                if phrase and (overwrite or not entry.get("mean")):
                    translated = translations.get(phrase)
                    if translated:
                        entry["mean"] = translated
                sentence = entry.get("onePhrase")
                if sentence and (overwrite or not entry.get("onePhraseJa")):
                    translated = translations.get(sentence)
                    if translated:
                        entry["onePhraseJa"] = translated
    return content


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="DeepLを使って語彙JSONに訳語を追加します。")
    parser.add_argument(
        "--vocab-dir",
        default="src/assets/vocab/reiwa3_7",
        type=Path,
        help="語彙ファイルが置かれているディレクトリ",
    )
    parser.add_argument(
        "--target-lang",
        default=DEFAULT_TARGET_LANG,
        help="翻訳先言語 (例: JA, EN, ZH)",
    )
    parser.add_argument(
        "--source-lang",
        default=DEFAULT_SOURCE_LANG,
        help="翻訳元言語 (省略可。例: EN)",
    )
    parser.add_argument(
        "--chunk-size",
        type=int,
        default=DEFAULT_CHUNK_SIZE,
        help="1回のリクエストで送るテキスト数",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=DEFAULT_DELAY,
        help="リクエスト間に挟む待機時間 (秒)",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="既存のmean/onePhraseJaを上書きする",
    )
    parser.add_argument(
        "--no-cache",
        action="store_true",
        help="キャッシュを利用しない (毎回全て翻訳)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    api_key = os.getenv("DEEPL_API_KEY")
    if not api_key:
        raise SystemExit("環境変数 DEEPL_API_KEY が設定されていません。")

    translator = deepl.Translator(api_key)

    vocab_dir: Path = args.vocab_dir
    if not vocab_dir.exists():
        raise SystemExit(f"ディレクトリが見つかりません: {vocab_dir}")

    unigram_files, frequent_words_path = collect_vocab_files(vocab_dir)

    cache_path = vocab_dir / CACHE_FILENAME
    cache: Dict[str, str] = {} if args.no_cache else load_cache(cache_path)

    requests: List[TranslationRequest] = []

    # Collect requests from unigram files
    unigram_data: Dict[Path, List[dict]] = {}
    for path in unigram_files:
        data = json.loads(path.read_text(encoding="utf-8"))
        reqs, _ = collect_requests_from_unigram(data, overwrite=args.overwrite)
        requests.extend(reqs)
        unigram_data[path] = data

    # Collect requests from aggregated file
    frequent_content = json.loads(frequent_words_path.read_text(encoding="utf-8"))
    freq_reqs, _ = collect_requests_from_frequent_words(frequent_content, overwrite=args.overwrite)
    requests.extend(freq_reqs)

    if not requests:
        print("翻訳が必要な項目はありません。")
        return 0

    translations = translate_requests(
        translator,
        requests,
        target_lang=args.target_lang,
        source_lang=args.source_lang,
        chunk_size=args.chunk_size,
        delay=args.delay,
        cache=cache,
    )

    # Write back to unigram files
    for path, data in unigram_data.items():
        updated = apply_translations_unigram(data, translations, overwrite=args.overwrite)
        path.write_text(json.dumps(updated, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"更新: {path}")

    # Write back to frequent words
    updated_content = apply_translations_frequent_words(
        frequent_content, translations, overwrite=args.overwrite
    )
    frequent_words_path.write_text(
        json.dumps(updated_content, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"更新: {frequent_words_path}")

    if not args.no_cache:
        save_cache(cache_path, cache)

    return 0


if __name__ == "__main__":
    sys.exit(main())
