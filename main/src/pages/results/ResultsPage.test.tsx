import {render, screen, fireEvent, within} from "@testing-library/react";
import {act} from "react";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";

import type {QuizQuestion} from "@/data/vocabLoader";
import type {SessionRecord} from "../states/TestReSultContext.shared";

import ResultsPage from "./ResultsPage";
import {lineGlowPlugin} from "./lineGlowPlugin";

const useTestResultsMock = vi.fn();
const useAllYearVocabMock = vi.fn();
const navigateMock = vi.fn();

vi.mock("../states/useTestResults", () => ({
  useTestResults: () => useTestResultsMock(),
}));

vi.mock("@/hooks/useAllYearVocab", () => ({
  useAllYearVocab: () => useAllYearVocabMock(),
}));

vi.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="line-chart" />,
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

interface SessionInput {
  startedAt: number;
  finishedAt: number;
  durationMs: number;
  sectionId: string;
  correctCount: number;
  incorrectCount: number;
  gainedXp?: number;
}

const createSession = (input: SessionInput): SessionRecord => ({
  startedAt: input.startedAt,
  finishedAt: input.finishedAt,
  durationMs: input.durationMs,
  sectionId: input.sectionId,
  correctCount: input.correctCount,
  incorrectCount: input.incorrectCount,
  gainedXp: input.gainedXp ?? 0,
});

const createQuestion = (phrase: string): QuizQuestion => ({
  id: phrase,
  phrase,
  mean: `${phrase}意味`,
  choices: [`${phrase}意味`],
  answerIndex: 0,
});

const setVocabState = (status: string, questions: QuizQuestion[]) => {
  useAllYearVocabMock.mockReturnValue({
    status,
    questionsByYear: {
      reiwa3: questions,
      reiwa4: questions,
      reiwa5: questions,
      reiwa6: questions,
      reiwa7: questions,
    },
    error: null,
  });
};

// ResultsPageの進捗表示を確認する
describe("ResultsPage", () => {
  let rafMock: ReturnType<typeof vi.fn> | null = null;
  let cafMock: ReturnType<typeof vi.fn> | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-05-10T00:00:00Z"));

    let rafTime = 0;
    rafMock = vi.fn((callback: FrameRequestCallback) => {
      rafTime += 500;
      return window.setTimeout(() => callback(rafTime), 0);
    });
    cafMock = vi.fn((id: number) => {
      window.clearTimeout(id);
    });

    vi.stubGlobal(
      "requestAnimationFrame",
      rafMock as unknown as typeof window.requestAnimationFrame,
    );
    vi.stubGlobal(
      "cancelAnimationFrame",
      cafMock as unknown as typeof window.cancelAnimationFrame,
    );

    useAllYearVocabMock.mockReset();
    navigateMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    rafMock = null;
    cafMock = null;
    vi.clearAllMocks();
  });

  test("ラインの発光プラグインがctxを操作する", () => {
    // プラグインのbefore/afterが動くことを確認する
    const save = vi.fn();
    const restore = vi.fn();
    const chart = {
      ctx: {save, restore},
    } as unknown as {ctx: {save: () => void; restore: () => void}};

    lineGlowPlugin.beforeDatasetsDraw?.(
      chart as never,
      {} as never,
      {} as never,
    );
    lineGlowPlugin.afterDatasetsDraw?.(
      chart as never,
      {} as never,
      {} as never,
      {} as never,
    );

    expect(save).toHaveBeenCalled();
    expect(restore).toHaveBeenCalled();
  });

  test("語彙が未読み込みでも画面が描画される", () => {
    // 語彙が未準備のときは進捗が0になることを確認する
    setVocabState("loading", []);

    useTestResultsMock.mockReturnValue({
      sessionHistory: [],
      solvedPhrases: [],
    });

    render(<ResultsPage />);

    expect(screen.getByText("Progress Log")).toBeInTheDocument();
    expect(screen.getAllByText("No study history yet.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("0%").length).toBeGreaterThan(0);

    const homeButton = screen.getByRole("button", {name: "Home"});
    fireEvent.click(homeButton);
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  test("語彙が空でも集計がゼロで表示される", () => {
    // 語彙が0件でも落ちないことを確認する
    setVocabState("ready", []);

    const today = new Date("2024-05-10T10:00:00Z").getTime();
    const session = createSession({
      startedAt: today,
      finishedAt: today + 5 * 60 * 1000,
      durationMs: 5 * 60 * 1000,
      sectionId: "reiwa3",
      correctCount: 0,
      incorrectCount: 0,
    });

    useTestResultsMock.mockReturnValue({
      sessionHistory: [session],
      solvedPhrases: [],
    });

    render(<ResultsPage />);

    expect(screen.getByText(/1 session/)).toBeInTheDocument();
    expect(screen.getByText("Still going strong")).toBeInTheDocument();
    expect(screen.getByText("Average accuracy")).toBeInTheDocument();
  });

  test("進捗が変わると表示が更新される", () => {
    // 進捗0から100に変わると描画が更新されることを確認する
    const questionSets = [
      createQuestion("reiwa3-a"),
      createQuestion("reiwa3-b"),
      createQuestion("reiwa4-a"),
      createQuestion("reiwa4-b"),
      createQuestion("reiwa5-a"),
      createQuestion("reiwa5-b"),
      createQuestion("reiwa6-a"),
      createQuestion("reiwa6-b"),
      createQuestion("reiwa7-a"),
      createQuestion("reiwa7-b"),
    ];

    setVocabState("ready", questionSets);

    const today = new Date("2024-05-10T10:00:00Z").getTime();
    const sameDay = new Date("2024-05-10T08:00:00Z").getTime();
    const yesterday = new Date("2024-05-09T10:00:00Z").getTime();
    const lastYear = new Date("2023-12-30T10:00:00Z").getTime();

    const sessions: SessionRecord[] = [
      createSession({
        startedAt: today,
        finishedAt: today + 10 * 60 * 1000,
        durationMs: 10 * 60 * 1000,
        sectionId: "reiwa3",
        correctCount: 10,
        incorrectCount: 0,
        gainedXp: 900,
      }),
      createSession({
        startedAt: sameDay,
        finishedAt: sameDay + 5 * 60 * 1000,
        durationMs: 5 * 60 * 1000,
        sectionId: "reiwa4",
        correctCount: 2,
        incorrectCount: 1,
        gainedXp: 130,
      }),
      createSession({
        startedAt: yesterday,
        finishedAt: yesterday + 8 * 60 * 1000,
        durationMs: 8 * 60 * 1000,
        sectionId: "reiwa5",
        correctCount: 1,
        incorrectCount: 1,
        gainedXp: 80,
      }),
      {
        startedAt: lastYear,
        finishedAt: lastYear + 5 * 60 * 1000,
        durationMs: 5 * 60 * 1000,
        sectionId: "",
        correctCount: 0,
        incorrectCount: 0,
        gainedXp: 0,
      },
    ];

    let currentSolved: QuizQuestion[] = [];
    useTestResultsMock.mockImplementation(() => ({
      sessionHistory: sessions,
      solvedPhrases: currentSolved,
    }));

    const {rerender} = render(<ResultsPage />);

    expect(screen.getByText(/Loading/)).toBeInTheDocument();
    expect(screen.getByText("Study streak")).toBeInTheDocument();
    expect(screen.getByText(/sessions/)).toBeInTheDocument();
    expect(screen.getAllByText("unknown").length).toBeGreaterThan(0);

    currentSolved = [...questionSets];

    act(() => {
      rerender(<ResultsPage />);
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getAllByText("100%").length).toBeGreaterThan(0);

    const ring = screen.getByRole("img", {name: "XP progress ring"});
    expect(within(ring).getByText("100%")).toBeInTheDocument();
    expect(rafMock?.mock.calls.length).toBeGreaterThan(1);
  });

  test("日付跨ぎと長時間セッションのラベルが変わる", () => {
    // 日付がまたぐとラベルに区間が表示されることを確認する
    setVocabState("ready", [createQuestion("reiwa3-a")]);

    const start = new Date("2024-05-08T00:00:00Z").getTime();
    const end = new Date("2024-05-10T00:00:00Z").getTime();

    const sessionWithoutXp = {
      startedAt: start,
      finishedAt: end,
      durationMs: 3 * 60 * 60 * 1000,
      sectionId: "reiwa3",
      correctCount: 2,
      incorrectCount: 0,
      gainedXp: undefined as unknown as number,
    } as SessionRecord;

    useTestResultsMock.mockReturnValue({
      sessionHistory: [sessionWithoutXp],
      solvedPhrases: [],
    });

    render(<ResultsPage />);

    expect(screen.getAllByText(/〜/).length).toBeGreaterThan(0);
    expect(screen.getByText("3 h 0 min")).toBeInTheDocument();
  });
});
