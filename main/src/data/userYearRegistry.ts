import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";

import type { PlayerRegistryEntry, PlayerRegistryEntryInput } from "./playerRegistryTypes";
import {
  applyDuplicateKeySuffix,
  applyDuplicateLabelSuffix,
  buildEntryFromFileName,
  isPlayerRegistryEntry,
  isPlayerRegistryEntryArray,
  isVocabEntryArray,
  normalizePlayerRegistry,
} from "./playerRegistryHelpers";
import {
  loadPlayerRegistry,
  removePlayerRegistry,
  savePlayerRegistry,
} from "./playerRegistryStorage";

export type { PlayerRegistryEntry } from "./playerRegistryTypes";
export {
  PLAYER_REGISTRY_STORAGE_KEY,
  PLAYER_REGISTRY_UPDATED_EVENT,
  loadPlayerRegistry,
  savePlayerRegistry,
  removePlayerRegistry,
} from "./playerRegistryStorage";

interface UserYearImportResult {
  handleDataImport: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  importError: string | null;
  importSuccess: string | null;
  playerRegistry: PlayerRegistryEntry[];
  removePlayerRegistry: (id: string) => void;
}

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
  const handleRemovePlayerRegistry = useCallback((entryId: string) => {
    const next = removePlayerRegistry(entryId);
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
      const labeledEntries = applyDuplicateLabelSuffix(current, nextEntries);
      const adjustedEntries = applyDuplicateKeySuffix(current, labeledEntries);
      const { normalized: merged } = normalizePlayerRegistry([...current, ...adjustedEntries]);
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
