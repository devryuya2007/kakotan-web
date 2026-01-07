import {
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

import { BackgroundGlow } from "./BackgroundGlow";

interface AppLayoutProps {
  children: ReactNode;
  // mainに追加するクラス（各ページのスクロール制御などに使う）
  mainClassName?: string;
  // 画面固定のボタンなどをmainの外に置いて、スクロールや変形の影響を避ける
  floatingSlot?: ReactNode;
}

// スクロールできるかを判定する（高さが足りないときはfalse）
const canScroll = (element: HTMLElement) =>
  element.scrollHeight > element.clientHeight;

// スクロール可能な親要素を探して、実際に動かせる箱を見つける
const findScrollableParent = (
  element: HTMLElement | null,
  rootElement: HTMLElement
) => {
  let current = element;
  while (current && current !== rootElement) {
    const style = window.getComputedStyle(current);
    const isScrollable =
      (style.overflowY === "auto" || style.overflowY === "scroll") &&
      canScroll(current);
    if (isScrollable) {
      return current;
    }
    current = current.parentElement;
  }

  return canScroll(rootElement) ? rootElement : null;
};

// iOSのゴム引っ張りを止めるために上下端を少しずらす
const nudgeScrollPosition = (element: HTMLElement) => {
  if (element.scrollTop <= 0) {
    element.scrollTop = 1;
    return;
  }

  const bottomEdge = element.scrollHeight - element.clientHeight - 1;
  if (element.scrollTop >= bottomEdge) {
    element.scrollTop = bottomEdge;
  }
};

// 背景側のスワイプを抑えて、スクロール領域だけ反応させる
const useTouchScrollGuard = (mainRef: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    let activeScrollElement: HTMLElement | null = null;

    // 背景エリアはタッチ無効、スクロール領域だけ許可
    const handleTouchMove = (event: TouchEvent) => {
      const targetNode = event.target as Node | null;
      if (!targetNode || !mainElement.contains(targetNode)) {
        event.preventDefault();
        return;
      }

      if (!activeScrollElement) {
        event.preventDefault();
      }
    };

    // タッチ開始時点で「どの要素がスクロール対象か」を決める
    const handleTouchStart = (event: TouchEvent) => {
      const target =
        event.target instanceof HTMLElement ? event.target : null;
      activeScrollElement = target
        ? findScrollableParent(target, mainElement)
        : null;
      if (!activeScrollElement) return;

      nudgeScrollPosition(activeScrollElement);
    };

    // タッチ終了時に状態をリセット
    const handleTouchEnd = () => {
      activeScrollElement = null;
    };

    document.addEventListener("touchmove", handleTouchMove, {passive: false});
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchend", handleTouchEnd, {passive: true});

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [mainRef]);
};

export function AppLayout({
  children,
  mainClassName,
  floatingSlot,
}: AppLayoutProps) {
  const mainRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 初回だけふわっと表示させる（ページ遷移の印象を柔らかくする）
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => {
      cancelAnimationFrame(raf);
      setIsVisible(false);
    };
  }, []);

  useTouchScrollGuard(mainRef);

  const enterMotionClass = isVisible
    ? "translate-y-0 opacity-100"
    : "translate-y-4 opacity-0";

  return (
    <div className="relative m-auto min-h-dvh overflow-hidden bg-[#050509] text-white">
      <BackgroundGlow />
      {floatingSlot}

      <main
        ref={mainRef}
        data-scroll-area="true"
        className={`relative z-10 m-auto flex h-dvh w-full transform-gpu justify-center px-4 transition-all duration-500 ease-out sm:px-8 ${
          enterMotionClass
        } ${mainClassName ?? ""}`}
      >
        {children}
      </main>
    </div>
  );
}
