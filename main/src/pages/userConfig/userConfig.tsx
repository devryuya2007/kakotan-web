import {useUserConfig} from '../tests/test_page/hooks/useUserConfig';

import {useMemo} from 'react';

import * as Slider from '@radix-ui/react-slider';

import {AppLayout} from '@/components/layout/AppLayout';

export default function UserConfig() {
  const {config, setMaxCount} = useUserConfig();
  const configEntries = useMemo(
    () =>
      Object.entries(config) as Array<
        [keyof typeof config, (typeof config)[keyof typeof config]]
      >,
    [config],
  );

  return (
    <AppLayout>
      <section className='flex h-full w-full select-none flex-col justify-center gap-6 py-6'>
        <header className='space-y-1'>
          <h1 className='text-[#f2c97d]'>Setting Your Exam</h1>
          <p className='text-sm text-white/60'>developing......</p>
        </header>
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
      <div className='relative z-20 m-4 mb-4 mt-10 h-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur'>
        <div className='font-mono absolute left-6 top-4 h-24 w-48 rounded-xl border border-white/30 bg-white/20 p-4 text-sm text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur'>
          {'</>'}
        </div>
        <div className='font-mono absolute right-8 top-10 h-28 w-52 rounded-xl border border-white/40 bg-white/25 p-4 text-xs text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur'>
          WIP
        </div>
        <div className='absolute left-1/2 top-16 h-20 w-40 -translate-x-1/2 transform rounded-xl border border-white/30 bg-white/10 p-4 text-center text-xs text-white shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur'>
          Building...
        </div>
      </div>
    </AppLayout>
  );
}
