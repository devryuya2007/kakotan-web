import { AppLayout } from "@/components/layout/AppLayout";

// ここではテスト直後のミニ結果カードを仮で表示しておく
export default function MiniResultPage() {
  // 仮の成績データ。後で実際のテスト結果と差し替える予定
  const dummyResult = {
    title: "RESULT",
    correctCount: 15,
    totalCount: 20,
  };

  const accuracy =
    dummyResult.totalCount === 0
      ? 0
      : Math.round((dummyResult.correctCount / dummyResult.totalCount) * 100);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const progressOffset =
    circumference * (1 - (accuracy === 0 ? 0 : accuracy / 100));

  return (
    <AppLayout>
      <div className="relative flex items-center justify-center px-12">
        <div className="flex h-[90vh] w-[90vw] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0b0b13]/90 p-6 text-center text-white shadow-[0_25px_55px_-40px_rgba(242,201,125,0.35)] backdrop-blur-sm sm:p-10">
          <p className="text-xs uppercase tracking-[0.4em] text-[#f2c97d]/60">
            {dummyResult.title}
          </p>
          <div className="flex items-center gap-6">
            <div className="relative flex h-40 w-40 items-center justify-center">
              <svg
                className="h-full w-full -rotate-90 transform text-[#1f2333]"
                viewBox="0 0 140 140"
                role="img"
                aria-label={`正答率 ${accuracy}%`}>
                <circle
                  className="text-white/10"
                  stroke="currentColor"
                  strokeWidth="12"
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                />
                <circle
                  className="text-[#f2c97d]"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={progressOffset}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-3xl font-semibold text-[#f2c97d]">
                {accuracy}%
              </span>
            </div>
            <div className="grid w-full grid-cols-2 grid-rows-2 gap-4 p-8">
              <section className="col-span-2 rounded-xl border border-white/5 bg-white/5 p-4 text-white">
                <h1>
                  {dummyResult.correctCount} / {dummyResult.totalCount}
                </h1>
                <p className="text-sm text-slate-200">正答率</p>
              </section>
              <section className="p-4 rounded-xl border border-white/5 bg-[#141826] text-slate-100">
                <h1>ランクA</h1>
                <p>経験値10GET</p>
              </section>
              <section className="p-4 rounded-xl border border-white/5 bg-[#0f1524] text-blue-100">
                <h1>タイム</h1>
                <p>33.4秒</p>
              </section>
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-white">
            {dummyResult.correctCount} / {dummyResult.totalCount}
          </h1>
          <p className="mt-2 text-sm text-white/70">
            ざっくり正答数を表示しているだけの仮カードだよ。
            <br />
            本実装ではここに詳細ボタンや復習導線を置く予定。
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
