import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {act} from "react";
import {MemoryRouter} from "react-router-dom";
import {beforeAll, describe, expect, vi} from "vitest";

import type {QuizQuestion} from "@/data/vocabLoader";
import TestPageLayout from "@/pages/tests/test_page/layout/TestPageLayout";

const usePrefersReducedMotionMock = vi.fn();
const navigateMock = vi.fn();
const useTestResultsMock = vi.fn();

const recorResultsMook = vi.fn();
const applyXpMook = vi.fn();
const addSessionMook = vi.fn();
const resetMock = vi.fn();
const recordStageAttemptMock = vi.fn();
const recordStageResultMock = vi.fn();
const audioInstances: {
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  currentTime: number;
}[] = [];
const originalAudio = window.Audio;

const createMockAudio = () => {
  const playMock = vi.fn().mockResolvedValue(undefined);
  const pauseMock = vi.fn();
  const instance = {
    play: playMock,
    pause: pauseMock,
    currentTime: 0,
  } as unknown as HTMLAudioElement;
  audioInstances.push(instance);
  return instance;
};

vi.mock("@/pages/states/useTestResults", () => ({
  useTestResults: () => useTestResultsMock(),
}));

vi.mock("@/features/stages/stageProgressStore", () => ({
  recordStageAttempt: (...args: unknown[]) => recordStageAttemptMock(...args),
  recordStageResult: (...args: unknown[]) => recordStageResultMock(...args),
}));

vi.mock("@/hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => usePrefersReducedMotionMock(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const multiQuestions: QuizQuestion[] = [
  {
    id: "q1",
    phrase: "apple",
    mean: "りんご",
    choices: ["apple", "orange", "banana", "grape"],
    answerIndex: 0,
  },
  {
    id: "q2",
    phrase: "banana",
    mean: "バナナ",
    choices: ["melon", "banana", "berry", "peach"],
    answerIndex: 1,
  },
];

let matchMediaMatches = false;
let matchMediaChangeHandler: ((event: MediaQueryListEvent) => void) | null = null;

const createMatchMediaStub = (matches: boolean) => ({
  matches,
  media: "(max-width: 640px)",
  addEventListener: vi.fn((event: string, handler: (event: MediaQueryListEvent) => void) => {
    if (event === "change") {
      matchMediaChangeHandler = handler;
    }
  }),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
  onchange: null,
});

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => createMatchMediaStub(matchMediaMatches)),
  });
});

beforeEach(() => {
  const correct: QuizQuestion[] = [];
  const incorrect: QuizQuestion[] = [];

  vi.clearAllMocks();
  usePrefersReducedMotionMock.mockReturnValue(false);
  matchMediaMatches = false;
  matchMediaChangeHandler = null;
  audioInstances.length = 0;
  Object.defineProperty(window, "Audio", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation(createMockAudio),
  });

  recorResultsMook.mockImplementation((question: QuizQuestion, isCorrect: boolean) => {
    if (isCorrect) {
      correct.push(question);
    } else {
      incorrect.push(question);
    }
  });

  resetMock.mockImplementation(() => {
    correct.length = 0;
    incorrect.length = 0;
  });

  useTestResultsMock.mockReturnValue({
    correct,
    incorrect,
    recordResult: recorResultsMook,
    totalXp: 0,
    applyXp: applyXpMook,
    reset: resetMock,
    addSession: addSessionMook,
  });
});

afterEach(() => {
  vi.useRealTimers();
  if (originalAudio) {
    Object.defineProperty(window, "Audio", {
      configurable: true,
      writable: true,
      value: originalAudio,
    });
  } else {
    delete (window as typeof window & {Audio?: unknown}).Audio;
  }
});

const sampleQuestions: QuizQuestion[] = [
  {
    id: "q1",
    choices: ["りんご", "ぶどう", "ごはん", "なし"],
    answerIndex: 2,
    phrase: "rice",
    mean: "ごはん",
  },
];

const renderLayout = () =>
  render(
    <MemoryRouter>
      <TestPageLayout
        questions={sampleQuestions}
        count={sampleQuestions.length}
        sectionId="section-test"
      />
    </MemoryRouter>,
  );

describe("テストページ", () => {
  test("ホームボタンが描画される", () => {
    renderLayout();

    expect(screen.getByRole("button", {name: /home/i})).toBeInTheDocument();
  });

  test("問題文が表示される", () => {
    renderLayout();

    expect(screen.getByRole("heading", {name: /rice/i})).toBeInTheDocument();
  });

  test("選択肢が4件表示される", () => {
    renderLayout();

    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });
  test("choices配列が選択肢に表示される", () => {
    renderLayout();

    const items = screen.getAllByRole("listitem");

    sampleQuestions[0].choices.forEach((choice) => {
      expect(items.some((item) => item.textContent?.includes(choice))).toBe(
        true,
      );
    });
  });

  test("選択肢をクリックするとrecordResultが呼ばれる", async () => {
    renderLayout();
    const buttons = screen.getAllByRole('button', {name: '正誤判定'});
    const {answerIndex, choices} = sampleQuestions[0];
    const correctLabel = choices[answerIndex];
    const correctButton = buttons.find((button) =>
      button.textContent?.includes(correctLabel),
    );
    if (!correctButton) {
      throw new Error('正解の選択肢が見つかりません');
    }
    fireEvent.click(correctButton);

    expect(recorResultsMook).toHaveBeenCalledWith(sampleQuestions[0], true);
  });
  test("正解のときに正解音が再生される", async () => {
    renderLayout();
    await waitFor(() => expect(audioInstances).toHaveLength(2));

    const buttons = screen.getAllByRole("button", {name: "正誤判定"});
    const {answerIndex, choices} = sampleQuestions[0];
    const correctLabel = choices[answerIndex];
    const correctButton = buttons.find((button) =>
      button.textContent?.includes(correctLabel),
    );
    if (!correctButton) {
      throw new Error("正解の選択肢が見つかりません");
    }

    fireEvent.click(correctButton);

    expect(audioInstances[0].play).toHaveBeenCalled();
  });
  test("正解の選択肢を押すとスタイルが変わる", async () => {
    renderLayout();

    const currentStyle =
      'w-full rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-200 px-5 py-4 text-center text-base font-semibold tracking-wide text-slate-900 shadow-[0_22px_48px_-20px_rgba(251,191,36,0.9)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_55px_-18px_rgba(251,191,36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

    const currentButton = screen.getByTestId('correct-choice');

    fireEvent.click(currentButton);

    expect(currentButton).toHaveClass(currentStyle);
  });
  test("不正解の選択肢を押すとスタイルが変わる", async () => {
    renderLayout();

    const incorrectButtons = screen.getAllByTestId('incorrect-choice');
    const incorrectButtonStyle =
      'w-full rounded-xl border border-rose-500/60 bg-gradient-to-br from-rose-600 via-rose-500 to-rose-400 px-5 py-4 text-center text-base font-semibold tracking-wide text-rose-50 shadow-[0_18px_38px_-18px_rgba(244,63,94,0.85)] transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';
    const user = userEvent.setup();
    await user.click(incorrectButtons[0]);

    expect(incorrectButtons[0]).toHaveClass(incorrectButtonStyle);
  });

  test("問題データが無いときはエラーを表示できているか", () => {
    render(
      <MemoryRouter>
        <TestPageLayout questions={[]} count={0} sectionId='null' />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('data-error')).toHaveTextContent(
      '問題データが取得できませんでした',
    );
  });
  test("正誤に応じてrecordResultの引数（true/false）が変わっているか", async () => {
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

  test("正解を押したときxpトーストが表示される", async () => {
    renderLayout();

    const user = userEvent.setup();
    const correctButton = screen.getByTestId('correct-choice');

    await user.click(correctButton);

    const toast = await screen.findByText(/xp/i);
    expect(toast).toBeInTheDocument();
  });

  test("applyXpが正しい引数で呼ばれているか", async () => {
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

  test("モーション削減時は即時に次の問題へ進む", async () => {
    // prefersReducedMotion=trueで即時遷移になるか確認する
    usePrefersReducedMotionMock.mockReturnValue(true);
    vi.useFakeTimers();

    render(
      <MemoryRouter>
        <TestPageLayout
          questions={multiQuestions}
          count={multiQuestions.length}
          sectionId="q1"
        />
      </MemoryRouter>,
    );

    const firstCorrectLabel =
      multiQuestions[0].choices[multiQuestions[0].answerIndex];
    const firstButton = screen
      .getAllByRole("button", {name: "正誤判定"})
      .find((button) => button.textContent?.includes(firstCorrectLabel));
    if (!firstButton) {
      throw new Error("正解の選択肢が見つかりません");
    }

    fireEvent.click(firstButton);

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.getByRole("heading", {name: /banana/i})).toBeInTheDocument();
  });

  test("Homeボタンを押すとnavigateが呼ばれる", async () => {
    // ホームに戻るボタンが動くか確認する
    const user = userEvent.setup();
    renderLayout();

    const homeButton = screen.getByRole("button", {name: /home/i});
    await user.click(homeButton);

    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  test("ステージIDがあると挑戦記録が保存される", () => {
    // ステージモードの初期化時に記録が走るか確認する
    render(
      <MemoryRouter>
        <TestPageLayout
          questions={sampleQuestions}
          count={sampleQuestions.length}
          sectionId="section-test"
          stageId="stage-1"
        />
      </MemoryRouter>,
    );

    expect(recordStageAttemptMock).toHaveBeenCalledWith("stage-1");
  });

  test("ステージ結果が保存される", async () => {
    // 正答したあとにステージ結果が保存されるか確認する
    vi.useFakeTimers();

    render(
      <MemoryRouter>
        <TestPageLayout
          questions={[multiQuestions[0]]}
          count={1}
          sectionId="q1"
          stageId="stage-2"
        />
      </MemoryRouter>,
    );

    const correctLabel = multiQuestions[0].choices[multiQuestions[0].answerIndex];
    const button = screen
      .getAllByRole("button", {name: "正誤判定"})
      .find((item) => item.textContent?.includes(correctLabel));
    if (!button) {
      throw new Error("正解の選択肢が見つかりません");
    }

    fireEvent.click(button);

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(recordStageResultMock).toHaveBeenCalledWith({
      stageId: "stage-2",
      correctCount: 1,
      totalCount: 1,
    });
  });

  test("終了後に再レンダリングしても二重遷移しない", () => {
    // hasFinishedRefのガードが動くか確認する
    vi.useFakeTimers();

    const {rerender} = render(
      <MemoryRouter>
        <TestPageLayout
          questions={[multiQuestions[0]]}
          count={1}
          sectionId="q1"
        />
      </MemoryRouter>,
    );

    const correctLabel = multiQuestions[0].choices[multiQuestions[0].answerIndex];
    const button = screen
      .getAllByRole("button", {name: "正誤判定"})
      .find((item) => item.textContent?.includes(correctLabel));
    if (!button) {
      throw new Error("正解の選択肢が見つかりません");
    }

    fireEvent.click(button);

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(navigateMock).toHaveBeenCalledTimes(1);

    rerender(
      <MemoryRouter>
        <TestPageLayout
          questions={[multiQuestions[0]]}
          count={1}
          sectionId="q1-next"
        />
      </MemoryRouter>,
    );

    expect(navigateMock).toHaveBeenCalledTimes(1);
  });

  test("カード移動中はレイアウトが切り替わる", () => {
    // スライド中にトランジション用のレイアウトが使われるか確認する
    vi.useFakeTimers();

    render(
      <MemoryRouter>
        <TestPageLayout
          questions={multiQuestions}
          count={multiQuestions.length}
          sectionId="q1"
        />
      </MemoryRouter>,
    );

    const correctLabel = multiQuestions[0].choices[multiQuestions[0].answerIndex];
    const button = screen
      .getAllByRole("button", {name: "正誤判定"})
      .find((item) => item.textContent?.includes(correctLabel));
    if (!button) {
      throw new Error("正解の選択肢が見つかりません");
    }

    fireEvent.click(button);

    act(() => {
      vi.advanceTimersByTime(800);
    });

    const progress = screen.getByLabelText("進捗 1 / 2");
    let cardShell: HTMLElement | null = progress as HTMLElement;
    while (cardShell && !cardShell.style.transform) {
      cardShell = cardShell.parentElement;
    }

    expect(cardShell?.style.transform).toContain("scale(1.02)");
  });

  test("スマホ幅ではカードの配置が縦向きになる", () => {
    // matchMediaがtrueのときにモバイル用レイアウトになるか確認する
    matchMediaMatches = true;

    render(
      <MemoryRouter>
        <TestPageLayout
          questions={[multiQuestions[0], multiQuestions[1], sampleQuestions[0]]}
          count={3}
          sectionId="q1"
        />
      </MemoryRouter>,
    );

    const progress = screen.getByLabelText("進捗 1 / 3");
    let cardShell: HTMLElement | null = progress as HTMLElement;
    while (cardShell && !cardShell.className.includes("left-1/2")) {
      cardShell = cardShell.parentElement;
    }

    expect(cardShell).toBeTruthy();
    expect(cardShell?.className).toContain("left-1/2");

    const inner = cardShell
      ? Array.from(cardShell.querySelectorAll("div")).find((node) =>
          node.className.includes("bg-[#050509]"),
        )
      : null;
    expect(inner?.className).toContain("px-4");
  });

  test("画面幅変更でモバイル判定が更新される", () => {
    // matchMediaのchangeでisSmallが切り替わるか確認する
    renderLayout();

    act(() => {
      matchMediaChangeHandler?.({matches: true} as MediaQueryListEvent);
    });

    const progress = screen.getByLabelText("進捗 1 / 1");
    let cardShell: HTMLElement | null = progress as HTMLElement;
    while (cardShell && !cardShell.className.includes("left-1/2")) {
      cardShell = cardShell.parentElement;
    }

    expect(cardShell?.className).toContain("left-1/2");
  });

  test("トーストが表示状態になる", () => {
    // rAF経由でトーストが表示状態になるか確認する
    vi.useFakeTimers();
    window.requestAnimationFrame = (callback) => {
      callback(0);
      return 0;
    };
    window.cancelAnimationFrame = () => {};

    renderLayout();

    const correctButton = screen.getByTestId("correct-choice");
    fireEvent.click(correctButton);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    const toast = screen.getByText(/XP/i);
    expect(toast.className).toContain("opacity-100");
  });

  test("IDが無い問題でもシャッフルが動く", () => {
    // idが空のときはphraseをキーにしていることを確認する
    const questionWithoutId: QuizQuestion = {
      id: "",
      phrase: "orange",
      mean: "みかん",
      choices: ["みかん", "りんご", "ぶどう", "なし"],
      answerIndex: 0,
    };

    render(
      <MemoryRouter>
        <TestPageLayout questions={[questionWithoutId]} count={1} sectionId="q3" />
      </MemoryRouter>,
    );

    expect(screen.getByText("みかん")).toBeInTheDocument();
  });
});
