import {render, screen, waitFor} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import type {VocabEntry} from "@/data/vocabLoader";

import {useStageDefinitions} from "./useStageDefinitions";

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

describe("useStageDefinitions", () => {
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
});
