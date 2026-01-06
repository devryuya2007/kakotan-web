import {type ReactNode, useEffect, useRef, useState} from "react";

import {BackgroundGlow} from "./BackgroundGlow";

interface AppLayoutProps {
  children: ReactNode;
  mainClassName?: string;
  // 画面固定のボタンなどをmainの外に置いて、スクロールや変形の影響を避ける
  floatingSlot?: ReactNode;
}

export function AppLayout({children, mainClassName, floatingSlot}: AppLayoutProps) {
  const mainRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => {
      cancelAnimationFrame(raf);
      setIsVisible(false);
    };
  }, []);

  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    // スクロールできるかを判定して、不要な引っ張りを止める
    const canScroll = (element: HTMLElement) =>
      element.scrollHeight > element.clientHeight;

    // スクロール可能な親要素を探して、適切なスクロール領域を決める
    const findScrollableParent = (element: HTMLElement | null) => {
      let current = element;
      while (current && current !== mainElement) {
        const style = window.getComputedStyle(current);
        const isScrollable =
          (style.overflowY === "auto" || style.overflowY === "scroll") &&
          canScroll(current);
        if (isScrollable) {
          return current;
        }
        current = current.parentElement;
      }

      return canScroll(mainElement) ? mainElement : null;
    };

    let activeScrollElement: HTMLElement | null = null;

    // 背景側のスワイプは止めて、スクロール領域だけ反応させる
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

    // iOSのゴム引っ張りを抑えるために上下端の位置を1pxずらす
    const handleTouchStart = (event: TouchEvent) => {
      const target =
        event.target instanceof HTMLElement ? event.target : null;
      activeScrollElement = target ? findScrollableParent(target) : null;
      if (!activeScrollElement) return;

      if (activeScrollElement.scrollTop <= 0) {
        activeScrollElement.scrollTop = 1;
        return;
      }

      const bottomEdge =
        activeScrollElement.scrollHeight - activeScrollElement.clientHeight - 1;
      if (activeScrollElement.scrollTop >= bottomEdge) {
        activeScrollElement.scrollTop = bottomEdge;
      }
    };

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
  }, []);

  return (
    <div className="relative m-auto min-h-dvh overflow-hidden bg-[#050509] text-white">
      <BackgroundGlow />
      {floatingSlot}

      <main
        ref={mainRef}
        data-scroll-area="true"
        className={`relative z-10 m-auto flex h-dvh w-full transform-gpu justify-center px-4 transition-all duration-500 ease-out sm:px-8 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        } ${mainClassName ?? ""}`}
      >
        {children}
      </main>
    </div>
  );
}
