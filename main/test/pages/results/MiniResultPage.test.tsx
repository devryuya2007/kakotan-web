import {render, screen, fireEvent} from "@testing-library/react";
import {act} from "react";
import {MemoryRouter} from "react-router-dom";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";

import {TestResultsContext} from "@/pages/states/TestReSultContext.shared";
import type {SessionRecord} from "@/pages/states/TestReSultContext.shared";
import type {QuizQuestion} from "@/data/vocabLoader";

import MiniResultPage from "@/pages/results/MiniResultPage";

const navigateMock = vi.fn();
const calculateLevelProgressMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/features/results/scoring", async () => {
  const actual = await vi.importActual<typeof import("@/features/results/scoring")>(
    "@/features/results/scoring",
  );
  return {
    ...actual,
    calculateLevelProgress: (...args: Array<unknown>) =>
      calculateLevelProgressMock(...args),
  };
});

const createQuestion = (phrase: string): QuizQuestion => ({
  id: phrase,
  phrase,
  mean: `${phrase}意味`,
  choices: [`${phrase}意味`],
  answerIndex: 0,
});

interface MiniResultOverrides {
  correct?: QuizQuestion[];
  incorrect?: QuizQuestion[];
  totalXp?: number;
  sessionHistory?: SessionRecord[];
}

interface MiniResultLocationState {
  updatedTotalXp?: number;
}

const buildContextValue = (overrides?: MiniResultOverrides) => ({
  correct: overrides?.correct ?? [createQuestion("apple")],
  incorrect: overrides?.incorrect ?? [],
  totalXp: overrides?.totalXp ?? 200,
  sessionHistory: overrides?.sessionHistory ?? [],
  solvedPhrases: [],
  missedPhrases: [],
  recordResult: () => {},
  applyXp: () => {},
  reset: () => {},
  addSession: () => {},
});

const createSessionRecord = (stageId?: string): SessionRecord => ({
  startedAt: 1,
  finishedAt: 2,
  durationMs: 1,
  sectionId: "reiwa3",
  correctCount: 1,
  incorrectCount: 0,
  gainedXp: 10,
  stageId,
});

const renderMiniResultPage = (
  contextValue: ReturnType<typeof buildContextValue>,
  state?: MiniResultLocationState,
) =>
  render(
    <MemoryRouter
      initialEntries={[{pathname: "/results/mini", state}]}
    >
      <TestResultsContext.Provider value={contextValue}>
        <MiniResultPage />
      </TestResultsContext.Provider>
    </MemoryRouter>,
  );

// ミニリザルトページの表示分岐を確認する
describe("ミニリザルトページ", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    calculateLevelProgressMock.mockReset();
    navigateMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("RESULTというタイトルが表示されている", () => {
    // 表示の基本が出ているかだけ確認する
    calculateLevelProgressMock.mockReturnValue({
      level: 10,
      xpTillNextLevel: 20,
      progressRatio: 0.5,
    });

    renderMiniResultPage(buildContextValue());

    const h1 = screen.getByRole("heading", {level: 1, name: "RESULT"});
    expect(h1).toBeInTheDocument();
  });

  test.each([
    {level: 99, letter: "SS"},
    {level: 90, letter: "S"},
    {level: 70, letter: "A"},
    {level: 50, letter: "B"},
    {level: 30, letter: "C"},
    {level: 10, letter: "D"},
    {level: 1, letter: "E"},
  ])("ランク判定が正しく表示される: level=$level", ({level, letter}) => {
    // レベルごとのランク表示が変わることを確認する
    calculateLevelProgressMock.mockReturnValue({
      level,
      xpTillNextLevel: 20,
      progressRatio: 0.5,
    });

    renderMiniResultPage(buildContextValue());

    expect(screen.getByText(letter)).toBeInTheDocument();
  });

  test("間違いが無いときは空メッセージが出る", () => {
    // 間違い0件の表示が出ていることを確認する
    calculateLevelProgressMock.mockReturnValue({
      level: 20,
      xpTillNextLevel: 20,
      progressRatio: 0.5,
    });

    renderMiniResultPage(
      buildContextValue({
        incorrect: [],
      }),
    );

    expect(
      screen.getByText("No missed words this time. Nice work!"),
    ).toBeInTheDocument();
  });

  test("回答が無いと正答率は0%になる", () => {
    // totalAnswerが0のときの表示を確認する
    calculateLevelProgressMock.mockReturnValue({
      level: 10,
      xpTillNextLevel: 20,
      progressRatio: 0.5,
    });

    renderMiniResultPage(
      buildContextValue({
        correct: [],
        incorrect: [],
      }),
    );

    expect(screen.getAllByText("0%").length).toBeGreaterThan(0);
  });

  test("間違いが多いときは詳細モーダルが開ける", async () => {
    // 間違いが6件を超えるとモーダルが開けることを確認する
    calculateLevelProgressMock.mockReturnValue({
      level: 20,
      xpTillNextLevel: 20,
      progressRatio: 0.4,
    });

    const incorrect = [
      createQuestion("alpha"),
      createQuestion("alpha"),
      createQuestion("alpha"),
      createQuestion("beta"),
      createQuestion("beta"),
      createQuestion("gamma"),
      createQuestion("delta"),
    ];

    const {unmount} = renderMiniResultPage(
      buildContextValue({
        incorrect,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const viewMore = screen.getByRole("button", {name: "View more..."});
    fireEvent.click(viewMore);

    expect(screen.getByText("間違えた単語リスト")).toBeInTheDocument();

    const closeButton = screen.getByRole("button", {name: "閉じる"});
    fireEvent.click(closeButton);

    expect(screen.queryByText("間違えた単語リスト")).toBeNull();

    unmount();
  });

  test("意味が無い単語はフォールバックが出る", () => {
    // meanが空のときにフォールバックが使われるか確認する
    calculateLevelProgressMock.mockReturnValue({
      level: 20,
      xpTillNextLevel: 20,
      progressRatio: 0.4,
    });

    const incorrect: QuizQuestion[] = [
      {id: "alpha-1", phrase: "alpha", mean: "", choices: ["alpha"], answerIndex: 0},
      {id: "alpha-2", phrase: "alpha", mean: "Alpha meaning", choices: ["alpha"], answerIndex: 0},
      {id: "beta-1", phrase: "beta", mean: undefined, choices: ["beta"], answerIndex: 0} as QuizQuestion,
      createQuestion("gamma"),
      createQuestion("delta"),
      createQuestion("epsilon"),
      createQuestion("zeta"),
    ];

    renderMiniResultPage(
      buildContextValue({
        incorrect,
      }),
    );

    const viewMore = screen.getByRole("button", {name: "View more..."});
    fireEvent.click(viewMore);

    expect(screen.getAllByText("Meaning unavailable").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Alpha meaning").length).toBeGreaterThan(0);
  });

  test("持ち越しXPがあるときはその値で計算される", () => {
    // location.stateのupdatedTotalXpが使われることを確認する
    calculateLevelProgressMock.mockReturnValue({
      level: 5,
      xpTillNextLevel: 10,
      progressRatio: 0.2,
    });

    renderMiniResultPage(buildContextValue(), {updatedTotalXp: 1234});

    expect(calculateLevelProgressMock).toHaveBeenCalledWith(1234);
  });

  test("Resultsボタンで結果ページに移動する", async () => {
    // Resultsボタンでnavigateが呼ばれるか確認する
    calculateLevelProgressMock.mockReturnValue({
      level: 12,
      xpTillNextLevel: 15,
      progressRatio: 0.6,
    });

    renderMiniResultPage(buildContextValue());

    const resultsButton = screen.getByRole("button", {name: "Results"});
    fireEvent.click(resultsButton);

    expect(navigateMock).toHaveBeenCalledWith("/results");
  });

  test("ステージ一覧ボタンで該当年度の一覧に戻る", () => {
    // 直近のstageIdから年度が推定されることを確認する
    calculateLevelProgressMock.mockReturnValue({
      level: 12,
      xpTillNextLevel: 15,
      progressRatio: 0.6,
    });

    renderMiniResultPage(
      buildContextValue({
        sessionHistory: [createSessionRecord("reiwa3-q20-stage1")],
      }),
    );

    const stageButton = screen.getByRole("button", {name: "Stage List"});
    fireEvent.click(stageButton);

    expect(navigateMock).toHaveBeenCalledWith("/stages/reiwa3");
  });

  test("ステージ情報が無いときはメニューに戻る", () => {
    // stageIdが無いときのフォールバック先を確認する
    calculateLevelProgressMock.mockReturnValue({
      level: 12,
      xpTillNextLevel: 15,
      progressRatio: 0.6,
    });

    renderMiniResultPage(buildContextValue());

    const stageButton = screen.getByRole("button", {name: "Stage List"});
    fireEvent.click(stageButton);

    expect(navigateMock).toHaveBeenCalledWith("/menu");
  });

  test("Homeボタンでホームに戻れる", () => {
    // Homeボタンでnavigateが呼ばれるか確認する
    calculateLevelProgressMock.mockReturnValue({
      level: 12,
      xpTillNextLevel: 15,
      progressRatio: 0.6,
    });

    renderMiniResultPage(buildContextValue());

    const homeButton = screen.getByRole("button", {name: "Home"});
    fireEvent.click(homeButton);

    expect(navigateMock).toHaveBeenCalledWith("/");
  });
});
