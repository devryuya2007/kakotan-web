import { useUserConfig } from "../tests/test_page/hooks/useUserConfig";

import { useMemo } from "react";

import * as Slider from "@radix-ui/react-slider";
import { useNavigate } from "react-router-dom";

import { QuickStartButton } from "@/components/buttons/QuickStartButton";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUserYearRegistryImport } from "@/data/userYearRegistry";

import { DataImportPanel } from "./components/DataImportPanel";
import { ImportSuccessBanner } from "./components/ImportSuccessBanner";
import { ToggleSwitch } from "./components/ToggleSwitch";

export default function UserConfig() {
  const { config, setMaxCount, setSoundEnabled } = useUserConfig();
  const { soundPreference } = config;
  const configEntries = useMemo(
    () =>
      Object.entries(config.years) as Array<
        [keyof typeof config.years, (typeof config.years)[keyof typeof config.years]]
      >,
    [config]
  );
  const navigate = useNavigate();
  // JSONインポートはUIだけ先に用意し、処理は後で実装できるようにする
  const {
    handleDataImport,
    importError,
    importSuccess,
    playerRegistry,
    removePlayerRegistry,
  } = useUserYearRegistryImport();

  return (
    <>
      <ImportSuccessBanner message={importSuccess} />
      <AppLayout
        mainClassName="overflow-y-auto overflow-x-hidden pb-8"
        floatingSlot={
          <div className="fixed bottom-6 right-6 z-50 w-[6rem]">
            <QuickStartButton onClick={() => navigate("/")} label="Home" />
          </div>
        }
      >
        <div className="flex min-h-full w-full flex-col gap-8 px-4 py-8 sm:gap-10 sm:px-8">
          <section className="flex w-full flex-col gap-6">
            <header className="space-y-1">
              <h1 className="text-[#f2c97d] text-[2rem]"> Practice Settings</h1>
              <p className="text-sm text-white/60">
                adjust the sound and question counts for your session.
              </p>
            </header>
            {/* トグル項目は余白を活かして横並びできるようにする */}
            <div className="flex flex-wrap gap-4">
              <ToggleSwitch
                id="sound-toggle"
                label="sound effects"
                description="toggle all in-app sounds, including button clicks."
                checked={soundPreference.isSoundEnabled}
                onChange={setSoundEnabled}
              />
              <DataImportPanel
                onImport={handleDataImport}
                importError={importError}
                playerRegistry={playerRegistry}
                onRemove={removePlayerRegistry}
              />
            </div>
            {/* 問題数の設定は画面幅に合わせて折り返す */}
            <div className="flex flex-wrap gap-6">
              {configEntries.map(([yearKey, yearConfig]) => (
                <div
                  key={yearConfig.sectionId}
                  className="flex w-full flex-col gap-4 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                >
                  <p className="text-sm text-white/70">
                    {yearConfig.sectionId}:{" "}
                    <span className="font-semibold text-[#f2c97d]">{yearConfig.maxCount}</span>
                  </p>
                  <Slider.Root
                    min={10}
                    max={100}
                    step={10}
                    value={[yearConfig.maxCount]}
                    onValueChange={([value]) => setMaxCount(yearKey, value)}
                    className="relative flex w-full min-w-[220px] touch-none select-none items-center"
                    aria-label={`Question count for ${yearConfig.sectionId}`}
                  >
                    <Slider.Track className="relative h-1 flex-1 rounded-full bg-white/10">
                      <Slider.Range className="absolute h-full rounded-full bg-[#f2c97d]" />
                    </Slider.Track>
                    <Slider.Thumb className="ml-4 block h-8 w-8 rounded-full border border-white/30 bg-[#0f1524] shadow-[0_4px_14px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2c97d]" />
                  </Slider.Root>
                </div>
              ))}
            </div>
          </section>
        </div>
      </AppLayout>
    </>
  );
}
