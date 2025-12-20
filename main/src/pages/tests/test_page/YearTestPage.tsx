import {AppLayout} from "../../../components/layout/AppLayout";

import {useParams} from "react-router-dom";

import {getYearEntry, isYearKey, yearRegistry} from "@/data/yearRegistry";
import {useYearVocabByKey} from "./hooks/useYearVocabByKey";
import TestPageLayout from "./layout/TestPageLayout";

export default function YearTestPage() {
  const {year: yearParam} = useParams();
  // URLパラメータの妥当性を確認する
  const isValidYear = typeof yearParam === "string" && isYearKey(yearParam);
  const fallbackYear = yearRegistry[0]?.key ?? "reiwa3";
  const yearKey = isValidYear ? yearParam : fallbackYear;
  // 年度メタ情報を拾って表示用ラベルに使う
  const yearEntry = getYearEntry(yearKey);
  const {status, count, error, questions} = useYearVocabByKey(yearKey);

  return (
    <AppLayout>
      <div className="my-auto w-full max-w-3xl rounded-2xl px-6 py-8">
        <h1 className="mb-4 text-xl font-semibold text-[#f2c97d]">
          {yearEntry.label}
        </h1>
        {!isValidYear && (
          <p className="mb-3 text-sm text-white/60">
            年度が見つからないため、デフォルトの年度を表示しています。
          </p>
        )}
        {status === "loading" && <p>データを読み込んでいます…</p>}
        {status === "ready" && (
          <TestPageLayout
            count={count}
            questions={questions}
            sectionId={yearEntry.sectionLabel}
          />
        )}
        {status === "error" && (
          <p className="text-red-400">読み込みに失敗しました: {error}</p>
        )}
      </div>
    </AppLayout>
  );
}
