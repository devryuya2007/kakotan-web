import {useMemo} from 'react';

import * as Slider from '@radix-ui/react-slider';

import {AppLayout} from '@/components/layout/AppLayout';

import {useUserConfig} from '../tests/test_page/userConfigContext';

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
      <div>
        <h1 className='text-[#f2c97d]'>Setting Your Exam</h1>
        <p>developing......</p>
      </div>
      <div className='space-y-4'>
        <div className='space-y-6'>
          {configEntries.map(([yearKey, yearConfig]) => (
            <div key={yearConfig.sectionId} className='space-y-2'>
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
                className='relative flex w-full max-w-sm touch-none select-none items-center'
                aria-label={`Question count for ${yearConfig.sectionId}`}
              >
                <Slider.Track className='relative h-1 flex-1 rounded-full bg-white/10'>
                  <Slider.Range className='absolute h-full rounded-full bg-[#f2c97d]' />
                </Slider.Track>
                <Slider.Thumb className='block h-4 w-4 rounded-full border border-white/30 bg-[#0f1524] shadow-[0_4px_14px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2c97d]' />
              </Slider.Root>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
