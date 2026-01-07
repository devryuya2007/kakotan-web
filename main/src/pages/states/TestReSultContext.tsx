import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { type QuizQuestion } from "@/data/vocabLoader";

import {
  type SessionRecord,
  TestResultsContext,
  type TestResultsContextValue,
} from "./TestReSultContext.shared";
import { loadSnapshot, persistSnapshot, type StoredSnapshot } from "./testResultsStorage";

export function TestResultsProvider({
  children,
  testId = "global",
}: {
  children: ReactNode;
  testId?: string;
}) {
  const [snapshot, setSnapshot] = useState<StoredSnapshot>(() => loadSnapshot(testId));

  const {
    correct,
    incorrect,
    totalXp,
    sessionHistory,
    solvedPhrases,
    missedPhrases,
  } = snapshot;

  const addSession = useCallback((session: SessionRecord) => {
    setSnapshot((prev) => ({
      ...prev,
      sessionHistory: [...prev.sessionHistory, session],
    }));
  }, []);

  useEffect(() => {
    persistSnapshot(testId, snapshot);
  }, [snapshot, testId]);

  const recordResult = useCallback(
    (question: QuizQuestion, isCorrect: boolean) => {
      setSnapshot((prev) => {
        if (isCorrect) {
          return {
            ...prev,
            correct: [...prev.correct, question],
            solvedPhrases: [...prev.solvedPhrases, question],
          };
        }
        return {
          ...prev,
          incorrect: [...prev.incorrect, question],
          missedPhrases: [...prev.missedPhrases, question],
        };
      });
    },
    [],
  );

  const applyXp = useCallback((gainedXp: number) => {
    setSnapshot((prev) => ({
      ...prev,
      totalXp: Math.max(0, prev.totalXp + gainedXp),
    }));
  }, []);

  const reset = useCallback(() => {
    setSnapshot((prev) => ({
      ...prev,
      correct: [],
      incorrect: [],
    }));
  }, []);

  const value = useMemo<TestResultsContextValue>(
    () => ({
      correct,
      incorrect,
      totalXp,
      solvedPhrases,
      missedPhrases,
      sessionHistory,
      recordResult,
      applyXp,
      reset,
      addSession,
    }),
    [
      correct,
      incorrect,
      totalXp,
      solvedPhrases,
      missedPhrases,
      sessionHistory,
      recordResult,
      applyXp,
      reset,
      addSession,
    ],
  );

  return (
    <TestResultsContext.Provider value={value}>
      {children}
    </TestResultsContext.Provider>
  );
}
