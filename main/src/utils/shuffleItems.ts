// 任意配列を受け取って順番を入れ替えるユーティリティ
// 入力: items(配列)
// 出力: 同じ要素を持つシャッフル済み配列
export const shuffleItems = <T,>(items: T[]): T[] => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
