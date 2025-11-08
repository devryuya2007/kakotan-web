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

  return (
    <AppLayout>
      <section className="bg-blue-500">
        <div>
          <p></p>
          <h1>すべての問題を正解するまで</h1>
          <p></p>

          <div style={{ width: ringSize, height: ringSize }}>
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
                  <stop offset="0%" stopColor="#d8ff9c" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#b6ff6e" />
                  <stop offset="100%" stopColor="#7ed957" />
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
                opacity={0.4}
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
                fill="#d8ff9c"
                fontSize="14">
                {progress}%
              </text>
            </svg>
          </div>
        </div>
        <div>
          <img
            src={TimeElapsedIcon}
            alt="時間経過アイコン"
            width={iconSize}
            height={iconSize}
          />
          <p>総合学習時間</p>
          <h1>
            {totalHours === 0
              ? `${totalMinutes}分`
              : `${totalHours}時間
          ${totalMinutes}分`}
          </h1>
          <p></p>
        </div>
        <div>
          <img
            src={AchievementIcon}
            alt="達成度アイコン"
            width={iconSize}
            height={iconSize}
          />
          <p>平均正答率</p>
          <h1>{totalCorrectRate}%</h1>
          <p></p>
        </div>
        <div>
          <img
            src={StreakIcon}
            alt="連続学習アイコン"
            width={iconSize}
            height={iconSize}
          />
          <p>連続学習日数</p>
          <h1>{streak}</h1>
          <p></p>
        </div>
        <div>
          <p>学習の進捗</p>
          <h1>８０単語</h1>
          <p>過去７日間+13%</p>
        </div>

        <div>
          <h1>最近の学習</h1>
          <ul>
            <li></li>
          </ul>
        </div>
      </section>
    </AppLayout>
  );
}
// #f2c97d  #b8860b #fdf1d7
