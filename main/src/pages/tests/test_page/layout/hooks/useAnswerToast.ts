import {
  type CSSProperties,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { gsap } from "gsap";

interface ToastPosition {
  top: number;
  left: number;
}

interface GainToast {
  amount: number;
  key: number;
  position: ToastPosition;
}

interface UseAnswerToastOptions {
  prefersReducedMotion: boolean;
  toastDelay: number;
  toastDuration: number;
}

interface UseAnswerToastResult {
  gainToast: GainToast | null;
  toastRef: RefObject<HTMLDivElement>;
  toastPositionStyle: CSSProperties | undefined;
  queueToast: (amount: number, position: ToastPosition) => void;
}

// 正解トーストの出現タイミングとアニメーションをまとめる
export const useAnswerToast = ({
  prefersReducedMotion,
  toastDelay,
  toastDuration,
}: UseAnswerToastOptions): UseAnswerToastResult => {
  const [gainToast, setGainToast] = useState<GainToast | null>(null);
  const toastRef = useRef<HTMLDivElement | null>(null);
  const toastAnimationRef = useRef<gsap.core.Timeline | null>(null);
  const toastDelayTimeoutRef = useRef<number | null>(null);

  const queueToast = useCallback(
    (amount: number, position: ToastPosition) => {
      if (toastDelayTimeoutRef.current) {
        clearTimeout(toastDelayTimeoutRef.current);
      }
      toastDelayTimeoutRef.current = globalThis.setTimeout(() => {
        setGainToast({
          amount,
          key: Date.now(),
          position,
        });
        toastDelayTimeoutRef.current = null;
      }, toastDelay);
    },
    [toastDelay],
  );

  useLayoutEffect(() => {
    if (!gainToast) return;
    const toastEl = toastRef.current;
    if (!toastEl) return;

    if (toastAnimationRef.current) {
      toastAnimationRef.current.kill();
    }

    if (prefersReducedMotion) {
      const timeoutId = globalThis.setTimeout(() => {
        setGainToast(null);
      }, toastDuration);
      return () => {
        clearTimeout(timeoutId);
      };
    }

    const holdMs = Math.max(toastDuration - 380, 0);
    toastAnimationRef.current = gsap
      .timeline({
        onComplete: () => {
          setGainToast(null);
        },
      })
      .fromTo(
        toastEl,
        { autoAlpha: 0, y: 10, scale: 0.9 },
        { autoAlpha: 1, y: -6, scale: 1, duration: 0.18, ease: "power2.out" },
      )
      .to(toastEl, {
        autoAlpha: 1,
        y: -8,
        scale: 1,
        duration: holdMs / 1000,
        ease: "none",
      })
      .to(toastEl, {
        autoAlpha: 0,
        y: -18,
        scale: 0.96,
        duration: 0.2,
        ease: "power2.in",
      });

    return () => {
      if (toastAnimationRef.current) {
        toastAnimationRef.current.kill();
      }
    };
  }, [gainToast, prefersReducedMotion, toastDuration]);

  useEffect(() => {
    return () => {
      if (toastDelayTimeoutRef.current) {
        clearTimeout(toastDelayTimeoutRef.current);
      }
      if (toastAnimationRef.current) {
        toastAnimationRef.current.kill();
      }
    };
  }, []);

  const toastPositionStyle: CSSProperties | undefined = gainToast
    ? {
        top: gainToast.position.top,
        left: gainToast.position.left,
        transform: "translate(-50%, -120%)",
      }
    : undefined;

  return { gainToast, toastRef, toastPositionStyle, queueToast };
};
