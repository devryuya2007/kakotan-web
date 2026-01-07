import type { PlayerRegistryEntry } from "./playerRegistryTypes";
import {
  isPlayerRegistryEntryArray,
  normalizePlayerRegistry,
} from "./playerRegistryHelpers";

// 保存先のキーはバージョン付きで固定する
export const PLAYER_REGISTRY_STORAGE_KEY = "playerRegistry:v1";
// playerRegistryの更新をアプリ全体へ通知するイベント名
export const PLAYER_REGISTRY_UPDATED_EVENT = "player-registry:updated";

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
  // 保存内容が更新されたことをアプリ側へ伝える
  window.dispatchEvent(new Event(PLAYER_REGISTRY_UPDATED_EVENT));
};

// playerRegistryから指定IDのセットを削除する
export const removePlayerRegistry = (id: string): PlayerRegistryEntry[] => {
  const current = loadPlayerRegistry();
  const next = current.filter((entry) => entry.id !== id);
  savePlayerRegistry(next);
  return next;
};
