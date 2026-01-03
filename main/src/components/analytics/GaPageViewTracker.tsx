import {useEffect} from "react";
import {useLocation} from "react-router-dom";

import {ensureGaUserId} from "@/components/analytics/gaUserId";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __GA_MEASUREMENT_ID__?: string;
  }
}

interface GtagConfigParams {
  user_id: string;
}

// HTML側でセットしたGAの計測IDを安全に取り出す
const getMeasurementId = (): string | null => {
  if (typeof window === "undefined") return null;
  if (!window.__GA_MEASUREMENT_ID__) return null;
  return window.__GA_MEASUREMENT_ID__;
};

// ルート切り替えを検知してGA4にpage_viewを送る
export const GaPageViewTracker = (): null => {
  const location = useLocation();

  useEffect(() => {
    // 開発環境の計測を止めるためのフラグ
    if (import.meta.env.VITE_GA_DISABLED === "true") {
      return;
    }
    // gtagが無い場合は何もしない（開発中や未設定の環境向け）
    if (typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }

    // user_idの送信は公式ドキュメントの推奨通りconfigで行う
    const measurementId = getMeasurementId();
    if (measurementId) {
      const userId = ensureGaUserId();
      if (userId) {
        const config: GtagConfigParams = {user_id: userId};
        window.gtag("config", measurementId, config);
      }
    }

    const pagePath = `${location.pathname}${location.search}${location.hash}`;

    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search, location.hash]);

  return null;
};
