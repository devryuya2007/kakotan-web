import { type QuizQuestion } from "@/data/vocabLoader";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type StoredSnapshot = {
  correct: QuizQuestion[];
  incorrect: QuizQuestion[];
  totalXp: number;
};

type TestResultsContextValue = {
  correct: QuizQuestion[];
  incorrect: QuizQuestion[];
  totalXp: number;
  recordResult: (question: QuizQuestion, isCorrect: boolean) => void;
  applyXp: (gainedXp: number) => void;
  reset: () => void;
};

const STORAGE_KEY_PREFIX = "test-results";

const TestResultsContext = createContext<TestResultsContextValue | undefined>(
  undefined
);

const createEmptySnapshot = (): StoredSnapshot => ({
  correct: [],
  incorrect: [],
  totalXp: 0,
});

const getStorageKey = (testId: string) => `${STORAGE_KEY_PREFIX}:${testId}`;

const loadSnapshot = (testId: string): StoredSnapshot => {
  if (typeof window === "undefined") {
    return createEmptySnapshot();
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(testId));
    if (!raw) {
      return createEmptySnapshot();
    }

    const parsed = JSON.parse(raw) as Partial<StoredSnapshot>;

    return {
      correct: Array.isArray(parsed.correct)
        ? (parsed.correct as QuizQuestion[])
        : [],
      incorrect: Array.isArray(parsed.incorrect)
        ? (parsed.incorrect as QuizQuestion[])
        : [],
      totalXp: typeof parsed.totalXp === "number" ? parsed.totalXp : 0,
    };
  } catch (error) {
    console.warn("Failed to load test results from storage", error);
    return createEmptySnapshot();
  }
};

export function TestResultsProvider({
  children,
  testId = "global",
}: {
  children: ReactNode;
  testId?: string;
}) {
  const [snapshot, setSnapshot] = useState<StoredSnapshot>(() =>
    loadSnapshot(testId)
  );
  const { correct, incorrect, totalXp } = snapshot;

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        getStorageKey(testId),
        JSON.stringify(snapshot)
      );
    } catch (error) {
      console.warn("Failed to persist test results", error);
    }
  }, [snapshot, testId]);

  const recordResult = useCallback(
    (question: QuizQuestion, isCorrect: boolean) => {
      setSnapshot((prev) => {
        if (isCorrect) {
          return {
            ...prev,
            correct: [...prev.correct, question],
          };
        }
        return {
          ...prev,
          incorrect: [...prev.incorrect, question],
        };
      });
    },
    []
  );

  const applyXp = useCallback((gainedXp: number) => {
    setSnapshot((prev) => ({
      ...prev,
      totalXp: Math.max(0, prev.totalXp + gainedXp),
    }));
  }, []);

  const reset = useCallback(() => {
    setSnapshot(createEmptySnapshot());
  }, []);

  const value = useMemo<TestResultsContextValue>(
    () => ({
      correct,
      incorrect,
      totalXp,
      recordResult,
      applyXp,
      reset,
    }),
    [correct, incorrect, totalXp, recordResult, applyXp, reset]
  );

  return (
    <TestResultsContext.Provider value={value}>
      {children}
    </TestResultsContext.Provider>
  );
}

export function useTestResults() {
  const context = useContext(TestResultsContext);
  if (!context) {
    throw new Error("useTestResults は TestResultsProvider の内側で使ってね");
  }
  return context;
}
