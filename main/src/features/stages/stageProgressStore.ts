import type { StageProgressEntry, StageProgressState } from "./stageProgressTypes";
import { loadStageProgress, saveStageProgress } from "./stageProgressStorage";

export type { StageProgressEntry, StageProgressState } from "./stageProgressTypes";
export { loadStageProgress, saveStageProgress } from "./stageProgressStorage";
export {
  buildStageStatusMap,
  buildStageUnlockMap,
  type StageStatusEntry,
  type StageStatusMap,
  type StageUnlockState,
} from "./stageProgressStatus";

// ステージの進捗を保存するためのユーティリティ。localStorageに保存して再訪で復元する

// クリア条件（正答率90%）
export const STAGE_CLEAR_THRESHOLD = 0.9;

// ステージを開いた時点で「挑戦済み」を記録する
export const recordStageAttempt = (stageId: string): StageProgressState => {
  const currentState = loadStageProgress();
  const previous = currentState[stageId];
  const now = Date.now();

  const nextEntry: StageProgressEntry = {
    stageId,
    bestAccuracy: previous?.bestAccuracy ?? 0,
    cleared: Boolean(previous?.cleared),
    attempts: previous?.attempts ?? 0,
    lastPlayedAt: now,
    lastAccuracy: previous?.lastAccuracy ?? 0,
    hasAttempted: true,
  };

  const nextState = {
    ...currentState,
    [stageId]: nextEntry,
  };

  saveStageProgress(nextState);
  return nextState;
};

// ステージ結果を保存するための入力
export interface StageResultPayload {
  stageId: string;
  correctCount: number;
  totalCount: number;
}

// ステージの結果を記録し、更新後の進捗状態を返す
export const recordStageResult = ({
  stageId,
  correctCount,
  totalCount,
}: StageResultPayload): StageProgressState => {
  const currentState = loadStageProgress();
  const accuracy =
    totalCount === 0 ? 0 : Math.min(1, correctCount / totalCount);
  const previous = currentState[stageId];
  const cleared = accuracy >= STAGE_CLEAR_THRESHOLD;

  const nextEntry: StageProgressEntry = {
    stageId,
    bestAccuracy: Math.max(previous?.bestAccuracy ?? 0, accuracy),
    cleared: Boolean(previous?.cleared) || cleared,
    attempts: (previous?.attempts ?? 0) + 1,
    lastPlayedAt: Date.now(),
    lastAccuracy: accuracy,
    // ステージ結果が保存できた時点で挑戦済み扱いにする
    hasAttempted: true,
  };

  const nextState = {
    ...currentState,
    [stageId]: nextEntry,
  };

  saveStageProgress(nextState);
  return nextState;
};
