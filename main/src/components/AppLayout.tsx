import type { ReactNode } from "react";
import { BackgroundGlow } from "./BackgroundGlow";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative min-h-dvh bg-[#050509] text-white overflow-hidden">
      <BackgroundGlow />

      <main className="relative z-10 flex h-dvh w-full items-stretch justify-center px-4 sm:px-8">
        {children}
      </main>
    </div>
  );
}
