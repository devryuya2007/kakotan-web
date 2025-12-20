import {describe, expect, test} from "vitest";

import {
  XP_PER_CORRECT,
  XP_PER_INCORRECT,
  calculateLevelProgress,
  getExperiencePoints,
  requiredXpForLevel,
} from "@/features/results/scoring";
import type {QuizQuestion} from "@/data/vocabLoader";

// スコア計算の基本ロジックを確認する
describe("scoring", () => {
  test("requiredXpForLevelはレベル1でベース値を返す", () => {
    // レベル1は必ずbaseRequiredXpになる
    const required = requiredXpForLevel(1, {baseRequiredXp: 120, growthRate: 2});
    expect(required).toBe(120);
  });

  test("requiredXpForLevelは成長率を掛けて算出する", () => {
    // growthRateで指数的に増えることを確認する
    const required = requiredXpForLevel(3, {baseRequiredXp: 100, growthRate: 2});
    expect(required).toBe(400);
  });

  test("calculateLevelProgressは負の経験値を0として扱う", () => {
    // マイナスXPを入れても進捗が壊れないことを確認する
    const result = calculateLevelProgress(-10, {
      baseRequiredXp: 1000,
      growthRate: 1.1,
      maxLevel: 99,
    });

    expect(result.level).toBe(1);
    expect(result.xpIntoLevel).toBe(0);
    expect(result.progressRatio).toBe(0);
  });

  test("calculateLevelProgressは最大レベル到達時に固定化される", () => {
    // maxLevelに達したら次レベルが0になることを確認する
    const result = calculateLevelProgress(9999, {
      baseRequiredXp: 100,
      growthRate: 1,
      maxLevel: 2,
    });

    expect(result.level).toBe(2);
    expect(result.xpForNextLevel).toBe(0);
    expect(result.progressRatio).toBe(1);
  });

  test("getExperiencePointsで正誤の経験値が合算される", () => {
    // 正解と不正解の件数からXPが計算されることを確認する
    const mockQuestion = {
      id: "q1",
      phrase: "apple",
      mean: "りんご",
      choices: ["りんご"],
      answerIndex: 0,
    } as QuizQuestion;

    const result = getExperiencePoints({
      correct: [mockQuestion, mockQuestion],
      incorrect: [mockQuestion],
      ExperiencePoints: 50,
    });

    expect(result.correctXp).toBe(2 * XP_PER_CORRECT);
    expect(result.incorrectXp).toBe(1 * XP_PER_INCORRECT);
    expect(result.gainedXp).toBe(result.correctXp + result.incorrectXp);
    expect(result.nextTotalXp).toBe(50 + result.gainedXp);
  });
});
