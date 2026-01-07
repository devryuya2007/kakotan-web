import { Outlet } from "react-router-dom";

import { GaPageViewTracker } from "@/components/analytics/GaPageViewTracker";
import { useButtonClickSound } from "@/hooks/useButtonClickSound";

export const AppShell = () => {
  // ボタン操作の効果音を全ページで共通化
  useButtonClickSound();
  return (
    <>
      {/* 画面遷移の計測はここでまとめて実行 */}
      <GaPageViewTracker />
      {/* ルーティング先のページをここに差し込む */}
      <Outlet />
    </>
  );
};
