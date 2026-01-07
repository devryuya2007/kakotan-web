import type { QuizQuestion } from "@/data/vocabLoader";

import type { SessionRecord } from "./TestReSultContext.shared";

// テスト結果を保存するためのまとめデータ
export interface StoredSnapshot {
  correct: QuizQuestion[];
  incorrect: QuizQuestion[];
  totalXp: number;
  sessionHistory: SessionRecord[];
  solvedPhrases: QuizQuestion[];
  missedPhrases: QuizQuestion[];
}

// localStorageのキーはまとめて管理する
const RESULTS_STORAGE_PREFIX = "test-results:session";
const XP_STORAGE_KEY = "test-results:xp";

// 配列として保存するデータの枠を用意する
interface StoredResults {
  correct: QuizQuestion[];
  incorrect: QuizQuestion[];
  sessionHistory: SessionRecord[];
  solvedPhrases: QuizQuestion[];
  missedPhrases: QuizQuestion[];
}

// localStorageから読み出した結果の形をゆるく定義する
interface ParsedResultsPayload {
  correct?: unknown;
  incorrect?: unknown;
  sessionHistory?: unknown;
  solvedPhrases?: unknown;
  missedPhrases?: unknown;
}

// XPだけ保存するペイロードの型
interface StoredXpPayload {
  totalXp?: number;
}

const createEmptyResults = (): StoredResults => ({
  correct: [],
  incorrect: [],
  sessionHistory: [],
  solvedPhrases: [],
  missedPhrases: [],
});

const createEmptySnapshot = (): StoredSnapshot => ({
  ...createEmptyResults(),
  totalXp: 0,
});

const getResultsStorageKey = (testId: string): string =>
  `${RESULTS_STORAGE_PREFIX}:${testId}`;

// 以前の保存データに欠けがある場合の補完処理
const normalizeSessionRecords = (
  raw: Array<Partial<SessionRecord>>
): SessionRecord[] =>
  raw.map((record) => ({
    startedAt: record.startedAt ?? 0,
    finishedAt: record.finishedAt ?? record.startedAt ?? 0,
    durationMs: record.durationMs ?? 0,
    sectionId: record.sectionId ?? "unknown",
    correctCount: record.correctCount ?? 0,
    incorrectCount: record.incorrectCount ?? 0,
    gainedXp: record.gainedXp ?? 0,
    stageId: typeof record.stageId === "string" ? record.stageId : undefined,
  }));

// 保存データ（テスト結果）のJSONを配列型に寄せて復元する
const parseResultsPayload = (raw: string | null): StoredResults => {
  if (!raw) return createEmptyResults();

  const parsed = JSON.parse(raw) as ParsedResultsPayload;

  return {
    correct: Array.isArray(parsed.correct)
      ? (parsed.correct as QuizQuestion[])
      : [],
    incorrect: Array.isArray(parsed.incorrect)
      ? (parsed.incorrect as QuizQuestion[])
      : [],
    solvedPhrases: Array.isArray(parsed.solvedPhrases)
      ? (parsed.solvedPhrases as QuizQuestion[])
      : [],
    missedPhrases: Array.isArray(parsed.missedPhrases)
      ? (parsed.missedPhrases as QuizQuestion[])
      : [],
    // 以前のバージョンで保存された履歴は新しいフィールドが欠けていることがあるため補完する
    sessionHistory: Array.isArray(parsed.sessionHistory)
      ? normalizeSessionRecords(parsed.sessionHistory as Array<Partial<SessionRecord>>)
      : [],
  };
};

// 保存データ（XPだけ）のJSONを数値に寄せて復元する
const parseXpPayload = (raw: string | null): number => {
  if (!raw) return 0;
  const parsed = JSON.parse(raw) as StoredXpPayload;
  return typeof parsed.totalXp === "number" ? parsed.totalXp : 0;
};

// localStorageからテスト結果の配列データを読む
const readResultsFromStorage = (testId: string): StoredResults => {
  if (typeof window === "undefined") return createEmptyResults();

  try {
    const raw = window.localStorage.getItem(getResultsStorageKey(testId));
    return parseResultsPayload(raw);
  } catch (error) {
    console.warn("Failed to load results from storage", error);
    return createEmptyResults();
  }
};

// localStorageからXPだけを読む
const readTotalXpFromStorage = (): number => {
  if (typeof window === "undefined") return 0;

  try {
    const raw = window.localStorage.getItem(XP_STORAGE_KEY);
    return parseXpPayload(raw);
  } catch (error) {
    console.warn("Failed to load total XP from storage", error);
    return 0;
  }
};

// テスト結果とXPを1つのスナップショットにまとめる
const mergeSnapshot = (results: StoredResults, totalXp: number): StoredSnapshot => ({
  ...results,
  totalXp,
});

// テスト結果のスナップショットをlocalStorageに保存する
const writeResultsToStorage = (testId: string, snapshot: StoredSnapshot): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    getResultsStorageKey(testId),
    JSON.stringify(snapshot)
  );
};

// XPだけをlocalStorageに保存する
const writeTotalXpToStorage = (totalXp: number): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    XP_STORAGE_KEY,
    JSON.stringify({ totalXp })
  );
};

// テストIDごとに保存したスナップショットを読み込む
export const loadSnapshot = (testId: string): StoredSnapshot => {
  if (typeof window === "undefined") {
    return createEmptySnapshot();
  }

  const results = readResultsFromStorage(testId);
  const totalXp = readTotalXpFromStorage();

  return mergeSnapshot(results, totalXp);
};

// スナップショットをlocalStorageに保存する
export const persistSnapshot = (testId: string, snapshot: StoredSnapshot): void => {
  if (typeof window === "undefined") return;

  try {
    writeResultsToStorage(testId, snapshot);
    writeTotalXpToStorage(snapshot.totalXp);
  } catch (error) {
    console.warn("Failed to persist test results", error);
  }
};
