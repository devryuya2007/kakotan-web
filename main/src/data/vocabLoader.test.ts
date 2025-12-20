import {describe, expect, test} from "vitest";

import {buildQuestionsFromVocab, loadYearVocab, type VocabEntry, type YearKey} from "./vocabLoader";

// 語彙ローダーの挙動を確認する
describe("vocabLoader", () => {
  test("年度の語彙は複製されて返る", async () => {
    // 同じ年度を2回読み込んでも、片方の変更が影響しないことを確認する
    const first = await loadYearVocab("reiwa3");
    if (first.length > 0) {
      first[0].phrase = "changed";
    }

    const second = await loadYearVocab("reiwa3");
    if (second.length > 0) {
      expect(second[0]?.phrase).not.toBe("changed");
    }
  });

  test("未知の年度キーはエラーになる", async () => {
    // 型はYearKeyに見せつつ、実体は存在しないキーを渡す
    await expect(loadYearVocab("unknown" as YearKey)).rejects.toThrow(
      "Unknown year key",
    );
  });

  test("buildQuestionsFromVocabは有効語彙だけで問題を作る", () => {
    // phrase/meanが揃っていない語彙は除外されることを確認する
    const vocab: VocabEntry[] = [
      {phrase: "alpha", mean: "A"},
      {phrase: "beta", mean: "B"},
      {phrase: "", mean: "空"},
      {phrase: "gamma"},
    ];

    const result = buildQuestionsFromVocab(vocab, 10);

    expect(result).toHaveLength(2);
    expect(result[0]?.choices).toContain("A");
    expect(result[0]?.answerIndex).toBe(
      result[0]?.choices.indexOf("A"),
    );
  });

  test("選択肢の重複は省かれ、最大4件までに整形される", () => {
    // meanが重複する語彙を混ぜて、重複が除外されるかを見る
    const vocab: VocabEntry[] = [
      {phrase: "alpha", mean: "A"},
      {phrase: "beta", mean: "B"},
      {phrase: "gamma", mean: "B"},
    ];

    const result = buildQuestionsFromVocab(vocab, 3);
    const choices = result[0]?.choices ?? [];

    // 同じ意味が複数入らないことを確認する
    const uniqueChoices = Array.from(new Set(choices));
    expect(uniqueChoices).toHaveLength(choices.length);
    expect(choices.length).toBeLessThanOrEqual(4);
  });
});
