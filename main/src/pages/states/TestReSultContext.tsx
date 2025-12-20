import {type ReactNode, useCallback, useEffect, useMemo, useState} from 'react';

import {type QuizQuestion} from '@/data/vocabLoader';

import {
  type SessionRecord,
  TestResultsContext,
  type TestResultsContextValue,
} from './TestReSultContext.shared';

type StoredSnapshot = {
  correct: QuizQuestion[];
  incorrect: QuizQuestion[];
  totalXp: number;
  sessionHistory: SessionRecord[];
  solvedPhrases: QuizQuestion[];
  missedPhrases: QuizQuestion[];
};

const RESULTS_STORAGE_PREFIX = 'test-results:session';
const XP_STORAGE_KEY = 'test-results:xp';

const createEmptySnapshot = (): StoredSnapshot => ({
  correct: [],
  incorrect: [],
  totalXp: 0,
  sessionHistory: [],
  solvedPhrases: [],
  missedPhrases: [],
});

const getResultsStorageKey = (testId: string) =>
  `${RESULTS_STORAGE_PREFIX}:${testId}`;

const loadResults = (testId: string) => {
  if (typeof window === 'undefined') {
    return {
      correct: [],
      incorrect: [],
      sessionHistory: [],
      solvedPhrases: [],
      missedPhrases: [],
    };
  }

  try {
    const raw = window.localStorage.getItem(getResultsStorageKey(testId));
    if (!raw)
      return {
        correct: [],
        incorrect: [],
        sessionHistory: [],
        solvedPhrases: [],
        missedPhrases: [],
      };
    const parsed = JSON.parse(raw);

    return {
      correct: Array.isArray(parsed.correct)
        ? (parsed.correct as QuizQuestion[])
        : [],
      incorrect: Array.isArray(parsed.incorrect)
        ? (parsed.incorrect as QuizQuestion[])
        : [],
      solvedPhrases: Array.isArray(parsed.solvedPhrases)
        ? (parsed.solvedPhrases as QuizQuestion[])
        : [],
      missedPhrases: Array.isArray(parsed.missedPhrases)
        ? (parsed.missedPhrases as QuizQuestion[])
        : [],
      // 以前のバージョンで保存された履歴は新しいフィールドが欠けていることがあるため、ここで補完してから返す
      sessionHistory: Array.isArray(parsed.sessionHistory)
        ? (parsed.sessionHistory as Array<Partial<SessionRecord>>).map(
            (raw) => ({
              startedAt: raw.startedAt ?? 0,
              finishedAt: raw.finishedAt ?? raw.startedAt ?? 0,
              durationMs: raw.durationMs ?? 0,
              sectionId: raw.sectionId ?? 'unknown',
              correctCount: raw.correctCount ?? 0,
              incorrectCount: raw.incorrectCount ?? 0,
              gainedXp: raw.gainedXp ?? 0,
              stageId:
                typeof raw.stageId === 'string' ? raw.stageId : undefined,
            }),
          )
        : [],
    };
  } catch (error) {
    console.warn('Failed to load results from storage', error);
    return {
      correct: [],
      incorrect: [],
      sessionHistory: [],
      solvedPhrases: [],
      missedPhrases: [],
    };
  }
};

const loadTotalXp = () => {
  if (typeof window === 'undefined') return 0;

  try {
    const raw = window.localStorage.getItem(XP_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as {totalXp?: number};
    return typeof parsed.totalXp === 'number' ? parsed.totalXp : 0;
  } catch (error) {
    console.warn('Failed to load total XP from storage', error);
    return 0;
  }
};

const loadSnapshot = (testId: string): StoredSnapshot => {
  if (typeof window === 'undefined') {
    return createEmptySnapshot();
  }

  const {correct, incorrect, sessionHistory, solvedPhrases, missedPhrases} =
    loadResults(testId);
  const totalXp = loadTotalXp();

  return {
    correct,
    incorrect,
    totalXp,
    sessionHistory,
    solvedPhrases,
    missedPhrases,
  };
};

export function TestResultsProvider({
  children,
  testId = 'global',
}: {
  children: ReactNode;
  testId?: string;
}) {
  const [snapshot, setSnapshot] = useState<StoredSnapshot>(() =>
    loadSnapshot(testId),
  );

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
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(
        getResultsStorageKey(testId),
        JSON.stringify(snapshot),
      );

      window.localStorage.setItem(
        XP_STORAGE_KEY,
        JSON.stringify({totalXp: snapshot.totalXp}),
      );
    } catch (error) {
      console.warn('Failed to persist test results', error);
    }
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
