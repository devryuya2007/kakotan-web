import {useEffect, useRef} from "react";

const correctSoundUrl = new URL(
  "../../assets/kenney_interface-sounds/Audio/answer_correct.mp4",
  import.meta.url,
).href;
const incorrectSoundUrl = new URL(
  "../../assets/kenney_interface-sounds/Audio/answer_incorrect.mp4",
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
    correctAudio.volume = 0.55;

    const incorrectAudio = new Audio(incorrectSoundUrl);
    incorrectAudio.preload = "auto";
    incorrectAudio.volume = 0.55;

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
