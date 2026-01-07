// インポートで受け取る単語の最小形
export interface VocabEntryLike {
  phrase: string;
  mean: string;
}

// ユーザーが追加したレジストリの1件分
export interface PlayerRegistryEntry {
  id: string;
  key: string;
  label: string;
  vocab: VocabEntryLike[];
}

// 旧データ（idなし）も取り込むための入力型
export interface PlayerRegistryEntryInput {
  id?: string;
  key: string;
  label: string;
  vocab: VocabEntryLike[];
}
