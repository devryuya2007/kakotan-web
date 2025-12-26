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
  const {config, setMaxCount, setSoundEnabled, setVibrationEnabled} =
    useUserConfig();
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
      <div className='flex h-full w-full flex-col gap-8 overflow-y-auto px-4 py-6 sm:flex-row sm:items-start sm:gap-12 sm:overflow-hidden sm:px-8'>
        <section className='flex w-full flex-col gap-6 sm:w-1/2 sm:overflow-visible'>
          <header className='space-y-1'>
            <h1 className='text-[#f2c97d]'>Setting Your Exam</h1>
            <p className='text-sm text-white/60'>developing......</p>
          </header>
          <div className='space-y-4'>
            <ToggleSwitch
              id="sound-toggle"
              label="すべての音"
              description="クリック音や正解・不正解の音をまとめて切り替える"
              checked={soundPreference.isSoundEnabled}
              onChange={setSoundEnabled}
            />
            <ToggleSwitch
              id="vibration-toggle"
              label="バイブ"
              description="正解・不正解時のバイブをまとめて切り替える"
              checked={soundPreference.isVibrationEnabled}
              onChange={setVibrationEnabled}
            />
          </div>
          <div className='space-y-10'>
            {configEntries.map(([yearKey, yearConfig]) => (
              <div key={yearConfig.sectionId} className='space-y-4'>
                <p className='text-sm text-white/70'>
                  {yearConfig.sectionId}:{' '}
                  <span className='font-semibold text-[#f2c97d]'>
                    {yearConfig.maxCount}
                  </span>
                </p>
                <Slider.Root
                  min={10}
                  max={100}
                  step={10}
                  value={[yearConfig.maxCount]}
                  onValueChange={([value]) => setMaxCount(yearKey, value)}
                  className='relative flex w-full max-w-2xl touch-none select-none items-center'
                  aria-label={`Question count for ${yearConfig.sectionId}`}
                >
                  <Slider.Track className='relative h-1 flex-1 rounded-full bg-white/10'>
                    <Slider.Range className='absolute h-full rounded-full bg-[#f2c97d]' />
                  </Slider.Track>
                  <Slider.Thumb className='ml-4 block h-8 w-8 rounded-full border border-white/30 bg-[#0f1524] shadow-[0_4px_14px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2c97d]' />
                </Slider.Root>
              </div>
            ))}
          </div>
        </section>
        <div className='relative z-20 h-80 w-full max-w-4xl flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur sm:h-full sm:w-1/2'>
          <div className='font-mono absolute left-4 top-6 h-20 w-44 rounded-xl border border-white/30 bg-white/15 p-4 text-sm text-white shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur sm:left-10 sm:top-12 sm:h-28 sm:w-60 sm:text-base'>
            {'</>'}
          </div>
          <div className='font-mono absolute right-6 top-10 z-10 h-24 w-40 rounded-xl border border-white/20 bg-white/40 p-4 text-xs text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-lg sm:right-12 sm:top-24 sm:h-32 sm:w-56 sm:text-sm'>
            WIP
          </div>
          <div className='font-mono absolute left-1/3 top-20 h-16 w-56 -translate-x-1/2 transform rounded-xl border border-white/30 bg-white/10 p-3 text-xs text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur sm:top-40 sm:h-24 sm:w-72 sm:text-sm'>
            Building...
          </div>

          <div className='font-mono absolute left-12 top-48 h-28 w-60 rounded-3xl border border-white/35 bg-white/40 p-5 text-2xl text-white shadow-[0_10px_50px_rgba(0,0,0,0.45)] backdrop-blur sm:left-20 sm:top-64 sm:h-40 sm:w-80 sm:text-3xl'>
            {`Currently under development......`}
          </div>
          <div className='font-mono absolute right-24 top-40 h-20 w-48 rounded-2xl border border-white/25 bg-white/15 p-4 text-xs text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur sm:right-16 sm:top-[75%] sm:h-28 sm:w-60 sm:text-sm'>
            npm run lint
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
