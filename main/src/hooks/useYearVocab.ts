import {buildQuestionsFromVocab, loadYearVocab} from "../data/vocabLoader";
import type {QuizQuestion, YearKey} from "../data/vocabLoader";

import {useEffect, useState} from "react";
import {useShuffledItems} from "./useShuffledItems";
import {shuffleItems} from "@/utils/shuffleItems";

export type UseYearVocabResult = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  questions: QuizQuestion[];
  count: number;
  error: string | null;
};

export function useYearVocab(
  year: YearKey,
  maxCount: number,
): UseYearVocabResult {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle',
  );
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  // extraだけ順番をシャッフルして、連続出題の偏りを減らす
  const shouldShuffle = year === "extra";
  const shuffledQuestions = useShuffledItems(questions, shouldShuffle);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setStatus('loading');
        setError(null);

        const vocab = await loadYearVocab(year);
        if (cancelled) return;

        const sourceVocab = shouldShuffle ? shuffleItems(vocab) : vocab;
        const nextQuestions = buildQuestionsFromVocab(sourceVocab, maxCount);
        setQuestions(nextQuestions);
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setStatus('error');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [year, maxCount, shouldShuffle]);

  return {
    status,
    questions: shuffledQuestions,
    count: shuffledQuestions.length,
    error,
  };
}
