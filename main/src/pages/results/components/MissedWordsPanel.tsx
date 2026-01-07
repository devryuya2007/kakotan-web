interface MissedWordEntry {
  word: string;
  meaning: string;
}

interface MissedWordsPanelProps {
  highlightClass: string;
  mutedClass: string;
  negativeClass: string;
  accentClass: string;
  wrongWords: MissedWordEntry[];
  hasNoWrongWords: boolean;
  hasMore: boolean;
  onOpenModal: () => void;
}

// 間違えた単語リストを表示するパネル
export function MissedWordsPanel({
  highlightClass,
  mutedClass,
  negativeClass,
  accentClass,
  wrongWords,
  hasNoWrongWords,
  hasMore,
  onOpenModal,
}: MissedWordsPanelProps) {
  return (
    <div className="order-2 min-w-0 rounded-2xl border border-white/10 bg-[#0f1524] p-5 lg:order-1 lg:col-span-2">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={`text-base font-semibold ${highlightClass} sm:text-lg`}>
            Missed words list
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {hasNoWrongWords ? (
          <h1 className={`col-span-full text-sm ${mutedClass}`}>
            No missed words this time. Nice work!
          </h1>
        ) : (
          wrongWords.map(({ word, meaning }) => (
            <div
              key={word}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#262335] px-3 py-2.5 text-left text-sm transition sm:px-4 sm:py-3"
            >
              <span className={`font-medium ${negativeClass}`}>{word}</span>
              <span className="truncate text-xs text-white/70">{meaning}</span>
            </div>
          ))
        )}
      </div>
      {hasMore && (
        <button
          onClick={onOpenModal}
          type="button"
          className={`button-pressable mt-4 block w-full text-sm font-semibold ${accentClass} transition hover:text-[#f7e2bd]`}
        >
          View more...
        </button>
      )}
    </div>
  );
}
