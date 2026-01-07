import type { StageProgressEntry, StageProgressState } from "./stageProgressTypes";

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

    const parsed = JSON.parse(raw) as Record<string, Partial<StageProgressEntry>>;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    // 古い保存形式を補完して、新しい形式に揃える
    const normalized: StageProgressState = {};
    Object.entries(parsed).forEach(([stageId, entry]) => {
      if (!entry || typeof entry !== "object") return;
      const attempts = typeof entry.attempts === "number" ? entry.attempts : 0;
      const cleared = Boolean(entry.cleared);
      const bestAccuracy = typeof entry.bestAccuracy === "number" ? entry.bestAccuracy : 0;
      const lastPlayedAt = typeof entry.lastPlayedAt === "number" ? entry.lastPlayedAt : 0;
      const lastAccuracy = typeof entry.lastAccuracy === "number" ? entry.lastAccuracy : 0;
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
      JSON.stringify(state)
    );
  } catch (error) {
    console.warn("Failed to persist stage progress", error);
  }
};
