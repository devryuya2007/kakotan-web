import type { ReactNode } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  content: ReactNode;
};

export function Modal({ open, onClose, content }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <ModalShell onClose={onClose} content={content} />,
    document.body
  );
}

type ModalShellProps = {
  onClose: () => void;
  content: ReactNode;
};

function ModalShell({ onClose, content }: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 select-none">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        role="presentation"
      />
      <div className="absolute inset-0 grid place-items-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-[#f2c97d1a] bg-[#0b0b13] p-6 shadow-[0_20px_45px_-25px_rgba(0,0,0,0.75)]">
          {content}
        </div>
      </div>
    </div>
  );
}
