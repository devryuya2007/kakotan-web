export function BackgroundGlow() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1a1a28_0%,transparent_55%)] opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#6744271a_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(242,201,125,0.08)_0%,transparent_40%,rgba(242,201,125,0.05)_80%)] opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20viewBox%3D%220%200%20400%20400%22%20fill%3D%22none%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M0%2050H400M50%200V400%22%20stroke%3D%22rgba(242,201,125,0.7)%22%20stroke-width%3D%221%22/%3E%3C/svg%3E')] opacity-40" />
    </>
  );
}
// strokeのrgb...0.25の部分を変えると線の濃淡を変えられる。
