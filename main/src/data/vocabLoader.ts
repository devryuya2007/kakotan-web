import { yearRegistry, type YearKey } from "./defaultRegistry";
import type { VocabEntry } from "./vocabTypes";

export type { VocabEntry } from "./vocabTypes";
export type { YearKey } from "./defaultRegistry";

const vocabByYear = yearRegistry.reduce(
  (accumulator, entry) => {
    accumulator[entry.key] = entry.vocab as VocabEntry[];
    return accumulator;
  },
  {} as Record<YearKey, VocabEntry[]>
);

export async function loadYearVocab(year: YearKey): Promise<VocabEntry[]> {
  const vocab = vocabByYear[year];
  if (!vocab) {
    throw new Error(`Unknown year key: ${year}`);
  }
  return structuredClone(vocab);
}

/**
 * Create simple 4-choice questions from vocab entries.
 * Default: prompt asks for the Japanese meaning of an English word.
 */

export interface QuizQuestion {
  id: string;
  prompt?: string; // e.g. 日本語の意味は？
  choices: string[]; // 表示用選択肢
  answerIndex: number; // 正解のchoicesインデックス
  phrase: string; // 英単語（正解の本体）
  mean?: string; // 正解の意味
  contextEn?: string; // 例文（英）
  contextJa?: string; // 例文（和）
}

export function buildQuestionsFromVocab(vocab: VocabEntry[], maxCount = 20): QuizQuestion[] {
  const entries = vocab.filter((e) => !!e.phrase && !!e.mean);
  const take = Math.min(maxCount, entries.length);

  const result: QuizQuestion[] = [];

  for (let i = 0; i < take; i++) {
    const e = entries[i]!;
    // Collect up to 3 distractors by順番に参照する
    const distractors: string[] = [];
    let offset = 1;
    while (distractors.length < 3 && offset < entries.length) {
      const candidate = entries[(i + offset) % entries.length]!;
      offset++;
      if (!candidate.mean || candidate.mean === e.mean) continue;
      if (distractors.includes(candidate.mean)) continue;
      distractors.push(candidate.mean);
    }

    const allChoices = [e.mean!, ...distractors].slice(0, 4);
    const answerIndex = allChoices.indexOf(e.mean!);

    result.push({
      id: `${e.phrase}-${i}`,
      prompt: `${e.phrase} の日本語の意味はどれ？`,
      choices: allChoices,
      answerIndex,
      phrase: e.phrase,
      mean: e.mean,
      contextEn: e.onePhrase,
      contextJa: e.onePhraseJa,
    });
  }

  return result;
}
