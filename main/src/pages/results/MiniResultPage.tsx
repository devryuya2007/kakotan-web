import { AppLayout } from "@/components/layout/AppLayout";

// ここではテスト直後のミニ結果カードを仮で表示しておく
export default function MiniResultPage() {
  // 仮の成績データ。後で実際のテスト結果と差し替える予定
  const dummyResult = {
    title: "今日のミニ結果",
    correctCount: 15,
    totalCount: 20,
  };

  return (
    <AppLayout>
      <div className="flex h-dvh w-full items-center justify-center px-6">
        <div className="max-w-full max-h-full flex-1 rounded-2xl border border-white/10 bg-[#0b0b13]/90 p-6 text-center text-white shadow-[0_25px_55px_-40px_rgba(242,201,125,0.35)] backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-[#f2c97d]/60">
            {dummyResult.title}
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-[#f2c97d]">
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
