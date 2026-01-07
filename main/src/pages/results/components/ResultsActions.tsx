import { QuickStartButton } from "@/components/buttons/QuickStartButton";

interface ResultsActionsProps {
  onHome: () => void;
}

// 結果画面の固定アクション
export function ResultsActions({ onHome }: ResultsActionsProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-[6rem]">
      <QuickStartButton onClick={onHome} label="Home" />
    </div>
  );
}
