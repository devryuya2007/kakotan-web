// ステージの進捗を保存するためのユーティリティ。localStorageに保存して再訪で復元する

// ステージ1件分の進捗情報
export interface StageProgressEntry {
  stageId: string;
  bestAccuracy: number;
  cleared: boolean;
  attempts: number;
  lastPlayedAt: number;
  lastAccuracy: number;
}

// ステージIDをキーにして進捗を持つ保存形式
export interface StageProgressState {
  [stageId: string]: StageProgressEntry;
}

// クリア条件（正答率90%）
export const STAGE_CLEAR_THRESHOLD = 0.9;

// 保存キー。バージョンを付けて将来の拡張にも備える
const STAGE_PROGRESS_STORAGE_KEY = "stage-progress:v1";

// localStorageから進捗を安全に読み込む
export const loadStageProgress = (): StageProgressState => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STAGE_PROGRESS_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as StageProgressState;
    return parsed ?? {};
  } catch (error) {
    console.warn("Failed to load stage progress", error);
    return {};
  }
};

// 進捗をlocalStorageへ保存する
export const saveStageProgress = (state: StageProgressState) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      STAGE_PROGRESS_STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch (error) {
    console.warn("Failed to persist stage progress", error);
  }
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
  };

  const nextState = {
    ...currentState,
    [stageId]: nextEntry,
  };

  saveStageProgress(nextState);
  return nextState;
};
