import {render, screen} from "@testing-library/react";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {beforeEach, describe, expect, test, vi} from "vitest";

import type {StageDefinition} from "@/features/stages/stageUtils";

import StageSelectPage from "./StageSelectPage";

const useStageDefinitionsMock = vi.fn();

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

    localStorage.clear();
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

  test("ステージ1クリア済みならステージ2が選択できる", async () => {
    const storageKey = "stage-progress:v1";
    const stage1Id = "reiwa3-q20-stage1";
    const progress = {
      [stage1Id]: {
        stageId: stage1Id,
        bestAccuracy: 1,
        cleared: true,
        attempts: 1,
        lastPlayedAt: 1,
        lastAccuracy: 1,
        hasAttempted: true,
      },
    };

    localStorage.setItem(storageKey, JSON.stringify(progress));

    render(
      <MemoryRouter initialEntries={["/stages/reiwa3"]}>
        <Routes>
          <Route path="/stages/:year" element={<StageSelectPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const stage2Button = await screen.findByRole("button", {
      name: /Stage 02/i,
    });

    expect(stage2Button).toBeEnabled();
    expect(stage2Button).not.toHaveAttribute("aria-disabled", "true");

    const stageButtons = screen.getAllByRole("button", {name: /Stage/i});
    expect(stageButtons).toHaveLength(3);
  });
});
