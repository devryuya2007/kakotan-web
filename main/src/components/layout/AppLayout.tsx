import {type ReactNode, useEffect, useState} from 'react';

import {BackgroundGlow} from './BackgroundGlow';

interface AppLayoutProps {
  children: ReactNode;
  mainClassName?: string;
  // 画面固定のボタンなどをmainの外に置いて、スクロールや変形の影響を避ける
  floatingSlot?: ReactNode;
}

export function AppLayout({children, mainClassName, floatingSlot}: AppLayoutProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => {
      cancelAnimationFrame(raf);
      setIsVisible(false);
    };
  }, []);

  return (
    <div className='relative m-auto min-h-dvh overflow-hidden bg-[#050509] text-white'>
      <BackgroundGlow />
      {floatingSlot}

      <main
        className={`relative z-10 m-auto flex h-dvh w-full transform-gpu justify-center px-4 transition-all duration-500 ease-out sm:px-8 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        } ${mainClassName ?? ""}`}
      >
        {children}
      </main>
    </div>
  );
}
