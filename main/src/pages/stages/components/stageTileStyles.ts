interface StageLabelStyleInput {
  isLocked: boolean;
  isCleared: boolean;
}

interface StageIconColorInput {
  variant: "default" | "locked" | "active" | "cleared";
  primaryColor: string;
  primaryDeep: string;
  primaryGlow: string;
}

interface StageIconColors {
  isLocked: boolean;
  isActive: boolean;
  isCleared: boolean;
  fillBase: string;
  fillDeep: string;
  glowColor: string;
}

const LABEL_BASE_CLASS = "mt-2 text-[11px] font-semibold uppercase tracking-[0.2em]";

const getLabelToneClass = ({ isLocked, isCleared }: StageLabelStyleInput) => {
  if (isCleared) return "text-emerald-300";
  if (isLocked) return "text-[#f2c97d]/50";
  return "text-[#f2c97d]";
};

export const getStageLabelClass = (input: StageLabelStyleInput) =>
  `${LABEL_BASE_CLASS} ${getLabelToneClass(input)}`;

const LOCKED_BASE = "#b19662";
const LOCKED_DEEP = "#8a6f42";
const CLEARED_BASE = "#8fe3b3";
const CLEARED_DEEP = "#4fbf7d";

export const getStageIconColors = ({
  variant,
  primaryColor,
  primaryDeep,
  primaryGlow,
}: StageIconColorInput): StageIconColors => {
  const isLocked = variant === "locked";
  const isActive = variant === "active";
  const isCleared = variant === "cleared";

  const fillBase = isCleared ? CLEARED_BASE : isLocked ? LOCKED_BASE : primaryColor;
  const fillDeep = isCleared ? CLEARED_DEEP : isLocked ? LOCKED_DEEP : primaryDeep;
  const glowColor = isCleared ? "rgba(112, 230, 176, 0.55)" : primaryGlow;

  return { isLocked, isActive, isCleared, fillBase, fillDeep, glowColor };
};

export const getStageButtonClass = (isLocked: boolean) =>
  `button-pressable group flex flex-col items-center justify-start transition-all duration-300 ${
    isLocked ? "cursor-not-allowed" : "hover:-translate-y-1"
  }`;
