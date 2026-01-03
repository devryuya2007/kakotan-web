import {afterEach, describe, expect, test} from "vitest";

import {clearGaUserId, ensureGaUserId, loadGaUserId} from "@/components/analytics/gaUserId";

// テスト後にlocalStorageの副作用を必ず掃除する
afterEach(() => {
  clearGaUserId();
});

describe("gaUserId", () => {
  test("保存済みのユーザーIDがあればそれを返す", () => {
    // 先にIDを作って保存しておく
    const firstId = ensureGaUserId();
    const secondId = ensureGaUserId();

    expect(firstId).toBeTruthy();
    expect(secondId).toBe(firstId);
  });

  test("loadGaUserIdは保存済みIDを読み込める", () => {
    const storedId = ensureGaUserId();
    const loadedId = loadGaUserId();

    expect(loadedId).toBe(storedId);
  });

  test("旧キーがあれば新キーへ移し替える", () => {
    window.localStorage.setItem("ga4:user-id", "legacy-user-id");

    const loadedId = loadGaUserId();

    expect(loadedId).toBe("legacy-user-id");
    expect(window.localStorage.getItem("analytics:user-id")).toBe("legacy-user-id");
    expect(window.localStorage.getItem("ga4:user-id")).toBeNull();
  });
});
