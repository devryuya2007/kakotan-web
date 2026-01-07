// ステージの進捗1件分の型
export interface StageProgressEntry {
  stageId: string;
  bestAccuracy: number;
  cleared: boolean;
  attempts: number;
  lastPlayedAt: number;
  lastAccuracy: number;
  // 1回でもステージを開いたかどうか
  hasAttempted: boolean;
}

// ステージIDをキーにして進捗を持つ保存形式
export interface StageProgressState {
  [stageId: string]: StageProgressEntry;
}
