import {renderHook, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, test, vi} from "vitest";

import {useAllYearVocab} from "@/hooks/useAllYearVocab";
import {yearRegistry, type YearKey} from "@/data/yearRegistry";
import type {VocabEntry} from "@/data/vocabLoader";

const loadYearVocabMock = vi.fn();

vi.mock("@/data/vocabLoader", async () => {
  const actual = await vi.importActual<typeof import("@/data/vocabLoader")>(
    "@/data/vocabLoader",
  );
  return {
    ...actual,
    loadYearVocab: (year: YearKey) => loadYearVocabMock(year),
  };
});

vi.mock("@/pages/tests/test_page/hooks/useUserConfig", () => ({
  useUserConfig: () => ({
    config: yearRegistry.reduce(
      (accumulator, entry) => {
        accumulator[entry.key] = {
          maxCount: entry.defaultQuestionCount,
          sectionId: entry.key,
        };
        return accumulator;
      },
      {} as Record<YearKey, {maxCount: number; sectionId: YearKey}>,
    ),
  }),
}));

describe("useAllYearVocab", () => {
  beforeEach(() => {
    loadYearVocabMock.mockReset();
  });

  test("年度ごとの問題がまとめて読み込まれる", async () => {
    const vocab: VocabEntry[] = [
      {phrase: "alpha", mean: "アルファ"},
      {phrase: "beta", mean: "ベータ"},
      {phrase: "gamma", mean: "ガンマ"},
      {phrase: "delta", mean: "デルタ"},
    ];
    loadYearVocabMock.mockResolvedValue(vocab);

    const {result} = renderHook(() => useAllYearVocab());

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    yearRegistry.forEach((entry) => {
      expect(result.current.questionsByYear[entry.key].length).toBeGreaterThan(
        0,
      );
    });
  });

  test("読み込みに失敗するとerrorになる", async () => {
    loadYearVocabMock.mockRejectedValue(new Error("load-error"));

    const {result} = renderHook(() => useAllYearVocab());

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    expect(result.current.error).toBe("load-error");
  });
});
