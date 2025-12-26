import {useEffect, useRef} from "react";

import {useUserConfig} from "@/pages/tests/test_page/hooks/useUserConfig";

const correctSoundOggUrl = new URL(
  "../../assets/kenney_interface-sounds/Audio/answer_correct.ogg",
  import.meta.url,
).href;
const correctSoundMp3Url = new URL(
  "../../assets/kenney_interface-sounds/Audio/answer_correct.mp3",
  import.meta.url,
).href;
const incorrectSoundOggUrl = new URL(
  "../../assets/kenney_interface-sounds/Audio/answer_incorrect.ogg",
  import.meta.url,
).href;
const incorrectSoundMp3Url = new URL(
  "../../assets/kenney_interface-sounds/Audio/answer_incorrect.mp3",
  import.meta.url,
).href;

interface AnswerSoundControls {
  playAnswerSound: (isCorrect: boolean) => void;
}

export const useAnswerResultSound = (): AnswerSoundControls => {
  const {config} = useUserConfig();
  // 設定画面のON/OFFに合わせて音とバイブの挙動を切り替える
  const {isSoundEnabled, isVibrationEnabled} = config.soundPreference;
  // バイブが使えるかどうかをキャッシュしておく
  const canVibrateRef = useRef(false);
  // バイブが使えない端末向けに音を保持しておく
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const incorrectAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (typeof navigator === "undefined") return;
    canVibrateRef.current = typeof navigator.vibrate === "function";

    // 再生できる形式を選んで、音を先読みしておく
    if (isSoundEnabled) {
      const probe = document.createElement("audio");
      const canPlayMp3 = probe.canPlayType("audio/mpeg");
      const canPlayOgg = probe.canPlayType("audio/ogg; codecs=\"vorbis\"");
      const pickUrl = (oggUrl: string, mp3Url: string) =>
        canPlayMp3 !== ""
          ? mp3Url
          : canPlayOgg !== ""
            ? oggUrl
            : mp3Url;

      const correctAudio = new Audio(
        pickUrl(correctSoundOggUrl, correctSoundMp3Url),
      );
      const incorrectAudio = new Audio(
        pickUrl(incorrectSoundOggUrl, incorrectSoundMp3Url),
      );
      correctAudio.preload = "auto";
      incorrectAudio.preload = "auto";
      correctAudio.volume = 0.95;
      incorrectAudio.volume = 0.95;
      correctAudioRef.current = correctAudio;
      incorrectAudioRef.current = incorrectAudio;
    } else {
      correctAudioRef.current = null;
      incorrectAudioRef.current = null;
    }

    return () => {
      correctAudioRef.current = null;
      incorrectAudioRef.current = null;
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
    playback.pause();
    playback.currentTime = 0;
    const result = playback.play();
    // テスト環境ではplayがPromiseを返さない場合があるので安全にガードする
    if (result && typeof result.catch === "function") {
      void result.catch(() => {});
    }
  };

  return {playAnswerSound};
};
