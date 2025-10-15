import type { ReactNode } from "react";
import { BackgroundGlow } from "./BackgroundGlow";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen bg-[#050509] text-white overflow-hidden">
      <BackgroundGlow />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        {children}
      </main>
    </div>
  );
}
