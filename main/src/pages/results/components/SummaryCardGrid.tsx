interface SummaryCardEntry {
  icon: string;
  title: string;
  value: string;
  caption: string;
  fullSpan?: boolean;
}

interface SummaryCardGridProps {
  cards: SummaryCardEntry[];
  iconSize: number;
}

// 学習サマリーのカード一覧をまとめて描画する
export function SummaryCardGrid({ cards, iconSize }: SummaryCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
      {cards.map(({ icon, title, value, caption, fullSpan }) => (
        <div
          key={title}
          className={`rounded-2xl border border-white/10 bg-[#0f1524] p-4 shadow-[0_18px_30px_-24px_rgba(2,6,23,0.9)] transition hover:-translate-y-1 hover:border-[#f2c97d]/60 hover:bg-[#141b2d] ${
            fullSpan ? "sm:col-span-2 lg:col-span-1" : ""
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <img
              src={icon}
              alt={`${title} icon`}
              width={iconSize}
              height={iconSize}
              className="rounded-full border border-white/10 bg-[#050917] p-2"
            />
            <div>
              <p className="py-2 text-xs uppercase tracking-[0.3em] text-white/60">
                {title}
              </p>
              <p className="text-2xl font-semibold text-white">{value}</p>
            </div>
          </div>
          <p className="mt-3 pl-4 text-center text-sm text-white/60">{caption}</p>
        </div>
      ))}
    </div>
  );
}
