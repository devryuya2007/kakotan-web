import { AppLayout } from "../../../components/layout/AppLayout";
import { useYearVocab } from "../../../hooks/useYearVocab";
import TestPageLayout from "./layout/TestPageLayout";
import { yearsConfig } from "./yearsConfig";

const reiwa3 = yearsConfig.reiwa3.sectionId;
const maxCount = yearsConfig.reiwa3.maxCount;
export function useReiwa3Vocab() {
  return useYearVocab(reiwa3, maxCount);
}

export default function Reiwa3Page() {
  const { status, count, error, questions } = useReiwa3Vocab();
  return (
    <AppLayout>
      <div className="my-auto w-full max-w-3xl rounded-2xl px-6 py-8">
        <h1 className="mb-4 text-xl font-semibold text-[#f2c97d]"></h1>
        {status === "loading" && <p>データを読み込んでいます…</p>}
        {status === "ready" && (
          <TestPageLayout
            count={count}
            questions={questions}
            sectionId={"令和3年"}
          />
        )}
        {status === "error" && (
          <p className="text-red-400">読み込みに失敗しました: {error}</p>
        )}
      </div>
    </AppLayout>
  );
}
