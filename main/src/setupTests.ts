import "@testing-library/jest-dom/vitest";
import {cleanup} from "@testing-library/react";
import {afterEach, vi} from "vitest";

// requestAnimationFrameが無い環境でも安全に動かすための保険
if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(Date.now()), 0);
}

// cancelAnimationFrameが無い環境でも安全に動かすための保険
if (!globalThis.cancelAnimationFrame) {
  globalThis.cancelAnimationFrame = (id: number) => {
    window.clearTimeout(id);
  };
}

afterEach(() => {
  // cleanup前にcancelAnimationFrameが無いと落ちるので保険を掛け直す
  if (!globalThis.requestAnimationFrame) {
    globalThis.requestAnimationFrame = (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(Date.now()), 0);
  }
  if (!globalThis.cancelAnimationFrame) {
    globalThis.cancelAnimationFrame = (id: number) => {
      window.clearTimeout(id);
    };
  }

  cleanup();
});

// テスト環境ではAudio再生が未実装なので、安全にモックして落ちないようにする
const createMockAudio = () => {
  return {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    currentTime: 0,
    preload: "",
    volume: 1,
  } as unknown as HTMLAudioElement;
};

Object.defineProperty(globalThis, "Audio", {
  configurable: true,
  value: vi.fn(function () {
    return createMockAudio();
  }),
});

// jsdomのHTMLMediaElement未実装メソッドを補う
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined),
});
Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  configurable: true,
  value: vi.fn(),
});

// バイブAPIを使う処理があっても落ちないように保険を入れる
if (!("vibrate" in navigator)) {
  Object.defineProperty(navigator, "vibrate", {
    configurable: true,
    value: vi.fn(() => false),
  });
}
