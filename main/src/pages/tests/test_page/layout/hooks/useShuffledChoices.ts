import { useRef } from "react";

import { type QuizQuestion } from "@/data/vocabLoader";

interface UseShuffledChoicesResult {
  getShuffledChoices: (question: QuizQuestion) => string[];
}

// 問題ごとの選択肢を一度だけシャッフルしてキャッシュする
export const useShuffledChoices = (
  questions: QuizQuestion[],
): UseShuffledChoicesResult => {
  const shuffledChoicesRef = useRef<Record<string, string[]>>({});
  const cacheSourceRef = useRef<QuizQuestion[] | null>(null);

  if (cacheSourceRef.current !== questions) {
    shuffledChoicesRef.current = {};
    cacheSourceRef.current = questions;
  }

  const getShuffledChoices = (question: QuizQuestion) => {
    const key = question.id || question.phrase;
    const cached = shuffledChoicesRef.current[key];
    if (cached) return cached;
    const randomized = [...question.choices].sort(() => Math.random() - 0.5);
    shuffledChoicesRef.current[key] = randomized;
    return randomized;
  };

  return { getShuffledChoices };
};
