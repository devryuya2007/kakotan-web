// ステージの進捗を保存するためのユーティリティ。localStorageに保存して再訪で復元する

// ステージ1件分の進捗情報
export interface StageProgressEntry {
  stageId: string;
  bestAccuracy: number;
  cleared: boolean;
  attempts: number;
  lastPlayedAt: number;
  lastAccuracy: number;
  // 1回でもステージを開いたかどうか
  hasAttempted: boolean;
}

// ステージIDをキーにして進捗を持つ保存形式
export interface StageProgressState {
  [stageId: string]: StageProgressEntry;
}

// ステージIDごとに解放状態を持つ形式
export interface StageUnlockState {
  [stageId: string]: boolean;
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

    const parsed = JSON.parse(raw) as Record<
      string,
      Partial<StageProgressEntry>
    >;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    // 古い保存形式を補完して、新しい形式に揃える
    const normalized: StageProgressState = {};
    Object.entries(parsed).forEach(([stageId, entry]) => {
      if (!entry || typeof entry !== "object") return;
      const attempts = typeof entry.attempts === "number" ? entry.attempts : 0;
      const cleared = Boolean(entry.cleared);
      const bestAccuracy =
        typeof entry.bestAccuracy === "number" ? entry.bestAccuracy : 0;
      const lastPlayedAt =
        typeof entry.lastPlayedAt === "number" ? entry.lastPlayedAt : 0;
      const lastAccuracy =
        typeof entry.lastAccuracy === "number" ? entry.lastAccuracy : 0;
      const hasAttempted =
        typeof entry.hasAttempted === "boolean"
          ? entry.hasAttempted
          : attempts > 0 || cleared;

      normalized[stageId] = {
        stageId,
        bestAccuracy,
        cleared,
        attempts,
        lastPlayedAt,
        lastAccuracy,
        hasAttempted,
      };
    });

    return normalized;
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

// 進捗とステージ一覧から、どのステージが解放されているかを計算する
export const buildStageUnlockMap = (
  stages: Array<{stageId: string}>,
  progress: StageProgressState,
): StageUnlockState => {
  // 1つ目は常に解放、それ以降は直前がクリア済みかで判定する
  const unlockState: StageUnlockState = {};
  let isPrevCleared = true;

  stages.forEach((stage, index) => {
    const isUnlocked = index === 0 ? true : isPrevCleared;
    unlockState[stage.stageId] = isUnlocked;

    const entry = progress[stage.stageId];
    isPrevCleared = Boolean(entry?.cleared);
  });

  return unlockState;
};
