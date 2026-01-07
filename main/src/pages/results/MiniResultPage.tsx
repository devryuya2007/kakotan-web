import {useTestResults} from '../states/useTestResults';

import {type ReactNode, useLayoutEffect, useMemo, useRef, useState} from "react";

import {useLocation, useNavigate} from 'react-router-dom';

import {gsap} from "gsap";

import {QuickStartButton} from '@/components/buttons/QuickStartButton';
import {AppLayout} from '@/components/layout/AppLayout';
import {calculateLevelProgress} from '@/features/results/scoring';
import {usePrefersReducedMotion} from "@/hooks/usePrefersReducedMotion";

import MiniResultPageModal from './ResultModal/MiniResultPageModal';
import { MiniResultRankCard } from "./components/MiniResultRankCard";
import { MiniResultSummaryCard } from "./components/MiniResultSummaryCard";
import { MissedWordsPanel } from "./components/MissedWordsPanel";
import { buildWrongWordStats, getRankLetter, getStageListPath, type WrongWordStat } from "./miniResultUtils";

// Temporary mini result card shown right after a test

export default function MiniResultPage() {
  // Placeholder stats; replace with real test results later
  const [isModalOpen, setIsModalOpen] = useState(false);

  const palette = {
    base: 'text-[#f5f6ff]',
    muted: 'text-[#f2c97d]',
    subtle: 'text-[#9499b1]',
    accent: 'text-[#f2c97d]',
    highlight: 'text-[#f2c97d]', // text-[#f7e2bd]
    positive: 'text-[#9fe0c8]',
    negative: 'text-[#f1a5b2]',
    caution: 'text-[#f5d3a6]',
  } as const;

  const toneStyles = {
    positive: palette.positive,
    negative: palette.negative,
    caution: palette.caution,
    neutral: palette.highlight,
  } as const;

  type ToneKey = keyof typeof toneStyles;

  const {correct, incorrect, totalXp, sessionHistory} = useTestResults();

  const totalAnswer = correct.length + incorrect.length;
  const correctRate =
    totalAnswer === 0 ? 0 : Math.round((correct.length / totalAnswer) * 100);
  const incorrectNumber = incorrect.length;

  interface ResultLocationState {
    gainedXp?: number;
    updatedTotalXp?: number;
    durationMs?: number;
  }

  const location = useLocation();
  const navigate = useNavigate();
  const carriedXp = location.state as ResultLocationState | undefined;
  // 1回の結果ページで獲得したXP。演出に使う
  const gainedXp = carriedXp?.gainedXp ?? 0;
  const effectiveTotalXp = carriedXp?.updatedTotalXp ?? totalXp;
  const {
    level,
    xpTillNextLevel,
    xpForNextLevel,
    progressRatio: progress,
  } = calculateLevelProgress(effectiveTotalXp);
  const summaryCards: Array<{
    label: string;
    value: ReactNode;
    tone?: ToneKey;
  }> = [
    {
      label: 'Section accuracy',
      value: `${correctRate}%`,
      tone: 'positive',
    },
    {
      label: 'Missed words',
      value: `${incorrectNumber}`,
      tone: 'negative',
    },
    {
      label: 'Badges earned',
      value: <span className='text-sm text-white/60'>secret...</span>,
    },
  ];

  const wrongWordsAll = useMemo<WrongWordStat[]>(() => buildWrongWordStats(incorrect), [incorrect]);

  const wrongWordsTop = useMemo(() => {
    const topEntries = wrongWordsAll.slice(0, 6);
    return topEntries;
  }, [wrongWordsAll]);

  // 直近のステージ情報から戻り先の年度を推定する
  const stageListPath = useMemo(() => getStageListPath(sessionHistory), [sessionHistory]);

  const r = 52;
  const circumference = 2 * Math.PI * r;

  // Slightly scale the layout down on mobile to keep it within the viewport
  const contentWrapperClass =
    'flex w-full max-w-[100vw] min-w-0 flex-col gap-6 pb-4 text-left text-[#f5f6ff] max-h-[calc(100dvh-4.5rem)] origin-top scale-[0.94] sm:scale-100 sm:gap-8 sm:pb-6';

  const hasNoWrongWords = wrongWordsTop.length === 0;
  const [displayProgress, setDisplayProgress] = useState(0);
  const [mascotFillRatio, setMascotFillRatio] = useState(0);
  // 水ちゃんは常に表示して、XP獲得があるときだけ演出を動かす
  const shouldShowMascot = true;
  const shouldAnimateGain = gainedXp > 0;
  // アニメを控える設定のときは演出を簡略化する
  const prefersReducedMotion = usePrefersReducedMotion();
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

    const mascotFillValue = {value: gainedFillRatio};
    const progressValue = {value: normalizedStartProgress};
    const timeline = gsap.timeline();
    expTimelineRef.current = timeline;

    // 水ちゃんが画面外からちょこちょこ歩いてくる
    timeline.set(mascot, {autoAlpha: 0, x: -80, y: 6, scale: 0.95, rotation: -6});
    timeline.to(mascot, {autoAlpha: 1, duration: 0.01}, entryDelay);
    timeline.to(
      mascot,
      {x: 0, duration: walkDuration, ease: "power2.out"},
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
      {scale: 1, y: 0, duration: 0.1, ease: "power2.out"},
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
      timeline.set(point, {x: startX, y: startY, autoAlpha: 0, scale: 1}, travelStart);
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

  const dashOffset = circumference * (1 - displayProgress);
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

  const results = () => {
    navigate('/results');
  };

  const goStageList = () => {
    navigate(stageListPath);
  };

  const rankInfo = {
    letter: getRankLetter(level),
    title: 'AURORA KNIGHT',
    level: level,
    nextXp: xpTillNextLevel,
  };

  return (
    <>
      <AppLayout>
        <div className='relative flex w-full justify-center overflow-y-auto px-4 sm:overflow-hidden sm:px-6 lg:px-8'>
          <div className='fixed bottom-6 right-6 z-20 w-[6rem]'>
            <QuickStartButton onClick={() => navigate('/')} label='Home' />
          </div>
          <div className={contentWrapperClass}>
            <section className='order-1 relative w-full space-y-2 pt-2 sm:pt-3'>
              <h1 className='text-center text-xl font-bold tracking-tight text-[#f2c97d] sm:text-3xl'>
                RESULT
              </h1>
              <div className='absolute right-0 top-1/2 flex -translate-y-1/2 flex-row gap-2'>
                <QuickStartButton
                  onClick={() => results()}
                  label='Results'
                  className='!w-[7rem] !px-5 !py-2.5 text-xs tracking-[0.2em]'
                />
                <QuickStartButton
                  onClick={goStageList}
                  label='Stage'
                  className='!w-[7rem] !px-5 !py-2.5 text-xs tracking-[0.2em]'
                />
              </div>
            </section>

            <section className='order-3 grid w-full min-w-0 grid-cols-1 gap-4 sm:order-2 sm:grid-cols-3'>
              {summaryCards.map(({label, value, tone}) => {
                const toneClass = tone ? toneStyles[tone] : '';

                return (
                  <MiniResultSummaryCard
                    key={label}
                    label={label}
                    value={value}
                    mutedClass={palette.muted}
                    toneClass={toneClass}
                  />
                );
              })}
            </section>

            <section className='order-2 mb-0 grid w-full min-w-0 grid-cols-1 gap-6 sm:order-3 lg:grid-cols-3'>
              <MissedWordsPanel
                highlightClass={palette.highlight}
                mutedClass={palette.muted}
                negativeClass={palette.negative}
                accentClass={palette.accent}
                wrongWords={wrongWordsTop}
                hasNoWrongWords={hasNoWrongWords}
                hasMore={incorrect.length > 6}
                onOpenModal={() => setIsModalOpen(true)}
              />

              <MiniResultRankCard
                palette={palette}
                rankInfo={rankInfo}
                expRingRef={expRingRef}
                expMascotRef={expMascotRef}
                expPointsRef={expPointsRef}
                expPointCount={expPointCount}
                shouldShowMascot={shouldShowMascot}
                shouldHideMascotAtStart={shouldHideMascotAtStart}
                handleMascotTap={handleMascotTap}
                mascotFillRatio={mascotFillRatio}
                prefersReducedMotion={prefersReducedMotion}
                displayProgress={displayProgress}
                shouldAnimateGain={shouldAnimateGain}
                r={r}
                circumference={circumference}
                dashOffset={dashOffset}
              />
            </section>
          </div>
        </div>
      </AppLayout>

      {isModalOpen && (
        <MiniResultPageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          wrongWords={wrongWordsAll}
        />
      )}
    </>
  );
}
