import type { StageStatusMap } from "@/features/stages/stageProgressStore";
import type { StageDefinition } from "@/features/stages/stageUtils";

import { StageTile } from "./StageTile";

interface StageGridProps {
  stages: StageDefinition[];
  stageStatusMap: StageStatusMap;
  activeStageIndex: number;
  primaryColor: string;
  primaryDeep: string;
  primaryGlow: string;
  tileWidth: number;
  tileHeight: number;
  tileIconHeight: number;
  tileGap: number;
  onSelectStage: (stage: StageDefinition) => void;
}

// ステージ一覧のタイルをグリッドで描画する
export function StageGrid({
  stages,
  stageStatusMap,
  activeStageIndex,
  primaryColor,
  primaryDeep,
  primaryGlow,
  tileWidth,
  tileHeight,
  tileIconHeight,
  tileGap,
  onSelectStage,
}: StageGridProps) {
  if (stages.length === 0) return null;

  return (
    <div
      className="mx-auto grid w-full justify-center"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${tileWidth}px, ${tileWidth}px))`,
        gap: `${tileGap}px`,
      }}
    >
      {/* ステージタイルはGridで自動配置し、初期幅が0でも崩れにくくする */}
      {stages.map((stage, index) => {
        const stageStatus = stageStatusMap[stage.stageId];
        const isCleared = Boolean(stageStatus?.isCleared);
        // 進捗とステージ順から解放状態を決める
        const isUnlocked = Boolean(stageStatus?.isUnlocked);
        const isActive = index === activeStageIndex;

        return (
          <StageTile
            key={stage.stageId}
            stage={stage}
            isLocked={!isUnlocked && !isCleared}
            isCleared={isCleared}
            isActive={isActive}
            primaryColor={primaryColor}
            primaryDeep={primaryDeep}
            primaryGlow={primaryGlow}
            tileWidth={tileWidth}
            tileHeight={tileHeight}
            tileIconHeight={tileIconHeight}
            delayMs={index * 60}
            onSelect={() => onSelectStage(stage)}
          />
        );
      })}
    </div>
  );
}
