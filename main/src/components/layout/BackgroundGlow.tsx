// 背景装飾は触れられないようにして、タップの誤反応を防ぐ
const BASE_LAYER_CLASS = "pointer-events-none absolute inset-0";

// 背景のレイヤーを配列でまとめて、順番や見た目を整理しやすくする
const BACKGROUND_LAYERS = [
  {
    key: "top-glow",
    className:
      "bg-[radial-gradient(circle_at_top,#1a1a28_0%,transparent_55%)] opacity-60",
  },
  {
    key: "bottom-glow",
    className:
      "bg-[radial-gradient(circle_at_bottom,#6744271a_0%,transparent_60%)]",
  },
  {
    key: "accent-sheen",
    className:
      "bg-[linear-gradient(120deg,rgba(242,201,125,0.08)_0%,transparent_40%,rgba(242,201,125,0.05)_80%)] opacity-70",
  },
  {
    key: "grid",
    className:
      "bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20viewBox%3D%220%200%20400%20400%22%20fill%3D%22none%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M0%2050H400M50%200V400%22%20stroke%3D%22rgba(242,201,125,0.7)%22%20stroke-width%3D%221%22/%3E%3C/svg%3E')] opacity-40",
  },
];

export function BackgroundGlow() {
  return (
    <>
      {BACKGROUND_LAYERS.map((layer) => (
        <div
          key={layer.key}
          className={`${BASE_LAYER_CLASS} ${layer.className}`}
        />
      ))}
    </>
  );
}
// strokeのrgbaを変えると線の濃淡を変えられる。
