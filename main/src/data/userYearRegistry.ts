import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";

interface UserYearImportResult {
  handleDataImport: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  importError: string | null;
  importSuccess: string | null;
  playerRegistry: PlayerRegistryEntry[];
  removePlayerRegistry: (id: string) => void;
}

// インポートで受け取る単語の最小形
interface VocabEntryLike {
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
interface PlayerRegistryEntryInput {
  id?: string;
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

// playerRegistryの1件かどうかを判定する（idは任意）
const isPlayerRegistryEntry = (value: unknown): value is PlayerRegistryEntryInput => {
  if (!isRecord(value)) return false;
  if (typeof value.key !== "string") return false;
  if (typeof value.label !== "string") return false;
  if ("id" in value && typeof value.id !== "string") return false;
  return isVocabEntryArray(value.vocab);
};

// playerRegistryの配列かどうかを判定する
const isPlayerRegistryEntryArray = (value: unknown): value is PlayerRegistryEntryInput[] => {
  if (!Array.isArray(value)) return false;
  return value.every(isPlayerRegistryEntry);
};

// 追加セットの識別子を作成する（重複を避けるために乱数も使う）
const createRegistryId = (base: string, index: number): string => {
  const normalized = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/giu, "-")
    .replace(/^-+|-+$/gu, "");
  const random = Math.random().toString(36).slice(2, 8);
  return `player-${normalized || "custom"}-${Date.now()}-${index}-${random}`;
};

// idの欠けや重複を補正して、削除できる形に揃える
const normalizePlayerRegistry = (
  entries: PlayerRegistryEntryInput[]
): { normalized: PlayerRegistryEntry[]; changed: boolean } => {
  const usedIds = new Set<string>();
  let changed = false;
  const normalized = entries.map((entry, index) => {
    let id = typeof entry.id === "string" ? entry.id : "";
    if (!id || usedIds.has(id)) {
      id = createRegistryId(entry.key || entry.label, index);
      changed = true;
    }
    usedIds.add(id);
    return {
      ...entry,
      id,
    };
  });
  return { normalized, changed };
};

// ファイル名からキーとラベルを作る（配列JSON用の仮登録）
const buildEntryFromFileName = (
  fileName: string,
  vocab: VocabEntryLike[]
): PlayerRegistryEntryInput => {
  const baseName = fileName.replace(/\.json$/iu, "").trim();
  const normalized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/giu, "-")
    .replace(/^-+|-+$/gu, "");
  const key = normalized ? `player-${normalized}` : `player-${Date.now()}`;
  const label = baseName.length > 0 ? baseName : "Player Extra";

  return {
    id: createRegistryId(baseName || key, 0),
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
    if (!isPlayerRegistryEntryArray(parsed)) return [];
    const { normalized, changed } = normalizePlayerRegistry(parsed);
    if (changed) {
      savePlayerRegistry(normalized);
    }
    return normalized;
  } catch {
    return [];
  }
};

// playerRegistryをlocalStorageに保存する
export const savePlayerRegistry = (entries: PlayerRegistryEntry[]): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PLAYER_REGISTRY_STORAGE_KEY, JSON.stringify(entries));
};

// playerRegistryから指定IDのセットを削除する
export const removePlayerRegistry = (id: string): PlayerRegistryEntry[] => {
  const current = loadPlayerRegistry();
  const next = current.filter((entry) => entry.id !== id);
  savePlayerRegistry(next);
  return next;
};

// ユーザーのJSONインポートを扱うためのフック
export const useUserYearRegistryImport = (): UserYearImportResult => {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  // UIで使う追加済みのセット一覧を管理する
  const [playerRegistry, setPlayerRegistry] = useState<PlayerRegistryEntry[]>(
    () => loadPlayerRegistry()
  );
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

  // 指定キーのセットを削除し、一覧も更新する
  const handleRemovePlayerRegistry = useCallback((key: string) => {
    const next = removePlayerRegistry(key);
    setPlayerRegistry(next);
  }, []);

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
      const nextEntries: PlayerRegistryEntryInput[] = isPlayerRegistryEntry(parsed)
        ? [parsed]
        : isPlayerRegistryEntryArray(parsed)
          ? parsed
          : isVocabEntryArray(parsed)
            ? [buildEntryFromFileName(file.name, parsed)]
            : [];

      if (nextEntries.length === 0) {
        setImportError(
          "Use an array of items with \"phrase\" and \"mean\", or a JSON with \"key\", \"label\", and \"vocab\"."
        );
        return;
      }

      // 既存のplayerRegistryに追加して保存する
      const current = loadPlayerRegistry();
      const { normalized: merged } = normalizePlayerRegistry([...current, ...nextEntries]);
      savePlayerRegistry(merged);
      // 保存後に一覧も更新して即反映させる
      setPlayerRegistry(merged);

      // 追加できた単語数を数えて通知に使う
      const totalWords = nextEntries.reduce((sum, entry) => sum + entry.vocab.length, 0);
      setImportSuccess(`Import complete: ${totalWords} words added.`);
      scheduleSuccessReset();
    } finally {
      // 同じファイルを選び直せるようにリセット
      input.value = "";
    }
  }, [scheduleSuccessReset]);

  return {
    handleDataImport,
    importError,
    importSuccess,
    playerRegistry,
    removePlayerRegistry: handleRemovePlayerRegistry,
  };
};
