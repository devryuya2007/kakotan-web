import {beforeEach, describe, expect, test, vi} from "vitest";

import {
  buildStageUnlockMap,
  loadStageProgress,
  recordStageAttempt,
  recordStageResult,
  saveStageProgress,
} from "@/features/stages/stageProgressStore";
import type {StageProgressState} from "@/features/stages/stageProgressStore";

// ステージ進捗の保存と補完をテストする
describe("ステージ進捗ストア", () => {
  beforeEach(() => {
    // localStorageを空にしてテスト同士の影響を消す
    localStorage.clear();
  });

  test("ステージ開始で挑戦済みが記録される", () => {
    const stageId = "reiwa3-q20-stage1";

    recordStageAttempt(stageId);

    const state = loadStageProgress();
    const entry = state[stageId];
    expect(entry).toBeTruthy();
    expect(entry?.hasAttempted).toBe(true);
    expect(entry?.attempts).toBe(0);
    expect(entry?.cleared).toBe(false);
  });

  test("結果保存でクリア判定と挑戦済みが更新される", () => {
    const stageId = "reiwa3-q20-stage2";

    recordStageResult({
      stageId,
      correctCount: 9,
      totalCount: 10,
    });

    const state = loadStageProgress();
    const entry = state[stageId];
    expect(entry).toBeTruthy();
    expect(entry?.attempts).toBe(1);
    expect(entry?.cleared).toBe(true);
    expect(entry?.hasAttempted).toBe(true);
    expect(entry?.bestAccuracy).toBeCloseTo(0.9);
  });

  test("旧形式データでも挑戦済みが補完される", () => {
    const storageKey = "stage-progress:v1";
    const stageId = "reiwa3-q20-stage3";
    const legacy = {
      [stageId]: {
        stageId,
        bestAccuracy: 0.5,
        cleared: false,
        attempts: 1,
        lastPlayedAt: 123,
        lastAccuracy: 0.5,
      },
    };

    localStorage.setItem(storageKey, JSON.stringify(legacy));

    const state = loadStageProgress();
    const entry = state[stageId];
    expect(entry).toBeTruthy();
    expect(entry?.hasAttempted).toBe(true);
  });

  test("不足した保存データでも全フィールドが補完される", () => {
    const storageKey = "stage-progress:v1";
    const stageId = "reiwa3-q20-stage4";
    const legacy = {
      [stageId]: {
        stageId,
      },
    };

    // 旧形式のまま保存しておく
    localStorage.setItem(storageKey, JSON.stringify(legacy));

    // 読み込み時に必要なフィールドが埋まるか確認する
    const state = loadStageProgress();
    const entry = state[stageId];
    expect(entry).toBeTruthy();
    expect(entry?.bestAccuracy).toBe(0);
    expect(entry?.cleared).toBe(false);
    expect(entry?.attempts).toBe(0);
    expect(entry?.lastPlayedAt).toBe(0);
    expect(entry?.lastAccuracy).toBe(0);
    expect(entry?.hasAttempted).toBe(false);
  });

  test("進捗から解放状態が順番通りに計算される", () => {
    const stages = [
      {stageId: "reiwa3-q20-stage1"},
      {stageId: "reiwa3-q20-stage2"},
      {stageId: "reiwa3-q20-stage3"},
    ];

    // ステージ1だけクリア済みにする
    const progress: StageProgressState = {
      [stages[0].stageId]: {
        stageId: stages[0].stageId,
        bestAccuracy: 1,
        cleared: true,
        attempts: 1,
        lastPlayedAt: 1,
        lastAccuracy: 1,
        hasAttempted: true,
      },
    };

    const unlockMap = buildStageUnlockMap(stages, progress);
    expect(unlockMap[stages[0].stageId]).toBe(true);
    expect(unlockMap[stages[1].stageId]).toBe(true);
    expect(unlockMap[stages[2].stageId]).toBe(false);
  });

  test("windowが無いときは空の進捗を返す", () => {
    // SSRなどwindowが無い環境の分岐を通す
    const originalWindow = window;
    vi.stubGlobal("window", undefined);

    const result = loadStageProgress();
    expect(result).toEqual({});

    vi.stubGlobal("window", originalWindow);
  });

  test("壊れたJSONは空扱いになりwarnが出る", () => {
    // JSON.parseが失敗したときの保険を確認する
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem("stage-progress:v1", "{broken");

    const result = loadStageProgress();
    expect(result).toEqual({});
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  test("JSONがオブジェクトでない場合は空扱いになる", () => {
    // numberなどの誤データが入っても空になることを確認する
    localStorage.setItem("stage-progress:v1", "1");

    const result = loadStageProgress();
    expect(result).toEqual({});
  });

  test("entryがオブジェクトでない場合はスキップされる", () => {
    // 保存形式が壊れていても安全にスキップされることを確認する
    const raw = {
      "stage-bad": "invalid",
    };
    localStorage.setItem("stage-progress:v1", JSON.stringify(raw));

    const result = loadStageProgress();
    expect(result).toEqual({});
  });

  test("windowが無いときは保存処理を行わない", () => {
    // saveStageProgressの早期returnを通す
    const originalWindow = window;
    vi.stubGlobal("window", undefined);

    saveStageProgress({});

    vi.stubGlobal("window", originalWindow);
  });

  test("totalCountが0なら正答率は0になる", () => {
    // 0割を避ける分岐を通す
    const stageId = "reiwa3-q20-stage6";
    recordStageResult({stageId, correctCount: 0, totalCount: 0});

    const result = loadStageProgress();
    expect(result[stageId]?.lastAccuracy).toBe(0);
  });

  test("保存時に例外が起きてもwarnで握りつぶす", () => {
    // localStorageのsetItemが失敗するケースを通す
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("storage-fail");
      });

    saveStageProgress({});

    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
    setItemSpy.mockRestore();
  });
});
