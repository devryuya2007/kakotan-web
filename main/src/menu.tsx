const MENU_BUTTON_LABELS = [
  "令和７年",
  "令和６年",
  "令和５年",
  "令和４年",
  "令和３年",
];

type MenuProps = {
  BodyStyle: string;
};

type MenuButtonProps = {
  label: string;
};

type MenuSection = {
  id: string;
  title: string;
  description?: string;
  buttons: MenuButtonProps[];
};

const MENU_SECTIONS: MenuSection[] = [
  {
    id: "by-year",
    title: "年度で探す",
    description: "必要な年度を選択して、関連するコンテンツへアクセスできます。",
    buttons: MENU_BUTTON_LABELS.map((label) => ({ label })),
  },
];

export const BodyStyle =
  "flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b0b13] to-[#1a1a23] p-4";

export default function Menu({ BodyStyle }: MenuProps) {
  return (
    <div className={BodyStyle}>
      <h1 className="select-none text-2xl font-semibold tracking-widest text-[#f2c97d] sm:text-3xl">
        Menu Page
      </h1>
      <p className="text-[#f2c97d]/80 select-none">
        メニュー画面のコンテンツは準備中です。
      </p>
      <section className="mt-8 flex w-full max-w-4xl flex-col gap-6">
        {MENU_SECTIONS.map(({ id, title, description, buttons }) => (
          <article
            key={id}
            className="rounded-2xl border border-[#f2c97d1f] bg-white/5 p-6 shadow-[0_20px_45px_-25px_rgba(0,0,0,0.75)]"
          >
            <header className="space-y-1">
              <h2 className="select-none text-xl font-semibold text-[#f2c97d] sm:text-2xl">
                {title}
              </h2>
              {description ? (
                <p className="text-sm text-[#f2c97d]/60">{description}</p>
              ) : null}
            </header>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {buttons.map(({ label }, index) => (
                <div
                  key={`${id}-${label}-${index}`}
                  className="flex flex-col gap-3 rounded-xl border border-[#f2c97d1a] bg-[#10101a] p-4"
                >
                  <MenuButton label={label} />
                  {/* 他の要素をここに追加 */}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export const MenuButton = ({ label }: MenuButtonProps) => (
  <button className="w-full rounded border border-[#f2c97d33] px-6 py-2 text-xl text-[#f2c97d]/80 transition hover:border-[#f2c97d66]">
    {label}
  </button>
);
