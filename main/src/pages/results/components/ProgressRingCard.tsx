interface ProgressRingCardProps {
  ringSize: number;
  ringRadius: number;
  ringCircumference: number;
  strokeDashoffset: number;
  displayProgress: number;
  progress: number | null;
  solvedWords: number;
  totalWords: number;
}

// 進捗リングと達成状況の説明をまとめて表示するカード
export function ProgressRingCard({
  ringSize,
  ringRadius,
  ringCircumference,
  strokeDashoffset,
  displayProgress,
  progress,
  solvedWords,
  totalWords,
}: ProgressRingCardProps) {
  const remainingWords = Math.max(totalWords - solvedWords, 0);

  return (
    <div className="flex h-full rounded-3xl border border-white/10 bg-[#0f1524] p-6 shadow-[0_30px_60px_-35px_rgba(3,5,20,0.9)] backdrop-blur">
      {/* リングと説明文の並びを切り替えるためのラッパー */}
      <div className="flex flex-1 flex-col gap-8 lg:flex-row lg:items-stretch lg:items-center">
        <div className="flex h-full items-center justify-center">
          <div
            className="flex rounded-full p-4"
            style={{ width: ringSize + 16, height: ringSize + 16 }}
          >
            <svg
              width={ringSize}
              height={ringSize}
              viewBox={`0 0 ${ringSize} ${ringSize}`}
              role="img"
              aria-label="XP progress ring"
            >
              <defs>
                <linearGradient id="xp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f2c97d" stopOpacity="0.9">
                    <animate
                      attributeName="stop-color"
                      values="#f2c97d;#fff4cf;#f2c97d"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="50%" stopColor="#f6dda5">
                    <animate
                      attributeName="stop-color"
                      values="#f6dda5;#ffe7b0;#f6dda5"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="100%" stopColor="#f2c97d">
                    <animate
                      attributeName="stop-color"
                      values="#f2c97d;#ffd68f;#f2c97d"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </stop>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                fill="none"
                stroke="dimgray"
                strokeWidth={6}
                opacity={0.85}
              />
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                fill="none"
                stroke="url(#xp-gradient)"
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                filter="url(#glow)"
                className="transition-all duration-1000 ease-out"
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="central"
                fill="#f2c97d"
                fontSize="20"
              >
                {displayProgress}%
              </text>
            </svg>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center space-y-3 text-center lg:items-start lg:text-left">
          <p className="text-xs uppercase tracking-[0.6em] text-[#f2c97d]/80">MAIN QUEST</p>
          <h2 className="text-2xl font-semibold">On track to clear every question</h2>
          <p className="text-sm text-white/70">
            We keep stacking every word you solved. Completion rate is{" "}
            <span className="text-[#f2c97d]">{progress === 0 ? "Loading..." : progress}%</span>.
          </p>
          <div className="flex justify-center gap-2 text-xs text-white/70 sm:flex-wrap sm:gap-3 lg:justify-start">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Solved: {solvedWords.toLocaleString()} words
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Total questions: {totalWords.toLocaleString()} words
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Remaining: {remainingWords.toLocaleString()} words
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
