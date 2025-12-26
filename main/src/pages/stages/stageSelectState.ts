import type {StageProgressState} from "@/features/stages/stageProgressStore";
import type {StageDefinition} from "@/features/stages/stageUtils";

export interface StageSelectState {
  selectedStage: StageDefinition | null;
  isVisible: boolean;
  stageProgress: StageProgressState;
}

export type StageSelectAction =
  | {type: "selectStage"; stage: StageDefinition | null}
  | {type: "setVisible"; isVisible: boolean}
  | {type: "setStageProgress"; progress: StageProgressState};

export const initialStageSelectState: StageSelectState = {
  selectedStage: null,
  isVisible: false,
  stageProgress: {},
};

// ステージ選択画面のUI状態をまとめて扱うreducer
export function stageSelectReducer(
  state: StageSelectState,
  action: StageSelectAction,
): StageSelectState {
  switch (action.type) {
    case "selectStage":
      return {...state, selectedStage: action.stage};
    case "setVisible":
      return {...state, isVisible: action.isVisible};
    case "setStageProgress":
      return {...state, stageProgress: action.progress};
    default:
      return state;
  }
}
