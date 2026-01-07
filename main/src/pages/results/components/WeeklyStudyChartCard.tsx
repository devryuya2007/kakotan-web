import type { ChartData, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";

interface WeeklyStudyChartCardProps {
  lineChartData: ChartData<"line">;
  lineChartOptions: ChartOptions<"line">;
  averageDailyMinutes: number;
}

// 週間学習時間のグラフを表示するカード
export function WeeklyStudyChartCard({
  lineChartData,
  lineChartOptions,
  averageDailyMinutes,
}: WeeklyStudyChartCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0f1524] p-6 shadow-[0_25px_40px_-30px_rgba(5,8,20,0.9)]">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[#f2c97d]/80">WEEKLY PULSE</p>
          <h2 className="text-xl font-semibold">Weekly study time</h2>
        </div>
        <p className="text-sm text-white/70">Daily avg {averageDailyMinutes} min</p>
      </div>
      <div className="mt-4 h-64 min-h-[18rem] sm:min-h-[20rem] lg:min-h-[22rem]">
        <Line data={lineChartData} options={lineChartOptions} />
      </div>
      <p className="mt-2 text-xs text-white/60">
        Plotting the latest 7-day trend from sessionHistory.
      </p>
    </div>
  );
}
