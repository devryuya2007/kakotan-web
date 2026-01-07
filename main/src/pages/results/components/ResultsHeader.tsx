import type { ReactNode } from "react";

interface ResultsHeaderProps {
  title: string;
  actions?: ReactNode;
}

// 結果画面のタイトルとアクションをまとめる
export function ResultsHeader({ title, actions }: ResultsHeaderProps) {
  return (
    <header className="text-center">
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#f2c97d] sm:text-4xl">
        {title}
      </h1>
      {actions}
    </header>
  );
}
