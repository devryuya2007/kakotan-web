import type { VocabEntry, YearKey } from "@/data/vocabLoader";

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

// 1ステージ分の問題を作るための入力
export interface StageQuestionInput {
  vocab: VocabEntry[];
  stage: StageDefinition;
}
