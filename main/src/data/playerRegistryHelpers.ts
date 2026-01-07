import type {
  PlayerRegistryEntry,
  PlayerRegistryEntryInput,
  VocabEntryLike,
} from "./playerRegistryTypes";

// 文字列をキーとして扱える形に整形する（小文字 + 記号をハイフンに変換）
const normalizeKeyFragment = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/giu, "-")
    .replace(/^-+|-+$/gu, "");

// 文字列キーだけを持つか判定するためのガード
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

// JSONの配列がphrase/meanを持っているかを判定する
export const isVocabEntryArray = (value: unknown): value is VocabEntryLike[] => {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    const record = item as Partial<VocabEntryLike>;
    return typeof record.phrase === "string" && typeof record.mean === "string";
  });
};

// playerRegistryの1件かどうかを判定する（idは任意）
export const isPlayerRegistryEntry = (
  value: unknown
): value is PlayerRegistryEntryInput => {
  if (!isRecord(value)) return false;
  if (typeof value.key !== "string") return false;
  if (typeof value.label !== "string") return false;
  if ("id" in value && typeof value.id !== "string") return false;
  return isVocabEntryArray(value.vocab);
};

// playerRegistryの配列かどうかを判定する
export const isPlayerRegistryEntryArray = (
  value: unknown
): value is PlayerRegistryEntryInput[] => {
  if (!Array.isArray(value)) return false;
  return value.every(isPlayerRegistryEntry);
};

// 追加セットの識別子を作成する（重複を避けるために乱数も使う）
const createRegistryId = (base: string, index: number): string => {
  const normalized = normalizeKeyFragment(base);
  const random = Math.random().toString(36).slice(2, 8);
  return `player-${normalized || "custom"}-${Date.now()}-${index}-${random}`;
};

// 末尾の連番を除いたラベルを作る（例: "My Set (2)" -> "My Set"）
const stripLabelSuffix = (label: string): string => label.replace(/\s\(\d+\)$/u, "");

// 既存キーと重複しないキーを作る
const buildUniqueKey = (baseKey: string, usedKeys: Set<string>): string => {
  if (!usedKeys.has(baseKey)) {
    usedKeys.add(baseKey);
    return baseKey;
  }
  let index = 2;
  let candidate = `${baseKey}-${index}`;
  while (usedKeys.has(candidate)) {
    index += 1;
    candidate = `${baseKey}-${index}`;
  }
  usedKeys.add(candidate);
  return candidate;
};

// 既存の同名セットがある場合に連番ラベルを付与する
export const applyDuplicateLabelSuffix = (
  current: PlayerRegistryEntry[],
  incoming: PlayerRegistryEntryInput[]
): PlayerRegistryEntryInput[] => {
  const counts = current.reduce<Record<string, number>>((accumulator, entry) => {
    const baseLabel = stripLabelSuffix(entry.label);
    accumulator[baseLabel] = (accumulator[baseLabel] ?? 0) + 1;
    return accumulator;
  }, {});

  return incoming.map((entry) => {
    const baseLabel = stripLabelSuffix(entry.label);
    const nextCount = (counts[baseLabel] ?? 0) + 1;
    counts[baseLabel] = nextCount;
    if (nextCount === 1) return entry;
    return {
      ...entry,
      label: `${baseLabel} (${nextCount})`,
    };
  });
};

// キーが重複しないように末尾へ連番を付ける
export const applyDuplicateKeySuffix = (
  current: PlayerRegistryEntry[],
  incoming: PlayerRegistryEntryInput[]
): PlayerRegistryEntryInput[] => {
  const usedKeys = new Set(current.map((entry) => entry.key));
  return incoming.map((entry) => ({
    ...entry,
    key: buildUniqueKey(entry.key, usedKeys),
  }));
};

// idの欠けや重複を補正して、削除できる形に揃える
export const normalizePlayerRegistry = (
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
export const buildEntryFromFileName = (
  fileName: string,
  vocab: VocabEntryLike[]
): PlayerRegistryEntryInput => {
  const baseName = fileName.replace(/\.json$/iu, "").trim();
  const normalized = normalizeKeyFragment(baseName);
  const key = normalized ? `player-${normalized}` : `player-${Date.now()}`;
  const label = baseName.length > 0 ? baseName : "Player Extra";

  return {
    id: createRegistryId(baseName || key, 0),
    key,
    label,
    vocab,
  };
};
