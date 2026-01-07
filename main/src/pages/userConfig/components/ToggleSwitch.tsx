// トグルに必要な情報をまとめた型
interface ToggleOption {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

// 設定のON/OFFを切り替えるためのトグルスイッチ
export function ToggleSwitch({
  id,
  label,
  description,
  checked,
  onChange,
}: ToggleOption) {
  // スイッチ本体はボタンで実装し、roleで支援技術に伝える
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={`${id}-label`}
      aria-describedby={`${id}-desc`}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/15 bg-[#0f1524] px-4 py-4 text-left shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:border-white/30"
    >
      {/* 左側にラベルと説明をまとめる */}\n      <div className="space-y-1">
        <p id={`${id}-label`} className="text-sm font-semibold text-white">
          {label}
        </p>
        <p id={`${id}-desc`} className="text-xs text-white/60">
          {description}
        </p>
      </div>
      {/* 右側の丸いつまみはON/OFFで位置が動く */}
      <span
        className={`relative inline-flex h-7 w-12 items-center rounded-full border transition ${
          checked ? "border-[#f2c97d]/80 bg-[#f2c97d]/80" : "border-white/20 bg-white/10"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}
