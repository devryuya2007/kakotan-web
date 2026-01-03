// GA4のuser_idを保存するlocalStorageキー
const GA_USER_ID_STORAGE_KEY = "ga4:user-id";

// localStorageに保存できる文字列かどうかを判定する
const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

// 乱数ベースのIDを作る（crypto.randomUUIDが無い環境向け）
const createFallbackUserId = (): string => {
  const timestampPart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `guest-${timestampPart}-${randomPart}`;
};

// GA4に送るユーザーIDを作成する（匿名IDなので個人情報は含めない）
const createGaUserId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return createFallbackUserId();
};

// localStorageからユーザーIDを読み込む（取得できなければnullを返す）
export const loadGaUserId = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(GA_USER_ID_STORAGE_KEY);
    return isNonEmptyString(stored) ? stored : null;
  } catch {
    // localStorageが使えない環境ではnullにする
    return null;
  }
};

// ユーザーIDを確実に用意して返す（保存に失敗したらnull）
export const ensureGaUserId = (): string | null => {
  if (typeof window === "undefined") return null;
  const existing = loadGaUserId();
  if (existing) return existing;

  // まだIDが無いので、新しく作る
  const nextId = createGaUserId();
  try {
    window.localStorage.setItem(GA_USER_ID_STORAGE_KEY, nextId);
    return nextId;
  } catch {
    // 保存できない場合はGA4に送らない
    return null;
  }
};

// サインアウト時などにユーザーIDをクリアする
export const clearGaUserId = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(GA_USER_ID_STORAGE_KEY);
  } catch {
    // localStorageが使えない環境では何もしない
  }
};
