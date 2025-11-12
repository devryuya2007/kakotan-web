import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { useNavigate } from "react-router-dom";
// 単語テストの一問分を表す型。外部のデータローダーから入ってくる
import { type QuizQuestion } from "../../../../data/vocabLoader";
import { useTestResults } from "@/pages/states/useTestResults";
import {
  getExperiencePoints,
  XP_PER_CORRECT,
  XP_PER_INCORRECT,
} from "@/features/results/scoring";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// このコンポーネントが受け取るpropsの形。questionsは問題配列、countは総数
type TestPageLayoutProps = {
  questions: QuizQuestion[];
  count: number;
  sectionId: string;
};

export default function TestPageLayout({
  questions,
  count,
  sectionId,
}: TestPageLayoutProps) {
  // いま表示している問題の配列インデックス
  const {
    correct,
    incorrect,
    recordResult,
    totalXp,
    applyXp,
    reset,
    addSession,
  } = useTestResults();

  const sessionStartRef = useRef<number | null>(null);

  useEffect(() => {
    reset();
    sessionStartRef.current = Date.now();

    return () => {
      sessionStartRef.current = null;
    };
  }, [reset]);

  const [currentIndex, setCurrentIndex] = useState(0);
  // 各選択肢が正解・不正解・未回答かを保持する
  const [buttonStates, setButtonStates] = useState<
    Record<string, "base" | "correct" | "incorrect">
  >({});
  // カード切り替え中かどうか。trueになっている間はボタン操作を無効化する
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSlideActive, setIsSlideActive] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  // 獲得XPのトースト表示に使うstate
  const [gainToast, setGainToast] = useState<{
    amount: number;
    key: number;
    position: { top: number; left: number };
  } | null>(null);
  // セクション要素の位置を参照してトーストの表示座標に使う
  const sectionRef = useRef<HTMLElement | null>(null);
  const toastDelayTimeoutRef = useRef<number | null>(null);
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
  const REVIEW_DURATION = 800;
  // 実際のカードスライドにかける時間
  const TRANSITION_DURATION = 400; // アニメーション本体（FEEDBACK_DELAYと合わせて0.5s）
  const TOAST_DELAY = 0;
  const TOAST_DURATION = 800;
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

  const finishTest = useCallback(() => {
    const snapshot = { correct, incorrect, ExperiencePoints: totalXp };
    const { gainedXp, nextTotalXp } = getExperiencePoints(snapshot);
    applyXp(gainedXp); // 得た経験値を含めた累計 - 累計 = 今回得た経験値
    const updatedTotalXp = nextTotalXp;

    const finishedAt = Date.now();
    const startedAt = sessionStartRef.current;
    let durationMs: number | undefined;
    const correctCount = correct.length;
    const incorrectCount = incorrect.length;

    if (typeof startedAt === "number") {
      durationMs = Math.max(0, finishedAt - startedAt);
      if (durationMs > 0) {
        // セッション履歴は集計に使うので、テスト毎のメタ情報を丸ごと残しておく
        addSession({
          startedAt,
          finishedAt,
          durationMs,
          sectionId,
          correctCount,
          incorrectCount,
          gainedXp,
        });
      }
      sessionStartRef.current = null;
    }

    return { gainedXp, updatedTotalXp, durationMs };
  }, [correct, incorrect, totalXp, applyXp, addSession, sectionId]);

  const hasFinishedRef = useRef(false);
  const navigate = useNavigate();

  // すべての問題を解いたときに成績を表示させる
  useEffect(() => {
    if (currentIndex < totalQuestions) return;
    if (hasFinishedRef.current) return;

    const { gainedXp, updatedTotalXp, durationMs } = finishTest();

    hasFinishedRef.current = true;
    navigate("/results/mini", {
      state: { gainedXp, updatedTotalXp, durationMs },
    });
  }, [currentIndex, totalQuestions, finishTest, navigate]);

  // コンポーネントが壊れるときにタイマーを全部止めるためのクリーンアップ
  useEffect(() => {
    return () => {
      if (toastDelayTimeoutRef.current) {
        clearTimeout(toastDelayTimeoutRef.current);
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!gainToast) {
      setIsToastVisible(false);
      return;
    }

    const showId = window.requestAnimationFrame(() => {
      setIsToastVisible(true);
    });

    const timeoutId = window.setTimeout(() => {
      setIsToastVisible(false);
      setGainToast(null);
    }, TOAST_DURATION);

    return () => {
      window.cancelAnimationFrame(showId);
      clearTimeout(timeoutId);
    };
  }, [gainToast, TOAST_DURATION]);

  // 問題や正解が存在しない場合は何も描画しない
  if (!question || !answerChoice) return null;

  // 選択肢クリック時のメイン処理
  function handleClick(choice: string, event: MouseEvent<HTMLButtonElement>) {
    // 正解データがなくても、アニメーション中でも何もしない
    if (!answerChoice || isTransitioning || !question) return;
    setIsTransitioning(true); // 問題を連打して加算水増しを防ぐ

    // 正解かどうかを判定し、ボタンの見た目ステータスを更新
    const isAnswer = choice === answerChoice;
    setButtonStates((prev) => ({
      ...prev,
      [choice]: isAnswer ? "correct" : "incorrect",
    }));

    const buttonRect = event.currentTarget.getBoundingClientRect();
    const sectionRect = sectionRef.current?.getBoundingClientRect();

    const relativeTop = sectionRect
      ? buttonRect.top - sectionRect.top + buttonRect.height / 2 // カードの上からボタンの中心までの距離
      : buttonRect.top + buttonRect.height / 2;
    const relativeLeft = sectionRect
      ? buttonRect.left - sectionRect.left + buttonRect.width / 2
      : buttonRect.left + buttonRect.width / 2;

    const gainAmount = isAnswer ? XP_PER_CORRECT : XP_PER_INCORRECT;
    if (toastDelayTimeoutRef.current) {
      clearTimeout(toastDelayTimeoutRef.current);
    }
    toastDelayTimeoutRef.current = window.setTimeout(() => {
      setGainToast({
        amount: gainAmount,
        key: Date.now(),
        position: { top: relativeTop, left: relativeLeft },
      });
      toastDelayTimeoutRef.current = null;
    }, TOAST_DELAY);

    // 正解・不正解ごとの記録に追加
    recordResult(question, isAnswer);

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
      feedbackTimeoutRef.current = null;

      // カードの整理が終わったら次の問題へ進める
      const finalizeTransition = () => {
        setButtonStates({});
        setCurrentIndex((i) => i + 1);
        setIsTransitioning(false);
        setIsSlideActive(false);
        transitionTimeoutRef.current = null;
      };

      // アニメーションを減らしたいユーザーは即座にスキップ
      if (effectiveTransitionDuration === 0) {
        finalizeTransition();
      } else {
        setIsSlideActive(true);
        // そうでなければアニメーション時間だけ待ってから完了処理へ
        transitionTimeoutRef.current = setTimeout(
          finalizeTransition,
          effectiveTransitionDuration
        );
      }
    }, REVIEW_DURATION);
  }

  // まだ判定が付いていない選択肢ボタンの共通スタイル
  const baseButtonStyle =
    "group relative w-full rounded-xl border border-white/15 bg-[radial-gradient(circle_at_top,#1a1c26,#070811)]/90 px-5 py-4 text-center text-base font-medium tracking-wide text-white/85 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-1 hover:border-[#f2c97d]/70 hover:bg-[radial-gradient(circle_at_top,#202333,#0d101c)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2c97d]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

  // 正解ボタン用の見た目（ゴールド系）
  const correctButtonStyle =
    "w-full rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-200 px-5 py-4 text-center text-base font-semibold tracking-wide text-slate-900 shadow-[0_22px_48px_-20px_rgba(251,191,36,0.9)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_55px_-18px_rgba(251,191,36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

  // 不正解ボタン用の見た目（赤系）
  const incorrectButtonStyle =
    "w-full rounded-xl border border-rose-500/60 bg-gradient-to-br from-rose-600 via-rose-500 to-rose-400 px-5 py-4 text-center text-base font-semibold tracking-wide text-rose-50 shadow-[0_18px_38px_-18px_rgba(244,63,94,0.85)] transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

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
      isSlideActive && effectiveTransitionDuration > 0
        ? transitionLayouts
        : baseLayouts;
    const clampedIndex = Math.min(idx, layouts.length - 1);
    return layouts[clampedIndex];
  }

  const toastBaseClass =
    "absolute z-50 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-lg pointer-events-none transition-all duration-200 ease-out opacity-0 -translate-y-4";

  const correctToastClass =
    "border-emerald-200 bg-emerald-500 text-emerald-50 shadow-[0_18px_36px_-16px_rgba(16,185,129,0.75)]";
  const incorrectToastClass =
    "border-rose-200 bg-rose-500 text-rose-50 shadow-[0_18px_36px_-16px_rgba(244,63,94,0.75)]";

  const toastVariantClass =
    gainToast?.amount === XP_PER_CORRECT
      ? correctToastClass
      : incorrectToastClass;
  const toastPositionStyle: CSSProperties | undefined = gainToast
    ? {
        top: gainToast.position.top,
        left: gainToast.position.left,
        transform: "translate(-50%, -120%)",
      }
    : undefined;
  const toastVisibilityClass = isToastVisible
    ? "opacity-100 translate-y-0"
    : "opacity-0 -translate-y-3";

  return (
    // カードスタック全体の外枠。センタリングと余白を担当
    <section className="relative flex justify-center px-4" ref={sectionRef}>
      {gainToast && gainToast.amount === XP_PER_CORRECT && (
        <div
          className={`${toastBaseClass} ${toastVariantClass} ${toastVisibilityClass}`}
          style={toastPositionStyle}
          key={gainToast.key}>
          {`+${gainToast.amount} XP`}
        </div>
      )}
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
                <ul className="grid grid-cols-2 gap-3 text-center text-white/80 list-none p-0 m-0">
                  {cardChoices.map((choice, choiceIndex) => {
                    return (
                      <li
                        key={choiceIndex}
                        className="relative flex justify-center">
                        <button
                          // アクティブなカードだけクリック可にする
                          onClick={
                            isActiveCard
                              ? (e) => handleClick(choice, e)
                              : undefined
                          }
                          disabled={!isActiveCard || isTransitioning}
                          className={`${
                            // 今のカードなら状態に応じた色を使う。後ろのカードは半透明＋カーソル無効
                            isActiveCard
                              ? ButtonStyleSwitch(choice)
                              : `${baseButtonStyle} cursor-default opacity-70`
                          }`}>
                          {/* 選択肢の文字列（意味や単語） */}
                          {choice}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
