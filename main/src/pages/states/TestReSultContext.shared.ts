import {createContext} from 'react';

import {type QuizQuestion} from '@/data/vocabLoader';

export interface SessionRecord {
  startedAt: number;
  finishedAt: number;
  durationMs: number;
  sectionId: string;
  correctCount: number;
  incorrectCount: number;
  gainedXp: number;
}

export type TestResultsContextValue = {
  correct: QuizQuestion[];
  incorrect: QuizQuestion[];
  totalXp: number;
  sessionHistory: SessionRecord[];
  solvedPhrases: QuizQuestion[];
  missedPhrases: QuizQuestion[];
  recordResult: (question: QuizQuestion, isCorrect: boolean) => void;
  applyXp: (gainedXp: number) => void;
  reset: () => void;
  addSession: (session: SessionRecord) => void;
};

export const TestResultsContext = createContext<
  TestResultsContextValue | undefined
>(undefined);
