import {useEffect, useRef} from "react";

// 正解時のフィードバックは端末のバイブに切り替える

interface AnswerSoundControls {
  playAnswerSound: (isCorrect: boolean) => void;
}

export const useAnswerResultSound = (): AnswerSoundControls => {
  // バイブが使えるかどうかをキャッシュしておく
  const canVibrateRef = useRef(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    canVibrateRef.current = typeof navigator.vibrate === "function";
  }, []);

  const playAnswerSound = (isCorrect: boolean) => {
    // ブラウザが対応していれば、短いバイブで正解を伝える
    if (!canVibrateRef.current) return;
    if (isCorrect) {
      navigator.vibrate(30);
      return;
    }
    // 不正解は「ブブッ」に感じる短い2回振動
    navigator.vibrate([20, 40, 20]);
  };

  return {playAnswerSound};
};
