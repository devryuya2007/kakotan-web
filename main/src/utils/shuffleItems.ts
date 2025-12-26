// 任意配列を受け取って順番を入れ替えるユーティリティ
// 入力: items(配列)
// 出力: 同じ要素を持つシャッフル済み配列
const createSeededRandom = (seed: number): (() => number) => {
  // 乱数の再現性を持たせるための簡易LCG
  let value = seed % 2147483647;
  if (value <= 0) {
    value += 2147483646;
  }
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

export const shuffleItems = <T,>(items: T[], seed?: number): T[] => {
  const shuffled = [...items];
  const random = seed === undefined ? Math.random : createSeededRandom(seed);
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
