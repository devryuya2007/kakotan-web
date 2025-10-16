import { useNavigate } from "react-router-dom";

const MENU_BUTTON_LABELS = [
  { label: "令和７年", path: "/components/test_7/main" },
  { label: "令和６年", path: "/components/test_6/main" },
  { label: "令和５年", path: "/components/test_5/main" },
  { label: "令和４年", path: "/components/test_4/main" },
  { label: "令和３年", path: "/components/test_3/main" },
];

type MenuProps = {
  BodyStyle: string;
};

type MenuButtonProps = {
  label: string;
  onClick?: () => void;
};

export const BodyStyle =
  "flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b0b13] to-[#1a1a23] p-4";

export default function Menu({ BodyStyle }: MenuProps) {
  const navigate = useNavigate();

  // const useImperativeHandleLists: string[] = [
  //   "/components/test_7/main",
  //   "/components/test_6/main",
  //   "/components/test_5/main",
  //   "/components/test_4/main",
  //   "/components/test_3/main",
  // ];

  return (
    <div className={BodyStyle}>
      <h1 className="select-none text-2xl font-semibold tracking-widest text-[#f2c97d] sm:text-3xl">
        Menu Page
      </h1>
      <p className="text-[#f2c97d]/80 select-none">
        メニュー画面のコンテンツは準備中です。
      </p>
      <section className="bg-white/5">
        <div className="h-16 mt-4 flex flex-row items-center gap-3">
          {MENU_BUTTON_LABELS.map(({ label, path }: MENU_BUTTON_LABELS) => (
            <MenuButton key={`${label}`} label={label} onClick={navigate} />
          ))}
        </div>
      </section>
    </div>
  );
}

export const MenuButton = ({ label, onClick }: MenuButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded border border-[#f2c97d33] px-6 py-2 text-[#f2c97d]/80 text-xl select-none transition hover:border-[#f2c97d66]">
    {label}
  </button>
);
