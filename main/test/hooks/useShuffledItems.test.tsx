import {renderHook} from "@testing-library/react";
import {describe, expect, test} from "vitest";

import {useShuffledItems} from "@/hooks/useShuffledItems";
import {shuffleItems} from "@/utils/shuffleItems";

describe("useShuffledItems", () => {
  test("enabledがfalseなら順番を変えずに返す", () => {
    const items = [1, 2, 3];
    // フラグOFFのときは元の配列順を維持する
    const {result} = renderHook(() => useShuffledItems(items, false));

    expect(result.current).toEqual(items);
  });

  test("enabledがtrueなら順番がシャッフルされる", () => {
    const items = [1, 2, 3];
    const seed = 20250101;

    const {result} = renderHook(() => useShuffledItems(items, true, seed));

    const expected = shuffleItems(items, seed);
    expect(result.current).toEqual(expected);
    expect([...result.current].sort()).toEqual([...items].sort());
  });
});
