import { useCallback, useState, type ChangeEvent } from "react";

interface UserYearImportResult {
  handleDataImport: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  importError: string | null;
}

interface VocabEntryLike {
  phrase: string;
  mean: string;
}

// JSONの配列がphrase/meanを持っているかを判定する
const isVocabEntryArray = (value: unknown): value is VocabEntryLike[] => {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    const record = item as Partial<VocabEntryLike>;
    return typeof record.phrase === "string" && typeof record.mean === "string";
  });
};

// ユーザーのJSONインポートを扱うためのフック
export const useUserYearRegistryImport = (): UserYearImportResult => {
  const [importError, setImportError] = useState<string | null>(null);

  // ファイル選択のイベントからJSONを読み込む
  const handleDataImport = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    // 同じファイルを選び直せるようにリセット
    event.currentTarget.value = "";
    setImportError(null);

    // ファイルがなければ終了
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    // 拡張子チェック（.jsonのみ許可）
    if (!file.name.toLowerCase().endsWith(".json")) {
      setImportError("you can only load JSON file.");
      return;
    }

    // 中身を読み込む
    const raw = await file.text();

    // JSONとして読み込めるかチェック
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setImportError("cannot load it as json file.");
      return;
    }

    // 配列で全要素にphrase/meanがあるかチェック
    if (!isVocabEntryArray(parsed)) {
      setImportError("すべての要素にphraseとmeanが含まれるjsonにしてください。");
      return;
    }

    // 中身そのまま保存する（JSON文字列）
    localStorage.setItem("playerRegistry:v1", raw);
  }, []);

  return { handleDataImport, importError };
};
