import {TestResultsContext} from '../states/TestReSultContext.shared';

import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';

import type {QuizQuestion} from '@/data/vocabLoader';

import MiniResultPage from './MiniResultPage';

const mockQuizQuestion = {} as QuizQuestion;

const noop = () => {};

const mockContextValue = {
  correct: Array(3).fill(mockQuizQuestion),
  incorrect: Array(1).fill(mockQuizQuestion),
  totalXp: 200,
  sessionHistory: [],
  solvedPhrases: [],
  missedPhrases: [],
  recordResult: noop,
  applyXp: noop,
  reset: noop,
  addSession: noop,
};

const renderMiniResultPage = () =>
  render(
    <MemoryRouter>
      <TestResultsContext.Provider value={mockContextValue}>
        <MiniResultPage />
      </TestResultsContext.Provider>
    </MemoryRouter>,
  );

describe('ミニリザルトページ', () => {
  test('RESULTというタイトルが表示されている', () => {
    renderMiniResultPage();
    const h1 = screen.getByRole('heading', {level: 1, name: 'RESULT'});
    expect(h1).toBeInTheDocument();
  });

  test('サマリーカードが計算通り表示されるか', () => {
    renderMiniResultPage();

    expect(screen.getByText('Section accuracy')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeVisible();
  });
});
