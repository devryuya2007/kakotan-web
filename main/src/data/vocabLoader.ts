export type YearKey = "reiwa3" | "reiwa4" | "reiwa5" | "reiwa6" | "reiwa7";

export type VocabEntry = {
  phrase: string;
  mean?: string;
  onePhrase?: string;
  onePhraseJa?: string;
  count?: number;
};

import reiwa3Vocab from "../assets/vocab/reiwa3_7/reiwa3.unigram.json";
import reiwa4Vocab from "../assets/vocab/reiwa3_7/reiwa4.unigram.json";
import reiwa5Vocab from "../assets/vocab/reiwa3_7/reiwa5.unigram.json";
import reiwa6Vocab from "../assets/vocab/reiwa3_7/reiwa6.unigram.json";
import reiwa7Vocab from "../assets/vocab/reiwa3_7/reiwa7.unigram.json";

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
  maxCount = 20
): QuizQuestion[] {
  const entries = vocab.filter((e) => !!e.phrase && !!e.mean);
  const take = Math.min(maxCount, entries.length);

  const rng = mulberry32(0xc0ffee); // 適当に整数入れてランダムな整数を返す
  const shuffledIdx = shuffle([...entries.keys()], rng); // entriesのインデックス配列とランダムな整数 ["0","1","2"...]

  const pickPool = shuffledIdx.slice(0, Math.max(40, take * 3));
  const result: QuizQuestion[] = [];

  for (let i = 0; i < take; i++) {
    const idx = pickPool[i % pickPool.length]!; // pickpoolをiが超えないように割っている→７÷4 = あまり3  3÷4 = あまり3
    const e = entries[idx]!; // 0~29まで一つずつの要素phraseとmean
    // Collect 3 distractors with different meanings
    const others = pickPool
      .map((j) => entries[j]!) // e以外のmeanが違う要素を配列で取得
      .filter((x) => x !== e && x.mean && x.mean !== e.mean);

    const shuffledOthers = shuffle([...others], rng);
    const distractors: string[] = [];

    for (const candidate of shuffledOthers) {
      if (distractors.length >= 3) break;
      const meaning = candidate.mean!;
      if (!distractors.includes(meaning)) {
        distractors.push(meaning);
      }
    }

    const allChoices = shuffle([e.mean!, ...distractors].slice(0, 4), rng);
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

export function shuffle<T>(arr: T[], rnd: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Small deterministic PRNG so choices are stable across reloads
export function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
