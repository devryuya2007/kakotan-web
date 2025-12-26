import { useEffect, useRef } from "react";

const clickSoundOggUrl = new URL(
  "../../assets/kenney_interface-sounds/Audio/click_002.ogg",
  import.meta.url,
).href;
const clickSoundMp3Url = new URL(
  "../../assets/kenney_interface-sounds/Audio/click_002.mp3",
  import.meta.url,
).href;

export const useButtonClickSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 端末の対応状況に合わせて再生できる形式を選ぶ
    const probe = document.createElement("audio");
    const canPlayMp3 = probe.canPlayType("audio/mpeg");
    const canPlayOgg = probe.canPlayType("audio/ogg; codecs=\"vorbis\"");
    const clickUrl =
      canPlayMp3 !== ""
        ? clickSoundMp3Url
        : canPlayOgg !== ""
          ? clickSoundOggUrl
          : clickSoundMp3Url;
    const clickAudio = new Audio(clickUrl);
    clickAudio.preload = "auto";
    clickAudio.volume = 0.65;
    audioRef.current = clickAudio;

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      const button = event.target.closest("button");
      if (!button) return;
      if (button.dataset.skipClickSound !== undefined) return;

      const playback = audioRef.current;
      if (!playback) return;
      playback.pause();
      playback.currentTime = 0;
      const result = playback.play();
      // テスト環境ではplayがPromiseを返さない場合があるので安全にガードする
      if (result && typeof result.catch === "function") {
        void result.catch(() => {});
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
    });

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, {
        capture: true,
      });
    };
  }, []);
};
