import {beforeEach, describe, expect, test} from "vitest";

import {
  loadStageProgress,
  recordStageAttempt,
  recordStageResult,
} from "./stageProgressStore";

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
});
