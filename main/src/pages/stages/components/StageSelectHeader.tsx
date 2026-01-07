interface StageSelectHeaderProps {
  yearLabel: string;
}

// 年度ラベルだけを表示するヘッダー
export function StageSelectHeader({ yearLabel }: StageSelectHeaderProps) {
  return (
    <div className="flex w-full items-center justify-end">
      <span className="text-xs uppercase tracking-[0.35em] text-white/40">
        {yearLabel}
      </span>
    </div>
  );
}
