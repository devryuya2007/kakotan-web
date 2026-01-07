import { useEffect, useState } from "react";

const hasWindow = typeof window !== "undefined";
const getIsSmallDefault = () => {
  if (!hasWindow || !window.matchMedia) return false;
  return window.matchMedia("(max-width: 640px)").matches;
};

// 画面幅の変更を監視してモバイル判定を返す
export const useIsSmallScreen = () => {
  const [isSmall, setIsSmall] = useState(getIsSmallDefault);

  useEffect(() => {
    if (!hasWindow || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsSmall(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return isSmall;
};
