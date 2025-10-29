# Repository Guidelines

## Project Structure & Module Organization
- `main/` hosts the React 19 + Vite frontend; group UI under `components/`, routes in `pages/`, hooks in `hooks/`, shared JSON in `data/`, and assetsやテスト周りを`assets/`と`setupTests.ts`にまとめる。
- Top-level `phrase/` contains production vocabulary exports, while `data/` holds raw sources for tooling such as frequency analysis.
- Generated builds land in `main/dist/` and root `dist/`; treat them as read-only. Keep design shots and references in `docs/`.

## Build, Test, and Development Commands
- `npm install` (root) runs the `postinstall` hook that bootstraps `main/`.
- `npm run dev` launches Vite at `localhost:5173`; `npm run build` performs the TypeScript build and emits production bundles to `main/dist/`.
- `npm run lint` runs ESLint with the repository rule set; fix offences before committing.
- `npm --prefix main run test` starts Vitest in watch mode; append `-- run` for a single pass. `npm run freq` converts `data/extracted/*.txt` into word-frequency CSV for analysis.

## Coding Style & Naming Conventions
- Use TypeScript, React function components, and Tailwind; keep presentational code in `components/` and route state in `pages/`.
- Follow the ESLint configuration: 2-space indentation, double quotes, trailing semicolons, and idiomatic React hooks usage.
- Name React components in PascalCase (`MiniResultPage.tsx`), hooks in `useCamelCase`, and Tailwind class collections via descriptive constants when reused.
- Keep JSON/CSV resources lowercase with underscores, matching the existing `phrase/vocab_list_part*.json` pattern.

## Testing Guidelines
- Vitest with React Testing Library is preconfigured; import utilities from `@testing-library/react` and rely on `setupTests.ts` for automatic cleanup.
- Co-locate tests either as `Component.test.tsx` siblings or inside `__tests__` folders (see `main/src/pages/tests/...` scaffold) to mirror runtime structure.
- Aim to cover new UI states and routing flows; exercise hooks in isolation with mocked DOM via `jsdom`.

## Commit & Pull Request Guidelines
- Mirror the current history: concise Japanese summaries that describe the change outcome (e.g., `結果カードに仮テキストを追加。`), avoiding English prefixes or ticket IDs.
- Keep related work in a single commit when feasible; otherwise, rebase before opening the PR.
- Pull requests should include: a plain-language overview, screenshots or GIFs for UI changes, affected vocab data files, testing notes (`npm --prefix main run test`, `npm run lint`), and any follow-up todos.
- Link GitHub issues when available and tag reviewers familiar with the touched feature area (results, tests, or data ingestion).

## コミュニケーション & PR 方針
- `AGENTS.md`に沿う会話やコメントは全部日本語で、高校生っぽいタメ口を基本にそろえてね。
- 実装はオブジェクト指向で組みつつ、初心者でも読めるようにコメントを多めに残す。プログラミング未経験の相手に教えるつもりで説明や構成を考える。
- Pull Request も日本語で作成し、テンプレがあればそれに沿って記入する。
- レビュー依頼・対応も日本語で行い、質問や確認もタメ口でやさしくフォローすること。
- コードの実装や編集は、ユーザーが「実装して」と明示的に言ったときだけ行う。それ以外は案内・説明に徹すること。
