import { differenceInCalendarDays, startOfDay } from "date-fns";
import TimeElapsedIcon from "@/assets/iconSvg/時間経過のアイコン .svg";
import AchievementIcon from "@/assets/iconSvg/業績アイコン.svg";
import StreakIcon from "@/assets/iconSvg/火の玉のアイコン.svg";
import { AppLayout } from "../../components/layout/AppLayout";
import { useTestResults } from "../states/TestReSultContext";
import { useReiwa3Vocab } from "../tests/test_page/Reiwa3Page";
import { useReiwa4Vocab } from "../tests/test_page/Reiwa4Page";
import { useReiwa5Vocab } from "../tests/test_page/Reiwa5Page";
import { useReiwa6Vocab } from "../tests/test_page/Reiwa6Page";
import { useReiwa7Vocab } from "../tests/test_page/Reiwa7Page";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function ResultsPage() {
  const { sessionHistory, correct } = useTestResults();
  const { questions: reiwa3Questions } = useReiwa3Vocab();
  const { questions: reiwa4Questions } = useReiwa4Vocab();
  const { questions: reiwa5Questions } = useReiwa5Vocab();
  const { questions: reiwa6Questions } = useReiwa6Vocab();
  const { questions: reiwa7Questions } = useReiwa7Vocab();

  let allQuestions: any = [];
  let correctQuestions: any = [];

  for (const question of reiwa3Questions) allQuestions.push(question.phrase);

  for (const question of reiwa4Questions) allQuestions.push(question.phrase);

  for (const question of reiwa5Questions) allQuestions.push(question.phrase);

  for (const question of reiwa6Questions) allQuestions.push(question.phrase);

  for (const question of reiwa7Questions) allQuestions.push(question.phrase);

  for (const question of correct) correctQuestions.push(question.phrase);

  const allQuestionsSet = new Set<string>(allQuestions);
  const correctQuestionsSet = new Set<string>(correctQuestions);

  const judgementProgress = () => {
    if (!allQuestionsSet || !correctQuestionsSet) return 0;

    const solvedCount = Array.from(allQuestionsSet).filter((a) =>
      correctQuestionsSet.has(a)
    ).length;

    const totalCount = allQuestionsSet.size;
    if (totalCount === 0) return 0;
    if (solvedCount === totalCount) return 100;

    return Math.round((solvedCount / totalCount) * 100);
  };

  const progress = judgementProgress() ?? 0; // TODO: replace with actual experience progress
  const progressRatio = progress / 100;

  // startedAt: number;
  // finishedAt: number;
  // durationMs: number;
  // sectionId: string;
  // correctCount: number;
  // incorrectCount: number;
  // gainedXp: number;

  const totalStudyMs = sessionHistory.reduce(
    (sum, session) => sum + session.durationMs,
    0
  );

  const hourMs = 1000 * 60 * 60;
  const minutesMs = 1000 * 60;
  const totalHours = Math.floor(totalStudyMs / hourMs);
  const totalMinutes = Math.floor((totalStudyMs % hourMs) / minutesMs);

  const correctCount = sessionHistory.reduce(
    (sum, session) => sum + session.correctCount,
    0
  );
  const incorrectCount = sessionHistory.reduce(
    (sum, session) => sum + session.incorrectCount,
    0
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

  const iconSize = 36;
  const ringSize = 72;
  const ringRadius = (ringSize - 12) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference * (1 - progressRatio);

  const renderCount = 10;

  const getThisYear = () => new Date().getFullYear();
  const formatDateWithYear = (date: Date, includeYear: boolean) =>
    `${includeYear ? `${date.getFullYear()}年` : ""}${
      date.getMonth() + 1
    }月${date.getDate()}日`;

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
    const sectionId = session.sectionId || "unknown";
    const startDate = new Date(session.startedAt);
    const endDate = new Date(session.finishedAt);
    const startLabel = formatDateWithYear(
      startDate,
      startDate.getFullYear() !== currentYear
    );
    const endLabel = formatDateWithYear(
      endDate,

      endDate.getFullYear() !== currentYear
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
    days = 7
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

    return { labels, data };
  };

  const dailySeries = computeDailyStudySeries(sessionHistory);
  const maxDailyMinutes =
    dailySeries.data.length > 0 ? Math.max(...dailySeries.data) : 0;
  const yAxisMax = Math.max(60, Math.ceil(maxDailyMinutes * 1.2));
  const averageDailyMinutes =
    dailySeries.data.length > 0
      ? Math.round(
          dailySeries.data.reduce((sum, value) => sum + value, 0) /
            dailySeries.data.length
        )
      : 0;
  const solvedWords = correctQuestionsSet.size;
  const totalWords = allQuestionsSet.size;
  const masteredDisplay =
    totalWords === 0
      ? "0単語"
      : `${solvedWords.toLocaleString()}/${totalWords.toLocaleString()}語`;
  const masteredCaption =
    totalWords === 0 ? "問題セット読込中" : `${progress}% コンプリート`;
  const formattedTotalStudyTime =
    totalHours === 0
      ? `${totalMinutes}分`
      : `${totalHours}時間 ${totalMinutes}分`;

  const summaryCards = [
    {
      icon: TimeElapsedIcon,
      title: "総合学習時間",
      value: formattedTotalStudyTime,
      caption: `${sessionHistory.length}セッション`,
    },
    {
      icon: AchievementIcon,
      title: "平均正答率",
      value: `${totalCorrectRate}%`,
      caption: `${totalAnswered}問中`,
    },
    {
      icon: StreakIcon,
      title: "連続学習日数",
      value: `${streak}日`,
      caption: streak > 0 ? "休まず継続中" : "本日スタート",
    },
    {
      icon: null,
      title: "学習の進捗",
      value: masteredDisplay,
      caption: masteredCaption,
    },
  ];

  const lineChartData: ChartData<"line"> = {
    labels: dailySeries.labels,
    datasets: [
      {
        label: "学習時間（分）",
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

  return (
    <AppLayout>
      <section className="bg-[radial-gradient(circle_at_top,_#141830,_#05060d)] text-white overflow-scroll w-full  ">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-8">
          <header className="text-center">
            <p className="text-xs uppercase tracking-[0.65em] text-[#f2c97d]/80">
              STUDY ARCHIVE
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              積み上げログ
            </h1>
            <p className="mt-2 text-sm text-white/70">
              MiniResultPageと同じトーンで、最近の学習データをまとめたダッシュボードだよ。
            </p>
          </header>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_60px_-35px_rgba(3,5,20,0.9)] backdrop-blur">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex items-center justify-center">
                <div
                  className="rounded-full border border-white/10 bg-[#050917]/70 p-4"
                  style={{ width: ringSize + 16, height: ringSize + 16 }}>
                  <svg
                    width={ringSize}
                    height={ringSize}
                    viewBox={`0 0 ${ringSize} ${ringSize}`}
                    role="img"
                    aria-label="経験値プログレス">
                    <defs>
                      <linearGradient
                        id="xp-gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%">
                        <stop
                          offset="0%"
                          stopColor="#f2c97d"
                          stopOpacity="0.9"
                        />
                        <stop offset="50%" stopColor="#f6dda5" />
                        <stop offset="100%" stopColor="#f2c97d" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={ringRadius}
                      fill="none"
                      stroke="#1b1f2b"
                      strokeWidth={6}
                      opacity={0.35}
                    />
                    <circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={ringRadius}
                      fill="none"
                      stroke="url(#xp-gradient)"
                      strokeWidth={6}
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={strokeDashoffset}
                      transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                      filter="url(#glow)"
                    />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#f2c97d"
                      fontSize="14">
                      {progress}%
                    </text>
                  </svg>
                </div>
              </div>

              <div className="flex-1 space-y-3 text-left">
                <p className="text-xs uppercase tracking-[0.6em] text-[#f2c97d]/80">
                  MAIN QUEST
                </p>
                <h2 className="text-2xl font-semibold">
                  すべての問題を正解するまで
                </h2>
                <p className="text-sm text-white/70">
                  正解できた単語をコツコツ積み重ね中。コンプリート率は{" "}
                  <span className="text-[#f2c97d]">{progress}%</span> だよ。
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-white/70">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    正解済: {solvedWords.toLocaleString()}語
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    総問題数: {totalWords.toLocaleString()}語
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    残り:{" "}
                    {Math.max(totalWords - solvedWords, 0).toLocaleString()}語
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map(({ icon, title, value, caption }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_30px_-24px_rgba(2,6,23,0.9)] transition hover:-translate-y-1 hover:border-[#f2c97d]/60 hover:bg-white/10">
                <div className="flex items-center gap-3">
                  {icon ? (
                    <img
                      src={icon}
                      alt={`${title}アイコン`}
                      width={iconSize}
                      height={iconSize}
                      className="rounded-full border border-white/10 bg-[#050917] p-2"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f2c97d]/60 bg-[#1b1420] text-xs font-semibold text-[#f2c97d]">
                      XP
                    </div>
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                      {title}
                    </p>
                    <p className="text-2xl font-semibold text-white">{value}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-white/60">{caption}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_40px_-30px_rgba(5,8,20,0.9)]">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-[#f2c97d]/80">
                  WEEKLY PULSE
                </p>
                <h2 className="text-xl font-semibold">週間の学習時間</h2>
              </div>
              <p className="text-sm text-white/70">
                1日平均 {averageDailyMinutes} 分
              </p>
            </div>
            <div className="mt-4 h-64">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
            <p className="mt-2 text-xs text-white/60">
              sessionHistory から直近7日のトレンドを描画しているよ。
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_40px_-30px_rgba(5,8,20,0.9)]">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-[#f2c97d]/80">
                  RECENT LOG
                </p>
                <h2 className="text-xl font-semibold">最近の学習</h2>
              </div>
              <p className="text-sm text-white/70">
                直近 {recentSessionLabels.length} 件を表示
              </p>
            </div>
            <ul className="mt-4 divide-y divide-white/10 text-sm">
              <li className="grid grid-cols-[1.4fr,1fr,0.8fr,0.8fr] gap-2 pb-3 text-xs uppercase tracking-[0.2em] text-white/50">
                <span>日付</span>
                <span>セクション</span>
                <span>獲得XP</span>
                <span>正答率</span>
              </li>
              {recentSessionLabels.length === 0 && (
                <li className="py-6 text-center text-white/60">
                  学習履歴がまだありません。
                </li>
              )}
              {recentSessionLabels.map((session) => (
                <li
                  key={session.key}
                  className="grid grid-cols-[1.4fr,1fr,0.8fr,0.8fr] items-center gap-2 py-3 text-white/90">
                  <span className="font-semibold text-white">
                    {session.label}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-center text-xs uppercase tracking-wide text-white/70">
                    {session.sectionId}
                  </span>
                  <span className="font-semibold text-[#f2c97d]">
                    {session.gainedXp} XP
                  </span>
                  <span>{session.accuracyRate}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
// #f2c97d  #b8860b #fdf1d7
