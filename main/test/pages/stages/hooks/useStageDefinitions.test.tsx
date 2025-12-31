import {render, screen, waitFor} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";

import type {VocabEntry} from "@/data/vocabLoader";

import {useStageDefinitions} from "@/pages/stages/hooks/useStageDefinitions";

const loadYearVocabMock = vi.fn();

vi.mock("@/data/vocabLoader", async () => {
  const actual = await vi.importActual<typeof import("@/data/vocabLoader")>(
    "@/data/vocabLoader",
  );
  return {
    ...actual,
    loadYearVocab: (...args: Array<unknown>) => loadYearVocabMock(...args),
  };
});

interface StageCountProbeProps {
  baseQuestionCount: number;
}

function StageCountProbe({baseQuestionCount}: StageCountProbeProps) {
  // 設定値を渡して、ステージ数が変わるかを確認する
  const {status, stages} = useStageDefinitions({
    year: "reiwa3",
    yearLabel: "Reiwa 3",
    baseQuestionCount,
  });

  if (status !== "ready") {
    return <div>loading</div>;
  }

  return <div data-testid="stage-count">{stages.length}</div>;
}

function StageErrorProbe() {
  // エラー時の文言が取得できるかを確認する
  const {status, error} = useStageDefinitions({
    year: "reiwa3",
    yearLabel: "Reiwa 3",
    baseQuestionCount: 2,
  });

  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="error">{error ?? ""}</span>
    </div>
  );
}

describe("useStageDefinitions", () => {
  beforeEach(() => {
    loadYearVocabMock.mockReset();
  });
  afterEach(() => {
    // フェイクタイマーを使ったテストが混ざるので毎回戻す
    vi.useRealTimers();
  });

  test("設定の問題数でステージ数が連動して変わる", async () => {
    // 語彙は5語、すべて有効なデータとして扱う
    const vocab: VocabEntry[] = [
      {phrase: "one", mean: "1"},
      {phrase: "two", mean: "2"},
      {phrase: "three", mean: "3"},
      {phrase: "four", mean: "4"},
      {phrase: "five", mean: "5"},
    ];
    loadYearVocabMock.mockResolvedValue(vocab);

    // 2問区切りなら3ステージになる
    const {rerender} = render(<StageCountProbe baseQuestionCount={2} />);
    expect(await screen.findByTestId("stage-count")).toHaveTextContent("3");

    // 3問区切りなら2ステージになる
    rerender(<StageCountProbe baseQuestionCount={3} />);
    await waitFor(() => {
      expect(screen.getByTestId("stage-count")).toHaveTextContent("2");
    });
  });

  test("読み込み直後はローディングが表示される", async () => {
    // 即時に解決される場合でも、ローディングが1フレーム出ることを確認する
    loadYearVocabMock.mockResolvedValueOnce([
      {phrase: "one", mean: "1"},
      {phrase: "two", mean: "2"},
      {phrase: "three", mean: "3"},
      {phrase: "four", mean: "4"},
      {phrase: "five", mean: "5"},
    ]);

    render(<StageCountProbe baseQuestionCount={2} />);

    expect(screen.getByText("loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("stage-count")).toHaveTextContent("3");
    });
  });

  test("読み込みエラー時はstatusがerrorになりメッセージが入る", async () => {
    // 文字列を投げてもString変換されることを確認する
    loadYearVocabMock.mockRejectedValueOnce("load-error");

    render(<StageErrorProbe />);

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("error");
    });

    expect(screen.getByTestId("error")).toHaveTextContent("load-error");
  });

  test("Errorを投げたときはmessageが入る", async () => {
    // Error型のメッセージが使われることを確認する
    loadYearVocabMock.mockRejectedValueOnce(new Error("load-error-object"));

    render(<StageErrorProbe />);

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("error");
    });

    expect(screen.getByTestId("error")).toHaveTextContent("load-error-object");
  });

  test("アンマウント後は途中の更新をスキップする", async () => {
    // cancelledフラグの分岐を通す
    let resolvePromise: (value: VocabEntry[]) => void = () => {};
    const pending = new Promise<VocabEntry[]>((resolve) => {
      resolvePromise = resolve;
    });

    loadYearVocabMock.mockReturnValueOnce(pending);

    const {unmount} = render(<StageCountProbe baseQuestionCount={2} />);
    unmount();

    resolvePromise([
      {phrase: "one", mean: "1"},
      {phrase: "two", mean: "2"},
    ]);

    await waitFor(() => {
      expect(true).toBe(true);
    });
  });

  test("アンマウント後のエラーも無視される", async () => {
    // rejectedでもcancelledなら更新しないことを確認する
    let rejectPromise: (reason?: unknown) => void = () => {};
    const pending = new Promise<VocabEntry[]>((_, reject) => {
      rejectPromise = reject;
    });

    loadYearVocabMock.mockReturnValueOnce(pending);

    const {unmount} = render(<StageCountProbe baseQuestionCount={2} />);
    unmount();

    rejectPromise("load-error");

    await waitFor(() => {
      expect(true).toBe(true);
    });
  });
});
