import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import {beforeAll, describe, expect, vi} from 'vitest';

import type {QuizQuestion} from '@/data/vocabLoader';
import TestPageLayout from '@/pages/tests/test_page/layout/TestPageLayout';

const recorResultsMook = vi.fn();

vi.mock('@/pages/states/useTestResults', () => {
  const noop = vi.fn();
  return {
    useTestResults: () => ({
      correct: [],
      incorrect: [],
      recordResult: recorResultsMook,
      totalXp: 0,
      applyXp: noop,
      reset: noop,
      addSession: noop,
    }),
  };
});

const createMatchMediaStub = () => ({
  matches: false,
  media: '(max-width: 640px)',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
  onchange: null,
});

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(createMatchMediaStub),
  });
});

const sampleQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    choices: ['りんご', 'ぶどう', 'ごはん', 'なし'],
    answerIndex: 2,
    phrase: 'rice',
    mean: 'ごはん',
  },
];

const renderLayout = () =>
  render(
    <MemoryRouter>
      <TestPageLayout
        questions={sampleQuestions}
        count={sampleQuestions.length}
        sectionId='section-test'
      />
    </MemoryRouter>,
  );

describe('TestPageLayout', () => {
  test('ホームボタンが描画される', () => {
    renderLayout();

    expect(screen.getByRole('button', {name: /home/i})).toBeInTheDocument();
  });

  test('問題文が表示される', () => {
    renderLayout();

    expect(screen.getByRole('heading', {name: /rice/i})).toBeInTheDocument();
  });

  test('選択肢が4件表示される', () => {
    renderLayout();

    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });
  test('choices配列が選択肢に表示される', () => {
    renderLayout();

    const items = screen.getAllByRole('listitem');

    sampleQuestions[0].choices.forEach((choice) => {
      expect(items.some((item) => item.textContent?.includes(choice))).toBe(
        true,
      );
    });
  });

  test('選択肢をクリックするとrecordResultが呼ばれる', async () => {
    renderLayout();
    const user = userEvent.setup();
    const choices = screen.getAllByRole('button', {name: '正誤判定'});
    const {answerIndex} = sampleQuestions[0];
    await user.click(choices[answerIndex]);

    expect(recorResultsMook).toHaveBeenCalledWith(sampleQuestions[0], true);
  });
});
