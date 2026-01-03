import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { ChangeEvent } from "react";

import {
  PLAYER_REGISTRY_STORAGE_KEY,
  useUserYearRegistryImport,
} from "@/data/userYearRegistry";

const ensureFileText = (file: File, content: string) => {
  if (typeof file.text === "function") return;
  Object.defineProperty(file, "text", {
    value: async () => content,
  });
};

const buildTestFile = (name: string, content: string, type = "application/json"): File => {
  const file = new File([content], name, { type });
  ensureFileText(file, content);
  return file;
};

const buildFileInputEvent = (file: File): ChangeEvent<HTMLInputElement> => {
  const input = document.createElement("input");
  Object.defineProperty(input, "files", {
    value: [file],
    writable: false,
  });
  return { currentTarget: input } as ChangeEvent<HTMLInputElement>;
};

describe("useUserYearRegistryImport", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("配列JSONをインポートするとファイル名からkey/labelが作成される", async () => {
    const { result } = renderHook(() => useUserYearRegistryImport());
    const payload = [
      { phrase: "apple", mean: "りんご" },
      { phrase: "policy", mean: "政策・方針" },
    ];
    const file = buildTestFile("My Vocab.json", JSON.stringify(payload));

    await act(async () => {
      await result.current.handleDataImport(buildFileInputEvent(file));
    });

    await waitFor(() => {
      expect(result.current.importSuccess).toBe("Import complete: 2 words added.");
    });
    expect(result.current.importError).toBeNull();

    const stored = JSON.parse(localStorage.getItem(PLAYER_REGISTRY_STORAGE_KEY) ?? "[]");
    expect(stored).toHaveLength(1);
    expect(typeof stored[0].id).toBe("string");
    expect(stored[0].key).toBe("player-my-vocab");
    expect(stored[0].label).toBe("My Vocab");
    expect(stored[0].vocab).toEqual(payload);
  });

  test("key/label/vocab形式のJSONはkeyとlabelがそのまま保存される", async () => {
    const { result } = renderHook(() => useUserYearRegistryImport());
    const payload = {
      key: "custom-set",
      label: "Custom Set",
      vocab: [{ phrase: "alpha", mean: "アルファ" }],
    };
    const file = buildTestFile("custom.json", JSON.stringify(payload));

    await act(async () => {
      await result.current.handleDataImport(buildFileInputEvent(file));
    });

    await waitFor(() => {
      expect(result.current.importSuccess).toBe("Import complete: 1 words added.");
    });

    const stored = JSON.parse(localStorage.getItem(PLAYER_REGISTRY_STORAGE_KEY) ?? "[]");
    expect(stored).toHaveLength(1);
    expect(typeof stored[0].id).toBe("string");
    expect(stored[0].key).toBe("custom-set");
    expect(stored[0].label).toBe("Custom Set");
    expect(stored[0].vocab).toEqual(payload.vocab);
  });

  test("JSONとして読めない場合はエラーになる", async () => {
    const { result } = renderHook(() => useUserYearRegistryImport());
    const file = buildTestFile("broken.json", "not json");

    await act(async () => {
      await result.current.handleDataImport(buildFileInputEvent(file));
    });

    await waitFor(() => {
      expect(result.current.importError).toBe("cannot load it as json file.");
    });
    expect(result.current.importSuccess).toBeNull();
    expect(localStorage.getItem(PLAYER_REGISTRY_STORAGE_KEY)).toBeNull();
  });

  test("拡張子がjson以外のときはエラーになる", async () => {
    const { result } = renderHook(() => useUserYearRegistryImport());
    const file = buildTestFile("vocab.txt", "[]", "text/plain");

    await act(async () => {
      await result.current.handleDataImport(buildFileInputEvent(file));
    });

    await waitFor(() => {
      expect(result.current.importError).toBe("you can only load JSON file.");
    });
    expect(result.current.importSuccess).toBeNull();
  });

  test("成功通知は一定時間後に消える", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useUserYearRegistryImport());
    const payload = [{ phrase: "alpha", mean: "アルファ" }];
    const file = buildTestFile("timed.json", JSON.stringify(payload));

    await act(async () => {
      await result.current.handleDataImport(buildFileInputEvent(file));
    });

    expect(result.current.importSuccess).toBe("Import complete: 1 words added.");

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.importSuccess).toBeNull();
  });

  test("追加したセットを削除すると一覧とlocalStorageが更新される", () => {
    const initial = [
      {
        key: "custom-set",
        label: "Custom Set",
        vocab: [{ phrase: "alpha", mean: "アルファ" }],
      },
    ];
    localStorage.setItem(PLAYER_REGISTRY_STORAGE_KEY, JSON.stringify(initial));

    const { result } = renderHook(() => useUserYearRegistryImport());

    expect(result.current.playerRegistry).toHaveLength(1);

    act(() => {
      result.current.removePlayerRegistry(result.current.playerRegistry[0].id);
    });

    expect(result.current.playerRegistry).toHaveLength(0);
    const stored = JSON.parse(localStorage.getItem(PLAYER_REGISTRY_STORAGE_KEY) ?? "[]");
    expect(stored).toHaveLength(0);
  });
});
