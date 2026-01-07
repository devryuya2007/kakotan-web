import {buildQuestionsFromVocab} from "@/data/vocabLoader";
import type {QuizQuestion, VocabEntry, YearKey} from "@/data/vocabLoader";

import {getCachedStageDefinitions, storeStageDefinitions} from "./stageDefinitionCache";
import type {
  StageDefinition,
  StageDefinitionInput,
  StageDefinitionResult,
  StageDefinitionSummary,
  StageQuestionInput,
} from "./stageDefinitionTypes";

export type {
  StageDefinition,
  StageDefinitionInput,
  StageDefinitionResult,
  StageDefinitionSummary,
  StageQuestionInput,
} from "./stageDefinitionTypes";

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

// 指定ステージの問題配列を作る（最後のステージは残り分だけになる）
export const buildStageQuestions = ({
  vocab,
  stage,
}: StageQuestionInput): QuizQuestion[] => {
  // ステージ定義と同じ基準で語彙をフィルタする
  const filteredEntries = filterStageEntries(vocab);
  // 定義済みの開始位置と問題数を使って切り出す
  const startIndex = Math.max(0, stage.startIndex);
  const questionCount = Math.max(0, stage.questionCount);
  const stageEntries = filteredEntries.slice(
    startIndex,
    startIndex + questionCount,
  );

  return buildQuestionsFromVocab(stageEntries, questionCount);
};
