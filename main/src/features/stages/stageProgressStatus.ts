import type { StageProgressState } from "./stageProgressTypes";

// ステージIDごとに解放状態を持つ形式
export interface StageUnlockState {
  [stageId: string]: boolean;
}

export interface StageStatusEntry {
  isCleared: boolean;
  isUnlocked: boolean;
}

export interface StageStatusMap {
  [stageId: string]: StageStatusEntry;
}

// 進捗とステージ一覧から、どのステージが解放されているかを計算する
export const buildStageUnlockMap = (
  stages: Array<{ stageId: string }>,
  progress: StageProgressState,
): StageUnlockState => {
  const statusMap = buildStageStatusMap(stages, progress);
  const unlockState: StageUnlockState = {};

  stages.forEach((stage) => {
    unlockState[stage.stageId] = Boolean(statusMap[stage.stageId]?.isUnlocked);
  });

  return unlockState;
};

// クリア済みの最後のステージから、クリア/解放/ロックを整理する
export const buildStageStatusMap = (
  stages: Array<{ stageId: string }>,
  progress: StageProgressState,
): StageStatusMap => {
  const statusMap: StageStatusMap = {};
  let lastClearedIndex = -1;

  stages.forEach((stage, index) => {
    if (progress[stage.stageId]?.cleared) {
      lastClearedIndex = Math.max(lastClearedIndex, index);
    }
  });

  const nextUnlockedIndex = Math.min(
    lastClearedIndex + 1,
    Math.max(0, stages.length - 1),
  );

  stages.forEach((stage, index) => {
    const isCleared = lastClearedIndex >= 0 && index <= lastClearedIndex;
    const isUnlocked = index <= nextUnlockedIndex;
    statusMap[stage.stageId] = { isCleared, isUnlocked };
  });

  return statusMap;
};
