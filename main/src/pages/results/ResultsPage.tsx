import {AppLayout} from '../../components/layout/AppLayout';
import {useTestResults} from '../states/useTestResults';
import {useAllYearVocab} from "@/hooks/useAllYearVocab";
import {calculateLevelProgress} from '@/features/results/scoring';
import { RankSummaryCard } from "./components/RankSummaryCard";
import { ProgressRingCard } from "./components/ProgressRingCard";
import { SummaryCardGrid } from "./components/SummaryCardGrid";
import { WeeklyStudyChartCard } from "./components/WeeklyStudyChartCard";
import { RecentSessionList } from "./components/RecentSessionList";

import {useEffect, useMemo, useRef, useState} from 'react';

import {
  CategoryScale,
  Chart,
  type ChartData,
  type ChartOptions,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import {differenceInCalendarDays, startOfDay} from 'date-fns';
import {useNavigate} from 'react-router-dom';

import TimeElapsedIcon from '@/assets/iconSvg/時間経過のアイコン .svg';
import AchievementIcon from '@/assets/iconSvg/業績アイコン.svg';
import StreakIcon from '@/assets/iconSvg/火の玉のアイコン.svg';
import {QuickStartButton} from '@/components/buttons/QuickStartButton';
import {lineGlowPlugin} from './lineGlowPlugin';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  lineGlowPlugin,
);

export default function ResultsPage() {
  const {sessionHistory, solvedPhrases, totalXp} = useTestResults();
  const {status: vocabStatus, questionsByYear} = useAllYearVocab();
  const vocabReady = vocabStatus === "ready";

  const allQuestions = useMemo(() => {
    if (!vocabReady) return [];
    return Object.values(questionsByYear)
      .flat()
      .map((question) => question.phrase);
  }, [
    vocabReady,
    questionsByYear,
  ]);

  const correctQuestions = useMemo(
    () => solvedPhrases.map((question) => question.phrase),
    [solvedPhrases],
  );


  const allQuestionsSet = useMemo(() => new Set(allQuestions), [allQuestions]);
  const correctQuestionsSet = useMemo(
    () => new Set(correctQuestions),
    [correctQuestions],
  );

  const progress = useMemo(() => {
    if (!vocabReady) return null;

    const totalCount = allQuestionsSet.size;
    if (totalCount === 0) return null;

    const solvedCount = Array.from(allQuestionsSet).filter((phrase) =>
      correctQuestionsSet.has(phrase),
    ).length;

    if (solvedCount === totalCount) return 100;
    return Math.round((solvedCount / totalCount) * 100);
  }, [vocabReady, allQuestionsSet, correctQuestionsSet]);


  const progressValue = progress ?? 0;
  const progressRatio = progressValue / 100;
  const [displayProgress, setDisplayProgress] = useState(progressValue);
  const lastProgressRef = useRef(progressValue);
  useEffect(() => {
    const startValue = lastProgressRef.current;
    const targetValue = progressValue;
    const duration = 1000;

    if (startValue === targetValue) {
      setDisplayProgress(targetValue);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    // requestAnimationFrameは描画するタイミングの絶対時間をtimestampとして返す
    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime; // アニメ開始からどれくらい経ったか
      const animationProgress = Math.min(elapsed / duration, 1); // 16/900,32/900,48/900...
      const easedValue =
        startValue + (targetValue - startValue) * animationProgress; // 前回まで + 割合
      setDisplayProgress(Math.round(easedValue)); // requestAnimationFrameのタイミングに合わせて
      if (animationProgress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    lastProgressRef.current = targetValue;

    return () => cancelAnimationFrame(animationFrame);
  }, [progressValue]);

  // startedAt: number;
  // finishedAt: number;
  // durationMs: number;
  // sectionId: string;
  // correctCount: number;
  // incorrectCount: number;
  // gainedXp: number;

  const totalStudyMs = sessionHistory.reduce(
    (sum, session) => sum + session.durationMs,
    0,
  );

  const hourMs = 1000 * 60 * 60;
  const minutesMs = 1000 * 60;
  const totalHours = Math.floor(totalStudyMs / hourMs);
  const totalMinutes = Math.floor((totalStudyMs % hourMs) / minutesMs);

  const correctCount = sessionHistory.reduce(
    (sum, session) => sum + session.correctCount,
    0,
  );
  const incorrectCount = sessionHistory.reduce(
    (sum, session) => sum + session.incorrectCount,
    0,
  );
  const totalAnswered = correctCount + incorrectCount;
  const totalCorrectRate =
    totalAnswered === 0 ? 0 : Math.floor((correctCount / totalAnswered) * 100);

  const sessions = [...sessionHistory]
    .slice()
    .sort((a, b) => b.startedAt - a.startedAt);

  let streak = 0;
  let prevDay: Date | null = null;

  for (const session of sessions) {
    const day = startOfDay(session.startedAt);

    if (!prevDay) {
      streak = 1;
      prevDay = day;
      continue;
    }

    const diff = differenceInCalendarDays(prevDay, day);
    if (diff === 0) continue;

    if (diff === 1) {
      streak += 1;
      prevDay = day;
      continue;
    }
    break; // 一日以上空いたら終了
  }

  const iconSize = 72;
  const ringSize = 200;
  const ringRadius = (ringSize - 12) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference * (1 - progressRatio);

  const renderCount = 10;

  const getThisYear = () => new Date().getFullYear();
  const formatDateWithYear = (date: Date, includeYear: boolean) =>
    `${includeYear ? `${date.getFullYear()} ` : ''}${date.getMonth() + 1}/${date.getDate()}`;

  const currentYear = getThisYear();

  const recentSessions = [...sessionHistory]
    .slice()
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, renderCount);

  const recentSessionLabels: Array<{
    key: number;
    label: string;
    sectionId: string;
    gainedXp: number;
    accuracyRate: number;
  }> = [];

  recentSessions.forEach((session) => {
    const gainedXp = session.gainedXp ?? 0;
    const sectionId = session.sectionId || 'unknown';
    const startDate = new Date(session.startedAt);
    const endDate = new Date(session.finishedAt);
    const startLabel = formatDateWithYear(
      startDate,
      startDate.getFullYear() !== currentYear,
    );
    const endLabel = formatDateWithYear(
      endDate,

      endDate.getFullYear() !== currentYear,
    );
    const label =
      startLabel === endLabel ? startLabel : `${startLabel}〜${endLabel}`;

    const answerTotal = session.correctCount + session.incorrectCount;
    const accuracyRate =
      answerTotal === 0
        ? 0
        : Math.round((session.correctCount / answerTotal) * 100);

    recentSessionLabels.push({
      key: session.startedAt,
      label,
      sectionId: sectionId,
      gainedXp: gainedXp,
      accuracyRate: accuracyRate,
    });
  });

  const computeDailyStudySeries = (
    history: typeof sessionHistory,
    days = 7,
  ) => {
    const minutesPerDay = new Map<number, number>();

    history.forEach((session) => {
      const day = new Date(session.startedAt); // 例：Mon Apr 01 2024 21:00:00 GMT+0900
      day.setHours(0, 0, 0, 0); // TODO:startOfDayにする
      const dayKey = day.getTime();
      const minutes = Math.round(session.durationMs / minutesMs);
      minutesPerDay.set(dayKey, (minutesPerDay.get(dayKey) ?? 0) + minutes);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const labels: string[] = [];
    const data: number[] = [];

    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date(today); // 今日
      date.setDate(date.getDate() - i);
      const dayKey = date.getTime(); // ミリ秒に直す
      labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
      data.push(minutesPerDay.get(dayKey) ?? 0);
    }

    return {labels, data};
  };

  const dailySeries = computeDailyStudySeries(sessionHistory);
  const maxDailyMinutes = Math.max(...dailySeries.data);
  const yAxisMax = Math.max(60, Math.ceil(maxDailyMinutes * 1.2));
  const averageDailyMinutes = Math.round(
    dailySeries.data.reduce((sum, value) => sum + value, 0) /
      dailySeries.data.length,
  );
  const solvedWords = correctQuestionsSet.size;
  const totalWords = allQuestionsSet.size;
  const formattedTotalStudyTime =
    totalHours === 0
      ? `${totalMinutes} min`
      : `${totalHours} h ${totalMinutes} min`;
  const sessionCountLabel =
    sessionHistory.length === 1 ? 'session' : 'sessions';
  const streakDayLabel = streak === 1 ? 'day' : 'days';

  const summaryCards = [
    {
      icon: TimeElapsedIcon,
      title: 'Total studytime',
      value: formattedTotalStudyTime,
      caption: `${sessionHistory.length} ${sessionCountLabel}`,
    },
    {
      icon: AchievementIcon,
      title: 'Average accuracy',
      value: `${totalCorrectRate}%`,
      caption: `Across ${totalAnswered} questions`,
    },
    {
      icon: StreakIcon,
      title: 'Study streak',
      value: `${streak} ${streakDayLabel}`,
      caption: streak > 0 ? 'Still going strong' : 'Starting today',
      fullSpan: true,
    },
  ];

  const lineChartData: ChartData<'line'> = {
    labels: dailySeries.labels,
    datasets: [
      {
        label: 'Study time (min)',
        data: dailySeries.data,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.25)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: '#f2c97d',
        pointBorderColor: 'transparent',
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {color: '#f5f5ff'},
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: {color: '#f5f5ff'},
        grid: {display: false},
      },
      y: {
        beginAtZero: true,
        suggestedMax: yAxisMax,
        ticks: {color: '#f5f5ff'},
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
        },
      },
    },
  };

  const navigate = useNavigate();
  return (
    <AppLayout>
      <section className='w-full overflow-x-hidden text-white'>
        <div className='mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-12'>
          <header className='text-center'>
            <h1 className='mt-2 text-3xl font-bold tracking-tight text-[#f2c97d] sm:text-4xl'>
              Progress Log
            </h1>
            <div className='fixed bottom-6 right-6 z-[9999] w-[6rem]'>
              <QuickStartButton onClick={() => navigate('/')} label='Home' />
            </div>
          </header>
          <div className='flex flex-col gap-8'>
            <div className='flex flex-col gap-6 lg:flex-row lg:items-stretch'>
              <div className='w-full lg:w-1/2'>
                <ProgressRingCard
                  ringSize={ringSize}
                  ringRadius={ringRadius}
                  ringCircumference={ringCircumference}
                  strokeDashoffset={strokeDashoffset}
                  displayProgress={displayProgress}
                  progress={progress}
                  solvedWords={solvedWords}
                  totalWords={totalWords}
                />
              </div>
              <div className='w-full lg:w-1/2'>
                <RankSummaryCard
                  levelProgress={calculateLevelProgress(totalXp ?? 0)}
                  variant='results'
                />
              </div>
            </div>
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1.4fr]'>
              <SummaryCardGrid cards={summaryCards} iconSize={iconSize} />
              <WeeklyStudyChartCard
                lineChartData={lineChartData}
                lineChartOptions={lineChartOptions}
                averageDailyMinutes={averageDailyMinutes}
              />
            </div>
          </div>

          <RecentSessionList sessions={recentSessionLabels} />
        </div>
      </section>
    </AppLayout>
  );
}
// #f2c97d  #b8860b #fdf1d7
