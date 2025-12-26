import {useEffect, useRef} from "react";

const correctSoundUrl = new URL(
  "../../assets/kenney_interface-sounds/Audio/answer_correct.ogg",
  import.meta.url,
).href;
const incorrectSoundUrl = new URL(
  "../../assets/kenney_interface-sounds/Audio/answer_incorrect.ogg",
  import.meta.url,
).href;

interface AnswerSoundControls {
  playAnswerSound: (isCorrect: boolean) => void;
}

export const useAnswerResultSound = (): AnswerSoundControls => {
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const incorrectAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 正解・不正解の短い音を先読みして、クリック直後の遅延を減らす
    const correctAudio = new Audio(correctSoundUrl);
    correctAudio.preload = "auto";
    // 音量を上げて、短い音でも聞き取りやすくする
    correctAudio.volume = 0.95;

    const incorrectAudio = new Audio(incorrectSoundUrl);
    incorrectAudio.preload = "auto";
    // 不正解も少し大きめにして、低音でも聞き取れるようにする
    incorrectAudio.volume = 0.95;

    correctAudioRef.current = correctAudio;
    incorrectAudioRef.current = incorrectAudio;

    return () => {
      // アンマウント時に参照を外して、ガベージコレクションで解放できるようにする
      correctAudioRef.current = null;
      incorrectAudioRef.current = null;
    };
  }, []);

  const playAnswerSound = (isCorrect: boolean) => {
    // 正誤に合わせて再生する音を切り替える
    const playback = isCorrect
      ? correctAudioRef.current
      : incorrectAudioRef.current;
    if (!playback) return;

    // 連打でも必ず先頭から鳴るように巻き戻す
    playback.pause();
    playback.currentTime = 0;
    void playback.play().catch(() => {});
  };

  return {playAnswerSound};
};
