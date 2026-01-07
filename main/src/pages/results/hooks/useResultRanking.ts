import { useMemo } from "react";

import type { SessionRecord } from "@/pages/states/TestReSultContext.shared";

interface RecentSessionLabel {
  key: number;
  label: string;
  sectionId: string;
  gainedXp: number;
  accuracyRate: number;
}

interface UseResultRankingOptions {
  renderCount?: number;
}

interface UseResultRankingInput {
  sessionHistory: SessionRecord[];
  options?: UseResultRankingOptions;
}

interface UseResultRankingResult {
  recentSessionLabels: RecentSessionLabel[];
}

const formatDateWithYear = (date: Date, includeYear: boolean) =>
  `${includeYear ? `${date.getFullYear()} ` : ""}${date.getMonth() + 1}/${date.getDate()}`;

// 直近セッションのラベルと精度をまとめる
export const useResultRanking = ({
  sessionHistory,
  options,
}: UseResultRankingInput): UseResultRankingResult => {
  const renderCount = options?.renderCount ?? 10;
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const recentSessions = useMemo(
    () =>
      [...sessionHistory]
        .slice()
        .sort((a, b) => b.startedAt - a.startedAt)
        .slice(0, renderCount),
    [sessionHistory, renderCount],
  );

  const recentSessionLabels = useMemo<RecentSessionLabel[]>(() => {
    return recentSessions.map((session) => {
      const gainedXp = session.gainedXp ?? 0;
      const sectionId = session.sectionId || "unknown";
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
      const label = startLabel === endLabel ? startLabel : `${startLabel}〜${endLabel}`;

      const answerTotal = session.correctCount + session.incorrectCount;
      const accuracyRate =
        answerTotal === 0
          ? 0
          : Math.round((session.correctCount / answerTotal) * 100);

      return {
        key: session.startedAt,
        label,
        sectionId,
        gainedXp,
        accuracyRate,
      };
    });
  }, [recentSessions, currentYear]);

  return { recentSessionLabels };
};
