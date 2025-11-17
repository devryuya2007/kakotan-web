import reiwa3Vocab from '../assets/vocab/reiwa3_7/reiwa3.unigram.json';
import reiwa4Vocab from '../assets/vocab/reiwa3_7/reiwa4.unigram.json';
import reiwa5Vocab from '../assets/vocab/reiwa3_7/reiwa5.unigram.json';
import reiwa6Vocab from '../assets/vocab/reiwa3_7/reiwa6.unigram.json';
import reiwa7Vocab from '../assets/vocab/reiwa3_7/reiwa7.unigram.json';

export type YearKey = 'reiwa3' | 'reiwa4' | 'reiwa5' | 'reiwa6' | 'reiwa7';

export type VocabEntry = {
  phrase: string;
  mean?: string;
  onePhrase?: string;
  onePhraseJa?: string;
  count?: number;
};

const vocabByYear: Record<YearKey, VocabEntry[]> = {
  reiwa3: reiwa3Vocab as VocabEntry[],
  reiwa4: reiwa4Vocab as VocabEntry[],
  reiwa5: reiwa5Vocab as VocabEntry[],
  reiwa6: reiwa6Vocab as VocabEntry[],
  reiwa7: reiwa7Vocab as VocabEntry[],
};

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
  prompt: string; // e.g. 日本語の意味は？
  choices: string[]; // 表示用選択肢
  answerIndex: number; // 正解のchoicesインデックス
  phrase: string; // 英単語（正解の本体）
  mean?: string; // 正解の意味
  contextEn?: string; // 例文（英）
  contextJa?: string; // 例文（和）
}

export function buildQuestionsFromVocab(
  vocab: VocabEntry[],
  maxCount = 20,
): QuizQuestion[] {
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
