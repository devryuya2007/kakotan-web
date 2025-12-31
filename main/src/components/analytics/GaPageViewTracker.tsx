import {useEffect} from "react";
import {useLocation} from "react-router-dom";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

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

    const pagePath = `${location.pathname}${location.search}${location.hash}`;

    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search, location.hash]);

  return null;
};
