import {renderHook, act} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {usePrefersReducedMotion} from "@/hooks/usePrefersReducedMotion";

// ユーザーのアニメーション設定を正しく拾えるかを確認する
describe("usePrefersReducedMotion", () => {
  test("matchMediaが無い場合はfalseのまま", () => {
    // matchMedia未対応環境の分岐を通す
    const original = window.matchMedia;
    const windowObject = window as {matchMedia?: typeof window.matchMedia};
    delete windowObject.matchMedia;

    const {result} = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: original,
    });
  });

  test("matchMediaの変更で状態が更新される", () => {
    // matchesが変わったときにstateが反映されるか確認する
    let listener: ((event: MediaQueryListEvent) => void) | null = null;
    const mediaQuery = {
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: vi.fn((_, callback) => {
        listener = callback;
      }),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;

    const original = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => mediaQuery),
    });

    const {result} = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);

    act(() => {
      if (!listener) {
        throw new Error("イベントリスナーが登録されていません");
      }
      (mediaQuery as {matches: boolean}).matches = false;
      listener({matches: false} as MediaQueryListEvent);
    });

    expect(result.current).toBe(false);

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: original,
    });
  });
});
