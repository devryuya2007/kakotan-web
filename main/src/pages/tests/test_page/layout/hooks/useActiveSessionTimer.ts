import { useCallback, useEffect, useRef } from "react";

const hasWindow = typeof window !== "undefined";
const hasDocument = typeof document !== "undefined";
const isDocumentVisible = () =>
  hasDocument ? document.visibilityState === "visible" : true;

const now = () => {
  if (typeof performance === "undefined") return Date.now();
  return performance.now();
};

interface ActiveSessionTimer {
  startSession: () => void;
  stopSession: () => number;
  getActiveDurationMs: () => number;
}

// 画面がアクティブな時間だけを計測するタイマー
export const useActiveSessionTimer = (): ActiveSessionTimer => {
  const activeStartRef = useRef<number | null>(null);
  const activeTotalRef = useRef(0);
  const isSessionActiveRef = useRef(false);

  const stopSession = useCallback(() => {
    if (!isSessionActiveRef.current) {
      return activeTotalRef.current;
    }
    if (activeStartRef.current !== null) {
      activeTotalRef.current += now() - activeStartRef.current;
      activeStartRef.current = null;
    }
    isSessionActiveRef.current = false;
    return activeTotalRef.current;
  }, []);

  const startSession = useCallback(() => {
    activeTotalRef.current = 0;
    activeStartRef.current = isDocumentVisible() ? now() : null;
    isSessionActiveRef.current = true;
  }, []);

  const getActiveDurationMs = useCallback(() => {
    if (!isSessionActiveRef.current) {
      return activeTotalRef.current;
    }
    return (
      activeTotalRef.current +
      (activeStartRef.current !== null ? now() - activeStartRef.current : 0)
    );
  }, []);

  const handleBlur = useCallback(() => {
    if (!isSessionActiveRef.current) return;
    if (activeStartRef.current === null) return;
    activeTotalRef.current += now() - activeStartRef.current;
    activeStartRef.current = null;
  }, []);

  const handleFocus = useCallback(() => {
    if (!isSessionActiveRef.current) return;
    if (activeStartRef.current !== null) return;
    activeStartRef.current = now();
  }, []);

  const handleVisibilityChange = useCallback(() => {
    if (isDocumentVisible()) handleFocus();
    else handleBlur();
  }, [handleFocus, handleBlur]);

  useEffect(() => {
    if (!hasDocument && !hasWindow) return;

    if (hasDocument) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }
    if (hasWindow) {
      window.addEventListener("blur", handleBlur);
      window.addEventListener("focus", handleFocus);
    }

    return () => {
      if (hasDocument) {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      if (hasWindow) {
        window.removeEventListener("blur", handleBlur);
        window.removeEventListener("focus", handleFocus);
      }
    };
  }, [handleVisibilityChange, handleBlur, handleFocus]);

  return { startSession, stopSession, getActiveDurationMs };
};
