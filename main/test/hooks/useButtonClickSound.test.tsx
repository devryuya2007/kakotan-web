import {renderHook, waitFor} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";

import {useButtonClickSound} from "@/hooks/useButtonClickSound";
import {initialUserConfig} from "@/pages/tests/test_page/initialUserConfig";

interface MockAudio {
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  currentTime: number;
  preload: string;
  volume: number;
}

// useUserConfigの返り値をテストごとに切り替えるための参照
let mockConfig = {
  ...initialUserConfig,
  soundPreference: {
    ...initialUserConfig.soundPreference,
  },
};

vi.mock("@/pages/tests/test_page/hooks/useUserConfig", () => ({
  useUserConfig: () => ({
    config: mockConfig,
  }),
}));

describe("useButtonClickSound", () => {
  let createdAudios: MockAudio[];
  let audioConstructor: ReturnType<typeof vi.fn>;
  let canPlayTypeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // テストごとに設定とAudioモックを初期化する
    mockConfig = {
      ...initialUserConfig,
      soundPreference: {
        ...initialUserConfig.soundPreference,
      },
    };
    createdAudios = [];
    audioConstructor = vi.fn(function (_url: string) {
      // クリック音の生成と再生を追跡できるようにする
      const audio: MockAudio = {
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        currentTime: 0,
        preload: "",
        volume: 1,
      };
      void _url;
      createdAudios.push(audio);
      return audio as unknown as HTMLAudioElement;
    });
    Object.defineProperty(globalThis, "Audio", {
      configurable: true,
      value: audioConstructor,
    });

    // 再生形式は必ずOK扱いにしてテストを安定させる
    canPlayTypeSpy = vi
      .spyOn(HTMLMediaElement.prototype, "canPlayType")
      .mockReturnValue("probably");
  });

  afterEach(() => {
    // 作成したボタンを残さないように掃除する
    document.body.innerHTML = "";
    canPlayTypeSpy.mockRestore();
  });

  test("音がオフならAudioが作られない", () => {
    // 音オフの場合は初期化も再生もしない
    mockConfig.soundPreference.isSoundEnabled = false;

    renderHook(() => useButtonClickSound());

    expect(audioConstructor).not.toHaveBeenCalled();
  });

  test("ボタン押下でクリック音が再生される", async () => {
    // 音オンでボタンを押したときに再生されるか確認する
    mockConfig.soundPreference.isSoundEnabled = true;

    renderHook(() => useButtonClickSound());

    await waitFor(() => {
      expect(createdAudios.length).toBe(1);
    });

    const button = document.createElement("button");
    document.body.appendChild(button);

    // pointerdownイベントを発火させて再生を確認する
    button.dispatchEvent(new Event("pointerdown", {bubbles: true}));

    expect(createdAudios[0].play).toHaveBeenCalledTimes(1);
  });

  test("data-skip-click-soundが付いていると再生しない", async () => {
    // 音オンでも無効化フラグがあれば再生しない
    mockConfig.soundPreference.isSoundEnabled = true;

    renderHook(() => useButtonClickSound());

    await waitFor(() => {
      expect(createdAudios.length).toBe(1);
    });

    const button = document.createElement("button");
    button.dataset.skipClickSound = "true";
    document.body.appendChild(button);

    button.dispatchEvent(new Event("pointerdown", {bubbles: true}));

    expect(createdAudios[0].play).not.toHaveBeenCalled();
  });
});
