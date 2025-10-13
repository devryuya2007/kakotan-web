
#!/usr/bin/env bash

# Fetch kyotsu English PDFs, convert to text, and optionally remove PDFs.
set -euo pipefail
IFS=$'\n\t'

# allow empty glob to expand to nothing
shopt -s nullglob

DEST_DIR=${1:-"${HOME}/kyotsu_english"}
KEEP_PDF=false
if [ "${2:-}" = "--keep-pdf" ]; then
  KEEP_PDF=true
fi

mkdir -p "${DEST_DIR}"
cd "${DEST_DIR}"

UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
REF="https://www.dnc.ac.jp/"

log() { printf "[%s] %s\n" "$(date +"%H:%M:%S")" "$*"; }

fetch_one() {
  local url="$1" out="$2" tmp
  tmp="${out}.part"
  rm -f "$tmp"
  log "Fetching ${out} ..."
  if ! curl -L --fail --retry 3 --retry-delay 2 -A "$UA" -e "$REF" -o "$tmp" "$url"; then
    log "WARN: Failed to download: $url"
    return 1
  fi
  if head -c 5 "$tmp" 2>/dev/null | grep -q "%PDF-"; then
    mv -f "$tmp" "$out"
    log "OK: ${out} ($(du -h "$out" | cut -f1))"
    return 0
  fi
  log "WARN: Not a PDF or blocked: ${out}"
  mv -f "$tmp" "${out%.pdf}.bin" || true
  return 2
}

: > cookies.txt || true
curl -s -L -A "$UA" -c cookies.txt -b cookies.txt "$REF" >/dev/null || true

log "Starting downloads..."
cat <<'URLS' | while read -r url out; do
https://www.dnc.ac.jp/albums/abm00000494.pdf 2025_reading.pdf
https://www.dnc.ac.jp/albums/abm00000495.pdf 2025_listening.pdf
https://www.dnc.ac.jp/albums/abm00000431.pdf 2024_reading.pdf
https://www.dnc.ac.jp/albums/abm00000432.pdf 2024_listening.pdf
https://www.dnc.ac.jp/albums/abm00000367.pdf 2023_reading.pdf
https://www.dnc.ac.jp/albums/abm00000368.pdf 2023_listening.pdf
https://www.dnc.ac.jp/albums/abm00000307.pdf 2022_reading.pdf
https://www.dnc.ac.jp/albums/abm00000308.pdf 2022_listening.pdf
https://www.dnc.ac.jp/albums/abm00000255.pdf 2021_reading.pdf
https://www.dnc.ac.jp/albums/abm00000256.pdf 2021_listening.pdf
URLS
  [ -z "$url" ] && continue
  fetch_one "$url" "$out" || true
  sleep 0.2
done

log "Download summary:"
ls -lh *.pdf 2>/dev/null || true

if ! python3 -c "import pdfminer.high_level" >/dev/null 2>&1; then
  log "Installing pdfminer.six ..."
  if python3 -m pip --version >/dev/null 2>&1; then
    python3 -m pip install --user --quiet pdfminer.six || true
  else
    pip3 install --user --quiet pdfminer.six || true
  fi
fi

log "Converting PDFs to text ..."
python3 - <<'PYCODE'
from pdfminer.high_level import extract_text
import glob, os, sys

os.makedirs("texts", exist_ok=True)
pdfs = sorted(glob.glob("*.pdf"))
if not pdfs:
    print("No PDFs found to convert.")
    sys.exit(0)

success = []
for path in pdfs:
    try:
        text = extract_text(path)
    except Exception as e:
        print(f"WARN: failed to extract {path}: {e}")
        continue
    out = os.path.join("texts", os.path.basename(path).replace('.pdf','.txt'))
    with open(out, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"OK: {path} -> {out} ({os.path.getsize(out)} bytes)")
    success.append(path)

print("__SUCCESS_LIST__")
for p in success:
    print(p)
PYCODE

log "Done. Preview:"
ls -lh texts 2>/dev/null || true
for f in texts/*.txt; do
  echo "--- ${f} (head) ---"
  sed -n '1,10p' "$f"
  echo
  break
done

if [ "$KEEP_PDF" = false ]; then
  for txt in texts/*.txt; do
    [ ! -f "$txt" ] && continue
    pdf="${txt##*/}"
    pdf="${pdf%.txt}.pdf"
    if [ -f "$pdf" ] && [ -s "$txt" ]; then
      log "Removing converted PDF: $pdf"
      rm -f "$pdf"
    fi
  done
fi

log "Finished all steps."


#!/usr/bin/env bash
# 共通テスト英語（過去5年）のPDFを自動ダウンロード→テキスト化
# 使い方: bash scripts/fetch_kyotsu.sh [保存先ディレクトリ] [--keep-pdf]
set -euo pipefail
IFS=$'\n\t'

DEST_DIR=${1:-"${HOME}/kyotsu_english"}
KEEP_PDF=false
if [ "${2:-}" = "--keep-pdf" ]; then
  KEEP_PDF=true
fi

mkdir -p "${DEST_DIR}"
cd "${DEST_DIR}"

# User-Agent/Referer を付与（簡易なブロック回避）
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
REF="https://www.dnc.ac.jp/"

# 取得対象（URL と 保存ファイル名）は下のダウンロードループで定義しています。

log() { printf "[%s] %s\n" "$(date +"%H:%M:%S")" "$*"; }

fetch_one() {
  local url="$1" out="$2" tmp
  tmp="${out}.part"
  rm -f "$tmp"
  log "Fetching ${out} ..."
  if ! curl -L --fail --retry 3 --retry-delay 2 \
        -A "$UA" -e "$REF" -o "$tmp" "$url"; then
    log "WARN: Failed to download: $url"
    return 1
  fi
  # PDFシグネチャ確認
  if head -c 5 "$tmp" 2>/dev/null | grep -q "%PDF-"; then
    mv -f "$tmp" "$out"
    log "OK: ${out} ($(du -h "$out" | cut -f1))"
    return 0
  fi
  log "WARN: Not a PDF or blocked: ${out}"
  mv -f "$tmp" "${out%.pdf}.bin" || true
  return 2
}

# Cookie準備（簡易）
: > cookies.txt || true
curl -s -L -A "$UA" -c cookies.txt -b cookies.txt "$REF" >/dev/null || true

# ダウンロード（here-doc で一覧を供給）
cat <<'URLS_LIST' | while read -r url out; do
https://www.dnc.ac.jp/albums/abm00000494.pdf 2025_reading.pdf
https://www.dnc.ac.jp/albums/abm00000495.pdf 2025_listening.pdf
https://www.dnc.ac.jp/albums/abm00000431.pdf 2024_reading.pdf
https://www.dnc.ac.jp/albums/abm00000432.pdf 2024_listening.pdf
https://www.dnc.ac.jp/albums/abm00000367.pdf 2023_reading.pdf
https://www.dnc.ac.jp/albums/abm00000368.pdf 2023_listening.pdf
https://www.dnc.ac.jp/albums/abm00000307.pdf 2022_reading.pdf
https://www.dnc.ac.jp/albums/abm00000308.pdf 2022_listening.pdf
https://www.dnc.ac.jp/albums/abm00000255.pdf 2021_reading.pdf
https://www.dnc.ac.jp/albums/abm00000256.pdf 2021_listening.pdf
URLS_LIST
do
  [ -z "$url" ] && continue
  fetch_one "$url" "$out" || true
  sleep 0.2
done

log "Download summary:"
ls -lh *.pdf 2>/dev/null || true

# 依存: pdfminer.six をチェックして未導入なら導入
if ! python3 -c "import pdfminer.high_level" >/dev/null 2>&1; then
  log "Installing pdfminer.six ..."
  if python3 -m pip --version >/dev/null 2>&1; then
    python3 -m pip install --user --quiet pdfminer.six || true
  else
    pip3 install --user --quiet pdfminer.six || true
  fi
fi

# 変換実行（texts/ 以下に *.txt を出力）
log "Converting PDFs to text ..."
python3 - <<'PYCODE'
from pdfminer.high_level import extract_text
import glob, os, sys

os.makedirs("texts", exist_ok=True)
pdfs = sorted(glob.glob("*.pdf"))
if not pdfs:
    print("No PDFs found to convert.")
    sys.exit(0)

success = []
for path in pdfs:
    try:
        text = extract_text(path)
    except Exception as e:
        print(f"WARN: failed to extract {path}: {e}")
        continue
    out = os.path.join("texts", os.path.basename(path).replace('.pdf','.txt'))
    with open(out, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"OK: {path} -> {out} ({os.path.getsize(out)} bytes)")
    success.append(path)

print("__SUCCESS_LIST__")
for p in success:
    print(p)
PYCODE

log "Done. Preview:"
ls -lh texts 2>/dev/null || true
for f in texts/*.txt 2>/dev/null; do
  echo "--- ${f} (head) ---"
  sed -n '1,10p' "$f"
  echo
  break
done

# 変換に成功したPDFを削除（デフォルト）
if [ "$KEEP_PDF" = false ]; then
  # parse the success list emitted by the Python block
  mapfile -t SUCC < <(sed -n '/__SUCCESS_LIST__/{n;p;:a;n;p;ba}' /dev/stdin 2>/dev/null || true)
  # Fallback: if mapfile failed, read success from the tmp file in python output
  # Instead, re-evaluate by checking texts/*.txt
  for txt in texts/*.txt; do
    [ ! -f "$txt" ] && continue
    pdf="${txt##*/}"
    pdf="${pdf%.txt}.pdf"
    if [ -f "$pdf" ] && [ -s "$txt" ]; then
      log "Removing converted PDF: $pdf"
      rm -f "$pdf"
    fi
  done
fi

log "Finished all steps."