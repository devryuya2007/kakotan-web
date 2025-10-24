// Reactから使う主要なフックをまとめて呼び出している（状態管理や副作用用）
import { useEffect, useMemo, useRef, useState } from "react";
// 単語テストの一問分を表す型。外部のデータローダーから入ってくる
import { type QuizQuestion } from "../../../../data/vocabLoader";

// このコンポーネントが受け取るpropsの形。questionsは問題配列、countは総数
type TestPageLayoutProps = {
  questions: QuizQuestion[];
  count: number;
};

// OSやブラウザの「アニメーションを減らす」設定を拾って真偽値で返す自作フック
function usePrefersReducedMotion() {
  // prefersReducedがtrueならアニメーションを抑えたいユーザー
  const [prefersReduced, setPrefersReduced] = useState(false);

  // コンポーネント生成時に一度だけ設定を確認し、変更があれば値を更新する
  useEffect(() => {
    // SSRなどwindowがない環境では何もしないように早期return
    if (typeof window === "undefined" || !("matchMedia" in window)) {
      return;
    }

    // ブラウザ設定「prefers-reduced-motion」を監視
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // 現在の設定に合わせてstateを更新する関数
    const handleChange = () => setPrefersReduced(mediaQuery.matches);

    // 初期値をセット
    handleChange();
    // 設定変更を監視
    mediaQuery.addEventListener("change", handleChange);

    // クリーンアップでイベントリスナーを外す
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // 呼び出し元に現在の設定を返す
  return prefersReduced;
}

export default function TestPageLayout({
  questions,
  count,
}: TestPageLayoutProps) {
  // いま表示している問題の配列インデックス
  const [currentIndex, setCurrentIndex] = useState(0);
  // 各選択肢が正解・不正解・未回答かを保持する
  const [buttonStates, setButtonStates] = useState<
    Record<string, "base" | "correct" | "incorrect">
  >({});
  // カード切り替え中かどうか。trueになっている間はボタン操作を無効化する
  const [isTransitioning, setIsTransitioning] = useState(false);
  // 解答直後の待ち時間を制御するためのタイマー参照
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // カードアニメーション終了待ち用タイマーの参照
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  // 問題ごとのシャッフル済み選択肢を保存しておくキャッシュ
  const shuffledChoicesRef = useRef<Record<string, string[]>>({});
  // どのquestion配列をキャッシュに使っているかを覚えておく
  const cacheSourceRef = useRef<QuizQuestion[] | null>(null);
  // ボタンを押した直後の「考え中」っぽい間
  const FEEDBACK_DELAY = 100; // 押下直後の余白（次操作解放まで合計0.5s）
  // 実際のカードスライドにかける時間
  const TRANSITION_DURATION = 600; // アニメーション本体（FEEDBACK_DELAYと合わせて0.5s）
  // アクセシビリティ設定を反映した結果の真偽値
  const prefersReducedMotion = usePrefersReducedMotion();
  // 設定によってはアニメーション時間をゼロにする
  const effectiveTransitionDuration = prefersReducedMotion
    ? 0
    : TRANSITION_DURATION;

  // 問題セットが差し替わったらシャッフル結果をリセットする
  if (cacheSourceRef.current !== questions) {
    shuffledChoicesRef.current = {};
    cacheSourceRef.current = questions;
  }

  // 現在の問題を取り出す。存在しない場合は後でnull returnする
  const question = questions[currentIndex];
  // 問題ごとに一度だけ選択肢をシャッフルし、キャッシュする関数
  const getShuffledChoices = (q: QuizQuestion) => {
    // idがあればそれを、なければ英単語をキーにする
    const key = q.id || q.phrase;
    // 既にシャッフル済みなら再利用
    const cached = shuffledChoicesRef.current[key];
    if (cached) return cached;
    // シャッフルしてキャッシュへ保存
    const randomized = [...q.choices].sort(() => Math.random() - 0.5);
    shuffledChoicesRef.current[key] = randomized;
    return randomized;
  };
  // 正解の選択肢。null安全のためoptional chaining
  const answerChoice = question?.choices[question?.answerIndex];
  // 表示上の総問題数。props優先で数がなければ配列長を使う
  const totalQuestions = count || questions.length || 1;
  // 画面に重ねて見せるカード4枚分をメモ化して抽出する
  const visibleCards = useMemo(
    () => questions.slice(currentIndex, currentIndex + 4),
    [questions, currentIndex]
  );

  // コンポーネントが壊れるときにタイマーを全部止めるためのクリーンアップ
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // 問題や正解が存在しない場合は何も描画しない
  if (!question || !answerChoice) return null;

  // 選択肢クリック時のメイン処理
  function handleClick(choice: string) {
    // 正解データがなくても、アニメーション中でも何もしない
    if (!answerChoice || isTransitioning) return;

    // 正解かどうかを判定し、ボタンの見た目ステータスを更新
    const isAnswer = choice === answerChoice;
    setButtonStates((prev) => ({
      ...prev,
      [choice]: isAnswer ? "correct" : "incorrect",
    }));

    // 前回のフィードバック用タイマーが残っていたら解除
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    // アニメーション待ちタイマーも同様に解除
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    // 少し待ってからカードを動かし始める
    feedbackTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(true);
      feedbackTimeoutRef.current = null;

      // カードの整理が終わったら次の問題へ進める
      const finalizeTransition = () => {
        setButtonStates({});
        setCurrentIndex((i) => i + 1);
        setIsTransitioning(false);
        transitionTimeoutRef.current = null;
      };

      // アニメーションを減らしたいユーザーは即座にスキップ
      if (effectiveTransitionDuration === 0) {
        finalizeTransition();
      } else {
        // そうでなければアニメーション時間だけ待ってから完了処理へ
        transitionTimeoutRef.current = setTimeout(
          finalizeTransition,
          effectiveTransitionDuration
        );
      }
    }, FEEDBACK_DELAY);
  }

  // まだ判定が付いていない選択肢ボタンの共通スタイル
  const baseButtonStyle =
    "group relative rounded-xl border border-white/15 bg-[radial-gradient(circle_at_top,#1a1c26,#070811)]/90 px-5 py-4 text-center text-base font-medium tracking-wide text-white/85 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-1 hover:border-[#f2c97d]/70 hover:bg-[radial-gradient(circle_at_top,#202333,#0d101c)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2c97d]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

  // 正解ボタン用の見た目（ゴールド系）
  const correctButtonStyle =
    "rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-200 px-5 py-4 text-center text-base font-semibold tracking-wide text-slate-900 shadow-[0_22px_48px_-20px_rgba(251,191,36,0.9)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_55px_-18px_rgba(251,191,36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

  // 不正解ボタン用の見た目（赤系）
  const incorrectButtonStyle =
    "rounded-xl border border-rose-500/60 bg-gradient-to-br from-rose-600 via-rose-500 to-rose-400 px-5 py-4 text-center text-base font-semibold tracking-wide text-rose-50 shadow-[0_18px_38px_-18px_rgba(244,63,94,0.85)] transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

  // 選択肢ごとの状態に合わせてスタイルを出し分ける小さなヘルパー
  function ButtonStyleSwitch(choice: string) {
    if (buttonStates[choice] === "correct") return correctButtonStyle;
    if (buttonStates[choice] === "incorrect") return incorrectButtonStyle;
    else return baseButtonStyle;
  }

  // カードが静止しているときの位置・スケール・不透明度などのリスト
  const baseLayouts = [
    { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 40 },
    { x: -6, y: -4, scale: 0.94, opacity: 0.9, zIndex: 30 },
    { x: -12, y: -7, scale: 0.88, opacity: 0.7, zIndex: 20 },
    { x: -18, y: -11, scale: 0.82, opacity: 0.0, zIndex: 10 },
  ];

  // カードが動いているときに適用する位置・スケールの並び
  const transitionLayouts = [
    { x: 14, y: 12, scale: 1.02, opacity: 0, zIndex: 5 },
    baseLayouts[0],
    baseLayouts[1],
    { x: -12, y: -7, scale: 0.88, opacity: 0.72, zIndex: 22 },
  ];

  // 表示するカードのindexから適切なレイアウト情報を引き出す
  function getCardPresentation(idx: number) {
    const layouts =
      isTransitioning && effectiveTransitionDuration > 0
        ? transitionLayouts
        : baseLayouts;
    const clampedIndex = Math.min(idx, layouts.length - 1);
    return layouts[clampedIndex];
  }

  return (
    // カードスタック全体の外枠。センタリングと余白を担当
    <section className="relative flex justify-center px-4">
      <div className="relative min-h-[420px] w-full max-w-3xl">
        {/* 表示対象となるカード一枚ごとに描画 */}
        {visibleCards.map((cardQuestion, idx) => {
          if (!cardQuestion) return null;

          // 先頭カードかどうか。ボタンの有効化などで使う
          const isActiveCard = idx === 0;
          // 何問目かを表示するためのインデックス
          const cardIndex = currentIndex + idx;
          // プログレスバーに使う進捗率
          const cardProgress = Math.min(
            ((cardIndex + 1) / totalQuestions) * 100,
            100
          );
          // 固定化された順番の選択肢配列
          const cardChoices = getShuffledChoices(cardQuestion);
          // カードの位置や透明度などの設定
          const presentation = getCardPresentation(idx);
          // transformスタイルに使う文字列を組み立てる
          const transform = `translate3d(${presentation.x}%, ${presentation.y}%, 0) scale(${presentation.scale})`;
          // アクティブカードのみクリック可能にするためのフラグ
          const interactive = idx === 0 && !isTransitioning;
          // 影の強さをカードの前後関係で変える

          const glowClass =
            idx === 0
              ? "shadow-[0_42px_85px_-48px_rgba(242,201,125,0.65)]"
              : idx === 1
              ? "shadow-[0_18px_60px_-54px_rgba(242,201,125,0.35)]"
              : "";

          return (
            <div
              key={`${cardQuestion.phrase}-${cardIndex}`}
              className={`absolute inset-0 rounded-2xl bg-gradient-to-b from-[#b8860b] to-[#f2c97d] p-[2px] transform-gpu transition-all ease-out will-change-transform will-change-opacity ${
                interactive ? "pointer-events-auto" : "pointer-events-none"
              } ${glowClass}`}
              style={{
                // 位置と拡大率を反映
                transform,
                // 後ろのカードほど透けさせて奥行きを演出
                opacity: presentation.opacity,
                // 前後関係の制御
                zIndex: presentation.zIndex,
                // アニメーション時間（ユーザー設定に応じて変更済み）
                transitionDuration: `${effectiveTransitionDuration}ms`,
                // ちょっと伸びのある動き方になるイージング
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}>
              {/* カード本体。外枠のゴールドから内側はダークな背景 */}
              <div className="bg-[#050509] [border-radius:inherit] px-6 py-[72px] text-white">
                {/* 問題番号やプログレスバーなどのヘッダー */}
                <div className="sticky top-4 z-20 mb-6 rounded-xl border border-white/10 bg-[#050509]/90 px-4 py-3 backdrop-blur-sm ">
                  <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-white/50">
                    <span>問題 {cardIndex + 1}</span>
                    <span>
                      {cardIndex + 1} / {totalQuestions}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <span
                      // アクセシビリティ用のaria属性で進捗を伝える
                      aria-label={`進捗 ${cardIndex + 1} / ${totalQuestions}`}
                      aria-valuemax={totalQuestions}
                      aria-valuemin={0}
                      aria-valuenow={cardIndex + 1}
                      role="progressbar"
                      className="block h-full rounded-full bg-gradient-to-r from-[#f2c97d] via-amber-300 to-yellow-200 transition-all duration-500"
                      style={{ width: `${cardProgress}%` }}
                    />
                  </div>
                </div>
                {/* 出題中の単語 */}
                <h1 className="mb-6 text-center text-4xl font-bold text-[#f2c97d]">
                  {cardQuestion.phrase}
                </h1>
                {/* 選択肢ボタンのグリッド */}
                <div className="grid grid-cols-2 gap-3 text-center text-white/80">
                  {cardChoices.map((choice, choiceIndex) => (
                    <button
                      // アクティブなカードだけクリック可にする
                      onClick={
                        isActiveCard ? () => handleClick(choice) : undefined
                      }
                      disabled={!isActiveCard || isTransitioning}
                      key={choiceIndex}
                      className={`${
                        // 今のカードなら状態に応じた色を使う。後ろのカードは半透明＋カーソル無効
                        isActiveCard
                          ? ButtonStyleSwitch(choice)
                          : `${baseButtonStyle} cursor-default opacity-70`
                      }`}>
                      {/* 選択肢の文字列（意味や単語） */}
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
