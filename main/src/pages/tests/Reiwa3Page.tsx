import { useEffect, useState } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { buildQuestionsFromVocab, loadYearVocab } from "../../data/vocabLoader";

export default function Reiwa3Page() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setStatus("loading");
        const vocab = await loadYearVocab("reiwa3");
        if (cancelled) return;
        const questions = buildQuestionsFromVocab(vocab, 20);
        setCount(questions.length);
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setStatus("error");
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppLayout>
      <div className="my-auto w-full max-w-3xl rounded-2xl px-6 py-8">
        <h1 className="mb-4 text-xl font-semibold text-[#f2c97d]">
          共通テスト 令和3年（データ読込サンプル）
        </h1>
        {status === "loading" && <p>データを読み込んでいます…</p>}
        {status === "ready" && (
          <p className="text-white/80">問題の準備ができました（{count}問）。</p>
        )}
        {status === "error" && (
          <p className="text-red-400">読み込みに失敗しました: {error}</p>
        )}
      </div>
    </AppLayout>
  );
}
