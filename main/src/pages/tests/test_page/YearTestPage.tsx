import { AppLayout } from "../../../components/layout/AppLayout";

import { useParams } from "react-router-dom";

import { useYearVocabByKey } from "./hooks/useYearVocabByKey";
import TestPageLayout from "./layout/TestPageLayout";
import { getAllRegistry } from "@/hooks/getAllRegistry";

export default function YearTestPage() {
  const { year: yearParam } = useParams();
  // URLパラメータの妥当性を確認する

  const registry = getAllRegistry();

  const isValidYear = typeof yearParam === "string" && registry.some((e) => e.key === yearParam);
  const fallbackYear = registry[0]?.key ?? "reiwa3";
  const yearKey = isValidYear ? yearParam : fallbackYear;
  // 年度メタ情報を拾って表示用ラベルに使う
  const yearEntry = registry.find((e) => e.key === yearKey) ?? registry[0];
  const { status, count, error, questions } = useYearVocabByKey(yearKey);

  return (
    <AppLayout>
      <div className="my-auto w-full max-w-3xl rounded-2xl px-6 py-8">
        <h1 className="mb-4 text-xl font-semibold text-[#f2c97d]">{yearEntry.label}</h1>
        {!isValidYear && (
          <p className="mb-3 text-sm text-white/60">
            年度が見つからないため、デフォルトの年度を表示しています。
          </p>
        )}
        {status === "loading" && <p>データを読み込んでいます…</p>}
        {status === "ready" && (
          <TestPageLayout count={count} questions={questions} sectionId={yearEntry.sectionLabel} />
        )}
        {status === "error" && <p className="text-red-400">読み込みに失敗しました: {error}</p>}
      </div>
    </AppLayout>
  );
}
