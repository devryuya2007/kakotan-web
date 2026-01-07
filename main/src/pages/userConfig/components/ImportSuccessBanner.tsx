// 成功メッセージを受け取るための型
interface ImportSuccessBannerProps {
  message: string | null;
}

// インポート成功時に表示する固定バナー
export function ImportSuccessBanner({ message }: ImportSuccessBannerProps) {
  // メッセージがないときは何も描画しない
  if (!message) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-50 border-b border-emerald-300/30 bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-50 shadow-[0_8px_20px_rgba(16,185,129,0.35)] backdrop-blur">
      {/* 中央にテキストを寄せて目立たせる */}
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center gap-4">
        {message}
      </div>
    </div>
  );
}
