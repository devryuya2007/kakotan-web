import { useId, type ChangeEvent } from "react";

import type { PlayerRegistryEntry } from "@/data/userYearRegistry";

// パネルに必要なデータと操作をまとめた型
interface DataImportPanelProps {
  onImport: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  importError: string | null;
  playerRegistry: PlayerRegistryEntry[];
  onRemove: (id: string) => void;
}

// JSONインポートの例を表示するための固定データ
// JSON.stringifyで整形し、インデントのズレを防ぐ
const sampleImportJson = JSON.stringify(
  [
    {
      phrase: "apple",
      mean: "りんご",
    },
    {
      phrase: "policy",
      mean: "政策・方針",
    },
  ],
  null,
  2
);

// JSONの説明とファイル取り込みUIをまとめたパネル
export function DataImportPanel({
  onImport,
  importError,
  playerRegistry,
  onRemove,
}: DataImportPanelProps) {
  // inputの紐付けに使うユニークIDを生成する
  const dataImportInputId = useId();
  const shouldScrollRegistry = playerRegistry.length >= 5;
  // 4件分の高さを確保して、5件目からスクロールに切り替える
  const registryScrollClass = shouldScrollRegistry ? "max-h-[260px] overflow-y-auto pr-2" : "";

  // 説明・リスト・ファイル選択を1つの枠にまとめて配置する
  return (
    <div className="flex w-full flex-col items-center justify-between gap-12 rounded-2xl border border-white/15 bg-[#0f1524] px-4 py-4 text-left shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:border-white/30 sm:flex-row">
      <div className="w-full space-y-1 sm:max-w-[26rem]">
        <p className="text-sm font-semibold text-white">data import</p>
        <p className="text-xs text-white/60">
          import your vocab JSON file to add custom words.
        </p>
        {/* JSONの形をそのまま見せるため、整形済み文字列を表示する */}
        <code className="mt-2 block whitespace-pre-wrap rounded-lg border border-white/10 bg-white/5 p-2 text-[10px] leading-relaxed text-white/70 sm:text-xs">
          {sampleImportJson}
        </code>
        {/* JSONが初めての人向けに、ざっくり意味を説明する */}
        <p className="mt-2 text-xs text-white/70">
          JSON is one of the file formats used to store data. Use [] for a list and {} for
          each item, with keys in double quotes.
        </p>
        <p className="text-xs text-white/60">
          Use a JSON array with "phrase" and "mean". You can also use a JSON with "key",
          "label", and "vocab" if you want to name the set. If the format is different,
          the import will fail with an error.
        </p>
        <p className="text-xs text-white/50">
          The file extension should be .json (example.json).
        </p>
      </div>
      {/* 追加済みの問題セット一覧。削除したらlocalStorageとUIを更新する */}
      <div className="relative w-full min-h-[140px] rounded-2xl border-2 border-white/25 bg-[#0c1320] shadow-[0_12px_30px_rgba(0,0,0,0.45)] sm:w-[18rem]">
        {/* 空間を確保するための下地ブロック。上にリストを重ねる */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-white/0 to-white/5" />
        {playerRegistry.length > 0 && (
          <div className={`relative z-10 space-y-3 p-3 ${registryScrollClass}`}>
            {playerRegistry.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{entry.label}</p>
                  <p className="text-[10px] text-white/50">{entry.vocab.length} words</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(entry.id)}
                  className="rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-[10px] font-semibold text-rose-200 transition hover:border-rose-300/60 hover:bg-rose-500/20"
                >
                  delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* ファイル選択UI。選択した内容は後で保存処理に繋げる想定 */}
      <div className="relative m-2 flex items-center">
        <input
          id={dataImportInputId}
          type="file"
          accept="application/json,.json"
          onChange={onImport}
          className="sr-only"
        />
        <label
          htmlFor={dataImportInputId}
          className="ml-0 w-[12rem] rounded-full border border-white/20 bg-white/10 p-4 text-center text-sm font-semibold text-white/80 transition hover:border-white/40 hover:bg-white/15"
        >
          select file
        </label>
        {importError && (
          <p
            className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-[10px] font-semibold text-rose-200 shadow-[0_8px_20px_rgba(244,63,94,0.25)]"
            role="alert"
          >
            {importError}
          </p>
        )}
      </div>
    </div>
  );
}
