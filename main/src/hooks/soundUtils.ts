import type { MutableRefObject } from "react";

// iOS系ブラウザは初回操作で音を鳴らさないと後続の再生がブロックされやすい
export const detectShouldUnlockAudio = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const isIOS = /iPad|iPhone|iPod/u.test(navigator.userAgent);
  const isIPadOS =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return isIOS || isIPadOS;
};

// 端末が再生できる拡張子を選んでURLを返す
export const pickPlayableAudioUrl = (
  oggUrl: string,
  mp3Url: string
): string => {
  if (typeof document === "undefined") return mp3Url;
  const probe = document.createElement("audio");
  const canPlayMp3 = probe.canPlayType("audio/mpeg");
  const canPlayOgg = probe.canPlayType("audio/ogg; codecs=\"vorbis\"");
  if (canPlayMp3 !== "") return mp3Url;
  if (canPlayOgg !== "") return oggUrl;
  return mp3Url;
};

// 音源の初期化をまとめて行う
export const createAudio = (
  sourceUrl: string,
  volume: number
): HTMLAudioElement => {
  const audio = new Audio(sourceUrl);
  audio.preload = "auto";
  audio.volume = volume;
  return audio;
};

// 連続再生に備えて、再生位置を先頭に戻す
export const resetAudioPlayback = (playback: HTMLAudioElement) => {
  playback.pause();
  playback.currentTime = 0;
};

// iOS対策のアンロック処理（再生できる状態ならtrueを返す）
export const unlockAudioIfNeeded = (
  playback: HTMLAudioElement | null,
  shouldUnlock: boolean,
  isUnlockedRef: MutableRefObject<boolean>
): boolean => {
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
