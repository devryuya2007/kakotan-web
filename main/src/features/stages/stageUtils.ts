import {buildQuestionsFromVocab} from "@/data/vocabLoader";
import type {QuizQuestion, VocabEntry, YearKey} from "@/data/vocabLoader";

// ステージ1つ分の情報。UIやルーティングで使うために必須の情報だけまとめる
export interface StageDefinition {
  stageId: string;
  year: YearKey;
  title: string;
  stageNumber: number;
  startIndex: number;
  questionCount: number;
  baseQuestionCount: number;
}

// ステージ生成の入力に使うパラメータ。年度別にまとめて渡す
export interface StageDefinitionInput {
  year: YearKey;
  yearLabel: string;
  vocab: VocabEntry[];
  baseQuestionCount: number;
}

// ステージ生成結果。総語彙数や基準問題数も一緒に返す
export interface StageDefinitionResult {
  stages: StageDefinition[];
  totalWords: number;
  normalizedQuestionCount: number;
}

// ステージ数の計算結果をまとめた型
export interface StageDefinitionSummary {
  totalWords: number;
  normalizedQuestionCount: number;
  totalStages: number;
}

// 設定値が0や負数だったときの保険。最低1問は保証する
const normalizeQuestionCount = (count: number) => Math.max(1, count);

// 出題対象として扱える語彙だけを抽出する。buildQuestionsFromVocabと同じ基準
const filterStageEntries = (vocab: VocabEntry[]) =>
  vocab.filter((entry) => Boolean(entry.phrase) && Boolean(entry.mean));

// ステージIDは設定問題数も含めて一意にする（設定変更時の進捗ズレを防ぐ）
export const buildStageId = (
  year: YearKey,
  baseQuestionCount: number,
  stageNumber: number,
) => `${year}-q${baseQuestionCount}-stage${stageNumber}`;

// ステージ数を計算する。定義生成とは役割を分ける
export const calculateStageSummary = ({
  vocab,
  baseQuestionCount,
}: Pick<
  StageDefinitionInput,
  "vocab" | "baseQuestionCount"
>): StageDefinitionSummary => {
  // 1) 使える語彙だけに絞る
  const filteredEntries = filterStageEntries(vocab);
  // 2) 設定値を安全な範囲に整える
  const normalizedQuestionCount = normalizeQuestionCount(baseQuestionCount);
  // 3) 総語彙数からステージ数を割り出す
  const totalWords = filteredEntries.length;
  const totalStages =
    totalWords === 0 ? 0 : Math.ceil(totalWords / normalizedQuestionCount);

  return {
    totalWords,
    normalizedQuestionCount,
    totalStages,
  };
};

// ステージ定義を作る（計算済みのサマリを受け取る）
const buildStageDefinitions = ({
  year,
  yearLabel,
  summary,
}: {
  year: YearKey;
  yearLabel: string;
  summary: StageDefinitionSummary;
}): StageDefinition[] => {
  const {totalWords, normalizedQuestionCount, totalStages} = summary;

  return Array.from({length: totalStages}, (_, index) => {
    const stageNumber = index + 1;
    const startIndex = index * normalizedQuestionCount;
    const remaining = Math.max(0, totalWords - startIndex);
    const questionCount = Math.min(normalizedQuestionCount, remaining);

    return {
      stageId: buildStageId(year, normalizedQuestionCount, stageNumber),
      year,
      title: `${yearLabel} Stage ${stageNumber}`,
      stageNumber,
      startIndex,
      questionCount,
      baseQuestionCount: normalizedQuestionCount,
    };
  });
};

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
      JSON.stringify(cache),
    );
  } catch {
    // 保存できなくてもアプリは進められるので握りつぶす
  }
};

const getCachedStageDefinitions = ({
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

const storeStageDefinitions = ({
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

// 年度語彙からステージ定義を生成する
export const createStageDefinitions = ({
  year,
  yearLabel,
  vocab,
  baseQuestionCount,
}: StageDefinitionInput): StageDefinitionResult => {
  // まずはサマリを計算して分離する
  const summary = calculateStageSummary({vocab, baseQuestionCount});
  // localStorageに保存した定義があればそれを再利用する
  const cachedStages = getCachedStageDefinitions({year, yearLabel, summary});
  const stages = cachedStages ?? buildStageDefinitions({year, yearLabel, summary});

  if (!cachedStages) {
    storeStageDefinitions({year, summary, stages});
  }

  return {
    stages,
    totalWords: summary.totalWords,
    normalizedQuestionCount: summary.normalizedQuestionCount,
  };
};

// 1ステージ分の問題を作る。年度語彙 + ステージ番号 + 1ステージの問題数で切り出す
export interface StageQuestionInput {
  vocab: VocabEntry[];
  stageNumber: number;
  baseQuestionCount: number;
}

// 指定ステージの問題配列を作る（最後のステージは残り分だけになる）
export const buildStageQuestions = ({
  vocab,
  stageNumber,
  baseQuestionCount,
}: StageQuestionInput): QuizQuestion[] => {
  const filteredEntries = filterStageEntries(vocab);
  const normalizedQuestionCount = normalizeQuestionCount(baseQuestionCount);
  const startIndex = Math.max(0, stageNumber - 1) * normalizedQuestionCount;
  const stageEntries = filteredEntries.slice(
    startIndex,
    startIndex + normalizedQuestionCount,
  );

  return buildQuestionsFromVocab(stageEntries, normalizedQuestionCount);
};
