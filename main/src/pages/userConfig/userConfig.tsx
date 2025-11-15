import {useState} from 'react';

import * as Slider from '@radix-ui/react-slider';

import {AppLayout} from '@/components/layout/AppLayout';

export default function UserConfig() {
  const [question, setQuestion] = useState<number>(10);
  return (
    <>
      <AppLayout>
        <div>
          <h1 className='text-[#f2c97d]'>Setting Your Exam</h1>
          <p>developing......</p>
        </div>
        <div className='space-y-4'>
          <p className='text-sm text-white/70'>
            問題数:{' '}
            <span className='font-semibold text-[#f2c97d]'>{question}</span>
          </p>
          <Slider.Root
            min={10}
            max={100}
            step={10}
            value={[question]}
            onValueChange={([next]) => setQuestion(next)}
            className='relative flex w-full max-w-sm touch-none select-none items-center'
            aria-label='Question count'
          >
            <Slider.Track className='relative h-1 flex-1 rounded-full bg-white/10'>
              <Slider.Range className='absolute h-full rounded-full bg-[#f2c97d]' />
            </Slider.Track>
            <Slider.Thumb className='block h-4 w-4 rounded-full border border-white/30 bg-[#0f1524] shadow-[0_4px_14px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2c97d]' />
          </Slider.Root>
        </div>
      </AppLayout>
    </>
  );
}
