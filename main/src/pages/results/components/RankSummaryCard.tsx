import { calculateLevelProgress } from "@/features/results/scoring";

interface RankSummaryCardProps {
  levelProgress:
    | ReturnType<typeof calculateLevelProgress>
    | { progressRatio: number; xpTillNextLevel: number; level: number };
  variant?: "default" | "results";
}

const letterCalculate = (level: number) => {
  if (level >= 99) return "SS";
  if (level >= 90) return "S";
  if (level >= 70) return "A";
  if (level >= 50) return "B";
  if (level >= 30) return "C";
  if (level >= 10) return "D";
  return "E";
};

export function RankSummaryCard({
  levelProgress,
  variant = "default",
}: RankSummaryCardProps) {
  const { level, xpTillNextLevel, progressRatio } = levelProgress;
  const dashRadius = 52;
  const circumference = 2 * Math.PI * dashRadius;
  const dashOffset = circumference * (1 - progressRatio);
  const rankLetter = letterCalculate(level);
  const backgroundClass =
    variant === "results" ? "bg-[#0f1524]" : "bg-[#0f1524]/70";

  return (
    <div
      className={`relative min-w-0 overflow-hidden rounded-2xl border border-white/10 ${backgroundClass} p-5 shadow-[0_20px_45px_-35px_rgba(5,8,20,0.9)]`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-[#ffffff08] to-transparent opacity-70" />
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute inset-x-0 top-8 h-px bg-gradient-to-r from-transparent via-[#f2c97d33] to-transparent" />
      </div>

      <header className="relative mb-6 flex flex-col gap-4 text-center sm:text-left">
        <p className="text-[11px] uppercase tracking-[0.6em] text-[#f2c97d]/70">
          Current rank
        </p>
        <h2 className="text-2xl font-semibold text-[#f2c97d]">
          AURORA KNIGHT
        </h2>
        <p className="text-xs text-white/70">
          To next rank{" "}
          <span className="font-semibold text-[#f2c97d]">
            {xpTillNextLevel} XP
          </span>
        </p>
      </header>

      <div className="relative mx-auto flex h-24 w-24 items-center justify-center sm:mx-0 lg:absolute lg:right-5 lg:top-5 lg:mx-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fdf1d7] via-[#f2c97d] to-[#b8860b] opacity-80 blur-sm" />
        <div className="relative flex h-full w-full items-center justify-center border border-[#f2c97d55] bg-[#050509]/80 shadow-[0_0_28px_rgba(242,201,125,0.38)]">
          <span className="absolute right-[24%] top-[14%] text-[0.6rem] tracking-[0.32em] text-white/60">
            RANK
          </span>
          <span className="text-5xl font-black text-[#f2c97d] drop-shadow-[0_0_12px_rgba(242,201,125,0.65)]">
            {rankLetter}
          </span>
        </div>
      </div>

      <div className="relative mx-auto mt-6 flex h-40 w-40 items-center justify-center sm:h-44 sm:w-44">
        <svg
          className="h-full w-full -rotate-90 transform text-[#1f2333]"
          viewBox="0 0 140 140"
          role="img"
          aria-label={`Level ${level}`}
        >
          <circle
            className="text-white/10 transition-opacity duration-500"
            stroke="currentColor"
            strokeWidth="12"
            cx="70"
            cy="70"
            r={dashRadius}
            fill="transparent"
          />
          <circle
            className="text-[#f2c97d] transition-all duration-700 ease-out"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            cx="70"
            cy="70"
            r={dashRadius}
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-[0.6rem] tracking-[0.3em] text-white/60">
            LEVEL
          </span>
          <span className="text-4xl font-semibold text-[#f2c97d]">
            {level}
          </span>
        </div>
      </div>
    </div>
  );
}
