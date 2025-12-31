import {
  QuickStartButton,
  QuickStartButtonStyle,
} from "../../components/buttons/QuickStartButton";
import {AppLayout} from "../../components/layout/AppLayout";

import {useEffect, useState} from "react";

import {useNavigate} from "react-router-dom";

import {yearRegistry} from "@/data/yearRegistry";

import "../../index.css";

// 年度ごとのステージ一覧へ進むためのメニュー
const MENU_ITEMS = yearRegistry.map((entry) => ({
  label: entry.label,
  path: `/stages/${entry.key}`,
}));

export default function MenuPage() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => {
      cancelAnimationFrame(raf);
      setIsVisible(false);
    };
  }, []);

  // メニューからステージ一覧へ遷移する
  const handleSelect = (path: string) => {
    navigate(path);
  };

  return (
    <AppLayout>
      <div
        className={`my-auto w-full max-w-4xl transform-gpu rounded-2xl transition-all duration-500 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="flex h-full w-full flex-col gap-8 rounded-2xl px-8 py-10 text-center sm:gap-10 sm:px-12 sm:py-12">
          <header className="space-y-8">
            <h1 className="select-none text-2xl font-semibold tracking-widest text-[#f2c97d] sm:text-3xl">
              SELECT
            </h1>
            <p className="select-none text-sm text-[#f2c97d]/70">
              Choose a year to move on to the stages.
            </p>
            {/* Resultsボタンは右下固定なのでここでは表示しない */}
          </header>

          {/* 年度ごとのステージ入口 */}
          <section>
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
              {MENU_ITEMS.map(({label, path}) => (
                <MenuButton
                  key={label}
                  label={label}
                  onSelect={() => handleSelect(path)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
      <div className="fixed bottom-6 right-6 w-[6rem]">
        <QuickStartButton onClick={() => navigate("/")} label="Home" />
      </div>
    </AppLayout>
  );
}

interface MenuButtonProps {
  label: string;
  onSelect: () => void;
}

function MenuButton({label, onSelect}: MenuButtonProps) {
  return (
    <button type="button" onClick={onSelect} className={QuickStartButtonStyle}>
      {label}
    </button>
  );
}

// モーダルはステージ一覧側で出すので、メニューは移動だけにする
