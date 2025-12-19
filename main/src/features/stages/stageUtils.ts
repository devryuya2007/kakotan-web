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

// 年度語彙からステージ定義を生成する
export const createStageDefinitions = ({
  year,
  yearLabel,
  vocab,
  baseQuestionCount,
}: StageDefinitionInput): StageDefinitionResult => {
  const filteredEntries = filterStageEntries(vocab);
  const normalizedQuestionCount = normalizeQuestionCount(baseQuestionCount);
  const totalWords = filteredEntries.length;
  const totalStages =
    totalWords === 0 ? 0 : Math.ceil(totalWords / normalizedQuestionCount);

  const stages = Array.from({length: totalStages}, (_, index) => {
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

  return {
    stages,
    totalWords,
    normalizedQuestionCount,
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
