import { AppLayout } from "../../../components/layout/AppLayout";
import { useYearVocab } from "../../../hooks/useYearVocab";
import TestPageLayout from "./layout/TestPageLayout";
import { yearsConfig } from "./yearsConfig";

const reiwa7 = yearsConfig.reiwa7.sectionId;
const maxCount = yearsConfig.reiwa7.maxCount;

export const reiwa7Config = {
  key: reiwa7,
  maxCount: maxCount,
};

export function useReiwa7Vocab() {
  return useYearVocab(reiwa7, maxCount);
}

export default function Reiwa7Page() {
  const { status, count, error, questions } = useReiwa7Vocab();
  return (
    <AppLayout>
      <div className="my-auto w-full max-w-3xl rounded-2xl px-6 py-8">
        <h1 className="mb-4 text-xl font-semibold text-[#f2c97d]">
          {/* 共通テスト 令和7年（データ読込サンプル） */}
        </h1>
        {status === "loading" && <p>データを読み込んでいます…</p>}
        {status === "ready" && (
          <TestPageLayout
            count={count}
            questions={questions}
            sectionId="令和７年"
          />
        )}
        {status === "error" && (
          <p className="text-red-400">読み込みに失敗しました: {error}</p>
        )}
      </div>
    </AppLayout>
  );
}
