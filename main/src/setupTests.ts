import "@testing-library/jest-dom/vitest";
import {cleanup} from "@testing-library/react";
import {afterEach} from "vitest";

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
