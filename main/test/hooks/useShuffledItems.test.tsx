import {renderHook} from "@testing-library/react";
import {afterEach, describe, expect, test, vi} from "vitest";

import {useShuffledItems} from "@/hooks/useShuffledItems";

describe("useShuffledItems", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("enabledがfalseなら順番を変えずに返す", () => {
    const items = [1, 2, 3];
    // フラグOFFのときは元の配列順を維持する
    const {result} = renderHook(() => useShuffledItems(items, false));

    expect(result.current).toEqual(items);
  });

  test("enabledがtrueなら順番がシャッフルされる", () => {
    const items = [1, 2, 3];
    // 乱数を固定してシャッフル結果を安定させる
    vi.spyOn(Math, "random").mockReturnValue(0);

    const {result} = renderHook(() => useShuffledItems(items, true));

    expect(result.current).not.toEqual(items);
    expect([...result.current].sort()).toEqual([...items].sort());
  });
});
