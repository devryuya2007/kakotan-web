import type {ReactNode} from 'react';

export interface PromoCardProps {
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
    <div className='animate-fadeIn flex h-full w-full'>
      <div className='flex h-full w-full flex-col overflow-hidden'>
        <div className='flex min-h-0 flex-1 flex-col items-center gap-6 overflow-hidden px-6 py-8 text-center sm:gap-8 sm:px-10 sm:py-10'>
          <header className='my-auto flex flex-col items-center gap-4'>
            <span className='text-sm tracking-[0.45em] text-[#f2c97d]/80'>
              {brand}
            </span>
            <h1 className='text-2xl font-semibold tracking-widest text-[#f2c97d] sm:text-3xl'>
              {title}
            </h1>
            {subtitle ? (
              <p className='text-sm uppercase tracking-[0.6em] text-[#f2c97d]/60'>
                {subtitle}
              </p>
            ) : null}
          </header>

          {icon ? (
            <div className='flex justify-center'>
              <div className='flex h-24 w-24 items-center justify-center rounded-full border border-[#f2c97d33] bg-[#0b0b13] shadow-[0_0_30px_rgba(242,201,125,0.3)] sm:h-28 sm:w-28'>
                {icon}
              </div>
            </div>
          ) : null}

          <p className='text-sm leading-relaxed text-[#f2c97d]/70'>
            {description}
          </p>

          {action ? <div>{action}</div> : null}

          {footerItems && footerItems.length > 0 ? (
            <div className='mt-auto w-full pt-6 sm:pt-8'>
              <div className='flex flex-col items-center gap-4'>
                <div className='flex w-full items-center justify-between text-xs uppercase tracking-[0.3em] text-[#f2c97d]/50'>
                  {footerItems.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
