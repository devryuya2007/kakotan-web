import {render, screen} from "@testing-library/react";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {beforeEach, describe, expect, test, vi} from "vitest";

import type {StageDefinition} from "@/features/stages/stageUtils";

import StageSelectPage from "./StageSelectPage";

const useStageDefinitionsMock = vi.fn();
const loadStageProgressMock = vi.fn();

vi.mock("./hooks/useStageDefinitions", () => ({
  useStageDefinitions: (args: unknown) => useStageDefinitionsMock(args),
}));

vi.mock("@/pages/tests/test_page/hooks/useUserConfig", () => ({
  useUserConfig: () => ({
    config: {
      reiwa3: {maxCount: 20, sectionId: "reiwa3"},
      reiwa4: {maxCount: 20, sectionId: "reiwa4"},
      reiwa5: {maxCount: 20, sectionId: "reiwa5"},
      reiwa6: {maxCount: 20, sectionId: "reiwa6"},
      reiwa7: {maxCount: 20, sectionId: "reiwa7"},
    },
  }),
}));

vi.mock("@/features/stages/stageProgressStore", () => ({
  loadStageProgress: () => loadStageProgressMock(),
  buildStageUnlockMap: (stages: Array<{stageId: string}>) =>
    stages.reduce<Record<string, boolean>>((acc, stage, index) => {
      acc[stage.stageId] = index === 0;
      return acc;
    }, {}),
}));

const createStageDefinitions = (count: number): StageDefinition[] =>
  Array.from({length: count}, (_, index) => ({
    stageId: `reiwa3-q20-stage${index + 1}`,
    year: "reiwa3",
    title: `Reiwa 3 Stage ${index + 1}`,
    stageNumber: index + 1,
    startIndex: index * 20,
    questionCount: 20,
    baseQuestionCount: 20,
  }));

describe("StageSelectPage", () => {
  beforeEach(() => {
    // rAFを即時実行してisVisibleの状態をtrueにする
    window.requestAnimationFrame = (callback) => {
      callback(0);
      return 0;
    };
    window.cancelAnimationFrame = () => {};

    // ResizeObserverが無い環境でも落ちないようにスタブする
    class ResizeObserverStub {
      observe() {}
      disconnect() {}
      unobserve() {}
    }
    window.ResizeObserver = ResizeObserverStub;

    loadStageProgressMock.mockReturnValue({});
    useStageDefinitionsMock.mockReturnValue({
      status: "ready",
      stages: createStageDefinitions(3),
      totalWords: 60,
      normalizedQuestionCount: 20,
      error: null,
    });
  });

  test("ステージが全部表示されてisVisibleで見える状態になる", () => {
    const {container} = render(
      <MemoryRouter initialEntries={["/stages/reiwa3"]}>
        <Routes>
          <Route path="/stages/:year" element={<StageSelectPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // 表示されるボタン数がステージ数と一致するか確認する
    const stageButtons = screen.getAllByRole("button", {name: /Stage/i});
    expect(stageButtons).toHaveLength(3);

    // isVisibleにより、フェードイン後のクラスになっていることを確認する
    const wrapper = container.querySelector("div.max-w-6xl");
    expect(wrapper).toBeTruthy();
    expect(wrapper).toHaveClass("opacity-100");
  });
});
