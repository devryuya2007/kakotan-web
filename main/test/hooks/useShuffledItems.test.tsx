import {renderHook} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {useShuffledItems} from "@/hooks/useShuffledItems";

describe("useShuffledItems", () => {
  test("シャッフル指定が無い場合は同じ配列を返す", () => {
    const items = [1, 2, 3];

    const {result} = renderHook(() => useShuffledItems(items, false));

    expect(result.current).toBe(items);
  });

  test("シャッフル指定がある場合は順序が入れ替わる", () => {
    const items = [1, 2, 3];
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    const {result} = renderHook(() => useShuffledItems(items, true));

    expect(result.current).toEqual([2, 3, 1]);

    randomSpy.mockRestore();
  });
});
