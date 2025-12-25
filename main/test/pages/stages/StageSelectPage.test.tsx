import {render, screen, waitFor, fireEvent} from "@testing-library/react";
import {act} from "react";
import userEvent from "@testing-library/user-event";
import {MemoryRouter, Route, Routes, useParams} from "react-router-dom";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";

import type {StageDefinition} from "@/features/stages/stageUtils";
import type {StageProgressState} from "@/features/stages/stageProgressStore";

import StageSelectPage from "@/pages/stages/StageSelectPage";
import {
  initialStageSelectState,
  stageSelectReducer,
} from "@/pages/stages/stageSelectState";

const useStageDefinitionsMock = vi.fn();

vi.mock("@/pages/stages/hooks/useStageDefinitions", () => ({
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

function StageTestProbe() {
  const {year, stageNumber} = useParams();
  return (
    <div>
      StageTest {year} {stageNumber}
    </div>
  );
}

describe("StageSelectPage", () => {
  const originalVisibilityState = Object.getOwnPropertyDescriptor(
    document,
    "visibilityState",
  );

  beforeEach(() => {
    // rAFを即時実行してisVisibleの状態をtrueにする
    window.requestAnimationFrame = (callback) => {
      callback(0);
      return 0;
    };
    window.cancelAnimationFrame = () => {};

    localStorage.clear();
    useStageDefinitionsMock.mockReturnValue({
      status: "ready",
      stages: createStageDefinitions(3),
      totalWords: 60,
      normalizedQuestionCount: 20,
      error: null,
    });
  });

  test("未知のアクションでもstateが変わらない", () => {
    // reducerのdefault分岐が安全にstateを返すかを確認する
    const baseState = {
      ...initialStageSelectState,
      isVisible: true,
    };

    const result = stageSelectReducer(
      baseState,
      {type: "unknown"} as unknown as Parameters<
        typeof stageSelectReducer
      >[1],
    );

    expect(result).toBe(baseState);
  });

  test("selectStageで選択中ステージが更新される", () => {
    const baseState = {...initialStageSelectState};
    const targetStage = createStageDefinitions(1)[0];

    const result = stageSelectReducer(baseState, {
      type: "selectStage",
      stage: targetStage,
    });

    expect(result.selectedStage).toEqual(targetStage);
  });

  test("setVisibleで表示状態が更新される", () => {
    const baseState = {...initialStageSelectState};

    const result = stageSelectReducer(baseState, {
      type: "setVisible",
      isVisible: true,
    });

    expect(result.isVisible).toBe(true);
  });

  test("setStageProgressで進捗が更新される", () => {
    const baseState = {...initialStageSelectState};
    const progress: StageProgressState = {
      "reiwa3-q20-stage1": {
        stageId: "reiwa3-q20-stage1",
        bestAccuracy: 1,
        cleared: true,
        attempts: 1,
        lastPlayedAt: 1,
        lastAccuracy: 1,
        hasAttempted: true,
      },
    };

    const result = stageSelectReducer(baseState, {
      type: "setStageProgress",
      progress,
    });

    expect(result.stageProgress).toEqual(progress);
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

  test("ステージ1クリア済みならステージ2が選択できて遷移できる", async () => {
    const user = userEvent.setup();
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
          <Route path="/stages/:year/:stageNumber" element={<StageTestProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    const stage2Button = await screen.findByRole("button", {
      name: /Stage 02/i,
    });

    await waitFor(() => {
      expect(stage2Button).toBeEnabled();
    });

    await user.click(stage2Button);
    const startButton = await screen.findByRole("button", {name: "Start"});
    await user.click(startButton);

    expect(
      await screen.findByText("StageTest reiwa3 2"),
    ).toBeInTheDocument();
  });

  test("進捗更新後にフォーカスするとステージ2が選択できる", async () => {
    const user = userEvent.setup();
    const storageKey = "stage-progress:v1";
    const stage1Id = "reiwa3-q20-stage1";

    render(
      <MemoryRouter initialEntries={["/stages/reiwa3"]}>
        <Routes>
          <Route path="/stages/:year" element={<StageSelectPage />} />
          <Route path="/stages/:year/:stageNumber" element={<StageTestProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    const stage2Button = await screen.findByRole("button", {
      name: /Stage 02/i,
    });
    expect(stage2Button).toBeDisabled();

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

    act(() => {
      window.dispatchEvent(new Event("focus"));
    });

    await waitFor(() => {
      expect(stage2Button).toBeEnabled();
    });

    await user.click(stage2Button);
    const startButton = await screen.findByRole("button", {name: "Start"});
    await user.click(startButton);

    expect(
      await screen.findByText("StageTest reiwa3 2"),
    ).toBeInTheDocument();
  });

  test("過去に挑戦済みなら前回の正答率がモーダルに表示される", async () => {
    const user = userEvent.setup();
    const storageKey = "stage-progress:v1";
    const stage1Id = "reiwa3-q20-stage1";
    const progress = {
      [stage1Id]: {
        stageId: stage1Id,
        bestAccuracy: 0.95,
        cleared: true,
        attempts: 1,
        lastPlayedAt: 1,
        lastAccuracy: 0.95,
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

    const stage1Button = await screen.findByRole("button", {
      name: /Stage 01/i,
    });
    await user.click(stage1Button);

    expect(
      await screen.findByText(/前回の正答率: 95%/i),
    ).toBeInTheDocument();
  });

  test("表示イベントとストレージ更新で進捗が同期される", async () => {
    const storageKey = "stage-progress:v1";
    const stage1Id = "reiwa3-q20-stage1";

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
    expect(stage2Button).toBeDisabled();

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

    // 非表示状態では同期されないことを確認する
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(stage2Button).toBeDisabled();

    // visibleに戻すと同期される
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await waitFor(() => {
      expect(stage2Button).toBeEnabled();
    });

    // pageshowでも同期される
    act(() => {
      window.dispatchEvent(new Event("pageshow"));
    });

    // storageイベントでも同期する
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {key: "stage-progress:v1"}),
      );
    });

    // 無関係なキーは無視される
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", {key: "other-key"}));
    });
  });

  test("ステージが0件でも落ちずに描画される", () => {
    useStageDefinitionsMock.mockReturnValue({
      status: "ready",
      stages: [],
      totalWords: 0,
      normalizedQuestionCount: 20,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/stages/reiwa3"]}>
        <Routes>
          <Route path="/stages/:year" element={<StageSelectPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByRole("button", {name: /Stage/i})).toBeNull();
  });

  test("全ステージクリア済みなら最後のステージがアクティブになる", async () => {
    const storageKey = "stage-progress:v1";
    const progress = createStageDefinitions(3).reduce<Record<string, unknown>>(
      (acc, stage) => {
        acc[stage.stageId] = {
          stageId: stage.stageId,
          bestAccuracy: 1,
          cleared: true,
          attempts: 2,
          lastPlayedAt: 1,
          lastAccuracy: 1,
          hasAttempted: true,
        };
        return acc;
      },
      {},
    );
    localStorage.setItem(storageKey, JSON.stringify(progress));

    render(
      <MemoryRouter initialEntries={["/stages/reiwa3"]}>
        <Routes>
          <Route path="/stages/:year" element={<StageSelectPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const stage3Button = await screen.findByRole("button", {
      name: /Stage 03/i,
    });
    expect(stage3Button).toBeEnabled();
  });

  test("モーダルを開いたあとEscで閉じられる", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/stages/reiwa3"]}>
        <Routes>
          <Route path="/stages/:year" element={<StageSelectPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const stage1Button = await screen.findByRole("button", {
      name: /Stage 01/i,
    });
    await user.click(stage1Button);

    expect(screen.getByText("Stage Ready")).toBeInTheDocument();

    fireEvent.keyDown(document, {key: "Escape"});

    await waitFor(() => {
      expect(screen.queryByText("Stage Ready")).toBeNull();
    });
  });

  test("ステージ一覧がGridレイアウトで配置される", () => {
    const {container} = render(
      <MemoryRouter initialEntries={["/stages/reiwa3"]}>
        <Routes>
          <Route path="/stages/:year" element={<StageSelectPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const stageGrid = container.querySelector("div.grid");
    expect(stageGrid).toBeTruthy();
    expect(stageGrid).toHaveStyle({
      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 120px))",
    });
    expect(stageGrid).toHaveStyle({gap: "24px"});
  });

  test("不正な年度パラメータなら案内文が出る", () => {
    // URLの年度が無効なときにメッセージが出るか確認する
    useStageDefinitionsMock.mockReturnValue({
      status: "ready",
      stages: createStageDefinitions(1),
      totalWords: 20,
      normalizedQuestionCount: 20,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/stages/unknown"]}>
        <Routes>
          <Route path="/stages/:year" element={<StageSelectPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText("年度が見つからないので、メニューに戻ります。"),
    ).toBeInTheDocument();
  });

  afterEach(() => {
    if (originalVisibilityState) {
      Object.defineProperty(document, "visibilityState", originalVisibilityState);
    }
  });
});
