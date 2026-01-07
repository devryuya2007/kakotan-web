import {AppLayout} from '../../components/layout/AppLayout';
import {useTestResults} from '../states/useTestResults';
import {useAllYearVocab} from "@/hooks/useAllYearVocab";
import {calculateLevelProgress} from '@/features/results/scoring';
import { RankSummaryCard } from "./components/RankSummaryCard";
import { ProgressRingCard } from "./components/ProgressRingCard";
import { SummaryCardGrid } from "./components/SummaryCardGrid";
import { WeeklyStudyChartCard } from "./components/WeeklyStudyChartCard";
import { RecentSessionList } from "./components/RecentSessionList";
import { useResultRanking } from "./hooks/useResultRanking";
import { useResultSummary } from "./hooks/useResultSummary";


import {
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
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
  const {
    progress,
    displayProgress,
    progressRatio,
    solvedWords,
    totalWords,
    summaryStats,
    lineChartData,
    lineChartOptions,
    averageDailyMinutes,
  } = useResultSummary({
    sessionHistory,
    solvedPhrases,
    questionsByYear,
    vocabReady,
  });
  const { recentSessionLabels } = useResultRanking({
    sessionHistory,
  });

  const iconSize = 72;
  const ringSize = 200;
  const ringRadius = (ringSize - 12) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference * (1 - progressRatio);

  const {
    formattedTotalStudyTime,
    sessionCountLabel,
    totalCorrectRate,
    totalAnswered,
    streak,
    streakDayLabel,
  } = summaryStats;

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
