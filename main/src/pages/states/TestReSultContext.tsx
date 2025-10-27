import { type QuizQuestion } from "@/data/vocabLoader";
import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type TestResultsContextValue = {
  correct: QuizQuestion[];
  incorrect: QuizQuestion[];
  recordResult: (question: QuizQuestion, isCorrect: boolean) => void;
  reset: () => void;
};

const TestResultsContext = createContext<TestResultsContextValue | undefined>(
  undefined
);

export function TestResultsProvider({ children }: { children: ReactNode }) {
  const [correct, setCorrect] = useState<QuizQuestion[]>([]);
  const [incorrect, setIncorrect] = useState<QuizQuestion[]>([]);

  const recordResult = useCallback(
    (question: QuizQuestion, isCorrect: boolean) => {
      if (isCorrect) {
        setCorrect((prev) => [...prev, question]);
      } else {
        setIncorrect((prev) => [...prev, question]);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setCorrect([]);
    setIncorrect([]);
  }, []);

  const value = useMemo<TestResultsContextValue>(() => {
    return {
      correct,
      incorrect,
      recordResult,
      reset,
    };
  }, [correct, incorrect, recordResult, reset]);

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
