import type { QuizQuestion } from "@/data/vocabLoader";
import { isYearKey } from "@/pages/stages/stageConstants";

// 間違えた単語の表示に使う型
export type WrongWordStat = {
  word: string;
  missCount: number;
  meaning: string;
  severity: "neutral" | "caution" | "negative";
};

interface SessionWithStageId {
  stageId?: string;
}

// 間違い単語を集計して重みづけする
export const buildWrongWordStats = (incorrect: QuizQuestion[]): WrongWordStat[] => {
  if (incorrect.length === 0) return [];

  const mistakeTally = new Map<string, { count: number; meaning: string }>();

  incorrect.forEach((question) => {
    const word = question.phrase;
    const meaning = question.mean ?? "Meaning unavailable";
    const tally = mistakeTally.get(word);

    if (tally) {
      mistakeTally.set(word, {
        count: tally.count + 1,
        meaning: tally.meaning || meaning,
      });
    } else {
      mistakeTally.set(word, { count: 1, meaning });
    }
  });

  const talliedEntries = Array.from(mistakeTally.entries());
  const sortedEntries = [...talliedEntries].sort(
    (a, b) => b[1].count - a[1].count
  );

  return sortedEntries.map<WrongWordStat>(([word, data]) => {
    const severity: WrongWordStat["severity"] =
      data.count >= 3 ? "negative" : data.count === 2 ? "caution" : "neutral";

    return {
      word,
      missCount: data.count,
      meaning: data.meaning,
      severity,
    };
  });
};

// 直近のステージ情報から戻り先の年度を推定する
export const getStageListPath = (sessionHistory: SessionWithStageId[]): string => {
  const latestStageId = sessionHistory[sessionHistory.length - 1]?.stageId ?? null;
  if (!latestStageId) return "/menu";

  const [maybeYear] = latestStageId.split("-");
  return isYearKey(maybeYear) ? `/stages/${maybeYear}` : "/menu";
};

// レベル帯に応じたランク文字を決める
export const getRankLetter = (level: number): string => {
  if (level === 99) return "SS";
  if (level >= 90) return "S";
  if (level >= 70) return "A";
  if (level >= 50) return "B";
  if (level >= 30) return "C";
  if (level >= 10) return "D";
  return "E";
};
