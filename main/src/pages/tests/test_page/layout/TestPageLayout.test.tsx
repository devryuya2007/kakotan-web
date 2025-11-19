import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {act} from 'react';
import {MemoryRouter} from 'react-router-dom';
import {beforeAll, describe, expect, vi} from 'vitest';

import type {QuizQuestion} from '@/data/vocabLoader';
import TestPageLayout from '@/pages/tests/test_page/layout/TestPageLayout';

const recorResultsMook = vi.fn();

const applyXpMook = vi.fn();
const addSessionMook = vi.fn();

vi.mock('@/pages/states/useTestResults', () => {
  const noop = vi.fn();
  return {
    useTestResults: () => ({
      correct: [],
      incorrect: [],
      recordResult: recorResultsMook,
      totalXp: 0,
      applyXp: applyXpMook,
      reset: noop,
      addSession: addSessionMook,
    }),
  };
});

const multiQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    phrase: 'apple',
    mean: 'りんご',
    choices: ['apple', 'orange', 'banana', 'grape'],
    answerIndex: 0,
  },
  {
    id: 'q2',
    phrase: 'banana',
    mean: 'バナナ',
    choices: ['melon', 'banana', 'berry', 'peach'],
    answerIndex: 1,
  },
];

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

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
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

describe('テストページ', () => {
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
    const buttons = screen.getAllByRole('button', {name: '正誤判定'});
    const {answerIndex, choices} = sampleQuestions[0];
    const correctLabel = choices[answerIndex];
    const correctButton = buttons.find((button) =>
      button.textContent?.includes(correctLabel),
    );
    if (!correctButton) {
      throw new Error('正解の選択肢が見つかりません');
    }
    await user.click(correctButton);

    expect(recorResultsMook).toHaveBeenCalledWith(sampleQuestions[0], true);
  });
  test('正解の選択肢を押すとスタイルが変わる', async () => {
    renderLayout();

    const currentStyle =
      'w-full rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-200 px-5 py-4 text-center text-base font-semibold tracking-wide text-slate-900 shadow-[0_22px_48px_-20px_rgba(251,191,36,0.9)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_55px_-18px_rgba(251,191,36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

    const user = userEvent.setup();
    const currentButton = screen.getByTestId('correct-choice');

    await user.click(currentButton);

    expect(currentButton).toHaveClass(currentStyle);
  });
  test('不正解の選択肢を押すとスタイルが変わる', async () => {
    renderLayout();

    const incorrectButtons = screen.getAllByTestId('incorrect-choice');
    const incorrectButtonStyle =
      'w-full rounded-xl border border-rose-500/60 bg-gradient-to-br from-rose-600 via-rose-500 to-rose-400 px-5 py-4 text-center text-base font-semibold tracking-wide text-rose-50 shadow-[0_18px_38px_-18px_rgba(244,63,94,0.85)] transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';
    const user = userEvent.setup();
    await user.click(incorrectButtons[0]);

    expect(incorrectButtons[0]).toHaveClass(incorrectButtonStyle);
  });

  test('問題データが無いときはエラーを表示できているか', () => {
    render(
      <MemoryRouter>
        <TestPageLayout questions={[]} count={0} sectionId='null' />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('data-error')).toHaveTextContent(
      '問題データが取得できませんでした',
    );
  });
  test('正誤に応じてrecordResultの引数（true/false）が変わっているか', async () => {
    const user = userEvent.setup();
    const firstRender = render(
      <MemoryRouter>
        <TestPageLayout
          questions={[multiQuestions[0]]}
          count={1}
          sectionId='q1'
        />
      </MemoryRouter>,
    );

    const firstButtons = screen.getAllByRole('button', {name: '正誤判定'});
    const firstCorrectLabel =
      multiQuestions[0].choices[multiQuestions[0].answerIndex];
    const firstCorrectButton = firstButtons.find((button) =>
      button.textContent?.includes(firstCorrectLabel),
    );
    if (!firstCorrectButton) {
      throw new Error('正解の選択肢が見つかりません');
    }
    await user.click(firstCorrectButton);

    expect(recorResultsMook).toHaveBeenNthCalledWith(
      1,
      multiQuestions[0],
      true,
    );

    firstRender.unmount();

    render(
      <MemoryRouter>
        <TestPageLayout
          questions={[multiQuestions[1]]}
          count={1}
          sectionId='q2'
        />
      </MemoryRouter>,
    );

    const secondButtons = screen.getAllByRole('button', {name: '正誤判定'});
    const secondIncorrectLabel = multiQuestions[1].choices.find(
      (_, index) => index !== multiQuestions[1].answerIndex,
    );
    if (!secondIncorrectLabel) {
      throw new Error('不正解の選択肢が見つかりません');
    }
    const secondIncorrectButton = secondButtons.find((button) =>
      button.textContent?.includes(secondIncorrectLabel),
    );
    if (!secondIncorrectButton) {
      throw new Error('不正解の選択肢が見つかりません');
    }
    await user.click(secondIncorrectButton);

    expect(recorResultsMook).toHaveBeenNthCalledWith(
      2,
      multiQuestions[1],
      false,
    );
  });

  test('正解を押したときxpトーストが表示される', async () => {
    renderLayout();

    const user = userEvent.setup();
    const correctButton = screen.getByTestId('correct-choice');

    await user.click(correctButton);

    const toast = await screen.findByText(/xp/i);
    expect(toast).toBeInTheDocument();
  });

  test('applyXpが正しい引数で呼ばれているか', async () => {
    const user = userEvent.setup();
    const firstRender = render(
      <MemoryRouter>
        <TestPageLayout
          questions={[multiQuestions[0]]}
          count={1}
          sectionId='q1'
        />
      </MemoryRouter>,
    );

    const firstButtons = screen.getAllByRole('button', {name: '正誤判定'});
    const firstCorrectLabel =
      multiQuestions[0].choices[multiQuestions[0].answerIndex];
    const firstCorrectButton = firstButtons.find((button) =>
      button.textContent?.includes(firstCorrectLabel),
    );
    if (!firstCorrectButton) {
      throw new Error('正解の選択肢が見つかりません');
    }
    await user.click(firstCorrectButton);
    expect(applyXpMook).not.toHaveBeenCalled();

    firstRender.unmount();
    render(
      <MemoryRouter>
        <TestPageLayout
          questions={[multiQuestions[1]]}
          count={1}
          sectionId='q2'
        />
      </MemoryRouter>,
    );

    const secondButtons = screen.getAllByRole('button', {name: '正誤判定'});
    const secondCorrectLabel =
      multiQuestions[1].choices[multiQuestions[1].answerIndex];
    const secondCorrectButton = secondButtons.find((button) =>
      button.textContent?.includes(secondCorrectLabel),
    );
    if (!secondCorrectButton) {
      throw new Error('正解の選択肢が見つかりません');
    }
    await user.click(secondCorrectButton);
    // NOTE: 本来はフェイクタイマーで待機を制御すべきだが、handleClickが多段のsetTimeoutで複雑なので
    // 現状は実時間で待ってfinishTestが走るまで待機している。より実務的にはタイマー処理を分離してテストしやすくする必要がある。
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    });

    expect(applyXpMook).toHaveBeenCalled();
  });
});
