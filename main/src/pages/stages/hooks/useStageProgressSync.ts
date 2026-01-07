import { useEffect } from "react";

import { loadStageProgress, type StageProgressState } from "@/features/stages/stageProgressStore";

interface StageProgressSyncOptions {
  onSync: (progress: StageProgressState) => void;
  refreshKey?: string;
}

// ステージ進捗を画面の表示タイミングに合わせて同期するフック
export const useStageProgressSync = ({
  onSync,
  refreshKey,
}: StageProgressSyncOptions) => {
  useEffect(() => {
    const hasWindow = typeof window !== "undefined";
    const hasDocument = typeof document !== "undefined";

    // 現在の進捗を読み込んでUIへ反映する
    const syncProgress = () => {
      onSync(loadStageProgress());
    };

    // 画面表示時に必ず最新の進捗を読み込む
    syncProgress();

    const handleFocus = () => {
      syncProgress();
    };
    const handleVisibilityChange = () => {
      if (!hasDocument) return;
      if (document.visibilityState === "visible") {
        syncProgress();
      }
    };
    const handlePageShow = () => {
      syncProgress();
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "stage-progress:v1") {
        syncProgress();
      }
    };

    if (hasWindow) {
      window.addEventListener("focus", handleFocus);
      window.addEventListener("pageshow", handlePageShow);
      window.addEventListener("storage", handleStorage);
    }
    if (hasDocument) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      if (hasWindow) {
        window.removeEventListener("focus", handleFocus);
        window.removeEventListener("pageshow", handlePageShow);
        window.removeEventListener("storage", handleStorage);
      }
      if (hasDocument) {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, [onSync, refreshKey]);
};
