import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { WrongWordStat } from "../MiniResultPage";

type MiniResultPageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  wrongWords: WrongWordStat[];
};

const CLOSE_BUTTON_CLASS =
  "rounded-xl bg-[#f2c97d] px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-[#f6dda5]";

const RESULTS_BUTTON_CLASS =
  "rounded-xl border border-[#f2c97d55] px-5 py-2 text-sm font-semibold text-[#f2c97d] transition hover:border-[#f2c97d] hover:text-[#f6dda5]";

const LIST_ITEM_CLASS =
  "flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3";

export default function MiniResultPageModal({
  isOpen,
  onClose,
  wrongWords,
}: MiniResultPageModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!modalRef.current) return;
      if (modalRef.current.contains(event.target as Node)) return;
      onClose();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavigateToResults = () => {
    onClose();
    navigate("/results");
  };

  return (
    <>
      <div className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm" />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
        <div
          ref={modalRef}
          className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#080b16] p-7 text-white shadow-[0_32px_90px_-24px_rgba(8,12,32,0.92)]">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-[#f2c97d]">
              間違えた単語リスト
            </h1>
            <p className="mt-1 text-sm text-white/60">
              全 {wrongWords.length} 語
            </p>
          </header>
          <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1 text-sm text-white/75">
            {wrongWords.length === 0 ? (
              <p className="text-white/60">
                今回は間違えた単語がありませんでした。
              </p>
            ) : (
              <ul className="space-y-2">
                {wrongWords.map(({ word, meaning }) => (
                  <li key={word} className={LIST_ITEM_CLASS}>
                    <span className="font-semibold text-[#f2c97d]">{word}</span>
                    <span className="text-xs text-white/70">{meaning}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              className={RESULTS_BUTTON_CLASS}
              onClick={handleNavigateToResults}>
              結果ページへ
            </button>
            <button
              type="button"
              className={CLOSE_BUTTON_CLASS}
              onClick={onClose}>
              閉じる
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
