import gsap from "gsap";
import { useEffect, useRef } from "react";
interface UseFirstClearBonusInput {
  isFirstClear: boolean;

  onComplete: () => void;
}

export default function useStageUnlockAnimation({
  isFirstClear,
  onComplete,
}: UseFirstClearBonusInput) {
  const activeStageRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isFirstClear) return;
    if (!activeStageRef.current) {
      onComplete();
      return;
    }
    const context = gsap.context(() => {
      gsap.to(activeStageRef.current, {
        scale: 4,
        left: "50%",
        top: "60%",
        xPercent: -50,
        yPercent: -50,
        position: "fixed",
        zIndex: 99,
        duration: 2,

        // 4. 完了時の通知
        onComplete: () => {
          onComplete();
        },
      });
    });

    return () => {
      context.kill();
    };
  }, [isFirstClear, onComplete]);

  return { activeStageRef };
}
