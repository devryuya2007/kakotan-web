import { useEffect, useRef } from "react";

const clickSoundUrl = new URL(
  "../../assets/kenney_interface-sounds/Audio/click_002.ogg",
  import.meta.url
).href;

export const useButtonClickSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const clickAudio = new Audio(clickSoundUrl);
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
      void playback.play().catch(() => {});
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
