import { useEffect, useRef } from "react";

import { useUserConfig } from "@/pages/tests/test_page/hooks/useUserConfig";
import {
  createAudio,
  detectShouldUnlockAudio,
  pickPlayableAudioUrl,
  resetAudioPlayback,
  unlockAudioIfNeeded,
} from "@/hooks/soundUtils";
const correctSoundOggUrl = new URL(
  "../../assets/kenney_interface-sounds/Audio/answer_correct.ogg",
  import.meta.url
).href;
const correctSoundMp3Url = new URL(
  "../../assets/kenney_interface-sounds/Audio/answer_correct.mp3",
  import.meta.url
).href;
const incorrectSoundOggUrl = new URL(
  "../../assets/kenney_interface-sounds/Audio/answer_incorrect.ogg",
  import.meta.url
).href;
const incorrectSoundMp3Url = new URL(
  "../../assets/kenney_interface-sounds/Audio/answer_incorrect.mp3",
  import.meta.url
).href;

interface AnswerSoundControls {
  playAnswerSound: (isCorrect: boolean) => void;
}

export const useAnswerResultSound = (): AnswerSoundControls => {
  const { config } = useUserConfig();
  // 設定画面のON/OFFに合わせて音とバイブの挙動を切り替える
  const { isSoundEnabled, isVibrationEnabled } = config.soundPreference;
  // iOS Safariはユーザー操作で一度音を再生しないと後続の音が鳴らないことがある
  const shouldUnlockRef = useRef(detectShouldUnlockAudio());
  const isUnlockedRef = useRef(!shouldUnlockRef.current);
  // バイブが使えるかどうかをキャッシュしておく
  const canVibrateRef = useRef(false);
  // バイブが使えない端末向けに音を保持しておく
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const incorrectAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const shouldUnlock = shouldUnlockRef.current === true;
    if (typeof document === "undefined") return;
    if (typeof navigator === "undefined") return;
    canVibrateRef.current = typeof navigator.vibrate === "function";

    // 再生できる形式を選んで、音を先読みしておく
    if (isSoundEnabled) {
      const correctUrl = pickPlayableAudioUrl(
        correctSoundOggUrl,
        correctSoundMp3Url
      );
      const incorrectUrl = pickPlayableAudioUrl(
        incorrectSoundOggUrl,
        incorrectSoundMp3Url
      );
      correctAudioRef.current = createAudio(correctUrl, 0.95);
      incorrectAudioRef.current = createAudio(incorrectUrl, 0.95);
      isUnlockedRef.current = !shouldUnlock;
    } else {
      correctAudioRef.current = null;
      incorrectAudioRef.current = null;
      isUnlockedRef.current = !shouldUnlock;
    }

    const handleUnlock = () => {
      const playback = correctAudioRef.current ?? incorrectAudioRef.current;
      unlockAudioIfNeeded(playback, shouldUnlock, isUnlockedRef);
    };

    if (shouldUnlock && isSoundEnabled) {
      document.addEventListener("pointerdown", handleUnlock, {capture: true});
      document.addEventListener("touchstart", handleUnlock, {capture: true});
    }

    return () => {
      correctAudioRef.current = null;
      incorrectAudioRef.current = null;
      if (shouldUnlock && isSoundEnabled) {
        document.removeEventListener("pointerdown", handleUnlock, {
          capture: true,
        });
        document.removeEventListener("touchstart", handleUnlock, {
          capture: true,
        });
      }
    };
  }, [isSoundEnabled]);

  const playAnswerSound = (isCorrect: boolean) => {
    // 先にバイブを試し、使えない端末は音にフォールバックする
    if (isVibrationEnabled && canVibrateRef.current) {
      if (isCorrect) {
        const didVibrate = navigator.vibrate(30);
        if (didVibrate) return;
      } else {
        const didVibrate = navigator.vibrate([20, 40, 20]);
        if (didVibrate) return;
      }
    }

    if (!isSoundEnabled) return;
    const playback = isCorrect
      ? correctAudioRef.current
      : incorrectAudioRef.current;
    if (!playback) return;
    if (shouldUnlockRef.current === true && !isUnlockedRef.current) {
      return;
    }
    resetAudioPlayback(playback);
    const result = playback.play();
    // テスト環境ではplayがPromiseを返さない場合があるので安全にガードする
    if (result && typeof result.catch === "function") {
      void result.catch(() => {});
    }
  };

  return { playAnswerSound };
};
