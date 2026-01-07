import { useEffect, useState } from "react";

import { buildQuestionsFromVocab, loadYearVocab } from "../data/vocabLoader";
import type { QuizQuestion, YearKey } from "../data/vocabLoader";

export interface UseYearVocabResult {
  status: "idle" | "loading" | "ready" | "error";
  questions: QuizQuestion[];
  count: number;
  error: string | null;
}

export function useYearVocab(
  year: YearKey,
  maxCount: number
): UseYearVocabResult {
  const [status, setStatus] = useState<UseYearVocabResult["status"]>("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // 年度ごとの語彙を読み込み、問題配列に変換する
    const run = async () => {
      try {
        setStatus("loading");
        setError(null);

        const vocab = await loadYearVocab(year);
        if (cancelled) return;

        const nextQuestions = buildQuestionsFromVocab(vocab, maxCount);
        setQuestions(nextQuestions);
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
  }, [year, maxCount]);

  return {
    status,
    questions,
    count: questions.length,
    error,
  };
}
