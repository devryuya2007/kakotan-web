interface StageLoadingOverlayProps {
  isVisible: boolean;
}

// ステージ読み込み中のオーバーレイ
export function StageLoadingOverlay({ isVisible }: StageLoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-[#0b0b13]/60 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Loading stages"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-[#67e8f9]" />
        <span className="text-sm uppercase tracking-[0.3em] text-white/70">
          Loading...
        </span>
      </div>
    </div>
  );
}
