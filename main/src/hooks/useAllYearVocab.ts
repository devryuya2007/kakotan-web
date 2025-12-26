import {useEffect, useState} from "react";

import {buildQuestionsFromVocab, loadYearVocab} from "@/data/vocabLoader";
import {yearRegistry, type YearKey} from "@/data/yearRegistry";
import type {QuizQuestion} from "@/data/vocabLoader";
import {useUserConfig} from "@/pages/tests/test_page/hooks/useUserConfig";

export interface AllYearVocabResult {
  status: "idle" | "loading" | "ready" | "error";
  questionsByYear: Record<YearKey, QuizQuestion[]>;
  error: string | null;
}

// 年度キーの空配列を作って、描画時の安定性を確保する
const buildEmptyQuestions = (): Record<YearKey, QuizQuestion[]> => {
  return yearRegistry.reduce(
    (accumulator, entry) => {
      accumulator[entry.key] = [];
      return accumulator;
    },
    {} as Record<YearKey, QuizQuestion[]>,
  );
};

export function useAllYearVocab(): AllYearVocabResult {
  const {config} = useUserConfig();
  const [status, setStatus] = useState<AllYearVocabResult["status"]>("idle");
  const [questionsByYear, setQuestionsByYear] = useState(
    buildEmptyQuestions,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // 年度ごとの語彙をまとめて読み込み、問題配列に変換する
    const run = async () => {
      try {
        setStatus("loading");
        setError(null);

        const results = await Promise.all(
          yearRegistry.map(async (entry) => {
            const vocab = await loadYearVocab(entry.key);
            const maxCount =
              config.years[entry.key]?.maxCount ?? entry.defaultQuestionCount;
            const questions = buildQuestionsFromVocab(vocab, maxCount);
            return [entry.key, questions] as const;
          }),
        );

        if (cancelled) return;

        // 年度の順番を保ったまま結果をまとめ直す
        const nextQuestions = buildEmptyQuestions();
        results.forEach(([key, questions]) => {
          nextQuestions[key] = questions;
        });

        setQuestionsByYear(nextQuestions);
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setStatus("error");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [config.years]);

  return {
    status,
    questionsByYear,
    error,
  };
}
