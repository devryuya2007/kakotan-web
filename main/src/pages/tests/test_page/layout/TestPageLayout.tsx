// 単語テストの一問分を表す型。外部のデータローダーから入ってくる
import { type QuizQuestion } from "../../../../data/vocabLoader";

import {
  type CSSProperties,
  type MouseEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";

import { QuickStartButton } from "@/components/buttons/QuickStartButton";
import { XP_PER_CORRECT, XP_PER_INCORRECT, getExperiencePoints } from "@/features/results/scoring";
import { recordStageAttempt, recordStageResult } from "@/features/stages/stageProgressStore";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useAnswerResultSound } from "@/hooks/useAnswerResultSound";
import { useTestResults } from "@/pages/states/useTestResults";

// このコンポーネントが受け取るpropsの形。questionsは問題配列、countは総数
interface TestPageLayoutProps {
  questions: QuizQuestion[];
  count: number;
  sectionId: string;
  stageId?: string;
}

// テスト中の累積EXPを表示する小さなコンポーネント
interface ExpIndicatorProps {
  value: number;
  isPulse: boolean;
  prefersReducedMotion: boolean;
  gain: { amount: number; isCorrect: boolean; key: number } | null;
  isCompact: boolean;
  fillRatio: number;
}

export const ExpIndicator = ({
  value,
  isPulse,
  prefersReducedMotion,
  gain,
  isCompact,
  fillRatio,
}: ExpIndicatorProps) => {
  const clipPathId = useId();
  const gainBadgeRef = useRef<HTMLSpanElement | null>(null);
  const gainAnimationRef = useRef<gsap.core.Timeline | null>(null);
  const fillRectRef = useRef<SVGRectElement | null>(null);
  const fillAnimationRef = useRef<gsap.core.Tween | null>(null);
  const expIndicatorClass = isCompact
    ? "pointer-events-none absolute left-1/2 top-[6px] z-[30] -translate-x-1/2"
    : "pointer-events-none absolute left-1/2 top-[14px] z-[30] -translate-x-1/2";
  const expIndicatorInnerClass = `relative inline-flex ${isCompact ? "h-[54px] w-[54px]" : "h-[70px] w-[70px]"} items-center justify-center ${
    isPulse ? "scale-[1.03]" : "scale-100"
  } ${prefersReducedMotion ? "" : "transition-transform duration-300"}`;
  const fillLevel = Math.min(1, Math.max(0, fillRatio));
  const fillHeight = 100 * fillLevel;
  const fillY = 100 - fillHeight;
  const gainBadgeClass = gain?.isCorrect
    ? "border-emerald-200/80 bg-emerald-500/90 text-emerald-50 shadow-[0_10px_24px_rgba(16,185,129,0.35)]"
    : "border-rose-200/80 bg-rose-500/90 text-rose-50 shadow-[0_10px_24px_rgba(244,63,94,0.35)]";

  useLayoutEffect(() => {
    const rect = fillRectRef.current;
    if (!rect) return;
    if (fillAnimationRef.current) {
      fillAnimationRef.current.kill();
    }
    if (prefersReducedMotion) {
      rect.setAttribute("y", `${fillY}`);
      rect.setAttribute("height", `${fillHeight}`);
      return;
    }
    fillAnimationRef.current = gsap.to(rect, {
      duration: 0.4,
      ease: "power2.out",
      attr: { y: fillY, height: fillHeight },
    });
  }, [fillY, fillHeight, prefersReducedMotion]);

  useLayoutEffect(() => {
    if (!gain || prefersReducedMotion) return;
    const badge = gainBadgeRef.current;
    if (!badge) return;
    if (gainAnimationRef.current) {
      gainAnimationRef.current.kill();
    }
    gainAnimationRef.current = gsap
      .timeline()
      .fromTo(
        badge,
        { autoAlpha: 0, scale: 0.85, y: 6 },
        {
          autoAlpha: 1,
          scale: 1.1,
          y: -6,
          duration: 0.2,
          ease: "back.out(2.6)",
        },
      )
      .to(badge, {
        autoAlpha: 0,
        y: -14,
        duration: 0.2,
        ease: "power2.in",
      });
  }, [gain, prefersReducedMotion]);

  return (
    <div className={expIndicatorClass} aria-live="polite" data-testid="exp-indicator">
      <div className={expIndicatorInnerClass}>
        <svg
          className="absolute inset-0 h-full w-full -translate-y-[2px]"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`${clipPathId}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.85" />
            </linearGradient>
            <clipPath id={clipPathId}>
              <polygon points="50,6 96,96 4,96" />
            </clipPath>
          </defs>
          <rect
            ref={fillRectRef}
            x="0"
            y={fillY}
            width="100"
            height={fillHeight}
            fill={`url(#${clipPathId}-fill)`}
            clipPath={`url(#${clipPathId})`}
          />
          <polygon
            points="50,6 96,96 4,96"
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
        <span className="relative z-10 text-[18px] font-semibold tabular-nums tracking-[0.08em] text-emerald-100">
          {value}
        </span>
        {gain && (
          <span
            ref={gainBadgeRef}
            key={gain.key}
            className={`absolute -top-2 right-0 rounded-lg border px-2 py-0.5 text-[10px] font-semibold ${gainBadgeClass}`}
          >
            {`+${gain.amount}`}
          </span>
        )}
      </div>
    </div>
  );
};

export default function TestPageLayout({
  questions,
  count,
  sectionId,
  stageId,
}: TestPageLayoutProps) {
  // いま表示している問題の配列インデックス
  const { correct, incorrect, recordResult, totalXp, applyXp, reset, addSession } =
    useTestResults();

  // このテスト開始時点の累積XPを固定で持っておく
  const baseTotalXpRef = useRef(totalXp);
  const sessionStartRef = useRef<number | null>(null);
  // 正解・不正解に合わせた効果音を鳴らすための関数
  const { playAnswerSound } = useAnswerResultSound();

  const [isSmall, setIsSmall] = useState(() => window.matchMedia("(max-width: 640px)").matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsSmall(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // 表示するカードのindexから適切なレイアウト情報を引き出す
  function getCardPresentation(idx: number) {
    const desktopLayouts =
      isSlideActive && effectiveTransitionDuration > 0 ? transitionLayouts : baseLayouts;
    const mobileLayouts =
      isSlideActive && effectiveTransitionDuration > 0 ? smallTransitionLayouts : smallBaseLayouts;
    const layouts = isSmall ? mobileLayouts : desktopLayouts;
    const clampedIndex = Math.min(idx, layouts.length - 1);
    return layouts[clampedIndex];
  }

  useEffect(() => {
    reset();
    sessionStartRef.current = Date.now();
    // セッション開始時点のXPを基準にして表示を初期化する
    setSessionGainedXp(0);
    setLatestGain(null);
    setAnimatedXp(0);

    // ステージモードなら挑戦済みを先に記録しておく
    if (stageId) {
      recordStageAttempt(stageId);
    }

    return () => {
      sessionStartRef.current = null;
    };
  }, [reset, stageId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  // 各選択肢が正解・不正解・未回答かを保持する
  const [buttonStates, setButtonStates] = useState<
    Record<string, "base" | "correct" | "incorrect">
  >({});
  // カード切り替え中かどうか。trueになっている間はボタン操作を無効化する
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSlideActive, setIsSlideActive] = useState(false);
  // 獲得XPのトースト表示に使うstate
  const [gainToast, setGainToast] = useState<{
    amount: number;
    key: number;
    position: { top: number; left: number };
  } | null>(null);
  // テスト中に獲得したXPを積み上げておく
  const [sessionGainedXp, setSessionGainedXp] = useState(0);
  // 直近の獲得XPをExpIndicatorに渡すためのstate
  const [latestGain, setLatestGain] = useState<{
    amount: number;
    isCorrect: boolean;
    key: number;
  } | null>(null);
  // 直近の獲得演出を強調するためのフラグ
  const [isGainPulse, setIsGainPulse] = useState(false);
  // 表示用のXPをなめらかに増やすためのstate
  const [animatedXp, setAnimatedXp] = useState(0);
  // XP演出の現在値をGSAPで回すための参照
  const xpCounterRef = useRef({ value: baseTotalXpRef.current });
  const xpTweenRef = useRef<gsap.core.Tween | null>(null);
  // トーストのアニメーション制御に使う参照
  const toastRef = useRef<HTMLDivElement | null>(null);
  const toastAnimationRef = useRef<gsap.core.Timeline | null>(null);
  const gainPulseTimeoutRef = useRef<number | null>(null);
  const expGainTimeoutRef = useRef<number | null>(null);
  // セクション要素の位置を参照してトーストの表示座標に使う
  const sectionRef = useRef<HTMLElement | null>(null);
  const toastDelayTimeoutRef = useRef<number | null>(null);
  // 解答直後の待ち時間を制御するためのタイマー参照
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // カードアニメーション終了待ち用タイマーの参照
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const effectiveTransitionDuration = prefersReducedMotion ? 0 : TRANSITION_DURATION;

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
  const expFillRatio = useMemo(() => {
    const maxXp = XP_PER_CORRECT * totalQuestions;
    if (maxXp <= 0) return 0;
    return Math.min(1, sessionGainedXp / maxXp);
  }, [sessionGainedXp, totalQuestions]);
  const finishTest = useCallback(() => {
    const snapshot = { correct, incorrect, ExperiencePoints: totalXp };
    const { gainedXp, nextTotalXp } = getExperiencePoints(snapshot);
    applyXp(gainedXp); // 得た経験値を含めた累計 - 累計 = 今回得た経験値
    const updatedTotalXp = nextTotalXp;

    const finishedAt = Date.now();
    const startedAt = sessionStartRef.current;
    const correctCount = correct.length;
    const incorrectCount = incorrect.length;
    const totalAnswered = correctCount + incorrectCount;

    const durationMs = Math.max(0, finishedAt - (startedAt as number));
    // セッション履歴は集計に使うので、テスト毎のメタ情報を丸ごと残しておく
    addSession({
      startedAt: startedAt as number,
      finishedAt,
      durationMs,
      sectionId,
      correctCount,
      incorrectCount,
      gainedXp,
      // ステージモードのときだけstageIdを記録する
      stageId,
    });
    sessionStartRef.current = null;

    // ステージモードのときは進捗を保存する（正答率90%以上でクリア扱い）
    if (stageId && totalAnswered > 0) {
      recordStageResult({
        stageId,
        correctCount,
        totalCount: totalAnswered,
      });
    }

    return { gainedXp, updatedTotalXp, durationMs };
  }, [correct, incorrect, totalXp, applyXp, addSession, sectionId, stageId]);

  const hasFinishedRef = useRef(false);
  const navigate = useNavigate();

  // すべての問題を解いたときに成績を表示させる
  useEffect(() => {
    if (currentIndex < totalQuestions) return;
    // 二重実行防止のガードはテスト対象外にする
    /* c8 ignore next */
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
      if (gainPulseTimeoutRef.current) {
        clearTimeout(gainPulseTimeoutRef.current);
      }
      if (expGainTimeoutRef.current) {
        clearTimeout(expGainTimeoutRef.current);
      }
      if (xpTweenRef.current) {
        xpTweenRef.current.kill();
      }
      if (toastAnimationRef.current) {
        toastAnimationRef.current.kill();
      }
    };
  }, []);

  // XPの現在値をrefにも保存し、次の演出で途切れないようにする
  useEffect(() => {
    xpCounterRef.current.value = animatedXp;
  }, [animatedXp]);

  // XPが増えたときに、数値をカウントアップで見せる
  useEffect(() => {
    const targetXp = Math.max(0, sessionGainedXp);
    if (prefersReducedMotion) {
      setAnimatedXp(targetXp);
      xpCounterRef.current.value = targetXp;
      return;
    }
    if (xpTweenRef.current) {
      xpTweenRef.current.kill();
    }
    if (xpCounterRef.current.value === targetXp) {
      return;
    }

    // スロットっぽく小刻みに増えるように、ステップ状のイージングを使う
    xpTweenRef.current = gsap.to(xpCounterRef.current, {
      value: targetXp,
      duration: 0.6,
      ease: "steps(24)",
      onUpdate: () => {
        setAnimatedXp(Math.round(xpCounterRef.current.value));
      },
    });

    return () => {
      if (xpTweenRef.current) {
        xpTweenRef.current.kill();
      }
    };
  }, [sessionGainedXp, prefersReducedMotion]);

  // トーストはGSAPで短く動かし、一定時間だけ表示する
  useLayoutEffect(() => {
    if (!gainToast) return;
    const toastEl = toastRef.current;
    if (!toastEl) return;

    if (toastAnimationRef.current) {
      toastAnimationRef.current.kill();
    }

    if (prefersReducedMotion) {
      const timeoutId = window.setTimeout(() => {
        setGainToast(null);
      }, TOAST_DURATION);
      return () => {
        clearTimeout(timeoutId);
      };
    }

    const holdMs = Math.max(TOAST_DURATION - 380, 0);
    toastAnimationRef.current = gsap
      .timeline({
        onComplete: () => {
          setGainToast(null);
        },
      })
      .fromTo(
        toastEl,
        { autoAlpha: 0, y: 10, scale: 0.9 },
        { autoAlpha: 1, y: -6, scale: 1, duration: 0.18, ease: "power2.out" }
      )
      .to(toastEl, {
        autoAlpha: 1,
        y: -8,
        scale: 1,
        duration: holdMs / 1000,
        ease: "none",
      })
      .to(toastEl, {
        autoAlpha: 0,
        y: -18,
        scale: 0.96,
        duration: 0.2,
        ease: "power2.in",
      });

    return () => {
      if (toastAnimationRef.current) {
        toastAnimationRef.current.kill();
      }
    };
  }, [gainToast, prefersReducedMotion, TOAST_DURATION]);

  // XPが増えた直後だけ強調演出を入れる
  useEffect(() => {
    if (sessionGainedXp <= 0) {
      setIsGainPulse(false);
      return;
    }
    setIsGainPulse(true);
    if (gainPulseTimeoutRef.current) {
      clearTimeout(gainPulseTimeoutRef.current);
    }
    gainPulseTimeoutRef.current = window.setTimeout(() => {
      setIsGainPulse(false);
      gainPulseTimeoutRef.current = null;
    }, 520);

    return () => {
      if (gainPulseTimeoutRef.current) {
        clearTimeout(gainPulseTimeoutRef.current);
      }
    };
  }, [sessionGainedXp]);

  // ExpIndicatorの加算表示は短時間だけ出す
  useEffect(() => {
    if (!latestGain) return;
    if (expGainTimeoutRef.current) {
      clearTimeout(expGainTimeoutRef.current);
    }
    expGainTimeoutRef.current = window.setTimeout(() => {
      setLatestGain(null);
      expGainTimeoutRef.current = null;
    }, 1000);

    return () => {
      if (expGainTimeoutRef.current) {
        clearTimeout(expGainTimeoutRef.current);
      }
    };
  }, [latestGain]);

  // 問題や正解が存在しない場合は何も描画しない
  if (!question || !answerChoice)
    return <p aria-label="data-error">問題データが取得できませんでした</p>;

  // 選択肢クリック時のメイン処理
  function handleClick(choice: string, event: MouseEvent<HTMLButtonElement>) {
    setIsTransitioning(true); // 問題を連打して加算水増しを防ぐ

    // 正解かどうかを判定し、ボタンの見た目ステータスを更新
    const isAnswer = choice === answerChoice;
    // 正解・不正解の音を短く鳴らして結果を分かりやすくする
    playAnswerSound(isAnswer);
    setButtonStates((prev) => ({
      ...prev,
      [choice]: isAnswer ? "correct" : "incorrect",
    }));
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const sectionRect = sectionRef.current?.getBoundingClientRect();

    const relativeTop = buttonRect.top - sectionRect!.top + buttonRect.height / 2; // カードの上からボタンの中心までの距離
    const relativeLeft = buttonRect.left - sectionRect!.left + buttonRect.width / 2;

    const gainAmount = isAnswer ? XP_PER_CORRECT : XP_PER_INCORRECT;
    // 獲得XPは累積で表示するためにセッション内で加算しておく
    setSessionGainedXp((prev) => prev + gainAmount);
    // 正解・不正解の加算演出をExpIndicatorに渡す
    setLatestGain({ amount: gainAmount, isCorrect: isAnswer, key: Date.now() });
    clearTimeout(toastDelayTimeoutRef.current as unknown as number);
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
    clearTimeout(feedbackTimeoutRef.current as unknown as number);
    feedbackTimeoutRef.current = null;
    // アニメーション待ちタイマーも同様に解除
    clearTimeout(transitionTimeoutRef.current as unknown as number);
    transitionTimeoutRef.current = null;

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
        transitionTimeoutRef.current = setTimeout(finalizeTransition, effectiveTransitionDuration);
      }
    }, REVIEW_DURATION);
  }

  // まだ判定が付いていない選択肢ボタンの共通スタイル
  const baseButtonStyle =
    "button-pressable group relative w-full rounded-xl border border-white/15 bg-[radial-gradient(circle_at_top,#1a1c26,#070811)]/90 px-5 py-4 text-center text-base font-medium tracking-wide text-white/85 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-1 hover:border-[#f2c97d]/70 hover:bg-[radial-gradient(circle_at_top,#202333,#0d101c)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2c97d]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

  // 正解ボタン用の見た目（ゴールド系）
  const correctButtonStyle =
    "button-pressable w-full rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-200 px-5 py-4 text-center text-base font-semibold tracking-wide text-slate-900 shadow-[0_22px_48px_-20px_rgba(251,191,36,0.9)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_55px_-18px_rgba(251,191,36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

  // 不正解ボタン用の見た目（赤系）
  const incorrectButtonStyle =
    "button-pressable w-full rounded-xl border border-rose-500/60 bg-gradient-to-br from-rose-600 via-rose-500 to-rose-400 px-5 py-4 text-center text-base font-semibold tracking-wide text-rose-50 shadow-[0_18px_38px_-18px_rgba(244,63,94,0.85)] transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

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

  const smallBaseLayouts = [
    { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 40 },
    { x: 0, y: -4, scale: 0.94, opacity: 0.9, zIndex: 30 },
    { x: 0, y: -8, scale: 0.88, opacity: 0.7, zIndex: 20 },
    { x: 0, y: -10, scale: 0.82, opacity: 0.0, zIndex: 10 },
  ];
  const smallTransitionLayouts = [
    { x: 0, y: 12, scale: 1.02, opacity: 0, zIndex: 5 },
    smallBaseLayouts[0],
    smallBaseLayouts[1],
    smallBaseLayouts[2],
  ];

  const toastBaseClass =
    "absolute z-[9999] flex h-[28px] w-[72px] items-center justify-center rounded-xl border text-[12px] font-semibold shadow-[0_10px_24px_rgba(0,0,0,0.35)] pointer-events-none";

  const correctToastClass = "border-emerald-200/80 bg-emerald-500/90 text-emerald-50";
  const incorrectToastClass = "border-rose-200/80 bg-rose-500/90 text-rose-50";

  const toastVariantClass =
    gainToast?.amount === XP_PER_CORRECT ? correctToastClass : incorrectToastClass;
  const toastPositionStyle: CSSProperties | undefined = gainToast
    ? {
        top: gainToast.position.top,
        left: gainToast.position.left,
        transform: "translate(-50%, -120%)",
      }
    : undefined;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-20 w-[6rem]">
        <QuickStartButton onClick={() => navigate("/")} label="Home" />
      </div>
      <section
        // カードスタック全体の外枠。センタリングと余白を担当
        className="relative flex w-full justify-center px-0 py-6 sm:px-4 sm:py-8 lg:px-12"
        ref={sectionRef}
      >
        {gainToast && gainToast.amount === XP_PER_CORRECT && (
          <div
            ref={toastRef}
            className={`${toastBaseClass} ${toastVariantClass}`}
            style={toastPositionStyle}
            key={gainToast.key}
            data-testid="xp-toast"
          >
            {`+${gainToast.amount}`}
          </div>
        )}
        {/* デスクトップではカードを重ねるために絶対配置を使うので、この囲いをrelativeにして境界を固定化 */}
        <div className="relative !m-0 w-full max-w-none rounded-2xl px-0 sm:min-h-[420px] sm:w-full sm:max-w-3xl sm:rounded-3xl sm:px-6 lg:px-8">
          {/* 表示対象となるカード一枚ごとに描画 */}

          {visibleCards.map((cardQuestion, idx) => {
            // 先頭カードかどうか。ボタンの有効化などで使う
            const isActiveCard = idx === 0;
            // 何問目かを表示するためのインデックス
            const cardIndex = currentIndex + idx;
            // プログレスバーに使う進捗率

            const cardProgress = Math.min(((cardIndex + 1) / totalQuestions) * 100, 100);

            // 固定化された順番の選択肢配列
            const cardChoices = getShuffledChoices(cardQuestion);
            // カードの位置や透明度などの設定
            const presentation = getCardPresentation(idx);
            // transformスタイルに使う文字列を組み立てる
            const translateX = presentation.x;
            const translateY = presentation.y;
            const baseTransform = `translate3d(${translateX}%, ${translateY}%, 0) scale(${presentation.scale})`;
            const transform = isSmall ? `translate(-50%, -50%) ${baseTransform}` : baseTransform;
            // アクティブカードのみクリック可能にするためのフラグ
            const interactive = idx === 0 && !isTransitioning;
            // 影の強さをカードの前後関係で変える

            const glowClass =
              idx === 0
                ? "shadow-[0_42px_85px_-48px_rgba(242,201,125,0.65)]"
                : idx === 1
                  ? "shadow-[0_18px_60px_-54px_rgba(242,201,125,0.35)]"
                  : "";

            const cardShellClass = isSmall
              ? "absolute left-1/2 top-1/2 w-full  rounded-2xl"
              : "absolute inset-0 rounded-2xl";

            return (
              <div
                key={`${cardQuestion.phrase}-${cardIndex}`}
                className={`${cardShellClass} will-change-opacity transform-gpu bg-gradient-to-b from-[#b8860b] to-[#f2c97d] p-[2px] transition-all ease-out will-change-transform ${
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
                }}
              >
                {/* カード本体。外枠のゴールドから内側はダークな背景 */}
                <div
                  className={`relative bg-[#050509] text-white [border-radius:inherit] ${
                    isSmall ? "px-4 py-10" : "px-6 py-[72px]"
                  }`}
                >
                  {/* 問題番号やプログレスバーなどのヘッダー */}
                  {/* EXPの累積表示はカードスタックと同じ位置変化で描画する */}
                  <ExpIndicator
                    value={animatedXp}
                    isPulse={isGainPulse}
                    prefersReducedMotion={prefersReducedMotion}
                    gain={isActiveCard ? latestGain : null}
                    isCompact={isSmall}
                    fillRatio={expFillRatio}
                  />
                  <div className="sticky top-4 z-20 mb-6 rounded-xl bg-[#050509]/90 px-4 py-3 backdrop-blur-sm">
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
                  <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 text-center text-white/80 sm:grid-cols-2">
                    {cardChoices.map((choice, choiceIndex) => {
                      return (
                        <li key={choiceIndex} className="relative flex justify-center">
                          <button
                            aria-label="正誤判定"
                            data-testid={
                              choice === answerChoice ? "correct-choice" : "incorrect-choice"
                            }
                            data-skip-click-sound
                            // アクティブなカードだけクリック可にする
                            onClick={isActiveCard ? (e) => handleClick(choice, e) : undefined}
                            disabled={!isActiveCard || isTransitioning}
                            className={`${
                              // 今のカードなら状態に応じた色を使う。後ろのカードは半透明＋カーソル無効
                              isActiveCard
                                ? ButtonStyleSwitch(choice)
                                : `${baseButtonStyle} cursor-default opacity-70`
                            }`}
                          >
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
    </>
  );
}
