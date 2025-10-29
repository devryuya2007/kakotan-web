/**
 * TODO: 経験値・正答率・連続正解などの計算ロジックを実装する。
 * React から独立した純粋関数としてエクスポートし、コンテキストや
 * コンポーネントが共通利用できるようにする。
 */

import { type QuizQuestion } from "../../data/vocabLoader";

// クイズ結果と既存の累積経験値をまとめたスナップショット
export type TestSessionSnapshot = {
  correct: QuizQuestion[];
  incorrect: QuizQuestion[];
  ExperiencePoints: number;
};

// レベルアップに必要な経験値カーブを定義する設定
export type LevelSystemConfig = {
  baseRequiredXp: number;
  growthRate: number;
  maxLevel?: number;
};

// レベルと次レベルまでの進捗を表現する結果
export type LevelProgress = {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  xpTillNextLevel: number;
  progressRatio: number;
};

// デフォルトの経験値カーブ設定
export const defaultLevelConfig: LevelSystemConfig = {
  baseRequiredXp: 100,
  growthRate: 1.2,
  maxLevel: 99,
};

// level: 計算したいレベル番号, config: 使用するカーブ設定 -> 次レベルまでに必要な経験値を返す
export function requiredXpForLevel(
  level: number,
  config: LevelSystemConfig = defaultLevelConfig
): number {
  if (level <= 1) {
    return Math.round(config.baseRequiredXp);
  }

  const scaled = config.baseRequiredXp * config.growthRate ** (level - 1);
  return Math.round(scaled);
}

// totalXp: 累積経験値, config: 使用するカーブ設定 -> 現在のレベル進捗情報を返す
export function calculateLevelProgress(
  totalXp: number,
  config: LevelSystemConfig = defaultLevelConfig
): LevelProgress {
  const safeTotal = Math.max(0, totalXp);
  let level = 1;
  let xpSpent = 0;

  while (true) {
    const required = requiredXpForLevel(level, config);
    const reachedMax =
      typeof config.maxLevel === "number" && level >= config.maxLevel;

    if (reachedMax) {
      return {
        level: config.maxLevel!,
        totalXp: safeTotal,
        xpIntoLevel: required,
        xpForNextLevel: 0,
        xpTillNextLevel: 0,
        progressRatio: 1,
      };
    } //if 100xp = 1レベル
    // xpSpent　レベル単位の経験値（得た経験値が1543xpなら1500xp）　safeTotal　得てきた経験値すべて
    if (xpSpent + required > safeTotal) {
      // required 次のレベルアップに必要な経験値
      const xpIntoLevel = safeTotal - xpSpent; // レベルの途中で溜まっている分
      const xpTillNextLevel = required - xpIntoLevel; // ユーザーが次のレベルに必要な分
      const progressRatio = required === 0 ? 1 : xpIntoLevel / required; // 次のレベルアップまで何割進んだか

      return {
        level,
        totalXp: safeTotal,
        xpIntoLevel,
        xpForNextLevel: required,
        xpTillNextLevel,
        progressRatio,
      };
    }

    xpSpent += required;
    level += 1;
  }
}

// correct/incorrect: 問題ごとの正誤リスト, ExperiencePoints: 既存の累積XP -> 新しい累積XPを返す
export function getExperiencePoints({
  correct,
  incorrect,
  ExperiencePoints: currentXp,
}: TestSessionSnapshot): number {
  const correctXp = correct.length * 10;
  const incorrectPenalty = incorrect.length * 3;
  const gained = Math.max(0, correctXp - incorrectPenalty);

  return currentXp + gained;
}
