import type { ReactNode } from "react";

interface MiniResultSummaryCardProps {
  label: string;
  value: ReactNode;
  mutedClass: string;
  toneClass?: string;
}

// ミニ結果ページのサマリーカードを1枚分だけ表示する
export function MiniResultSummaryCard({
  label,
  value,
  mutedClass,
  toneClass = "",
}: MiniResultSummaryCardProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-2xl border border-white/10 bg-[#0f1524] p-4">
      <p className={`text-xs ${mutedClass} sm:text-sm`}>{label}</p>
      <div
        className={`text-2xl font-semibold tracking-tight sm:text-3xl ${toneClass}`}
      >
        {value}
      </div>
    </div>
  );
}
