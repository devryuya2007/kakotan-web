import {describe, test, expect, beforeEach, vi} from "vitest";

import type {VocabEntry, YearKey} from "@/data/vocabLoader";

import {
  buildStageQuestions,
  calculateStageSummary,
  createStageDefinitions,
} from "@/features/stages/stageUtils";

// ステージ定義の計算ロジックをまとめて確認する
describe("ステージ定義ユーティリティ", () => {
  beforeEach(() => {
    // localStorageを使うテストなので、毎回クリーンにする
    localStorage.clear();
  });

  test("ステージ数の計算と正規化が正しく行われる", () => {
    // 入力語彙のうち、phrase/meanが揃ったものだけが対象になる
    const vocab: VocabEntry[] = [
      {phrase: "alpha", mean: "アルファ"},
      {phrase: "beta"},
      {phrase: "", mean: "空"},
      {phrase: "gamma", mean: "ガンマ"},
    ];

    // baseQuestionCountが0でも、最低1問になることを確認する
    const summary = calculateStageSummary({
      vocab,
      baseQuestionCount: 0,
    });

    // フィルタ後は2語なので、ステージ数も2になる
    expect(summary.totalWords).toBe(2);
    expect(summary.normalizedQuestionCount).toBe(1);
    expect(summary.totalStages).toBe(2);
  });

  test("語彙が0件ならステージ数は0になる", () => {
    // totalWordsが0のときの分岐を通す
    const summary = calculateStageSummary({
      vocab: [],
      baseQuestionCount: 5,
    });

    expect(summary.totalWords).toBe(0);
    expect(summary.totalStages).toBe(0);
  });

  test("ステージ定義が正しい件数で作られてlocalStorageにも保存される", () => {
    // 語彙は5語あるので、3問区切りなら2ステージになる
    const vocab: VocabEntry[] = [
      {phrase: "one", mean: "1"},
      {phrase: "two", mean: "2"},
      {phrase: "three", mean: "3"},
      {phrase: "four", mean: "4"},
      {phrase: "five", mean: "5"},
    ];

    const year: YearKey = "reiwa3";
    // 年度とラベルを渡してステージ定義を作成する
    const result = createStageDefinitions({
      year,
      yearLabel: "Reiwa 3",
      vocab,
      baseQuestionCount: 3,
    });

    // 期待するステージ数とタイトルの整形を確認する
    expect(result.stages).toHaveLength(2);
    expect(result.stages[0].title).toBe("Reiwa 3 Stage 1");
    expect(result.stages[1].questionCount).toBe(2);

    // 保存先が作られているかだけ確認する（キー名は内部管理）
    expect(localStorage.length).toBe(1);
    const storedKey = localStorage.key(0);
    expect(storedKey).toBeTruthy();
    const storedValue = storedKey ? localStorage.getItem(storedKey) : null;
    expect(storedValue).not.toBeNull();

    const parsed = storedValue ? JSON.parse(storedValue) : {};
    const entries = Object.values(parsed) as Array<{
      stages: Array<{stageNumber: number}>;
    }>;
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0]?.stages[0]?.stageNumber).toBe(1);
  });

  test("ステージ定義の開始位置と問題数で問題が切り出される", () => {
    const vocab: VocabEntry[] = [
      {phrase: "apple", mean: "りんご"},
      {phrase: "banana", mean: "ばなな"},
      {phrase: "cherry", mean: "さくらんぼ"},
      {phrase: "dragon", mean: "ドラゴン"},
      {phrase: "egg", mean: "たまご"},
    ];

    // 2問ずつで区切るので、ステージ2は3〜4番目になる
    const result = createStageDefinitions({
      year: "reiwa3",
      yearLabel: "Reiwa 3",
      vocab,
      baseQuestionCount: 2,
    });
    const targetStage = result.stages[1];
    expect(targetStage).toBeTruthy();

    const questions = buildStageQuestions({
      vocab,
      stage: targetStage,
    });

    // ステージ2の問題は cherry と dragon が対象になる
    expect(questions).toHaveLength(2);
    expect(questions[0]?.phrase).toBe("cherry");
    expect(questions[1]?.phrase).toBe("dragon");
  });

  test("シャッフル指定があると出題順が変わる", () => {
    const vocab: VocabEntry[] = [
      {phrase: "alpha", mean: "A"},
      {phrase: "bravo", mean: "B"},
      {phrase: "charlie", mean: "C"},
      {phrase: "delta", mean: "D"},
    ];

    const result = createStageDefinitions({
      year: "reiwa3",
      yearLabel: "Reiwa 3",
      vocab,
      baseQuestionCount: 2,
    });
    const targetStage = result.stages[0];
    expect(targetStage).toBeTruthy();

    // 乱数を固定してシャッフル結果を安定させる
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    const questions = buildStageQuestions({
      vocab,
      stage: targetStage,
      shuffleEntries: true,
    });

    expect(questions).toHaveLength(2);
    expect(questions[0]?.phrase).not.toBe("alpha");
    expect(questions[1]?.phrase).not.toBe("bravo");

    randomSpy.mockRestore();
  });

  test("キャッシュが壊れていても新しく作り直される", () => {
    // JSONが壊れている場合でも落ちないことを確認する
    localStorage.setItem("stage-definition-cache:v1", "{broken");

    const vocab: VocabEntry[] = [
      {phrase: "one", mean: "1"},
      {phrase: "two", mean: "2"},
    ];

    const result = createStageDefinitions({
      year: "reiwa3",
      yearLabel: "Reiwa 3",
      vocab,
      baseQuestionCount: 2,
    });

    expect(result.stages).toHaveLength(1);
  });

  test("windowが無いときはキャッシュ操作をスキップする", () => {
    // SSR環境向けの早期returnを通す
    const originalWindow = window;
    vi.stubGlobal("window", undefined);

    const vocab: VocabEntry[] = [
      {phrase: "one", mean: "1"},
      {phrase: "two", mean: "2"},
    ];

    const result = createStageDefinitions({
      year: "reiwa3",
      yearLabel: "Reiwa 3",
      vocab,
      baseQuestionCount: 2,
    });

    expect(result.stages).toHaveLength(1);

    vi.stubGlobal("window", originalWindow);
  });

  test("総語彙数が違うキャッシュは無効になる", () => {
    // totalWordsが合わないキャッシュは使われないことを確認する
    const cacheKey = "reiwa3-q2";
    const cached = {
      [cacheKey]: {
        totalWords: 999,
        normalizedQuestionCount: 2,
        stages: [
          {
            stageId: "reiwa3-q2-stage1",
            year: "reiwa3",
            title: "Old Stage 1",
            stageNumber: 1,
            startIndex: 0,
            questionCount: 2,
            baseQuestionCount: 2,
          },
        ],
        savedAt: 1,
      },
    };
    localStorage.setItem("stage-definition-cache:v1", JSON.stringify(cached));

    const vocab: VocabEntry[] = [
      {phrase: "one", mean: "1"},
      {phrase: "two", mean: "2"},
    ];

    const result = createStageDefinitions({
      year: "reiwa3",
      yearLabel: "Reiwa 3",
      vocab,
      baseQuestionCount: 2,
    });

    expect(result.stages[0]?.title).toBe("Reiwa 3 Stage 1");
  });

  test("キャッシュが有効なときはタイトルだけ作り直す", () => {
    // totalWordsが合っているキャッシュは再利用されることを確認する
    const cacheKey = "reiwa3-q2";
    const cached = {
      [cacheKey]: {
        totalWords: 2,
        normalizedQuestionCount: 2,
        stages: [
          {
            stageId: "reiwa3-q2-stage1",
            year: "reiwa3",
            title: "Old Stage 1",
            stageNumber: 1,
            startIndex: 0,
            questionCount: 2,
            baseQuestionCount: 2,
          },
        ],
        savedAt: 1,
      },
    };
    localStorage.setItem("stage-definition-cache:v1", JSON.stringify(cached));

    const vocab: VocabEntry[] = [
      {phrase: "one", mean: "1"},
      {phrase: "two", mean: "2"},
    ];

    const result = createStageDefinitions({
      year: "reiwa3",
      yearLabel: "Reiwa 3",
      vocab,
      baseQuestionCount: 2,
    });

    expect(result.stages[0]?.title).toBe("Reiwa 3 Stage 1");
  });
});
