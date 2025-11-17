アプリURL: https://bst-1900.pages.dev/

<p align="center">
  <img src="docs/main.png" alt="カコタン ホーム画面" width="480" />
</p>

# カコタン

このアプリは令和３~7年度までの共通テスト英語リーディングから特に頻出な英単語を、日本語訳４択式で学習できる英単語アプリです。

## 主な機能

- 年度ごとの英単語テスト（令和 3〜7 年想定）
- 出題数をユーザー設定から調整できるテスト生成
- 正答数・スコアの表示と簡易的な結果画面
- ローカルストレージを使った出題数設定の保存

## 技術スタック

- フロントエンド: React 19, TypeScript, Vite
- UI: Tailwind CSS, Radix UI
- グラフ表示: Chart.js, react-chartjs-2
- テスト: Vitest + React Testing Library

## 動作環境

- Node.js: 20.19 以上（推奨は 22 系）
- npm: 8 以上

## セットアップ

```bash
# 依存関係のインストール（root で実行）
npm install

# 開発サーバーを起動（http://localhost:5173）
npm run dev

# 本番ビルド
npm run build

# Lint チェック
npm run lint
```

## ディレクトリ構成（抜粋）

- `main/` … React + Vite のフロントエンド
  - `src/pages/` … 画面コンポーネント（テストページや設定画面など）
  - `src/components/` … 共通 UI コンポーネント
  - `src/hooks/` … 共通ロジック（単語ロード用のカスタムフックなど）
- `phrase/` … 本番用の語彙データ
- `data/` … 生データと頻度解析用のスクリプト入力
- `docs/` … デザインやスクリーンショットなどの資料

## テスト

フロントエンドのテストは Vitest で実行できます。

```bash
npm --prefix main run test -- run
```

## スクリーンショット

### ホーム / メニュー

<p align="center">
  <img src="docs/main.png" alt="ホーム画面" width="420" />
</p>

<p align="center">
  <img src="docs/memu.png" alt="メニュー画面" width="420" />
</p>

### テスト画面

<p align="center">
  <img src="docs/test.png" alt="テスト画面" width="420" />
</p>

## デモ動画

- テスト画面デモ: [docs/test.mp4](docs/test.mp4)
- 結果画面デモ: [docs/results.mp4](docs/results.mp4)

## コントリビュート

- Issue や Pull Request は日本語で歓迎です。
- コミットメッセージはこのリポジトリに合わせて、簡潔な日本語で書いてください。
- PR にはできればスクリーンショットと、`npm run lint` / `npm --prefix main run test -- run` の実行結果を添えてもらえると助かります。

## ライセンス

このリポジトリは `MIT` ライセンスです（詳細は `package.json` を参照してください）。
