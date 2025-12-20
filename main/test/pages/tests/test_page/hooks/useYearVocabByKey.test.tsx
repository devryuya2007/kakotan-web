import {renderHook} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {useYearVocabByKey} from "@/pages/tests/test_page/hooks/useYearVocabByKey";

const useYearVocabMock = vi.fn();

vi.mock("@/hooks/useYearVocab", () => ({
  useYearVocab: (...args: Array<unknown>) => useYearVocabMock(...args),
}));

vi.mock("@/pages/tests/test_page/hooks/useUserConfig", () => ({
  useUserConfig: () => ({
    config: {
      reiwa3: {maxCount: 20, sectionId: "reiwa3"},
    },
  }),
}));

describe("useYearVocabByKey", () => {
  test("設定値を使ってuseYearVocabを呼び出す", () => {
    useYearVocabMock.mockReturnValue({
      status: "ready",
      questions: [],
      count: 0,
      error: null,
    });

    const {result} = renderHook(() => useYearVocabByKey("reiwa3"));

    expect(useYearVocabMock).toHaveBeenCalledWith("reiwa3", 20);
    expect(result.current.status).toBe("ready");
  });
});
