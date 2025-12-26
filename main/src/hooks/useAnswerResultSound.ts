import {useEffect, useRef} from "react";

const correctSoundUrl = new URL(
  "../../assets/kenney_interface-sounds/Audio/answer_correct.ogg",
  import.meta.url,
).href;

interface AnswerSoundControls {
  playAnswerSound: (isCorrect: boolean) => void;
}

export const useAnswerResultSound = (): AnswerSoundControls => {
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 正解音を先読みして、クリック直後の遅延を減らす
    const correctAudio = new Audio(correctSoundUrl);
    correctAudio.preload = "auto";
    // 音量を上げて、短い音でも聞き取りやすくする
    correctAudio.volume = 0.95;

    correctAudioRef.current = correctAudio;

    return () => {
      // アンマウント時に参照を外して、ガベージコレクションで解放できるようにする
      correctAudioRef.current = null;
    };
  }, []);

  const playAnswerSound = (isCorrect: boolean) => {
    // 不正解時は音を鳴らさない
    if (!isCorrect) return;
    const playback = correctAudioRef.current;
    if (!playback) return;

    // 連打でも必ず先頭から鳴るように巻き戻す
    playback.pause();
    playback.currentTime = 0;
    void playback.play().catch(() => {});
  };

  return {playAnswerSound};
};
