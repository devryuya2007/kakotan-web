import { differenceInCalendarDays, startOfDay } from "date-fns";
import TimeElapsedIcon from "@/assets/iconSvg/時間経過のアイコン .svg";
import AchievementIcon from "@/assets/iconSvg/業績アイコン.svg";
import StreakIcon from "@/assets/iconSvg/火の玉のアイコン.svg";
import { AppLayout } from "../../components/layout/AppLayout";
import { useTestResults } from "../states/TestReSultContext";

export default function ResultsPage() {
  const { sessionHistory } = useTestResults();

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

  // const totalGainedXp = sessionHistory.reduce(
  //   (sum, session) => sum + session.gainedXp,
  //   0
  // );

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

  return (
    <AppLayout>
      <section className="bg-blue-500">
        <div>
          <p></p>
          <h1>すべての問題を正解するまで</h1>
          <p></p>
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
      </section>
    </AppLayout>
  );
}
// #f2c97d  #b8860b #fdf1d7
