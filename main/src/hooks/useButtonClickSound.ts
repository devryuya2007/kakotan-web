import { useEffect, useRef } from "react";

import { useUserConfig } from "@/pages/tests/test_page/hooks/useUserConfig";
import {
  createAudio,
  detectShouldUnlockAudio,
  pickPlayableAudioUrl,
  resetAudioPlayback,
  unlockAudioIfNeeded,
} from "@/hooks/soundUtils";

const clickSoundOggUrl = new URL(
  "../../assets/kenney_interface-sounds/Audio/click_002.ogg",
  import.meta.url
).href;
const clickSoundMp3Url = new URL(
  "../../assets/kenney_interface-sounds/Audio/click_002.mp3",
  import.meta.url
).href;

export const useButtonClickSound = () => {
  const { config } = useUserConfig();
  // 音のON/OFF設定に合わせてクリック音を制御する
  const { isSoundEnabled } = config.soundPreference;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // iOS Safariはユーザー操作で一度音を再生しないと後続の音が鳴らないことがある
  const shouldUnlockRef = useRef(detectShouldUnlockAudio());
  const isUnlockedRef = useRef(!shouldUnlockRef.current);

  useEffect(() => {
    const shouldUnlock = shouldUnlockRef.current === true;
    if (!isSoundEnabled) {
      audioRef.current = null;
      isUnlockedRef.current = !shouldUnlock;
      return;
    }
    if (typeof document === "undefined") return;

    // 端末の対応状況に合わせて再生できる形式を選ぶ
    const clickUrl = pickPlayableAudioUrl(clickSoundOggUrl, clickSoundMp3Url);
    audioRef.current = createAudio(clickUrl, 0.65);
    isUnlockedRef.current = !shouldUnlock;

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      const button = event.target.closest("button");
      if (!button) return;
      if (button.dataset.skipClickSound !== undefined) return;

      const playback = audioRef.current;
      if (!playback) return;
      // iOS向けに先にアンロックしてから再生する
      if (!unlockAudioIfNeeded(playback, shouldUnlock, isUnlockedRef)) return;
      resetAudioPlayback(playback);
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
