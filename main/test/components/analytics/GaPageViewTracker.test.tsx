import {render, waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import {afterEach, describe, expect, test} from "vitest";

import {GaPageViewTracker} from "@/components/analytics/GaPageViewTracker";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

// 既存のdataLayerを保持しておき、テスト後に必ず戻す
const originalDataLayer = window.dataLayer;

describe("GaPageViewTracker", () => {
  afterEach(() => {
    // テスト間でグローバル状態が漏れないように復元する
    window.dataLayer = originalDataLayer;
    window.localStorage.removeItem("analytics:user-id");
  });

  test("ルート情報からpage_viewを送る", async () => {
    window.dataLayer = [];
    window.localStorage.setItem("analytics:user-id", "test-user-id");

    render(
      <MemoryRouter initialEntries={["/tests/reiwa3?mode=1#hash"]}>
        <GaPageViewTracker />
      </MemoryRouter>,
    );

    // useEffectの発火を待ってから呼び出し内容を確認する
    await waitFor(() => {
      expect(window.dataLayer?.length).toBeGreaterThan(0);
    });

    expect(window.dataLayer?.[0]).toEqual(
      expect.objectContaining({
        event: "page_view",
        page_path: "/tests/reiwa3?mode=1#hash",
        user_id: "test-user-id",
      }),
    );
  });
});
