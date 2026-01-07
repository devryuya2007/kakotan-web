import type { YearKey } from "@/data/vocabLoader";

import type { StageDefinition, StageDefinitionSummary } from "./stageDefinitionTypes";

// ステージ定義のキャッシュ。localStorageは既存ストアと区別する
const STAGE_DEFINITION_STORAGE_KEY = "stage-definition-cache:v1";

interface StageDefinitionCacheEntry {
  totalWords: number;
  normalizedQuestionCount: number;
  stages: StageDefinition[];
  savedAt: number;
}

// 年度 + 設定問題数をキーにしたキャッシュ状態
interface StageDefinitionCacheState {
  [cacheKey: string]: StageDefinitionCacheEntry;
}

const buildStageCacheKey = (year: YearKey, normalizedQuestionCount: number) =>
  `${year}-q${normalizedQuestionCount}`;

const loadStageDefinitionCache = (): StageDefinitionCacheState => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STAGE_DEFINITION_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StageDefinitionCacheState;
  } catch {
    // 読み込みに失敗したら空で再開する
    return {};
  }
};

const saveStageDefinitionCache = (cache: StageDefinitionCacheState) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STAGE_DEFINITION_STORAGE_KEY,
      JSON.stringify(cache)
    );
  } catch {
    // 保存できなくてもアプリは進められるので握りつぶす
  }
};

export const getCachedStageDefinitions = ({
  year,
  yearLabel,
  summary,
}: {
  year: YearKey;
  yearLabel: string;
  summary: StageDefinitionSummary;
}): StageDefinition[] | null => {
  // キャッシュ読み込みは必ずこの関数経由にまとめる
  const cache = loadStageDefinitionCache();
  const key = buildStageCacheKey(year, summary.normalizedQuestionCount);
  const entry = cache[key];
  if (!entry) return null;
  if (entry.totalWords !== summary.totalWords) return null;

  // タイトルは最新の年表示に合わせて作り直す
  return entry.stages.map((stage) => ({
    ...stage,
    year,
    title: `${yearLabel} Stage ${stage.stageNumber}`,
    baseQuestionCount: summary.normalizedQuestionCount,
  }));
};

export const storeStageDefinitions = ({
  year,
  summary,
  stages,
}: {
  year: YearKey;
  summary: StageDefinitionSummary;
  stages: StageDefinition[];
}) => {
  // 保存前に最新キャッシュを取り直して上書きする
  const cache = loadStageDefinitionCache();
  const key = buildStageCacheKey(year, summary.normalizedQuestionCount);
  cache[key] = {
    totalWords: summary.totalWords,
    normalizedQuestionCount: summary.normalizedQuestionCount,
    stages,
    savedAt: Date.now(),
  };
  saveStageDefinitionCache(cache);
};
