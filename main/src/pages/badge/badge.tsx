import type { ReactNode } from "react";

type BadgeDefinition = {
  key: string;
  icon: ReactNode;
};

export const badges: BadgeDefinition[] = [
  {
    key: "lunar-orbit",
    icon: (
      <svg
        viewBox="0 0 48 48"
        role="img"
        aria-label="ルナバッジ"
        className="h-10 w-10 text-[#f2c97d]">
        <circle cx="24" cy="24" r="18" fill="currentColor" opacity="0.2" />
        <circle
          cx="24"
          cy="24"
          r="12"
          fill="currentColor"
          className="text-[#f7e2bd]"
        />
        <circle cx="30" cy="18" r="4" fill="white" opacity="0.6" />
      </svg>
    ),
  },
  {
    key: "aurora-peak",
    icon: (
      <svg
        viewBox="0 0 48 48"
        role="img"
        aria-label="オーロラバッジ"
        className="h-10 w-10 text-[#f2c97d]">
        <polygon points="24 8 8 40 40 40" fill="currentColor" opacity="0.2" />
        <polygon
          points="24 12 12 38 36 38"
          fill="currentColor"
          className="text-[#f7e2bd]"
        />
        <circle cx="24" cy="24" r="3" fill="white" opacity="0.65" />
      </svg>
    ),
  },
];
