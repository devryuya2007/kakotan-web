import type { ReactNode } from "react";

interface PromoCardProps {
  brand: string;
  title: string;
  subtitle?: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  footerItems?: string[];
}

export function PromoCard({
  brand,
  title,
  subtitle,
  description,
  icon,
  action,
  footerItems,
}: PromoCardProps) {
  return (
    <div className="w-full max-w-md rounded-[3rem] border border-[#f2c97d33] bg-[#0b0b13]/80 p-10 shadow-[0_0_50px_rgba(242,201,125,0.2)] backdrop-blur-md">
      <header className="flex flex-col items-center gap-4 text-center">
        <span className="text-sm tracking-[0.45em] text-[#f2c97d]/80">
          {brand}
        </span>
        <h1 className="text-2xl font-semibold tracking-widest text-[#f2c97d] sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sm uppercase tracking-[0.6em] text-[#f2c97d]/60">
            {subtitle}
          </p>
        ) : null}
      </header>

      {icon ? (
        <div className="mt-12 flex justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[#f2c97d33] bg-[#0b0b13] shadow-[0_0_30px_rgba(242,201,125,0.3)]">
            {icon}
          </div>
        </div>
      ) : null}

      <p className="mt-12 text-center text-sm leading-relaxed text-[#f2c97d]/70">
        {description}
      </p>

      {action ? <div className="mt-8">{action}</div> : null}

      {footerItems && footerItems.length > 0 ? (
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex w-full items-center justify-between text-xs uppercase tracking-[0.3em] text-[#f2c97d]/50">
            {footerItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
