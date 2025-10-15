import menu from "./menu";

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#050509] text-white overflow-hidden">
      <BackgroundGlow />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-[3rem] border border-[#f2c97d33] bg-[#0b0b13]/80 p-10 shadow-[0_0_50px_rgba(242,201,125,0.2)] backdrop-blur-md">
          <header className="flex flex-col items-center gap-4 text-center">
            <span className="text-sm tracking-[0.45em] text-[#f2c97d]/80">
              LEXIFY
            </span>
            <h1 className="text-2xl font-semibold tracking-widest text-[#f2c97d] sm:text-3xl">
              UNIVERSITY ENTRANCE ENGLISH
            </h1>
            <p className="text-sm uppercase tracking-[0.6em] text-[#f2c97d]/60">
              Vocabulary Mastery
            </p>
          </header>

          <div className="mt-12 flex justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[#f2c97d33] bg-[#0b0b13] shadow-[0_0_30px_rgba(242,201,125,0.3)]">
              <BrainBookIcon className="h-16 w-16" />
            </div>
          </div>

          <p className="mt-12 text-center text-sm leading-relaxed text-[#f2c97d]/70">
            Master 2,000 essential words with quick daily drills. Perfect for
            commuters and study breaks—always ready, even offline.
          </p>
          <div className="mt-8">
            {button()}
          </div>

          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="flex w-full items-center justify-between text-xs uppercase tracking-[0.3em] text-[#f2c97d]/50">
              <span>Daily Practice</span>
              <span>Flashcards</span>
              <span>Review</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function BackgroundGlow() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1a1a28_0%,transparent_55%)] opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#6744271a_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(242,201,125,0.08)_0%,transparent_40%,rgba(242,201,125,0.05)_80%)] opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20viewBox%3D%220%200%20400%20400%22%20fill%3D%22none%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M0%2050H400M50%200V400%22%20stroke%3D%22rgba(242,201,125,0.05)%22%20stroke-width%3D%221%22/%3E%3C/svg%3E')] opacity-40" />
    </>
  );
}

function button() {
  return (
    <button className="btn-text-glow w-full rounded-full border border-[#f2c97d66] bg-[#14141f] px-6 py-3 text-sm font-semibold tracking-[0.3em] text-[#f2c97d] shadow-[0_0_25px_rgba(242,201,125,0.25)] transition hover:border-[#f2c97d] hover:bg-[#1c1c2a] hover:shadow-[0_0_35px_rgba(242,201,125,0.35)]">
      QUICK START
    </button>
  );
}

interface BrainBookIconProps {
  className?: string;
}

function BrainBookIcon({ className }: BrainBookIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={className}
      fill="#E6B871"
      stroke="#E6B871"
      strokeWidth={10}
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M32 176c24-18 64-18 96-2m0 0c32-16 72-16 96 2" />
      <path d="M32 204c24-18 64-18 96-2m0 0c32-16 72-16 96 2" />
      <path d="M128 158v48" />
      <path d="M32 190c24-16 64-16 96 0m0 0c32-16 72-16 96 0" />
      <path
        d="M128 90
           c-10-18-40-18-48 2
           c-10 4-16 16-10 26
           c-12 10-8 28 8 32
           c0 14 18 20 28 12
           c4 8 16 10 22 6"
      />
      <path
        d="M128 90
           c10-18 40-18 48 2
           c10 4 16 16 10 26
           c12 10 8 28-8 32
           c0 14-18 20-28 12
           c-4 8-16 10-22 6"
      />
      <path d="M128 84v68" />
      <path d="M102 110c-8 0-12 6-12 12" />
      <path d="M106 134c-6 0-10 4-10 10" />
      <path d="M154 110c8 0 12 6 12 12" />
      <path d="M150 134c6 0 10 4 10 10" />
    </svg>
  );
}

// function BrainBookIcon(props: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 64 64"
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth={2.5}
//       {...props}>
//       <path
//         d="M12 21c0-6.627 6.268-12 14-12 4.418 0 8 3.582 8 8v30c0 0 0-6-8-6s-14 5.373-14 12"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//       <path
//         d="M52 21c0-6.627-6.268-12-14-12-4.418 0-8 3.582-8 8v30c0 0 0-6 8-6s14 5.373 14 12"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//       <path
//         d="M6 49s8.286-6 18-6 18 6 18 6"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//       <path
//         d="M58 49s-8.286-6-18-6-18 6-18 6"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   );
// }
