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
    // 不正解時は何もしない
    if (!isCorrect) return;
    // ブラウザが対応していれば、短いバイブで正解を伝える
    if (!canVibrateRef.current) return;
    navigator.vibrate(30);
  };

  return {playAnswerSound};
};
