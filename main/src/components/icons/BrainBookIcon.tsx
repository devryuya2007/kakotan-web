interface BrainBookIconProps {
  className?: string;
  dataTestid: string;
}

export function BrainBookIcon({dataTestid, className}: BrainBookIconProps) {
  return (
    <svg
      data-testid={dataTestid}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 256 256'
      className={className}
      fill='#E6B871'
      stroke='#E6B871'
      strokeWidth={10}
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M32 176c24-18 64-18 96-2m0 0c32-16 72-16 96 2' />
      <path d='M32 204c24-18 64-18 96-2m0 0c32-16 72-16 96 2' />
      <path d='M128 158v48' />
      <path d='M32 190c24-16 64-16 96 0m0 0c32-16 72-16 96 0' />
      <path
        d='M128 90
           c-10-18-40-18-48 2
           c-10 4-16 16-10 26
           c-12 10-8 28 8 32
           c0 14 18 20 28 12
           c4 8 16 10 22 6'
      />
      <path
        d='M128 90
           c10-18 40-18 48 2
           c10 4 16 16 10 26
           c12 10 8 28-8 32
           c0 14-18 20-28 12
           c-4 8-16 10-22 6'
      />
      <path d='M128 84v68' />
      <path d='M102 110c-8 0-12 6-12 12' />
      <path d='M106 134c-6 0-10 4-10 10' />
      <path d='M154 110c8 0 12 6 12 12' />
      <path d='M150 134c6 0 10 4 10 10' />
    </svg>
  );
}
