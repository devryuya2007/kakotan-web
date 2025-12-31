import {useEffect, useRef} from "react";

import {useUserConfig} from "@/pages/tests/test_page/hooks/useUserConfig";

const clickSoundOggUrl = new URL(
  "../../assets/kenney_interface-sounds/Audio/click_002.ogg",
  import.meta.url,
).href;
const clickSoundMp3Url = new URL(
  "../../assets/kenney_interface-sounds/Audio/click_002.mp3",
  import.meta.url,
).href;

export const useButtonClickSound = () => {
  const {config} = useUserConfig();
  // 音のON/OFF設定に合わせてクリック音を制御する
  const {isSoundEnabled} = config.soundPreference;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // iOS Safariはユーザー操作で一度音を再生しないと後続の音が鳴らないことがある
  const shouldUnlockRef = useRef<boolean | null>(null);
  if (shouldUnlockRef.current === null) {
    if (typeof navigator === "undefined") {
      shouldUnlockRef.current = false;
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isIPadOS =
        navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
      shouldUnlockRef.current = isIOS || isIPadOS;
    }
  }
  const isUnlockedRef = useRef(!(shouldUnlockRef.current ?? false));

  useEffect(() => {
    const shouldUnlock = shouldUnlockRef.current === true;
    if (!isSoundEnabled) {
      audioRef.current = null;
      isUnlockedRef.current = !shouldUnlock;
      return;
    }
    if (typeof document === "undefined") return;
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
    isUnlockedRef.current = !shouldUnlock;

    const unlockAudio = (playback: HTMLAudioElement | null) => {
      if (!shouldUnlock || isUnlockedRef.current) return true;
      if (!playback) return false;
      const prevMuted = playback.muted;
      const prevVolume = playback.volume;
      playback.muted = true;
      playback.volume = 0;
      const result = playback.play();
      const finalizeUnlock = () => {
        playback.pause();
        playback.currentTime = 0;
        playback.muted = prevMuted;
        playback.volume = prevVolume;
        isUnlockedRef.current = true;
      };
      if (result && typeof result.then === "function") {
        void result.then(finalizeUnlock).catch(() => {
          playback.muted = prevMuted;
          playback.volume = prevVolume;
        });
        return false;
      }
      finalizeUnlock();
      return false;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      const button = event.target.closest("button");
      if (!button) return;
      if (button.dataset.skipClickSound !== undefined) return;

      const playback = audioRef.current;
      if (!playback) return;
      // iOS向けに先にアンロックしてから再生する
      if (!unlockAudio(playback)) return;
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
  }, [isSoundEnabled]);
};
