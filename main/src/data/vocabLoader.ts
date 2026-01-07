import { getAllRegistry } from "@/hooks/getAllRegistry";
import type { VocabEntry } from "./vocabTypes";

export type { VocabEntry } from "./vocabTypes";
export type YearKey = string;

const QUESTION_CHOICE_COUNT = 4;
const DEFAULT_QUESTION_COUNT = 20;

// 年度キーから語彙データを取得する
export async function loadYearVocab(year: string): Promise<VocabEntry[]> {
  const entry = getAllRegistry().find((item) => item.key === year);
  if (!entry) throw new Error(`Unknown year key ${year}`);

  // 元データを直接触らないようにコピーして返す
  return structuredClone(entry.vocab);
}

// 出題に必要な情報をまとめた構造
export interface QuizQuestion {
  id: string;
  prompt?: string; // 例: 日本語の意味は？
  choices: string[]; // 表示用選択肢
  answerIndex: number; // 正解のchoicesインデックス
  phrase: string; // 英単語（正解の本体）
  mean?: string; // 正解の意味
  contextEn?: string; // 例文（英）
  contextJa?: string; // 例文（和）
}

// phrase/meanが揃っている単語だけを出題対象にする
const filterValidEntries = (vocab: VocabEntry[]) =>
  vocab.filter((entry) => entry.phrase && entry.mean);

// 選択肢を4つにまとめる（正解+ダミー）
const buildChoices = (entries: VocabEntry[], index: number): string[] => {
  const correct = entries[index]?.mean;
  if (!correct) return [];

  // ダミーは順番に拾って重複を避ける
  const distractors: string[] = [];
  let offset = 1;
  while (distractors.length < QUESTION_CHOICE_COUNT - 1 && offset < entries.length) {
    const candidate = entries[(index + offset) % entries.length];
    offset += 1;
    if (!candidate?.mean || candidate.mean === correct) continue;
    if (distractors.includes(candidate.mean)) continue;
    distractors.push(candidate.mean);
  }

  return [correct, ...distractors].slice(0, QUESTION_CHOICE_COUNT);
};

// 単語配列から問題データを組み立てる
export function buildQuestionsFromVocab(
  vocab: VocabEntry[],
  maxCount = DEFAULT_QUESTION_COUNT
): QuizQuestion[] {
  const entries = filterValidEntries(vocab);
  const take = Math.min(maxCount, entries.length);

  return Array.from({ length: take }, (_, index) => {
    const entry = entries[index]!;
    const choices = buildChoices(entries, index);
    const answerIndex = choices.indexOf(entry.mean ?? "");

    return {
      id: `${entry.phrase}-${index}`,
      prompt: `${entry.phrase} の日本語の意味はどれ？`,
      choices,
      answerIndex,
      phrase: entry.phrase,
      mean: entry.mean,
      contextEn: entry.onePhrase,
      contextJa: entry.onePhraseJa,
    };
  });
}
