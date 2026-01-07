// 単語テストの一問分を表す型。外部のデータローダーから入ってくる
import { type QuizQuestion } from "../../../../data/vocabLoader";

import {
  type CSSProperties,
  type MouseEvent,
  useCallback,
  useEffect,
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

import { TestQuestionCard } from "./components/TestQuestionCard";
import {
  BASE_BUTTON_STYLE,
  CORRECT_BUTTON_STYLE,
  INCORRECT_BUTTON_STYLE,
  CORRECT_TOAST_CLASS,
  INCORRECT_TOAST_CLASS,
  REVIEW_DURATION,
  TOAST_BASE_CLASS,
  TOAST_DELAY,
  TOAST_DURATION,
  TRANSITION_DURATION,
  getCardPresentation,
} from "./testPageLayoutConfig";

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
  // アクセシビリティ設定を反映した結果の真偽値
  const prefersReducedMotion = usePrefersReducedMotion();
  // 設定によってはアニメーション時間をゼロにする
  const effectiveTransitionDuration = prefersReducedMotion ? 0 : TRANSITION_DURATION;
  const useTransitionLayouts = isSlideActive && effectiveTransitionDuration > 0;

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
  }, [gainToast, prefersReducedMotion]);

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

  // 選択肢ごとの状態に合わせてスタイルを出し分ける小さなヘルパー
  function getChoiceButtonClass(choice: string) {
    if (buttonStates[choice] === "correct") return CORRECT_BUTTON_STYLE;
    if (buttonStates[choice] === "incorrect") return INCORRECT_BUTTON_STYLE;
    return BASE_BUTTON_STYLE;
  }

  const toastVariantClass =
    gainToast?.amount === XP_PER_CORRECT ? CORRECT_TOAST_CLASS : INCORRECT_TOAST_CLASS;
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
            className={`${TOAST_BASE_CLASS} ${toastVariantClass}`}
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

            // 固定化された順番の選択肢配列
            const cardChoices = getShuffledChoices(cardQuestion);
            // カードの位置や透明度などの設定
            const presentation = getCardPresentation(idx, isSmall, useTransitionLayouts);

            return (
              <TestQuestionCard
                key={`${cardQuestion.phrase}-${cardIndex}`}
                cardQuestion={cardQuestion}
                cardIndex={cardIndex}
                stackIndex={idx}
                totalQuestions={totalQuestions}
                isSmall={isSmall}
                isTransitioning={isTransitioning}
                isActiveCard={isActiveCard}
                presentation={presentation}
                effectiveTransitionDuration={effectiveTransitionDuration}
                animatedXp={animatedXp}
                isGainPulse={isGainPulse}
                prefersReducedMotion={prefersReducedMotion}
                expFillRatio={expFillRatio}
                answerChoice={answerChoice}
                cardChoices={cardChoices}
                baseButtonStyle={BASE_BUTTON_STYLE}
                getChoiceButtonClass={getChoiceButtonClass}
                onChoiceClick={handleClick}
              />
            );
          })}
        </div>
      </section>
    </>
  );
}
