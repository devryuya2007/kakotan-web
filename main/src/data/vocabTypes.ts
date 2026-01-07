// 単語データの基本形（必要最低限の項目だけを持つ）
export interface VocabEntry {
  phrase: string;
  mean?: string;
  onePhrase?: string;
  onePhraseJa?: string;
  count?: number;
}
