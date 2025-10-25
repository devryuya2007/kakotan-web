export const QuickStartButtonStyle =
  "btn-text-glow w-full rounded-full border border-[#f2c97d66] bg-[#14141f] text-sm font-semibold tracking-[0.3em] text-[#f2c97d] shadow-[0_0_25px_rgba(242,201,125,0.25)] transition hover:border-[#f2c97d] hover:bg-[#1c1c2a] hover:shadow-[0_0_35px_rgba(242,201,125,0.35)]";

interface QuickStartButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function QuickStartButton({
  onClick,
  label = "QUICK START",
  className,
}: QuickStartButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${QuickStartButtonStyle} ${className ?? ""}`}>
      {label}
    </button>
  );
}
