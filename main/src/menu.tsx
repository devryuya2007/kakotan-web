import { AppLayout } from "./components/AppLayout";
import "./index.css";
import { QuickStartButtonStyle } from "./App";
import { Modal } from "./components/test_7/Modal";

const MENU_BUTTON_LABELS = [
  { label: "令和３年", path: "/components/test_3/main" },
  { label: "令和４年", path: "/components/test_4/main" },
  { label: "令和５年", path: "/components/test_5/main" },
  { label: "令和６年", path: "/components/test_6/main" },
  { label: "令和７年", path: "/components/test_7/main" },
];

interface MenuButtonProps {
  label: string;
  // onClick?: () => void;
  className: string;
  Modal: any;
  index: string;
}

export const BodyStyle =
  "flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b0b13] to-[#1a1a23] p-4";

export default function Menu() {
  return (
    <AppLayout>
      <div className=" my-auto w-full max-w-4xl rounded-2xl  bg-white/5 ">
        <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-[#0b0b13]/80 backdrop-blur-md">
          <div className="flex text-center min-h-0 flex-1 flex-col gap-6 overflow-hidden px-8 py-10 sm:gap-8 sm:px-12 sm:py-12">
            <header className="space-y-8">
              <h1 className="select-none text-2xl font-semibold tracking-widest text-[#f2c97d] sm:text-3xl">
                SELECT
              </h1>
              <p className="text-sm text-[#f2c97d]/70 select-none">
                出題範囲を選んでください。
              </p>
            </header>

            <section>
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {MENU_BUTTON_LABELS.map(({ label, index }, onClick) => (
                  <MenuButton
                    className={QuickStartButtonStyle}
                    key={label + index}
                    label={label}
                    onClick={}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const ToModal = ({ open, onClose, children }: ModalProps) => {
  Modal;
};

export const MenuButton = ({ label, Modal }: MenuButtonProps) => (
  <button type="button" onClick={Modal} className={QuickStartButtonStyle}>
    {label}
  </button>
);

export function ButtonWrapStyle() {
  return <div></div>;
}
