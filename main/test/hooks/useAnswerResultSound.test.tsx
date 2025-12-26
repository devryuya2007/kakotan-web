import {renderHook, waitFor} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";

import {useAnswerResultSound} from "@/hooks/useAnswerResultSound";
import {initialUserConfig} from "@/pages/tests/test_page/initialUserConfig";

interface MockAudio {
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  currentTime: number;
  preload: string;
  volume: number;
}

// useUserConfigの返り値をテストごとに差し替えるための参照
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

describe("useAnswerResultSound", () => {
  let createdAudios: MockAudio[];
  let audioConstructor: ReturnType<typeof vi.fn>;
  let vibrateSpy: ReturnType<typeof vi.fn>;
  let canPlayTypeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // テストの独立性を保つために設定とモックを初期化する
    mockConfig = {
      ...initialUserConfig,
      soundPreference: {
        ...initialUserConfig.soundPreference,
      },
    };
    createdAudios = [];
    audioConstructor = vi.fn(function (_url: string) {
      // Audioが作られたかどうかと再生呼び出しを追えるようにする
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

    // バイブの成否で分岐するので、関数をモックして戻り値を制御する
    vibrateSpy = vi.fn(() => false);
    Object.defineProperty(navigator, "vibrate", {
      configurable: true,
      value: vibrateSpy,
    });

    // 再生形式判定はテストでは固定値でよいので、常に再生できると返す
    canPlayTypeSpy = vi
      .spyOn(HTMLMediaElement.prototype, "canPlayType")
      .mockReturnValue("probably");
  });

  afterEach(() => {
    // ほかのテストに影響しないようにモックを戻す
    canPlayTypeSpy.mockRestore();
  });

  test("音がオフなら再生処理を呼ばない", () => {
    // 音とバイブを両方オフにして分岐を確認する
    mockConfig.soundPreference.isSoundEnabled = false;
    mockConfig.soundPreference.isVibrationEnabled = false;

    const {result} = renderHook(() => useAnswerResultSound());

    result.current.playAnswerSound(true);

    expect(vibrateSpy).not.toHaveBeenCalled();
    expect(audioConstructor).not.toHaveBeenCalled();
  });

  test("バイブが成功したときは音を鳴らさない", async () => {
    // バイブが使える前提でtrueを返す
    mockConfig.soundPreference.isSoundEnabled = true;
    mockConfig.soundPreference.isVibrationEnabled = true;
    vibrateSpy.mockReturnValue(true);

    const {result} = renderHook(() => useAnswerResultSound());

    await waitFor(() => {
      // 正解・不正解の2つが生成されているか確認する
      expect(createdAudios.length).toBe(2);
    });

    result.current.playAnswerSound(false);

    expect(vibrateSpy).toHaveBeenCalledWith([20, 40, 20]);
    expect(createdAudios[0].play).not.toHaveBeenCalled();
    expect(createdAudios[1].play).not.toHaveBeenCalled();
  });

  test("バイブが失敗したときは音を再生する", async () => {
    // バイブが失敗した場合は音にフォールバックする
    mockConfig.soundPreference.isSoundEnabled = true;
    mockConfig.soundPreference.isVibrationEnabled = true;
    vibrateSpy.mockReturnValue(false);

    const {result} = renderHook(() => useAnswerResultSound());

    await waitFor(() => {
      expect(createdAudios.length).toBe(2);
    });

    result.current.playAnswerSound(true);

    expect(vibrateSpy).toHaveBeenCalledWith(30);
    expect(createdAudios[0].pause).toHaveBeenCalledTimes(1);
    expect(createdAudios[0].play).toHaveBeenCalledTimes(1);
  });
});
