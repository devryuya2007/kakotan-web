interface RecentSessionEntry {
  key: number;
  label: string;
  sectionId: string;
  gainedXp: number;
  accuracyRate: number;
}

interface RecentSessionListProps {
  sessions: RecentSessionEntry[];
}

// 最近の学習履歴をカードと表の両方で表示する
export function RecentSessionList({ sessions }: RecentSessionListProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0f1524] p-6 shadow-[0_25px_40px_-30px_rgba(5,8,20,0.9)]">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[#f2c97d]/80">RECENT LOG</p>
          <h2 className="text-xl font-semibold">Recent study log</h2>
        </div>
        <p className="text-sm text-white/70">Showing the latest {sessions.length} entries</p>
      </div>
      <div className="mt-4 flex snap-x snap-mandatory flex-col gap-4 overflow-auto pb-4 sm:hidden">
        {sessions.length === 0 && (
          <div className="min-w-[260px] snap-center rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-white/60">
            No study history yet.
          </div>
        )}
        {sessions.map((session) => (
          <div
            key={`card-${session.key}`}
            className="min-w-[260px] snap-center rounded-2xl border border-white/10 bg-[#0b101d] p-4 text-white/90"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              {session.sectionId}
            </p>
            <p className="mt-2 text-lg font-semibold text-white">{session.label}</p>
            <p className="mt-4 text-sm text-[#f2c97d]">{session.gainedXp} XP</p>
            <p className="text-sm text-white/70">Accuracy {session.accuracyRate}%</p>
          </div>
        ))}
      </div>
      <ul className="mt-4 hidden divide-y divide-white/10 text-sm sm:block">
        <li className="grid grid-cols-[1.4fr,1fr,0.8fr,0.8fr] gap-2 pb-3 text-xs uppercase tracking-[0.2em] text-white/50">
          <span>Date</span>
          <span>Section</span>
          <span>XP gained</span>
          <span>Accuracy</span>
        </li>
        {sessions.length === 0 ? (
          <li className="py-6 text-center text-white/60">No study history yet.</li>
        ) : (
          sessions.map((session) => (
            <li
              key={session.key}
              className="grid grid-cols-[1.4fr,1.4fr,0.8fr,0.8fr] items-center gap-2 py-3 text-white/90"
            >
              <span className="font-semibold text-white">{session.label}</span>
              <span className="justify-self-start rounded-full border border-white/10 bg-white/5 px-6 py-2 text-center text-xs uppercase tracking-wide text-white/70">
                {session.sectionId}
              </span>
              <span className="font-semibold text-[#f2c97d]">{session.gainedXp} XP</span>
              <span>{session.accuracyRate}%</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
