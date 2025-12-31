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
import {
  XP_PER_CORRECT,
  XP_PER_INCORRECT,
  getExperiencePoints,
} from "@/features/results/scoring";
import {
  recordStageAttempt,
  recordStageResult,
} from "@/features/stages/stageProgressStore";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useAnswerResultSound } from "@/hooks/useAnswerResultSound";
import { useTestResults } from "@/pages/states/useTestResults";

const hasWindow = typeof window !== "undefined";
const hasDocument = typeof document !== "undefined";
const getIsSmallDefault = () => {
  if (!hasWindow || !window.matchMedia) return false;
  return window.matchMedia("(max-width: 640px)").matches;
};
const isDocumentVisible = () =>
  hasDocument ? document.visibilityState === "visible" : true;

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
  isCompact: boolean;
  fillRatio: number;
  className?: string;
}

export const ExpIndicator = ({
  value,
  isPulse,
  prefersReducedMotion,
  isCompact,
  fillRatio,
  className,
}: ExpIndicatorProps) => {
  // 複数表示されてもIDがかぶらないようにユニークなIDを作る
  const baseId = useId().replace(/:/g, "");
  // SVG内の定義を参照するためのIDをまとめて用意する
  const charShapeId = `${baseId}-shape`;
  const waterGradientId = `${baseId}-water`;
  const clipPathId = `${baseId}-clip`;
  const expIndicatorClass =
    className ??
    (isCompact
      ? "absolute left-1/2 top-[6px] z-[30] -translate-x-1/2"
      : "absolute left-1/2 top-[14px] z-[30] -translate-x-1/2");
  const expIndicatorInnerClass = `relative inline-flex ${
    isCompact ? "h-[54px] w-[54px]" : "h-[70px] w-[70px]"
  } items-center justify-center ${
    isPulse ? "scale-[1.03]" : "scale-100"
  } ${prefersReducedMotion ? "" : "transition-transform duration-300"}`;
  // 波の形を2パターン用意して、左右移動ではなく形だけ揺らす
  const wavePathBase = "M-50,0 Q0,10 50,0 T150,0 T250,0 V200 H-50 Z";
  const wavePathAlt = "M-50,4 Q0,6 50,4 T150,4 T250,4 V200 H-50 Z";
  // 0〜1で来る比率を0〜100の水位に変換して使う
  const fillLevel = Math.min(100, Math.max(0, fillRatio * 100));
  // 50%以上で表情をニコっと変える
  const isHappyFace = fillLevel >= 50;
  // 水位に合わせて水面の位置を上下させる（下が空、上が満タン）
  const waterTranslateY = 190 - (170 * fillLevel) / 100;
  // 低減設定のときはアニメを止めるためにtransitionを切る
  const waterStyle: CSSProperties = {
    transform: `translateY(${waterTranslateY}px)`,
    transition: prefersReducedMotion
      ? "none"
      : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  };
  const mascotRef = useRef<HTMLButtonElement | null>(null);
  const bounceTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const handleMascotTap = () => {
    if (prefersReducedMotion) return;
    const mascot = mascotRef.current;
    if (!mascot) return;

    if (bounceTimelineRef.current) {
      bounceTimelineRef.current.kill();
      bounceTimelineRef.current = null;
    }

    bounceTimelineRef.current = gsap
      .timeline()
      .to(mascot, {
        y: -12,
        scale: 1.14,
        duration: 0.14,
        ease: "power1.out",
        overwrite: "auto",
      })
      .to(mascot, {
        y: 0,
        scale: 1,
        duration: 0.26,
        ease: "bounce.out",
      });
  };
  return (
    <div className={expIndicatorClass} aria-live="polite" data-testid="exp-indicator">
      <button
        ref={mascotRef}
        type="button"
        className={`${expIndicatorInnerClass} border-none bg-transparent p-0`}
        onClick={handleMascotTap}
        aria-label="水ちゃんを動かす"
      >
        <svg
          className="absolute inset-0 h-full w-full -translate-y-[2px]"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <defs>
            <path
              id={charShapeId}
              d="M100,20 C150,20 180,60 180,110 C180,170 150,190 100,190 C50,190 20,170 20,110 C20,60 50,20 100,20 Z"
            />
            <linearGradient id={waterGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.95" />
            </linearGradient>
            <clipPath id={clipPathId}>
              <use href={`#${charShapeId}`} />
            </clipPath>
          </defs>

          <use
            href={`#${charShapeId}`}
            fill="rgba(255, 255, 255, 0.1)"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="2"
          />

          <g clipPath={`url(#${clipPathId})`}>
            <g style={waterStyle}>
              <path d={wavePathBase} fill={`url(#${waterGradientId})`}>
                {!prefersReducedMotion && (
                  <animate
                    attributeName="d"
                    dur="2.4s"
                    repeatCount="indefinite"
                    values={`${wavePathBase};${wavePathAlt};${wavePathBase}`}
                  />
                )}
              </path>
              <circle cx="50" cy="40" r="3" fill="rgba(255,255,255,0.6)">
                <animate attributeName="cy" from="40" to="-20" dur="1.5s" repeatCount="indefinite" begin="0s" />
                <animate attributeName="opacity" values="0.6;0" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="120" cy="80" r="2" fill="rgba(255,255,255,0.6)">
                <animate attributeName="cy" from="80" to="0" dur="2s" repeatCount="indefinite" begin="0.5s" />
                <animate attributeName="opacity" values="0.6;0" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          </g>
          {/* 顔は水より手前に出してキャラ感を優先する */}
          <g transform="translate(0, 10)">
            {isHappyFace ? (
              <>
                <path d="M60,100 Q70,92 80,100" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                <path d="M120,100 Q130,92 140,100" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : (
              <>
                <ellipse cx="70" cy="100" rx="8" ry="12" fill="#1e293b" />
                <circle cx="73" cy="96" r="3" fill="#ffffff" />
                <ellipse cx="130" cy="100" rx="8" ry="12" fill="#1e293b" />
                <circle cx="133" cy="96" r="3" fill="#ffffff" />
              </>
            )}
            <path
              d={isHappyFace ? "M86,108 Q100,122 114,108" : "M90,110 Q100,115 110,110"}
              fill="none"
              stroke="#1e293b"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <ellipse cx="60" cy="115" rx="6" ry="3" fill="#fda4af" opacity="0.6" />
            <ellipse cx="140" cy="115" rx="6" ry="3" fill="#fda4af" opacity="0.6" />
          </g>
        </svg>
        <span className="sr-only">{value}</span>
      </button>
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

  const now = () => performance.now();
  const isVisible = () => isDocumentVisible();
  // セッションの開始時刻（画面表示の時刻）を残す
  const sessionStartRef = useRef<number | null>(null);
  // アクティブ時間の開始点と累積値を保存する
  const activeStartRef = useRef<number | null>(isVisible() ? now() : null);
  const activeTotalRef = useRef(0);
  // 正解・不正解に合わせた効果音を鳴らすための関数
  const { playAnswerSound } = useAnswerResultSound();

  const [isSmall, setIsSmall] = useState(getIsSmallDefault);

  useEffect(() => {
    if (!hasWindow || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsSmall(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
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
    // セッション開始時点は獲得XPを0に戻す
    setSessionGainedXp(0);
    setAnimatedXp(0);
    // 画面がアクティブな時だけカウントするように初期化
    activeTotalRef.current = 0;
    activeStartRef.current = isVisible() ? now() : null;

    // ステージモードなら挑戦済みを先に記録しておく
    if (stageId) {
      recordStageAttempt(stageId);
    }

    return () => {
      sessionStartRef.current = null;
      activeStartRef.current = null;
      activeTotalRef.current = 0;
    };
  }, [reset, stageId]);

  useEffect(() => {
    const handleBlur = () => {
      // セッションが終わっている場合は何もしない
      if (sessionStartRef.current === null) return;
      if (activeStartRef.current === null) return;
      activeTotalRef.current += now() - activeStartRef.current;
      activeStartRef.current = null;
    };

    const handleFocus = () => {
      if (sessionStartRef.current === null) return;
      if (activeStartRef.current !== null) return;
      activeStartRef.current = now();
    };

    const handleVisibilityChange = () => {
      if (isVisible()) handleFocus();
      else handleBlur();
    };

    if (hasDocument) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }
    if (hasWindow) {
      window.addEventListener("blur", handleBlur);
      window.addEventListener("focus", handleFocus);
    }

    return () => {
      if (hasDocument) {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      if (hasWindow) {
        window.removeEventListener("blur", handleBlur);
        window.removeEventListener("focus", handleFocus);
      }
    };
  }, []);

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
  // 直近の獲得演出を強調するためのフラグ
  const [isGainPulse, setIsGainPulse] = useState(false);
  // 表示用のXPをなめらかに増やすためのstate
  const [animatedXp, setAnimatedXp] = useState(0);
  // XP演出の現在値をGSAPで回すための参照
  const xpCounterRef = useRef({ value: 0 });
  const xpTweenRef = useRef<gsap.core.Tween | null>(null);
  // トーストのアニメーション制御に使う参照
  const toastRef = useRef<HTMLDivElement | null>(null);
  const toastAnimationRef = useRef<gsap.core.Timeline | null>(null);
  const gainPulseTimeoutRef = useRef<number | null>(null);
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
    const startedAt = sessionStartRef.current ?? finishedAt;
    const correctCount = correct.length;
    const incorrectCount = incorrect.length;
    const totalAnswered = correctCount + incorrectCount;

    const activeDuration =
      activeTotalRef.current +
      (activeStartRef.current !== null
        ? now() - activeStartRef.current
        : 0);
    const durationMs = Math.max(0, activeDuration);
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
    activeStartRef.current = null;

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
    gainPulseTimeoutRef.current = globalThis.setTimeout(() => {
      setIsGainPulse(false);
      gainPulseTimeoutRef.current = null;
    }, 520);

    return () => {
      if (gainPulseTimeoutRef.current) {
        clearTimeout(gainPulseTimeoutRef.current);
      }
    };
  }, [sessionGainedXp]);

  // トーストはGSAPで短く動かし、一定時間だけ表示する
  useLayoutEffect(() => {
    if (!gainToast) return;
    const toastEl = toastRef.current;
    if (!toastEl) return;

    if (toastAnimationRef.current) {
      toastAnimationRef.current.kill();
    }

    if (prefersReducedMotion) {
      const timeoutId = globalThis.setTimeout(() => {
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
    clearTimeout(toastDelayTimeoutRef.current as unknown as number);
    toastDelayTimeoutRef.current = globalThis.setTimeout(() => {
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
                  <div className="sticky top-4 z-20 mb-6 rounded-xl bg-[#050509]/90 px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-white/50">
                      <span>問題 {cardIndex + 1}</span>
                      <span>
                        {cardIndex + 1} / {totalQuestions}
                      </span>
                    </div>
                    <div className="relative mt-2">
                      {/* 水ちゃんは進捗バーの上に固定で配置する */}
                      <ExpIndicator
                        value={animatedXp}
                        isPulse={isGainPulse}
                        prefersReducedMotion={prefersReducedMotion}
                        isCompact={isSmall}
                        fillRatio={expFillRatio}
                        className={
                          isSmall
                            ? "absolute left-1/2 -top-[58px] z-[30] -translate-x-1/2"
                            : "absolute left-1/2 -top-[72px] z-[30] -translate-x-1/2"
                        }
                      />
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
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
