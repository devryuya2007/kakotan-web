// ユーザーが現在どれくらい経験値とレベルを持っているかをまとめた型
export type UserProgress = {
  totalXp: number;
  level: number;
};

// TODO: userの状況を見て解放すべきバッジ一覧を返す処理を実装する
export default function badgeRule({level}: UserProgress): boolean {
  return level >= 5;
}
