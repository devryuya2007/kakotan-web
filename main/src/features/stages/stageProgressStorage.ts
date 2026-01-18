import type { StageProgressEntry, StageProgressState } from "./stageProgressTypes";

// 保存キー。バージョンを付けて将来の拡張にも備える
const STAGE_PROGRESS_STORAGE_KEY = "stage-progress:v1";
// 初回クリア演出などで使う「直近のクリア情報」を保存するキー
const STAGE_CLEAR_EVENT_STORAGE_KEY = "stage-clear-event:v1";

// 直近のクリア情報を保存するための型
export interface StageClearEvent {
  stageId: string;
  clearedAt: number;
}

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

// 直近のクリア情報を読み込む（演出やボーナス判定に使う）
export const loadStageClearEvent = (): StageClearEvent | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STAGE_CLEAR_EVENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StageClearEvent>;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (typeof parsed.stageId !== "string") return null;
    if (typeof parsed.clearedAt !== "number") return null;

    return {
      stageId: parsed.stageId,
      clearedAt: parsed.clearedAt,
    };
  } catch {
    return null;
  }
};

// 直近のクリア情報を保存する（初回クリア時だけ使う想定）
export const saveStageClearEvent = (event: StageClearEvent) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      STAGE_CLEAR_EVENT_STORAGE_KEY,
      JSON.stringify(event)
    );
  } catch {
    return;
  }
};

// 直近のクリア情報を削除する（演出を消したいときに使う）
export const clearStageClearEvent = () => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STAGE_CLEAR_EVENT_STORAGE_KEY);
  } catch {
    return;
  }
};
