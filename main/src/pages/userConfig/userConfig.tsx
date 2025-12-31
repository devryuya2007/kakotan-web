import { useUserConfig } from "../tests/test_page/hooks/useUserConfig";

import { useId, useMemo, type ChangeEvent } from "react";

import * as Slider from "@radix-ui/react-slider";
import { useNavigate } from "react-router-dom";

import { QuickStartButton } from "@/components/buttons/QuickStartButton";
import { AppLayout } from "@/components/layout/AppLayout";

interface ToggleOption {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

// JSONインポートの例を表示するための固定データ
// JSON.stringifyで整形し、インデントのズレを防ぐ
const sampleImportJson = JSON.stringify(
  [
    {
      phrase: "apple",
      mean: "りんご",
    },
    {
      phrase: "policy",
      mean: "政策・方針",
    },
  ],
  null,
  2
);

// 設定画面で使うトグルUI。role="switch"でアクセシビリティを確保する
const ToggleSwitch = ({ id, label, description, checked, onChange }: ToggleOption) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={`${id}-label`}
      aria-describedby={`${id}-desc`}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-left shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:border-white/30"
    >
      <div className="space-y-1">
        <p id={`${id}-label`} className="text-sm font-semibold text-white">
          {label}
        </p>
        <p id={`${id}-desc`} className="text-xs text-white/60">
          {description}
        </p>
      </div>
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
};

export default function UserConfig() {
  const { config, setMaxCount, setSoundEnabled } = useUserConfig();
  const { soundPreference } = config;
  // インポート用inputの紐付けに使うIDを作る
  const dataImportInputId = useId();
  const configEntries = useMemo(
    () =>
      Object.entries(config.years) as Array<
        [keyof typeof config.years, (typeof config.years)[keyof typeof config.years]]
      >,
    [config]
  );
  const navigate = useNavigate();
  // JSONインポートはUIだけ先に用意し、処理は後で実装できるようにする
  const handleDataImport = (event: ChangeEvent<HTMLInputElement>) => {
    event.currentTarget.value = "";
  };
  return (
    <AppLayout
      mainClassName="overflow-y-auto overflow-x-hidden pb-8"
      floatingSlot={
        <div className="fixed bottom-6 right-6 z-50 w-[6rem]">
          <QuickStartButton onClick={() => navigate("/")} label="Home" />
        </div>
      }
    >
      <div className="flex min-h-full w-full flex-col gap-8 px-4 py-8 sm:gap-10 sm:px-8">
        <section className="flex w-full flex-col gap-6">
          <header className="space-y-1">
            <h1 className="text-[#f2c97d] text-[2rem]"> Practice Settings</h1>
            <p className="text-sm text-white/60">
              adjust the sound and question counts for your session.
            </p>
          </header>
          {/* トグル項目は余白を活かして横並びできるようにする */}
          <div className="flex flex-wrap gap-4">
            <ToggleSwitch
              id="sound-toggle"
              label="sound effects"
              description="toggle all in-app sounds, including button clicks."
              checked={soundPreference.isSoundEnabled}
              onChange={setSoundEnabled}
            />
            <div className="flex flex-col w-full items-center justify-between gap-12 rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-left shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:border-white/30 sm:flex-row">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">data import</p>
                <p className="text-xs text-white/60">
                  import your vocab JSON file to add custom words.
                </p>
                {/* JSONの形をそのまま見せるため、整形済み文字列を表示する */}
                <code className="mt-2 block whitespace-pre-wrap rounded-lg border border-white/10 bg-white/5 p-2 text-[10px] leading-relaxed text-white/70 sm:text-xs">
                  {sampleImportJson}
                </code>
                {/* JSONが初めての人向けに、ざっくり意味を説明する */}
                <p className="mt-2 text-xs text-white/70">
                  JSON is one of the file formats used to store data. Use [] for a list and {} for
                  each item, with keys in double quotes.
                </p>
                <p className="text-xs text-white/60">
                  Each item must include "phrase" and "mean". If the format is different, the import
                  will fail with an error.
                </p>
                <p className="text-xs text-white/50">
                  The file extension should be .json (example.json).
                </p>
              </div>
              {/* ファイル選択UI。選択した内容は後で保存処理に繋げる想定 */}
              <div className=" items-center m-2">
                <input
                  id={dataImportInputId}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleDataImport}
                  className="sr-only"
                />
                <label
                  htmlFor={dataImportInputId}
                  className="w-[12rem] text-center ml-0 rounded-full border border-white/20 bg-white/10 p-4  text-sm font-semibold text-white/80 transition hover:border-white/40 hover:bg-white/15"
                >
                  select file
                </label>
              </div>
            </div>
          </div>
          {/* 問題数の設定は画面幅に合わせて折り返す */}
          <div className="flex flex-wrap gap-6">
            {configEntries.map(([yearKey, yearConfig]) => (
              <div
                key={yearConfig.sectionId}
                className="flex w-full flex-col gap-4 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                <p className="text-sm text-white/70">
                  {yearConfig.sectionId}:{" "}
                  <span className="font-semibold text-[#f2c97d]">{yearConfig.maxCount}</span>
                </p>
                <Slider.Root
                  min={10}
                  max={100}
                  step={10}
                  value={[yearConfig.maxCount]}
                  onValueChange={([value]) => setMaxCount(yearKey, value)}
                  className="relative flex w-full min-w-[220px] touch-none select-none items-center"
                  aria-label={`Question count for ${yearConfig.sectionId}`}
                >
                  <Slider.Track className="relative h-1 flex-1 rounded-full bg-white/10">
                    <Slider.Range className="absolute h-full rounded-full bg-[#f2c97d]" />
                  </Slider.Track>
                  <Slider.Thumb className="ml-4 block h-8 w-8 rounded-full border border-white/30 bg-[#0f1524] shadow-[0_4px_14px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2c97d]" />
                </Slider.Root>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
