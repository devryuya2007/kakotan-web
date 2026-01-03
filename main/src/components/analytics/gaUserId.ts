// analyticsのuser_idを保存するlocalStorageキー
const ANALYTICS_USER_ID_STORAGE_KEY = "analytics:user-id";
// 旧キーの互換性を保つために残す
const LEGACY_USER_ID_STORAGE_KEY = "ga4:user-id";

// localStorageに保存できる文字列かどうかを判定する
const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

// OS名をざっくり判定して、匿名IDの材料にする
const getOsLabel = (): string => {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) return "ios";
  if (ua.includes("android")) return "android";
  if (ua.includes("windows")) return "windows";
  if (ua.includes("macintosh") || ua.includes("mac os")) return "mac";
  if (ua.includes("cros")) return "chromeos";
  if (ua.includes("linux")) return "linux";
  return "unknown";
};

// analyticsに送るユーザーIDを作成する（OS名 + アクセス日時の匿名ID）
const createGaUserId = (): string => {
  const osLabel = getOsLabel();
  const accessTimestamp = Date.now();
  return `${osLabel}-${accessTimestamp}`;
};

// localStorageからユーザーIDを読み込む（取得できなければnullを返す）
export const loadGaUserId = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(ANALYTICS_USER_ID_STORAGE_KEY);
    if (isNonEmptyString(stored)) return stored;

    // 旧キーが残っている場合は新キーに移し替える
    const legacyStored = window.localStorage.getItem(LEGACY_USER_ID_STORAGE_KEY);
    if (!isNonEmptyString(legacyStored)) return null;
    window.localStorage.setItem(ANALYTICS_USER_ID_STORAGE_KEY, legacyStored);
    window.localStorage.removeItem(LEGACY_USER_ID_STORAGE_KEY);
    return legacyStored;
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
    window.localStorage.setItem(ANALYTICS_USER_ID_STORAGE_KEY, nextId);
    return nextId;
  } catch {
    // 保存できない場合はanalyticsに送らない
    return null;
  }
};

// サインアウト時などにユーザーIDをクリアする
export const clearGaUserId = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ANALYTICS_USER_ID_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_USER_ID_STORAGE_KEY);
  } catch {
    // localStorageが使えない環境では何もしない
  }
};
