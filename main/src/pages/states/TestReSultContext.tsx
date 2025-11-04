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

export interface SessionRecord {
  startedAt: number;
  finishedAt: number;
  durationMs: number;
}

type StoredSnapshot = {
  correct: QuizQuestion[];
  incorrect: QuizQuestion[];
  totalXp: number;
  sessionHistory: SessionRecord[];
};

type TestResultsContextValue = {
  correct: QuizQuestion[];
  incorrect: QuizQuestion[];
  totalXp: number;
  sessionHistory: SessionRecord[];
  recordResult: (question: QuizQuestion, isCorrect: boolean) => void;
  applyXp: (gainedXp: number) => void;
  reset: () => void;
  addSession: (session: SessionRecord) => void;
};

const RESULTS_STORAGE_PREFIX = "test-results:session";
const XP_STORAGE_KEY = "test-results:xp";

const TestResultsContext = createContext<TestResultsContextValue | undefined>(
  undefined
);

const createEmptySnapshot = (): StoredSnapshot => ({
  correct: [],
  incorrect: [],
  totalXp: 0,
  sessionHistory: [],
});

const getResultsStorageKey = (testId: string) =>
  `${RESULTS_STORAGE_PREFIX}:${testId}`;

const loadResults = (testId: string) => {
  if (typeof window === "undefined") {
    return { correct: [], incorrect: [], sessionHistory: [] };
  }

  try {
    const raw = window.localStorage.getItem(getResultsStorageKey(testId));
    if (!raw)
      return {
        correct: [],
        incorrect: [],
        sessionHistory: [],
      };
    const parsed = JSON.parse(raw);

    return {
      correct: Array.isArray(parsed.correct)
        ? (parsed.correct as QuizQuestion[])
        : [],
      incorrect: Array.isArray(parsed.incorrect)
        ? (parsed.incorrect as QuizQuestion[])
        : [],
      sessionHistory: Array.isArray(parsed.sessionHistory)
        ? (parsed.sessionHistory as SessionRecord[])
        : [],
    };
  } catch (error) {
    console.warn("Failed to load results from storage", error);
    return { correct: [], incorrect: [], sessionHistory: [] };
  }
};

const loadTotalXp = () => {
  if (typeof window === "undefined") return 0;

  try {
    const raw = window.localStorage.getItem(XP_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { totalXp?: number };
    return typeof parsed.totalXp === "number" ? parsed.totalXp : 0;
  } catch (error) {
    console.warn("Failed to load total XP from storage", error);
    return 0;
  }
};

const loadSnapshot = (testId: string): StoredSnapshot => {
  if (typeof window === "undefined") {
    return createEmptySnapshot();
  }

  const { correct, incorrect, sessionHistory } = loadResults(testId);
  const totalXp = loadTotalXp();

  return {
    correct,
    incorrect,
    totalXp,
    sessionHistory,
  };
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

  const { correct, incorrect, totalXp, sessionHistory } = snapshot;

  const addSession = useCallback((session: SessionRecord) => {
    setSnapshot((prev) => ({
      ...prev,
      sessionHistory: [...prev.sessionHistory, session],
    }));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        getResultsStorageKey(testId),
        JSON.stringify(snapshot)
      );

      window.localStorage.setItem(
        XP_STORAGE_KEY,
        JSON.stringify({ totalXp: snapshot.totalXp })
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
      sessionHistory,
      recordResult,
      applyXp,
      reset,
      addSession,
    ]
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
