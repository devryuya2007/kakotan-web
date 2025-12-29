import {badges} from '../badge/badge';
import {useTestResults} from '../states/useTestResults';

import {type ReactNode, useLayoutEffect, useMemo, useRef, useState} from "react";

import {useLocation, useNavigate} from 'react-router-dom';

import {gsap} from "gsap";

import {QuickStartButton} from '@/components/buttons/QuickStartButton';
import {AppLayout} from '@/components/layout/AppLayout';
import badgeRule from '@/features/results/badgeCondition';
import {calculateLevelProgress} from '@/features/results/scoring';
import {usePrefersReducedMotion} from "@/hooks/usePrefersReducedMotion";
import {isYearKey} from "@/pages/stages/stageConstants";

import MiniResultPageModal from './ResultModal/MiniResultPageModal';

export type WrongWordStat = {
  word: string;
  missCount: number;
  meaning: string;
  severity: 'neutral' | 'caution' | 'negative';
};
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
  const shouldShowBadge = badgeRule({
    totalXp: effectiveTotalXp,
    level,
  });

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
      value: (
        <div className='flex flex-wrap gap-3'>
          {shouldShowBadge && // Badge unlock rule (currently hidden, see badgeCondition.ts)
            // x
            badges.map(({key, icon}) => (
              <span
                key={key}
                className='inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-white/5'
              >
                {icon}
              </span>
            ))}
        </div>
      ),
    },
  ];

  const wrongWordsAll = useMemo<WrongWordStat[]>(() => {
    if (incorrect.length === 0) return [];

    const mistakeTally = new Map<string, {count: number; meaning: string}>();

    incorrect.forEach((question) => {
      const word = question.phrase;
      const meaning = question.mean ?? 'Meaning unavailable';
      const tally = mistakeTally.get(word);

      if (tally) {
        mistakeTally.set(word, {
          count: tally.count + 1,
          meaning: tally.meaning || meaning,
        });
      } else {
        mistakeTally.set(word, {count: 1, meaning});
      }
    });

    const talliedEntries = Array.from(mistakeTally.entries());
    const sortedEntries = [...talliedEntries].sort(
      (a, b) => b[1].count - a[1].count,
    );

    return sortedEntries.map<WrongWordStat>(([word, data]) => {
      const severity: WrongWordStat['severity'] =
        data.count >= 3 ? 'negative' : data.count === 2 ? 'caution' : 'neutral';

      return {
        word,
        missCount: data.count,
        meaning: data.meaning,
        severity,
      };
    });
  }, [incorrect]);

  const wrongWordsTop = useMemo(() => {
    const topEntries = wrongWordsAll.slice(0, 6);
    return topEntries;
  }, [wrongWordsAll]);

  // 直近のステージ情報から戻り先の年度を推定する
  const stageListPath = useMemo(() => {
    const latestStageId =
      sessionHistory[sessionHistory.length - 1]?.stageId ?? null;
    if (!latestStageId) return "/menu";

    const [maybeYear] = latestStageId.split("-");
    return isYearKey(maybeYear) ? `/stages/${maybeYear}` : "/menu";
  }, [sessionHistory]);

  function letterCalculate() {
    if (level === 99) return 'SS';
    else if (level >= 90) return 'S';
    else if (level >= 70) return 'A';
    else if (level >= 50) return 'B';
    else if (level >= 30) return 'C';
    else if (level >= 10) return 'D';
    else return 'E';
  }

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
  const expMascotRef = useRef<HTMLDivElement | null>(null);
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
    letter: letterCalculate(),
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
            <section className='relative w-full space-y-2'>
              <h1 className='text-center text-xl font-bold tracking-tight text-[#f2c97d] sm:text-3xl'>
                RESULT
              </h1>
              <div className='absolute right-0 top-1/2 flex -translate-y-1/2 flex-row gap-2'>
                <QuickStartButton
                  onClick={() => results()}
                  label='Results'
                  className='!w-[6rem] !px-3 !py-1 text-xs tracking-[0.2em]'
                />
                <QuickStartButton
                  onClick={goStageList}
                  label='Stage'
                  className='!w-[6rem] !px-2 !py-1 text-[0.6rem] tracking-[0.2em]'
                />
              </div>
            </section>

            <section className='grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-3'>
              {summaryCards.map(({label, value, tone}) => {
                const toneClass = tone ? toneStyles[tone] : '';

                return (
                  <div
                    key={label}
                    className='flex min-w-0 flex-col gap-2 rounded-2xl border border-white/10 bg-[#0f1524] p-4'
                  >
                    <p className={`text-xs ${palette.muted} sm:text-sm`}>
                      {label}
                    </p>
                    <div
                      className={`text-2xl font-semibold tracking-tight sm:text-3xl ${toneClass}`}
                    >
                      {value}
                    </div>
                  </div>
                );
              })}
            </section>

            <section className='mb-0 grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-3'>
              <div className='min-w-0 rounded-2xl border border-white/10 bg-[#0f1524] p-5 lg:col-span-2'>
                <div className='mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                  <div>
                    <h2
                      className={`text-base font-semibold ${palette.highlight} sm:text-lg`}
                    >
                      Missed words list
                    </h2>
                  </div>
                  {/* <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-xl border border-[#f2c97d33] px-3 py-1.5 text-xs font-semibold ${palette.accent} transition hover:border-[#f2c97d] hover:text-[#f7e2bd] sm:px-4 sm:py-2 sm:text-sm`}>
                    <span aria-hidden="true">★</span>
                    Targeted practice
                  </button> */}
                </div>
                <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
                  {hasNoWrongWords ? (
                    <h1 className={`col-span-full text-sm ${palette.muted}`}>
                      No missed words this time. Nice work!
                    </h1>
                  ) : (
                    wrongWordsTop.map(({word, meaning}) => {
                      return (
                        <div
                          key={word}
                          className='flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#262335] px-3 py-2.5 text-left text-sm transition sm:px-4 sm:py-3'
                        >
                          <span className={`font-medium ${palette.negative}`}>
                            {word}
                          </span>
                          <span className='truncate text-xs text-white/70'>
                            {meaning}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
                {incorrect.length > 6 && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    type='button'
                    className={`button-pressable mt-4 block w-full text-sm font-semibold ${palette.accent} transition hover:text-[#f7e2bd]`}
                  >
                    View more...
                  </button>
                )}
              </div>

              <div className='relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1524] p-5'>
                <div className='pointer-events-none absolute -right-24 -top-28 h-60 w-60 rounded-full bg-gradient-to-br from-[#f2c97d33] via-[#be8b381f] to-transparent blur-3xl' />
                <div className='pointer-events-none absolute inset-0 opacity-50'>
                  <div className='absolute inset-x-0 top-8 h-px bg-gradient-to-r from-transparent via-[#f2c97d33] to-transparent' />
                </div>

                <header className='relative mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='space-y-1'>
                    <p
                      className={`text-[11px] uppercase tracking-[0.6em] ${palette.subtle}`}
                    >
                      Current rank
                    </p>
                    <h2
                      className={`text-2xl font-semibold ${palette.highlight}`}
                    >
                      {rankInfo.title}
                    </h2>
                    <p className={`text-xs ${palette.muted}`}>
                      To next rank{' '}
                      <span className={`font-semibold ${palette.accent}`}>
                        {rankInfo.nextXp} XP
                      </span>
                    </p>
                  </div>
                  <div className='relative mx-auto flex h-20 w-20 items-center justify-center sm:mx-0'>
                    <div className='absolute inset-0 bg-gradient-to-br from-[#fdf1d7] via-[#f2c97d] to-[#b8860b] opacity-80 blur-sm' />
                    <div className='relative flex h-full w-full items-center justify-center border border-[#f2c97d55] bg-[#050509]/80 shadow-[0_0_28px_rgba(242,201,125,0.38)]'>
                      <span
                        className={`absolute right-[26%] top-[15%] text-[0.55rem] tracking-[0.32em] ${palette.muted}`}
                      >
                        RANK
                      </span>
                      <span
                        className={`text-4xl font-black ${palette.highlight} drop-shadow-[0_0_12px_rgba(242,201,125,0.65)]`}
                      >
                        {rankInfo.letter}
                      </span>
                    </div>
                  </div>
                </header>

                <div
                  ref={expRingRef}
                  className='relative mx-auto flex h-40 w-40 items-center justify-center sm:h-44 sm:w-44'
                >
                  {/* 水ちゃんはXP獲得時だけ出す */}
                  {shouldShowMascot && (
                    <button
                      ref={expMascotRef}
                      type="button"
                      onClick={handleMascotTap}
                      className='absolute -left-10 top-6 h-14 w-14 cursor-pointer appearance-none bg-transparent p-0 sm:-left-12 sm:top-4 sm:h-16 sm:w-16'
                      style={shouldHideMascotAtStart ? {opacity: 0} : undefined}
                      aria-label="水ちゃんを動かす"
                    >
                      <svg viewBox="0 0 200 200" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <path
                            id="mini-result-water-shape"
                            d="M100,20 C150,20 180,60 180,110 C180,170 150,190 100,190 C50,190 20,170 20,110 C20,60 50,20 100,20 Z"
                          />
                          <linearGradient id="mini-result-water-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.95" />
                          </linearGradient>
                          <clipPath id="mini-result-water-clip">
                            <use href="#mini-result-water-shape" />
                          </clipPath>
                        </defs>
                        <use
                          href="#mini-result-water-shape"
                          fill="rgba(255, 255, 255, 0.1)"
                          stroke="rgba(255, 255, 255, 0.5)"
                          strokeWidth="2"
                        />
                        <g clipPath="url(#mini-result-water-clip)">
                          <g
                            style={{
                              // 獲得分の水位に合わせる
                              transform: `translateY(${190 - (170 * Math.min(100, mascotFillRatio * 100)) / 100}px)`,
                              transition: prefersReducedMotion
                                ? "none"
                                : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          >
                            <path d="M-50,0 Q0,10 50,0 T150,0 T250,0 V200 H-50 Z" fill="url(#mini-result-water-gradient)">
                              {!prefersReducedMotion && (
                                <animate
                                  attributeName="d"
                                  dur="2.4s"
                                  repeatCount="indefinite"
                                  values="M-50,0 Q0,10 50,0 T150,0 T250,0 V200 H-50 Z;M-50,4 Q0,6 50,4 T150,4 T250,4 V200 H-50 Z;M-50,0 Q0,10 50,0 T150,0 T250,0 V200 H-50 Z"
                                />
                              )}
                            </path>
                            {prefersReducedMotion ? (
                              <>
                                <circle cx="50" cy="40" r="3" fill="rgba(255,255,255,0.6)" />
                                <circle cx="120" cy="80" r="2" fill="rgba(255,255,255,0.6)" />
                              </>
                            ) : (
                              <>
                                <circle cx="50" cy="40" r="3" fill="rgba(255,255,255,0.6)">
                                  <animate attributeName="cy" from="40" to="-20" dur="1.5s" repeatCount="indefinite" begin="0s" />
                                  <animate attributeName="opacity" values="0.6;0" dur="1.5s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="120" cy="80" r="2" fill="rgba(255,255,255,0.6)">
                                  <animate attributeName="cy" from="80" to="0" dur="2s" repeatCount="indefinite" begin="0.5s" />
                                  <animate attributeName="opacity" values="0.6;0" dur="2s" repeatCount="indefinite" />
                                </circle>
                              </>
                            )}
                          </g>
                        </g>
                        {/* 表情は50%以上でニコ */}
                        <g transform="translate(0, 10)">
                          {displayProgress >= 0.5 ? (
                            <>
                              <path d="M60,100 Q70,92 80,100" fill="none" stroke="#0b1020" strokeWidth="4" strokeLinecap="round" />
                              <path d="M120,100 Q130,92 140,100" fill="none" stroke="#0b1020" strokeWidth="4" strokeLinecap="round" />
                              <path d="M86,108 Q100,122 114,108" fill="none" stroke="#0b1020" strokeWidth="3" strokeLinecap="round" />
                            </>
                          ) : (
                            <>
                              <ellipse cx="70" cy="100" rx="8" ry="12" fill="#1e293b" />
                              <circle cx="73" cy="96" r="3" fill="#ffffff" />
                              <ellipse cx="130" cy="100" rx="8" ry="12" fill="#1e293b" />
                              <circle cx="133" cy="96" r="3" fill="#ffffff" />
                              <path d="M90,110 Q100,115 110,110" fill="none" stroke="#0b1020" strokeWidth="3" strokeLinecap="round" />
                            </>
                          )}
                          <ellipse cx="60" cy="115" rx="6" ry="3" fill="#fda4af" opacity="0.6" />
                          <ellipse cx="140" cy="115" rx="6" ry="3" fill="#fda4af" opacity="0.6" />
                        </g>
                      </svg>
                    </button>
                  )}
                  {/* ポイント粒の飛翔レイヤー */}
                  <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    {shouldAnimateGain &&
                      Array.from({length: expPointCount}).map((_, index) => (
                        <span
                          key={`exp-point-${index}`}
                          ref={(element) => {
                            expPointsRef.current[index] = element;
                          }}
                          className="absolute h-5 w-5 rounded-full bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-400 opacity-0 shadow-[0_0_14px_rgba(16,185,129,0.6)]"
                        />
                      ))}
                  </div>
                  <svg
                    className='h-full w-full -rotate-90 transform text-[#1f2333]'
                    viewBox='0 0 140 140'
                    role='img'
                    aria-label={`Level ${rankInfo.level}`}
                  >
                    <circle
                      className='text-white/10 transition-opacity duration-500'
                      stroke='currentColor'
                      strokeWidth='12'
                      cx='70'
                      cy='70'
                      r={r}
                      fill='transparent'
                    />
                    <circle
                      className='text-[#67e8f9] transition-all duration-700 ease-out'
                      stroke='currentColor'
                      strokeWidth='12'
                      strokeLinecap='round'
                      strokeDasharray={`${circumference} ${circumference}`}
                      strokeDashoffset={dashOffset}
                      cx='70'
                      cy='70'
                      r={r}
                      fill='transparent'
                    />
                  </svg>
                  <div className='absolute flex flex-col items-center'>
                    <span
                      className={`text-[0.6rem] tracking-[0.3em] ${palette.muted}`}
                    >
                      LEVEL
                    </span>
                    <span
                      className={`text-4xl font-semibold ${palette.accent}`}
                    >
                      {rankInfo.level}
                    </span>
                  </div>
                </div>
              </div>
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
