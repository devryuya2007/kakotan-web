import {beforeEach, describe, expect, test} from "vitest";

import {
  buildStageUnlockMap,
  loadStageProgress,
  recordStageAttempt,
  recordStageResult,
} from "./stageProgressStore";
import type {StageProgressState} from "./stageProgressStore";

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
});
