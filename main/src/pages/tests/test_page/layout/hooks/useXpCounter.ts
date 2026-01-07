import { useCallback, useEffect, useRef, useState } from "react";

import { gsap } from "gsap";

interface UseXpCounterResult {
  animatedXp: number;
  resetXpCounter: () => void;
}

// 獲得XPをスロット風にカウントアップ表示する
export const useXpCounter = (
  sessionGainedXp: number,
  prefersReducedMotion: boolean,
): UseXpCounterResult => {
  const [animatedXp, setAnimatedXp] = useState(0);
  const xpCounterRef = useRef({ value: 0 });
  const xpTweenRef = useRef<gsap.core.Tween | null>(null);

  const resetXpCounter = useCallback(() => {
    if (xpTweenRef.current) {
      xpTweenRef.current.kill();
      xpTweenRef.current = null;
    }
    xpCounterRef.current.value = 0;
    setAnimatedXp(0);
  }, []);

  // XPの現在値をrefにも保存し、次の演出で途切れないようにする
  useEffect(() => {
    xpCounterRef.current.value = animatedXp;
  }, [animatedXp]);

  // XPが増えたときに、数値をカウントアップで見せる
  useEffect(() => {
    const targetXp = Math.max(0, sessionGainedXp);
    if (prefersReducedMotion) {
      setAnimatedXp(targetXp);
      xpCounterRef.current.value = targetXp;
      return;
    }
    if (xpTweenRef.current) {
      xpTweenRef.current.kill();
    }
    if (xpCounterRef.current.value === targetXp) {
      return;
    }

    // スロットっぽく小刻みに増えるように、ステップ状のイージングを使う
    xpTweenRef.current = gsap.to(xpCounterRef.current, {
      value: targetXp,
      duration: 0.6,
      ease: "steps(24)",
      onUpdate: () => {
        setAnimatedXp(Math.round(xpCounterRef.current.value));
      },
    });

    return () => {
      if (xpTweenRef.current) {
        xpTweenRef.current.kill();
      }
    };
  }, [sessionGainedXp, prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (xpTweenRef.current) {
        xpTweenRef.current.kill();
      }
    };
  }, []);

  return { animatedXp, resetXpCounter };
};
