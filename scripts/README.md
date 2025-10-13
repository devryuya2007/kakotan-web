# scripts

このフォルダには共通テスト英語 PDF のダウンロードと PDF→ テキスト変換を行うスクリプトが入っています。

使い方の例（Linux/macOS/Crostini）:

1. 依存をインストール（推奨: 仮想環境）

```bash
python3 -m pip install --user -r requirements.txt
```

2. ダウンロードして変換を一括実行

```bash
bash scripts/fetch_kyotsu.sh ~/kyotsu_english
# またはカレントディレクトリでPDFだけ変換する場合
python3 scripts/convert_pdfs.py --outdir texts
```

ダウンロード先はデフォルトで `~/kyotsu_english` です。変換結果は `texts/` に出力されます。
