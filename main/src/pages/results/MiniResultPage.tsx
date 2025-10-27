import { QuickStartButton } from "@/components/buttons/QuickStartButton";
import { AppLayout } from "@/components/layout/AppLayout";
import type { ReactNode } from "react";
import { badges } from "../badge/badge";

// ここではテスト直後のミニ結果カードを仮で表示しておく
export default function MiniResultPage() {
  // 仮の成績データ。後で実際のテスト結果と差し替える予定
  const dummyResult = {
    title: "RESULT",
    accuracy: 92,
    studyTime: "8時間45分",
    mistakes: 18,
  };

  const palette = {
    base: "text-[#f5f6ff]",
    muted: "text-[#c7cada]",
    subtle: "text-[#9499b1]",
    accent: "text-[#f2c97d]",
    highlight: "text-[#f5f6ff]/80", // text-[#f7e2bd]
    positive: "text-[#9fe0c8]",
    negative: "text-[#f1a5b2]",
    caution: "text-[#f5d3a6]",
  } as const;

  const toneStyles = {
    positive: palette.positive,
    negative: palette.negative,
    caution: palette.caution,
    neutral: palette.highlight,
  } as const;

  type ToneKey = keyof typeof toneStyles;

  const summaryCards: Array<{
    label: string;
    value: ReactNode;
    tone?: ToneKey;
  }> = [
    {
      label: "セクション正答率",
      value: `${dummyResult.accuracy}%`,
      tone: "positive",
    },
    {
      label: "獲得バッジ",
      value: (
        <div className="flex flex-wrap gap-3">
          {badges.map(({ key, icon }) => (
            <span
              key={key}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-white/5">
              {icon}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "間違えた単語数",
      value: `${dummyResult.mistakes}`,
      tone: "negative",
    },
  ];

  const wrongWords: Array<{
    word: string;
    missCount: number;
    severity: ToneKey;
  }> = [
    { word: "accommodate", missCount: 2, severity: "negative" },
    { word: "negotiate", missCount: 2, severity: "negative" },
    { word: "implement", missCount: 1, severity: "negative" },
    { word: "perceive", missCount: 1, severity: "negative" },
    { word: "justify", missCount: 1, severity: "negative" },
    { word: "emphasize", missCount: 1, severity: "negative" },
  ];

  const rankInfo = {
    letter: "A",
    title: "AURORA KNIGHT",
    level: 15,
    nextXp: 350,
    gauge: 0.68,
    recentGain: 1250,
  };

  const r = 52;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(Math.max(dummyResult.accuracy / 100, 0), 1);
  const dashOffset = circumference * (1 - progress);
  // 画面からはみ出さないように、モバイルでは全体レイアウトを軽く縮小している
  const contentWrapperClass =
    "flex w-full max-w-[100vw] min-w-0 flex-col gap-6 pb-4 text-left text-[#f5f6ff] max-h-[calc(100dvh-4.5rem)] origin-top scale-[0.94] sm:scale-100 sm:gap-8 sm:pb-6";

  return (
    <AppLayout>
      <div className="relative  overflow-y-auto flex w-full justify-center px-4 sm:px-6 lg:px-8 select-none">
        <div className={contentWrapperClass}>
          <section className="w-full space-y-2">
            <h1 className="text-[#f2c97d] tracking-[1rem] text-center text-xl font-bold tracking-tight sm:text-3xl">
              {dummyResult.title}
            </h1>
            <span>
              <QuickStartButton
                onClick={() => {}}
                label="成績"
                className="!w-auto !px-3  !py-1 text-xs tracking-[0.2em] !float-right"
              />
              <QuickStartButton
                onClick={() => {}}
                label="ホーム"
                className="!w-auto !px-3 !py-1 text-xs tracking-[0.2em]"
              />
            </span>
          </section>

          <section className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
            {summaryCards.map(({ label, value, tone }) => {
              const toneClass = tone ? toneStyles[tone] : "";

              return (
                <div
                  key={label}
                  className="flex min-w-0 flex-col gap-2 rounded-2xl border border-white/10 bg-[#0f1524]/70 p-4">
                  <p className={`text-xs ${palette.muted} sm:text-sm`}>
                    {label}
                  </p>
                  <div
                    className={`text-2xl font-semibold tracking-tight sm:text-3xl ${toneClass}`}>
                    {value}
                  </div>
                </div>
              );
            })}
          </section>

          <section className="grid mb-0 w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0f1524]/70 p-5 lg:col-span-2">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2
                    className={`text-base font-semibold ${palette.highlight} sm:text-lg`}>
                    間違えた単語リスト
                  </h2>
                </div>
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 rounded-xl border border-[#f2c97d33] px-3 py-1.5 text-xs font-semibold ${palette.accent} transition hover:border-[#f2c97d] hover:text-[#f7e2bd] sm:px-4 sm:py-2 sm:text-sm`}>
                  <span aria-hidden="true">★</span>
                  弱点克服テスト
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {wrongWords.map(({ word, missCount, severity }) => {
                  const severityClass =
                    toneStyles[severity] ?? toneStyles.caution;

                  return (
                    <button
                      type="button"
                      key={word}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-[#050509]/80 px-3 py-2.5 text-left text-sm transition hover:border-[#f2c97d33] hover:bg-[#111424] sm:px-4 sm:py-3">
                      <span className={`font-medium ${palette.highlight}`}>
                        {word}
                      </span>
                      <span
                        className={`text-[11px] font-semibold sm:text-xs ${severityClass}`}>
                        {missCount}回ミス
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className={`mt-4 block w-full text-sm font-semibold ${palette.accent} transition hover:text-[#f7e2bd]`}>
                さらに表示...
              </button>
            </div>

            <div className="relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1524]/70 p-5">
              <div className="pointer-events-none absolute -right-24 -top-28 h-60 w-60 rounded-full bg-gradient-to-br from-[#f2c97d33] via-[#be8b381f] to-transparent blur-3xl" />
              <div className="pointer-events-none absolute inset-0 opacity-50">
                <div className="absolute inset-x-0 top-8 h-px bg-gradient-to-r from-transparent via-[#f2c97d33] to-transparent" />
              </div>

              <header className="relative mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p
                    className={`text-[11px] uppercase tracking-[0.6em] ${palette.subtle}`}>
                    現在のランク
                  </p>
                  <h2 className={`text-2xl font-semibold ${palette.highlight}`}>
                    {rankInfo.title}
                  </h2>
                  <p className={`text-xs ${palette.muted}`}>
                    次のランクまで{" "}
                    <span className={`font-semibold ${palette.accent}`}>
                      {rankInfo.nextXp} XP
                    </span>
                  </p>
                </div>
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center sm:mx-0">
                  <div className="absolute inset-0  bg-gradient-to-br from-[#fdf1d7] via-[#f2c97d] to-[#b8860b] opacity-80 blur-sm" />
                  <div className="relative flex h-full w-full items-center justify-center  border border-[#f2c97d55] bg-[#050509]/80 shadow-[0_0_28px_rgba(242,201,125,0.38)]">
                    <span
                      className={`absolute top-[15%] right-[26%] text-[0.55rem] tracking-[0.32em] ${palette.muted}`}>
                      RANK
                    </span>
                    <span
                      className={`text-4xl font-black ${palette.highlight} drop-shadow-[0_0_12px_rgba(242,201,125,0.65)]`}>
                      {rankInfo.letter}
                    </span>
                  </div>
                </div>
              </header>

              <div className="relative mx-auto flex h-40 w-40 items-center justify-center sm:h-44 sm:w-44">
                <svg
                  className="h-full w-full -rotate-90 transform text-[#1f2333]"
                  viewBox="0 0 140 140"
                  role="img"
                  aria-label={`レベル ${rankInfo.level}`}>
                  <circle
                    className="text-white/10 transition-opacity duration-500"
                    stroke="currentColor"
                    strokeWidth="12"
                    cx="70"
                    cy="70"
                    r={r}
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
                    r={r}
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span
                    className={`text-[0.6rem] tracking-[0.3em] ${palette.muted}`}>
                    LEVEL
                  </span>
                  <span className={`text-4xl font-semibold ${palette.accent}`}>
                    {rankInfo.level}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
