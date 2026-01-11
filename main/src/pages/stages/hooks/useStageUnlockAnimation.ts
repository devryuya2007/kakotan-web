import gsap from "gsap";
import { useEffect, useRef } from "react";

interface UseFirstClearBonusInpout {
  isFirstClear: boolean;
  onComplete: () => void;
}

export default function useStageUnlockAnimation({
  isFirstClear,
  onComplete,
}: UseFirstClearBonusInpout) {
  const activeStageRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isFirstClear) return;

    const el = activeStageRef.current;

    if (!el) {
      onComplete();
      return;
    }
    // スクロール無効化ハンドラ（同じ参照でremoveできるようにする）
    const prevent = (e: Event) => e.preventDefault();

    document.addEventListener("touchmove", prevent, { passive: false });
    document.addEventListener("wheel", prevent, { passive: false });

    // 見た目クリックズレ対策：アニメ中は pointer-events を無効化しておく
    //overlayがあるためクリックされないと思うが、アニメーションさせる要素自身にもイベント無効

    //　もともとの設定がわからないので後でそれに戻すための代入

    const prevPointerEvents = el.style.pointerEvents;
    el.style.pointerEvents = "none";

    // gsap.context を使って作成したTween等をまとめて管理（cleanupしやすくするため）
    const ctx = gsap.context(() => {
      // 中央までの差分を計算
      const rect = el.getBoundingClientRect();
      const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
      const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);

      // 初回アニメーションは timeline / gsap.to で実行して onComplete を受け取る
      // quickTo を使った後でも、gsap.to は transform を更新してくれるので問題なし
      gsap
        .timeline({
          onComplete: () => {
            // 後処理：pointer-events を戻してスクロール解除、ユーザー伝達

            try {
              onComplete();
            } catch (err) {
              // 念のため例外は握りつぶすがログは残す
              // eslint-disable-next-line no-console
              console.error("onComplete threw", err);
            }
          },
        })
        .to(el, {
          x: dx,
          y: dy,
          scale: 2, // 適当に拡大させたいなら調整
          duration: 5,
          ease: "power3.out",
        });
    }, el);

    return () => {
      // クリーンアップ：gsap関連を止める & イベントリスナーを外す
      ctx.revert && ctx.revert();

      gsap.killTweensOf(activeStageRef.current as any);
      document.removeEventListener("touchmove", prevent);
      document.removeEventListener("wheel", prevent);

      // pointer-events を元に戻す（要素がまだ存在するなら）
      el.style.pointerEvents = prevPointerEvents || "";
      // eslint-disable-next-line react-hooks/exhaustive-deps
    };
  }, [isFirstClear, onComplete]);

  return { activeStageRef };
}
