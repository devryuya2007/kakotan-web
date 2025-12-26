import {useMemo} from "react";
import {shuffleItems} from "@/utils/shuffleItems";

// 任意の配列を受け取り、必要に応じて順番をシャッフルして返すフック
// 入力: items(配列), enabled(シャッフル有効/無効)
// 出力: 同じ要素を持つ並び替え後の配列
export const useShuffledItems = <T,>(
  items: T[],
  enabled = true,
  seed?: number,
): T[] => {
  return useMemo(() => {
    // 無効化されているときは順番を変えずに返す
    if (!enabled) {
      return items;
    }
    // Fisher-Yatesで配列の順番をランダムに入れ替える
    return shuffleItems(items, seed);
  }, [items, enabled, seed]);
};
