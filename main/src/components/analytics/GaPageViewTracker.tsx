import {useEffect} from "react";
import {useLocation} from "react-router-dom";

import {ensureGaUserId} from "@/components/analytics/gaUserId";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

// dataLayerが無い場合は作成して返す
const ensureDataLayer = (): Array<Record<string, unknown>> => {
  if (typeof window === "undefined") return [];
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
};

// ルート切り替えを検知してanalyticsにpage_viewを送る
export const GaPageViewTracker = (): null => {
  const location = useLocation();

  useEffect(() => {
    // 開発環境の計測を止めるためのフラグ
    if (import.meta.env.VITE_GA_DISABLED === "true") {
      return;
    }
    // dataLayerが使えない環境では何もしない
    if (typeof window === "undefined") {
      return;
    }

    const userId = ensureGaUserId();

    const pagePath = `${location.pathname}${location.search}${location.hash}`;

    const payload: Record<string, unknown> = {
      event: "page_view",
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    };
    if (userId) {
      payload.user_id = userId;
    }

    ensureDataLayer().push(payload);
  }, [location.pathname, location.search, location.hash]);

  return null;
};
