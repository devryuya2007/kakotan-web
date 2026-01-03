import {render, waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import {afterEach, describe, expect, test, vi} from "vitest";

import {GaPageViewTracker} from "@/components/analytics/GaPageViewTracker";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __GA_MEASUREMENT_ID__?: string;
  }
}

// 既存のgtagを保持しておき、テスト後に必ず戻す
const originalGtag = window.gtag;
const originalMeasurementId = window.__GA_MEASUREMENT_ID__;

describe("GaPageViewTracker", () => {
  afterEach(() => {
    // テスト間でグローバル状態が漏れないように復元する
    window.gtag = originalGtag;
    window.__GA_MEASUREMENT_ID__ = originalMeasurementId;
    window.localStorage.removeItem("ga4:user-id");
  });

  test("ルート情報からpage_viewを送る", async () => {
    // gtagをモックして送信内容を検証できるようにする
    const gtagMock = vi.fn();
    window.gtag = gtagMock;
    window.__GA_MEASUREMENT_ID__ = "G-TEST-123";
    window.localStorage.setItem("ga4:user-id", "test-user-id");

    render(
      <MemoryRouter initialEntries={["/tests/reiwa3?mode=1#hash"]}>
        <GaPageViewTracker />
      </MemoryRouter>,
    );

    // useEffectの発火を待ってから呼び出し内容を確認する
    await waitFor(() => {
      expect(gtagMock).toHaveBeenCalled();
    });

    expect(gtagMock).toHaveBeenCalledWith(
      "config",
      "G-TEST-123",
      expect.objectContaining({
        user_id: "test-user-id",
      }),
    );

    expect(gtagMock).toHaveBeenCalledWith(
      "event",
      "page_view",
      expect.objectContaining({
        page_path: "/tests/reiwa3?mode=1#hash",
      }),
    );
  });
});
