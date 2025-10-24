import { useEffect, useState, type ReactNode } from "react";
import { BackgroundGlow } from "./BackgroundGlow";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => {
      cancelAnimationFrame(raf);
      setIsVisible(false);
    };
  }, []);

  return (
    <div className="relative min-h-dvh bg-[#050509] text-white overflow-hidden m-auto">
      <BackgroundGlow />

      <main
        className={`relative z-10 flex h-dvh w-full items-stretch justify-center px-4 sm:px-8 m-auto transform-gpu transition-all duration-500 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
        {children}
      </main>
    </div>
  );
}
