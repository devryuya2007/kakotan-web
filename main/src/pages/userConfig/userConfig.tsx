import {useUserConfig} from "../tests/test_page/hooks/useUserConfig";

import {useMemo} from "react";

import * as Slider from "@radix-ui/react-slider";
import {useNavigate} from "react-router-dom";

import {QuickStartButton} from "@/components/buttons/QuickStartButton";
import {AppLayout} from "@/components/layout/AppLayout";

interface ToggleOption {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

// 設定画面で使うトグルUI。role="switch"でアクセシビリティを確保する
const ToggleSwitch = ({
  id,
  label,
  description,
  checked,
  onChange,
}: ToggleOption) => {
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
          checked
            ? "border-[#f2c97d]/80 bg-[#f2c97d]/80"
            : "border-white/20 bg-white/10"
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
  const {config, setMaxCount, setSoundEnabled} = useUserConfig();
  const {soundPreference} = config;
  const configEntries = useMemo(
    () =>
      Object.entries(config.years) as Array<
        [keyof typeof config.years, (typeof config.years)[keyof typeof config.years]]
      >,
    [config],
  );
  const navigate = useNavigate();
  return (
    <AppLayout>
      <div className='fixed bottom-6 right-6 z-50 w-[6rem]'>
        <QuickStartButton onClick={() => navigate('/')} label='Home' />
      </div>
      <div className="flex min-h-full w-full flex-col gap-8 px-4 py-6 sm:gap-10 sm:px-8">
        <section className="flex w-full flex-col gap-6">
          <header className='space-y-1'>
            <h1 className='text-[#f2c97d]'>Practice Settings</h1>
            <p className='text-sm text-white/60'>
              Adjust the sound and question counts for your session.
            </p>
          </header>
          {/* トグル項目は余白を活かして横並びできるようにする */}
          <div className="flex flex-wrap gap-4">
            <ToggleSwitch
              id="sound-toggle"
              label="Sound effects"
              description="Toggle all in-app sounds, including button clicks."
              checked={soundPreference.isSoundEnabled}
              onChange={setSoundEnabled}
            />
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
                  <span className="font-semibold text-[#f2c97d]">
                    {yearConfig.maxCount}
                  </span>
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
