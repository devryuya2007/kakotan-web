import { useMemo } from "react";

import {
  buildStageStatusMap,
  type StageProgressEntry,
  type StageProgressState,
  type StageStatusMap,
} from "@/features/stages/stageProgressStore";
import type { StageDefinition } from "@/features/stages/stageUtils";

interface UseStageStatusMapInput {
  stages: StageDefinition[];
  stageProgress: StageProgressState;
  selectedStage: StageDefinition | null;
}

interface UseStageStatusMapResult {
  stageStatusMap: StageStatusMap;
  activeStageIndex: number;
  selectedStageProgress: StageProgressEntry | null;
}

// ステージの表示状態をまとめて計算する
export const useStageStatusMap = ({
  stages,
  stageProgress,
  selectedStage,
}: UseStageStatusMapInput): UseStageStatusMapResult => {
  const stageStatusMap = useMemo(
    () => buildStageStatusMap(stages, stageProgress),
    [stages, stageProgress],
  );

  const nextPlayableIndex = useMemo(() => {
    return stages.findIndex((stage) => {
      const status = stageStatusMap[stage.stageId];
      return Boolean(status?.isUnlocked && !status?.isCleared);
    });
  }, [stages, stageStatusMap]);

  const activeStageIndex = useMemo(() => {
    if (stages.length === 0) return 0;
    if (nextPlayableIndex >= 0) return nextPlayableIndex;
    return stages.length - 1;
  }, [stages.length, nextPlayableIndex]);

  const selectedStageProgress = useMemo<StageProgressEntry | null>(() => {
    if (!selectedStage) return null;
    return stageProgress[selectedStage.stageId] ?? null;
  }, [selectedStage, stageProgress]);

  return { stageStatusMap, activeStageIndex, selectedStageProgress };
};
