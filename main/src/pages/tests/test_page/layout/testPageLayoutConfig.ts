// テスト画面のレイアウトや見た目に関する定数をまとめる
export interface CardPresentation {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

export const REVIEW_DURATION = 800;
export const TRANSITION_DURATION = 400;
export const TOAST_DELAY = 0;
export const TOAST_DURATION = 800;

export const BASE_LAYOUTS: CardPresentation[] = [
  { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 40 },
  { x: -6, y: -4, scale: 0.94, opacity: 0.9, zIndex: 30 },
  { x: -12, y: -7, scale: 0.88, opacity: 0.7, zIndex: 20 },
  { x: -18, y: -11, scale: 0.82, opacity: 0, zIndex: 10 },
];

export const TRANSITION_LAYOUTS: CardPresentation[] = [
  { x: 14, y: 12, scale: 1.02, opacity: 0, zIndex: 5 },
  BASE_LAYOUTS[0],
  BASE_LAYOUTS[1],
  { x: -12, y: -7, scale: 0.88, opacity: 0.72, zIndex: 22 },
];

export const SMALL_BASE_LAYOUTS: CardPresentation[] = [
  { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 40 },
  { x: 0, y: -4, scale: 0.94, opacity: 0.9, zIndex: 30 },
  { x: 0, y: -8, scale: 0.88, opacity: 0.7, zIndex: 20 },
  { x: 0, y: -10, scale: 0.82, opacity: 0, zIndex: 10 },
];

export const SMALL_TRANSITION_LAYOUTS: CardPresentation[] = [
  { x: 0, y: 12, scale: 1.02, opacity: 0, zIndex: 5 },
  SMALL_BASE_LAYOUTS[0],
  SMALL_BASE_LAYOUTS[1],
  SMALL_BASE_LAYOUTS[2],
];

// カードの見た目を切り替えるためのレイアウトを選ぶ
export const getCardPresentation = (
  index: number,
  isSmall: boolean,
  useTransitionLayouts: boolean
): CardPresentation => {
  const desktopLayouts = useTransitionLayouts ? TRANSITION_LAYOUTS : BASE_LAYOUTS;
  const mobileLayouts = useTransitionLayouts ? SMALL_TRANSITION_LAYOUTS : SMALL_BASE_LAYOUTS;
  const layouts = isSmall ? mobileLayouts : desktopLayouts;
  const clampedIndex = Math.min(index, layouts.length - 1);
  return layouts[clampedIndex];
};

// ボタンとトーストの見た目に使うクラス
export const BASE_BUTTON_STYLE =
  "button-pressable group relative w-full rounded-xl border border-white/15 bg-[radial-gradient(circle_at_top,#1a1c26,#070811)]/90 px-5 py-4 text-center text-base font-medium tracking-wide text-white/85 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-1 hover:border-[#f2c97d]/70 hover:bg-[radial-gradient(circle_at_top,#202333,#0d101c)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2c97d]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

export const CORRECT_BUTTON_STYLE =
  "button-pressable w-full rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-200 px-5 py-4 text-center text-base font-semibold tracking-wide text-slate-900 shadow-[0_22px_48px_-20px_rgba(251,191,36,0.9)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_55px_-18px_rgba(251,191,36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

export const INCORRECT_BUTTON_STYLE =
  "button-pressable w-full rounded-xl border border-rose-500/60 bg-gradient-to-br from-rose-600 via-rose-500 to-rose-400 px-5 py-4 text-center text-base font-semibold tracking-wide text-rose-50 shadow-[0_18px_38px_-18px_rgba(244,63,94,0.85)] transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

export const TOAST_BASE_CLASS =
  "absolute z-[9999] flex h-[28px] w-[72px] items-center justify-center rounded-xl border text-[12px] font-semibold shadow-[0_10px_24px_rgba(0,0,0,0.35)] pointer-events-none";

export const CORRECT_TOAST_CLASS = "border-emerald-200/80 bg-emerald-500/90 text-emerald-50";
export const INCORRECT_TOAST_CLASS = "border-rose-200/80 bg-rose-500/90 text-rose-50";
