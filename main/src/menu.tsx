import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import "./index.css";
import { QuickStartButtonStyle } from "./App";
import { Modal } from "./components/Modal";

const MENU_ITEMS = [
  { label: "令和３年", path: "/components/test_3/main", modalKey: "reiwa3" },
  { label: "令和４年", path: "/components/test_4/main", modalKey: "reiwa4" },
  { label: "令和５年", path: "/components/test_5/main", modalKey: "reiwa5" },
  { label: "令和６年", path: "/components/test_6/main", modalKey: "reiwa6" },
  { label: "令和７年", path: "/components/test_7/main", modalKey: "reiwa7" },
] as const;

type MenuItem = (typeof MENU_ITEMS)[number];
type MenuModalKey = MenuItem["modalKey"];

export default function Menu() {
  const [openKey, setOpenKey] = useState<MenuModalKey | null>(null);
  const navigate = useNavigate();

  const activeItem = openKey
    ? MENU_ITEMS.find((item) => item.modalKey === openKey)
    : undefined;

  const modalContent = createModalContent(activeItem, {
    onStart() {
      if (!activeItem) {
        return;
      }
      setOpenKey(null);
      navigate(activeItem.path);
    },
  });

  return (
    <AppLayout>
      <div className="my-auto w-full max-w-4xl rounded-2xl bg-white/5">
        <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-[#0b0b13]/80 backdrop-blur-md">
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden px-8 py-10 text-center sm:gap-8 sm:px-12 sm:py-12">
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

type ModalContentOptions = {
  onStart: () => void;
};

function createModalContent(
  item: MenuItem | undefined,
  options: ModalContentOptions,
): ReactNode {
  if (!item) {
    return null;
  }

  return (
    <BasicModalContent
      yearLabel={item.label}
      startButtonLabel="開始する"
      description="この問題は共通テストの出題傾向から頻出語を抜粋した練習セットです。" // props化して後により詳細を柔軟に追加
      estimatedTime="終了目安は10分です。"
      onStart={options.onStart}
    />
  );
}
// TODO:　ここだけじゃなくて、interface型で統一する
type BasicModalContentProps = {
  yearLabel: string;
  description: string;
  estimatedTime: string;
  startButtonLabel: string;
  onStart: () => void;
};

//　Modalを直接作ってpropsで中身を変えられる
function BasicModalContent({
  yearLabel,
  description,
  estimatedTime,
  startButtonLabel,
  onStart,
}: BasicModalContentProps) {
  return (
    <div className="space-y-3 text-left">
      <h1 className="text-xl font-semibold text-[#f2c97d]">
        共通テスト　{yearLabel}
      </h1>
      <p className="text-sm text-white/80">{description}</p>
      <p className="text-sm text-white/80">{estimatedTime}</p>
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
