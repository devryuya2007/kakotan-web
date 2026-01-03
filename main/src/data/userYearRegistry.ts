import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";

interface UserYearImportResult {
  handleDataImport: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  importError: string | null;
  importSuccess: string | null;
}

// インポートで受け取る単語の最小形
interface VocabEntryLike {
  phrase: string;
  mean: string;
}

// ユーザーが追加したレジストリの1件分
export interface PlayerRegistryEntry {
  key: string;
  label: string;
  vocab: VocabEntryLike[];
}

// 保存先のキーはバージョン付きで固定する
export const PLAYER_REGISTRY_STORAGE_KEY = "playerRegistry:v1";

// 文字列キーだけを持つか判定するためのガード
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

// JSONの配列がphrase/meanを持っているかを判定する
const isVocabEntryArray = (value: unknown): value is VocabEntryLike[] => {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    const record = item as Partial<VocabEntryLike>;
    return typeof record.phrase === "string" && typeof record.mean === "string";
  });
};

// playerRegistryの1件かどうかを判定する
const isPlayerRegistryEntry = (value: unknown): value is PlayerRegistryEntry => {
  if (!isRecord(value)) return false;
  if (typeof value.key !== "string") return false;
  if (typeof value.label !== "string") return false;
  return isVocabEntryArray(value.vocab);
};

// playerRegistryの配列かどうかを判定する
const isPlayerRegistryEntryArray = (value: unknown): value is PlayerRegistryEntry[] => {
  if (!Array.isArray(value)) return false;
  return value.every(isPlayerRegistryEntry);
};

// ファイル名からキーとラベルを作る（配列JSON用の仮登録）
const buildEntryFromFileName = (fileName: string, vocab: VocabEntryLike[]): PlayerRegistryEntry => {
  const baseName = fileName.replace(/\.json$/iu, "").trim();
  const normalized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/giu, "-")
    .replace(/^-+|-+$/gu, "");
  const key = normalized ? `player-${normalized}` : `player-${Date.now()}`;
  const label = baseName.length > 0 ? baseName : "Player Extra";

  return {
    key,
    label,
    vocab,
  };
};

// localStorageからplayerRegistryを読み込む
export const loadPlayerRegistry = (): PlayerRegistryEntry[] => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(PLAYER_REGISTRY_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isPlayerRegistryEntryArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// playerRegistryをlocalStorageに保存する
export const savePlayerRegistry = (entries: PlayerRegistryEntry[]): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PLAYER_REGISTRY_STORAGE_KEY, JSON.stringify(entries));
};

// ユーザーのJSONインポートを扱うためのフック
export const useUserYearRegistryImport = (): UserYearImportResult => {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  // 成功通知の自動消し込み用のタイマーを保持する
  const successTimerRef = useRef<number | null>(null);

  // 既存のタイマーがあればクリアして、通知の重なりを防ぐ
  const clearSuccessTimer = useCallback(() => {
    if (successTimerRef.current === null) return;
    window.clearTimeout(successTimerRef.current);
    successTimerRef.current = null;
  }, []);

  // 一定時間で成功通知を消す
  const scheduleSuccessReset = useCallback(() => {
    clearSuccessTimer();
    successTimerRef.current = window.setTimeout(() => {
      setImportSuccess(null);
      successTimerRef.current = null;
    }, 4000);
  }, [clearSuccessTimer]);

  // アンマウント時のタイマー掃除
  useEffect(() => {
    return () => {
      clearSuccessTimer();
    };
  }, [clearSuccessTimer]);

  // ファイル選択のイベントからJSONを読み込む
  const handleDataImport = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    // 非同期処理でも参照できるようにinput要素を退避する
    const input = event.currentTarget;
    setImportError(null);
    setImportSuccess(null);

    try {
      // ファイルがなければ終了
      const file = input.files?.[0];
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

      // 受け付けるJSONをplayerRegistryの形に揃える
      const nextEntries: PlayerRegistryEntry[] = isPlayerRegistryEntry(parsed)
        ? [parsed]
        : isPlayerRegistryEntryArray(parsed)
          ? parsed
          : isVocabEntryArray(parsed)
            ? [buildEntryFromFileName(file.name, parsed)]
            : [];

      if (nextEntries.length === 0) {
        setImportError(
          "Use an array of items with \"phrase\" and \"mean\", or a JSON with key/label/vocab."
        );
        return;
      }

      // 既存のplayerRegistryに追加して保存する
      const current = loadPlayerRegistry();
      const merged = [...current, ...nextEntries];
      savePlayerRegistry(merged);

      // 追加できた単語数を数えて通知に使う
      const totalWords = nextEntries.reduce((sum, entry) => sum + entry.vocab.length, 0);
      setImportSuccess(`Import complete: ${totalWords} words added.`);
      scheduleSuccessReset();
    } finally {
      // 同じファイルを選び直せるようにリセット
      input.value = "";
    }
  }, [scheduleSuccessReset]);

  return { handleDataImport, importError, importSuccess };
};
