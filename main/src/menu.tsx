export default function Menu({ BodyStyle }: { BodyStyle: string }) {
  const buttons = Array.from({ length: 3 }, (_, index) => ({
    id: index,
    label: "Menu Page",
  }));

  return (
    <div className={BodyStyle}>
      <h1 className="text-2xl font-semibold tracking-widest text-[#f2c97d] sm:text-3xl">
        Menu Page
      </h1>
      <p className="text-[#f2c97d]/80 select-none">
        メニュー画面のコンテンツは準備中です。
      </p>
      <div className="mt-4 flex flex-col items-center gap-3">
        {buttons.map((button) => (
          <button
            key={button.id}
            className="rounded border border-[#f2c97d33] px-6 py-2 text-[#f2c97d]/80 text-xl select-none transition hover:border-[#f2c97d66]"
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export const BodyStyle = () => {
  return "flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b0b13] to-[#1a1a23] p-4";
};

export const LayoutStyle = () => {
  return <div></div>;
};
