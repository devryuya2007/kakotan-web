export default function Menu({ BodyStyle }: { BodyStyle: string }) {
  return (
    <div className={BodyStyle}>
      <h1 className="text-2xl font-semibold tracking-widest text-[#f2c97d] sm:text-3xl">
        Menu Page
      </h1>
      <p className="text-[#f2c97d]/80 select-none">メニュー画面のコンテンツは準備中です。</p>
      <button className="text-[#f2c97d]/80 text-2xl select-none">Menu Page</button>
    </div>
  );
}

export const BodyStyle = () => {
  return "flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b0b13] to-[#1a1a23] p-4";
};

export const LayoutStyle = () => {
  return <div></div>;
};
