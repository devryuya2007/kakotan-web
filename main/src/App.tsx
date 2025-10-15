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
              <BrainBookIcon className="h-16 w-16 text-[#f2c97d]" />
            </div>
          </div>

          <p className="mt-12 text-center text-sm leading-relaxed text-[#f2c97d]/70">
            Master 2,000 essential words with quick daily drills. Perfect for
            commuters and study breaks—always ready, even offline.
          </p>
          <div className="mt-8">{button()}</div>

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

function BrainBookIcon(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      {...props}>
      <path
        d="M12 21c0-6.627 6.268-12 14-12 4.418 0 8 3.582 8 8v30c0 0 0-6-8-6s-14 5.373-14 12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M52 21c0-6.627-6.268-12-14-12-4.418 0-8 3.582-8 8v30c0 0 0-6 8-6s14 5.373 14 12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 49s8.286-6 18-6 18 6 18 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M58 49s-8.286-6-18-6-18 6-18 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
