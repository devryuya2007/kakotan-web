import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../index.css";
import { QuickStartButtonStyle } from "../../components/buttons/QuickStartButton";
import { AppLayout } from "../../components/layout/AppLayout";
import { Modal } from "../../components/modal/Modal";

const MENU_ITEMS = [
  { label: "令和３年", path: "/tests/reiwa3", modalKey: "reiwa3" },
  { label: "令和４年", path: "/tests/reiwa4", modalKey: "reiwa4" },
  { label: "令和５年", path: "/tests/reiwa5", modalKey: "reiwa5" },
  { label: "令和６年", path: "/tests/reiwa6", modalKey: "reiwa6" },
  { label: "令和７年", path: "/tests/reiwa7", modalKey: "reiwa7" },
] as const;

type MenuItem = (typeof MENU_ITEMS)[number];
type MenuModalKey = MenuItem["modalKey"];

const QUESTION_COUNTS: Record<MenuModalKey, number> = {
  reiwa3: 1000,
  reiwa4: 1200,
  reiwa5: 1100,
  reiwa6: 1300,
  reiwa7: 1400,
};

export default function MenuPage() {
  const [openKey, setOpenKey] = useState<MenuModalKey | null>(null);
  const navigate = useNavigate();

  const activeItem = openKey
    ? MENU_ITEMS.find((item) => item.modalKey === openKey)
    : undefined;

  const handleStart = () => {
    if (!activeItem) {
      return;
    }

    setOpenKey(null);
    navigate(activeItem.path);
  };

  const modalContent = activeItem ? (
    <BasicModalContent
      yearLabel={activeItem.label}
      startButtonLabel="開始する"
      description="この問題は共通テストの出題傾向から頻出語を抜粋した練習セットです。" // props化して後により詳細を柔軟に追加
      estimatedTime="終了目安は10分です。"
      questionSummary={getQuestionSummary(activeItem)}
      onStart={handleStart}
    />
  ) : null;

  return (
    <AppLayout>
      <div className="my-auto w-full max-w-4xl rounded-2xl">
        <div className="flex h-full w-full flex-col gap-8 rounded-2xl px-8 py-10 text-center sm:gap-10 sm:px-12 sm:py-12">
          <header className="space-y-8">
            <h1 className="select-none text-2xl font-semibold tracking-widest text-[#f2c97d] sm:text-3xl">
              SELECT
            </h1>
            <p className="select-none text-sm text-[#f2c97d]/70">
              出題範囲を選んでください。
            </p>
          </header>

          <section>
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
              {MENU_ITEMS.map(({ label, modalKey }) => (
                <MenuButton
                  key={modalKey}
                  label={label}
                  onSelect={() => setOpenKey(modalKey)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <Modal
        open={Boolean(activeItem)}
        onClose={() => setOpenKey(null)}
        content={modalContent}
      />
    </AppLayout>
  );
}

type MenuButtonProps = {
  label: string;
  onSelect: () => void;
};

function MenuButton({ label, onSelect }: MenuButtonProps) {
  return (
    <button type="button" onClick={onSelect} className={QuickStartButtonStyle}>
      {label}
    </button>
  );
}

type BasicModalContentProps = {
  yearLabel: string;
  description: string;
  estimatedTime: string;
  startButtonLabel: string;
  onStart: () => void;
  questionSummary: string | null;
};

// Modalを直接作ってpropsで中身を変えられる
function BasicModalContent({
  yearLabel,
  description,
  estimatedTime,
  startButtonLabel,
  onStart,
  questionSummary,
}: BasicModalContentProps) {
  return (
    <div className="space-y-3 text-left">
      <h1 className="text-xl font-semibold text-[#f2c97d]">
        共通テスト　{yearLabel}
      </h1>
      <p className="text-sm text-white/80">{description}</p>
      <p className="text-sm text-white/80">{estimatedTime}</p>
      {questionSummary ? (
        <p className="text-sm text-white/80">{questionSummary}</p>
      ) : null}
      <div className="pt-2 text-right">
        <button
          type="button"
          className={QuickStartButtonStyle}
          onClick={onStart}
        >
          {startButtonLabel}
        </button>
      </div>
    </div>
  );
}

function getQuestionSummary(item: MenuItem): string | null {
  const count = QUESTION_COUNTS[item.modalKey];
  if (!count) {
    return null;
  }

  return `総問題数は${count}問です。`;
}
