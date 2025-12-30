import {useMemo} from "react";

import {shuffleItems} from "@/utils/shuffleItems";

// 配列を必要に応じてシャッフルするためのフック
export const useShuffledItems = <T,>(items: T[], shouldShuffle: boolean) => {
  return useMemo(() => {
    if (!shouldShuffle) return items;
    return shuffleItems(items);
  }, [items, shouldShuffle]);
};
