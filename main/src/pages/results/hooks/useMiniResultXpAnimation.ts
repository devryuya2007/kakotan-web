import { type MutableRefObject, type RefObject, useLayoutEffect, useRef, useState } from "react";

import { gsap } from "gsap";

import { calculateLevelProgress } from "@/features/results/scoring";

interface UseMiniResultXpAnimationInput {
  gainedXp: number;
  effectiveTotalXp: number;
  progress: number;
  xpForNextLevel: number;
  level: number;
  prefersReducedMotion: boolean;
}

interface UseMiniResultXpAnimationResult {
  displayProgress: number;
  mascotFillRatio: number;
  shouldShowMascot: boolean;
  shouldAnimateGain: boolean;
  shouldHideMascotAtStart: boolean;
  expRingRef: RefObject<HTMLDivElement | null>;
  expMascotRef: RefObject<HTMLButtonElement | null>;
  expPointsRef: MutableRefObject<Array<HTMLSpanElement | null>>;
  expPointCount: number;
  handleMascotTap: () => void;
}

export function useMiniResultXpAnimation({
  gainedXp,
  effectiveTotalXp,
  progress,
  xpForNextLevel,
  level,
  prefersReducedMotion,
}: UseMiniResultXpAnimationInput): UseMiniResultXpAnimationResult {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [mascotFillRatio, setMascotFillRatio] = useState(0);
  // 水ちゃんは常に表示して、XP獲得があるときだけ演出を動かす
  const shouldShowMascot = true;
  const shouldAnimateGain = gainedXp > 0;
  // アニメを控える設定のときは演出を簡略化する
  const shouldHideMascotAtStart = shouldAnimateGain && !prefersReducedMotion;
  // 水ちゃん・ポイント・ターゲットの参照
  const expMascotRef = useRef<HTMLButtonElement | null>(null);
  const expRingRef = useRef<HTMLDivElement | null>(null);
  const expPointsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const expProgressTweenRef = useRef<gsap.core.Tween | null>(null);
  const expTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const expMascotBounceRef = useRef<gsap.core.Timeline | null>(null);
  // たまは1つだけ大きめに出す
  const expPointCount = 1;
  const gainedFillRatio =
    gainedXp <= 0
      ? 0
      : xpForNextLevel > 0
        ? Math.min(1, gainedXp / xpForNextLevel)
        : 1;

  useLayoutEffect(() => {
    // 連続レンダリング時の残りアニメを先に消す
    if (expProgressTweenRef.current) {
      expProgressTweenRef.current.kill();
      expProgressTweenRef.current = null;
    }
    if (expTimelineRef.current) {
      expTimelineRef.current.kill();
      expTimelineRef.current = null;
    }

    // 今回の増加前の進捗を計算して、伸びる量を決める
    const previousTotalXp = Math.max(0, effectiveTotalXp - gainedXp);
    const {
      progressRatio: startProgressRatio,
      level: startLevel,
    } = calculateLevelProgress(previousTotalXp);
    const normalizedStartProgress = startLevel === level ? startProgressRatio : 0;

    // 省アニメ設定なら即時反映して、演出は飛ばす
    if (prefersReducedMotion) {
      setDisplayProgress(progress);
      setMascotFillRatio(shouldAnimateGain ? gainedFillRatio : progress);
      return undefined;
    }

    // XP増加がないときは軽い遅延だけで反映する
    if (!shouldAnimateGain) {
      const timeoutId = window.setTimeout(() => {
        setDisplayProgress(progress);
        setMascotFillRatio(progress);
      }, 200);
      return () => {
        clearTimeout(timeoutId);
      };
    }

    // ここから「水ちゃん → ポイント飛翔 → バー加算」の流れ
    const ring = expRingRef.current;
    const mascot = expMascotRef.current;
    const points = expPointsRef.current.filter(
      (point): point is HTMLSpanElement => Boolean(point),
    );

    if (!ring || !mascot || points.length === 0) {
      setDisplayProgress(progress);
      return undefined;
    }

    const ringRect = ring.getBoundingClientRect();
    const mascotRect = mascot.getBoundingClientRect();
    const startX = mascotRect.left + mascotRect.width * 0.7 - ringRect.left;
    const startY = mascotRect.top + mascotRect.height * 0.35 - ringRect.top;
    const targetX = ringRect.width / 2;
    const targetY = ringRect.height / 2;

    // 3秒で「出る→抽出→接近→吸収&伸びる」を段階的に見せる
    const totalDuration = 3;
    const entryDelay = 0.4;
    const walkDuration = 0.8;
    const settleDuration = 0.15;
    const drainDuration = 0.35;
    const pointTravelDuration = 0.95;
    const progressAnimDuration = Math.max(
      0.2,
      totalDuration -
        (entryDelay +
          walkDuration +
          settleDuration +
          drainDuration +
          pointTravelDuration),
    );
    const pointFadeDuration = Math.min(0.2, pointTravelDuration * 0.4);
    const drainStart = entryDelay + walkDuration + settleDuration;
    const travelStart = drainStart + drainDuration;
    const progressStart = travelStart + pointTravelDuration;

    // 取得した分だけ水がある状態で始める
    setDisplayProgress(normalizedStartProgress);
    setMascotFillRatio(gainedFillRatio);

    const mascotFillValue = { value: gainedFillRatio };
    const progressValue = { value: normalizedStartProgress };
    const timeline = gsap.timeline();
    expTimelineRef.current = timeline;

    // 水ちゃんが画面外からちょこちょこ歩いてくる
    timeline.set(mascot, { autoAlpha: 0, x: -80, y: 6, scale: 0.95, rotation: -6 });
    timeline.to(mascot, { autoAlpha: 1, duration: 0.01 }, entryDelay);
    timeline.to(
      mascot,
      { x: 0, duration: walkDuration, ease: "power2.out" },
      entryDelay,
    );
    timeline.to(
      mascot,
      {
        y: -6,
        rotation: 3,
        duration: 0.2,
        repeat: 3,
        yoyo: true,
        ease: "power1.inOut",
      },
      entryDelay,
    );
    timeline.to(
      mascot,
      {
        scale: 1.05,
        y: -2,
        rotation: 0,
        duration: settleDuration,
        ease: "back.out(2)",
      },
      entryDelay + walkDuration,
    );
    timeline.to(
      mascot,
      { scale: 1, y: 0, duration: 0.1, ease: "power2.out" },
      entryDelay + walkDuration + settleDuration,
    );
    // 水が抽出される
    timeline.to(
      mascotFillValue,
      {
        value: 0,
        duration: drainDuration,
        ease: "power1.inOut",
        onUpdate: () => {
          setMascotFillRatio(mascotFillValue.value);
        },
      },
      drainStart,
    );

    // 水が円に近づく
    points.forEach((point) => {
      const spreadX = 0;
      const spreadY = 0;
      timeline.set(point, { x: startX, y: startY, autoAlpha: 0, scale: 1 }, travelStart);
      timeline.to(
        point,
        {
          x: targetX + spreadX,
          y: targetY + spreadY,
          autoAlpha: 1,
          // 移動中に少しずつ小さくして「水が減る」感を出す
          scale: 0.5,
          duration: pointTravelDuration,
          ease: "power2.out",
        },
        travelStart,
      );
      timeline.to(
        point,
        {
          autoAlpha: 0,
          scale: 0.1,
          duration: pointFadeDuration,
          ease: "power2.in",
        },
        travelStart + pointTravelDuration - pointFadeDuration,
      );
    });

    // 円に吸収されて伸びる
    expProgressTweenRef.current = gsap.to(progressValue, {
      value: progress,
      delay: progressStart,
      duration: progressAnimDuration,
      ease: "power1.out",
      onUpdate: () => {
        setDisplayProgress(progressValue.value);
      },
      onComplete: () => {
        setDisplayProgress(progress);
      },
    });

    return () => {
      if (expTimelineRef.current) {
        expTimelineRef.current.kill();
        expTimelineRef.current = null;
      }
      if (expProgressTweenRef.current) {
        expProgressTweenRef.current.kill();
        expProgressTweenRef.current = null;
      }
    };
  }, [
    prefersReducedMotion,
    progress,
    shouldAnimateGain,
    gainedXp,
    gainedFillRatio,
    effectiveTotalXp,
    level,
  ]);

  const handleMascotTap = () => {
    if (prefersReducedMotion) return;
    const mascot = expMascotRef.current;
    if (!mascot) return;

    if (expMascotBounceRef.current) {
      expMascotBounceRef.current.kill();
      expMascotBounceRef.current = null;
    }

    expMascotBounceRef.current = gsap
      .timeline()
      .to(mascot, {
        y: -6,
        scale: 1.08,
        duration: 0.12,
        ease: "power1.out",
        overwrite: "auto",
      })
      .to(mascot, {
        y: 0,
        scale: 1,
        duration: 0.2,
        ease: "bounce.out",
      });
  };

  return {
    displayProgress,
    mascotFillRatio,
    shouldShowMascot,
    shouldAnimateGain,
    shouldHideMascotAtStart,
    expRingRef,
    expMascotRef,
    expPointsRef,
    expPointCount,
    handleMascotTap,
  };
}
