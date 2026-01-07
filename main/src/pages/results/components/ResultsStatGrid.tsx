import type { ChartData, ChartOptions } from "chart.js";

import { calculateLevelProgress } from "@/features/results/scoring";

import { ProgressRingCard } from "./ProgressRingCard";
import { RankSummaryCard } from "./RankSummaryCard";
import { SummaryCardGrid } from "./SummaryCardGrid";
import { WeeklyStudyChartCard } from "./WeeklyStudyChartCard";

interface SummaryCardEntry {
  icon: string;
  title: string;
  value: string;
  caption: string;
  fullSpan?: boolean;
}

interface ResultsStatGridProps {
  ringSize: number;
  ringRadius: number;
  ringCircumference: number;
  strokeDashoffset: number;
  displayProgress: number;
  progress: number | null;
  solvedWords: number;
  totalWords: number;
  levelProgress: ReturnType<typeof calculateLevelProgress>;
  summaryCards: SummaryCardEntry[];
  iconSize: number;
  lineChartData: ChartData<"line">;
  lineChartOptions: ChartOptions<"line">;
  averageDailyMinutes: number;
}

// 結果画面の主要カードをまとめて表示する
export function ResultsStatGrid({
  ringSize,
  ringRadius,
  ringCircumference,
  strokeDashoffset,
  displayProgress,
  progress,
  solvedWords,
  totalWords,
  levelProgress,
  summaryCards,
  iconSize,
  lineChartData,
  lineChartOptions,
  averageDailyMinutes,
}: ResultsStatGridProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <div className="w-full lg:w-1/2">
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
        <div className="w-full lg:w-1/2">
          <RankSummaryCard levelProgress={levelProgress} variant="results" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1.4fr]">
        <SummaryCardGrid cards={summaryCards} iconSize={iconSize} />
        <WeeklyStudyChartCard
          lineChartData={lineChartData}
          lineChartOptions={lineChartOptions}
          averageDailyMinutes={averageDailyMinutes}
        />
      </div>
    </div>
  );
}
