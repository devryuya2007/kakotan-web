import { useEffect, useMemo, useRef, useState } from "react";

import { differenceInCalendarDays, startOfDay } from "date-fns";
import type { ChartData, ChartOptions } from "chart.js";

import type { QuizQuestion } from "@/data/vocabLoader";
import type { RegistryMap } from "@/hooks/getAllRegistry";
import type { SessionRecord } from "@/pages/states/TestReSultContext.shared";

interface UseResultSummaryInput {
  sessionHistory: SessionRecord[];
  solvedPhrases: QuizQuestion[];
  questionsByYear: RegistryMap<QuizQuestion[]>;
  vocabReady: boolean;
}

interface ResultSummaryStats {
  formattedTotalStudyTime: string;
  sessionCountLabel: string;
  totalCorrectRate: number;
  totalAnswered: number;
  streak: number;
  streakDayLabel: string;
}

interface UseResultSummaryResult {
  progress: number | null;
  displayProgress: number;
  progressRatio: number;
  solvedWords: number;
  totalWords: number;
  summaryStats: ResultSummaryStats;
  lineChartData: ChartData<"line">;
  lineChartOptions: ChartOptions<"line">;
  averageDailyMinutes: number;
}

interface DailyStudySeries {
  labels: string[];
  data: number[];
}

const computeDailyStudySeries = (
  history: SessionRecord[],
  days = 7,
): DailyStudySeries => {
  const minutesPerDay = new Map<number, number>();

  history.forEach((session) => {
    const dayKey = startOfDay(session.startedAt).getTime();
    const minutes = Math.round(session.durationMs / (1000 * 60));
    minutesPerDay.set(dayKey, (minutesPerDay.get(dayKey) ?? 0) + minutes);
  });

  const today = startOfDay(Date.now());
  const labels: string[] = [];
  const data: number[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayKey = date.getTime();
    labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
    data.push(minutesPerDay.get(dayKey) ?? 0);
  }

  return { labels, data };
};

// 結果画面で使う集計データをまとめて返す
export const useResultSummary = ({
  sessionHistory,
  solvedPhrases,
  questionsByYear,
  vocabReady,
}: UseResultSummaryInput): UseResultSummaryResult => {
  const allQuestions = useMemo(() => {
    if (!vocabReady) return [];
    return Object.values(questionsByYear)
      .flat()
      .map((question) => question.phrase);
  }, [vocabReady, questionsByYear]);

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

    let solvedCount = 0;
    allQuestionsSet.forEach((phrase) => {
      if (correctQuestionsSet.has(phrase)) {
        solvedCount += 1;
      }
    });

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
      const elapsed = timestamp - startTime;
      const animationProgress = Math.min(elapsed / duration, 1);
      const easedValue =
        startValue + (targetValue - startValue) * animationProgress;
      setDisplayProgress(Math.round(easedValue));
      if (animationProgress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    lastProgressRef.current = targetValue;

    return () => cancelAnimationFrame(animationFrame);
  }, [progressValue]);

  const totalStudyMs = useMemo(
    () => sessionHistory.reduce((sum, session) => sum + session.durationMs, 0),
    [sessionHistory],
  );

  const hourMs = 1000 * 60 * 60;
  const minutesMs = 1000 * 60;
  const totalHours = Math.floor(totalStudyMs / hourMs);
  const totalMinutes = Math.floor((totalStudyMs % hourMs) / minutesMs);

  const correctCount = useMemo(
    () => sessionHistory.reduce((sum, session) => sum + session.correctCount, 0),
    [sessionHistory],
  );
  const incorrectCount = useMemo(
    () =>
      sessionHistory.reduce((sum, session) => sum + session.incorrectCount, 0),
    [sessionHistory],
  );
  const totalAnswered = correctCount + incorrectCount;
  const totalCorrectRate =
    totalAnswered === 0 ? 0 : Math.floor((correctCount / totalAnswered) * 100);

  const sessions = useMemo(
    () => [...sessionHistory].slice().sort((a, b) => b.startedAt - a.startedAt),
    [sessionHistory],
  );

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
    break;
  }

  const dailySeries = useMemo(
    () => computeDailyStudySeries(sessionHistory),
    [sessionHistory],
  );
  const maxDailyMinutes = Math.max(...dailySeries.data);
  const yAxisMax = Math.max(60, Math.ceil(maxDailyMinutes * 1.2));
  const averageDailyMinutes = Math.round(
    dailySeries.data.reduce((sum, value) => sum + value, 0) /
      dailySeries.data.length,
  );

  const lineChartData: ChartData<"line"> = {
    labels: dailySeries.labels,
    datasets: [
      {
        label: "Study time (min)",
        data: dailySeries.data,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.25)",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: "#f2c97d",
        pointBorderColor: "transparent",
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { color: "#f5f5ff" },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: { color: "#f5f5ff" },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        suggestedMax: yAxisMax,
        ticks: { color: "#f5f5ff" },
        grid: {
          color: "rgba(148, 163, 184, 0.2)",
        },
      },
    },
  };

  const solvedWords = correctQuestionsSet.size;
  const totalWords = allQuestionsSet.size;
  const formattedTotalStudyTime =
    totalHours === 0
      ? `${totalMinutes} min`
      : `${totalHours} h ${totalMinutes} min`;
  const sessionCountLabel = sessionHistory.length === 1 ? "session" : "sessions";
  const streakDayLabel = streak === 1 ? "day" : "days";

  return {
    progress,
    displayProgress,
    progressRatio,
    solvedWords,
    totalWords,
    summaryStats: {
      formattedTotalStudyTime,
      sessionCountLabel,
      totalCorrectRate,
      totalAnswered,
      streak,
      streakDayLabel,
    },
    lineChartData,
    lineChartOptions,
    averageDailyMinutes,
  };
};
