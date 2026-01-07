import type { StageProgressEntry } from "./stageProgressTypes";

// ステージクリア報酬の計算結果
export interface StageClearReward {
  baseExp: number;
  firstClearBonusExp: number;
  totalExp: number;
}

// 報酬計算で使う設定値（必要なら後から差し替える）
export interface StageClearRewardConfig {
  baseClearExp: number;
  bonusBaseExp: number;
  bonusStepExp: number;
}

// 初回クリアかどうかの判定に必要な入力
export interface StageFirstClearInput {
  previousEntry?: StageProgressEntry;
  isCleared: boolean;
}

// 初回クリア報酬を計算するための入力
export interface StageClearRewardInput {
  stageNumber: number;
  isFirstClear: boolean;
  config?: Partial<StageClearRewardConfig>;
}

// まずはIssueのスニペットに合わせた既定値を置いておく
export const DEFAULT_STAGE_CLEAR_REWARD_CONFIG: StageClearRewardConfig = {
  baseClearExp: 20,
  bonusBaseExp: 30,
  bonusStepExp: 5,
};

// 進行中の設定を安全な値に整える（未指定の項目は既定値を使う）
const resolveStageClearRewardConfig = (
  config?: Partial<StageClearRewardConfig>,
): StageClearRewardConfig => ({
  baseClearExp: config?.baseClearExp ?? DEFAULT_STAGE_CLEAR_REWARD_CONFIG.baseClearExp,
  bonusBaseExp: config?.bonusBaseExp ?? DEFAULT_STAGE_CLEAR_REWARD_CONFIG.bonusBaseExp,
  bonusStepExp: config?.bonusStepExp ?? DEFAULT_STAGE_CLEAR_REWARD_CONFIG.bonusStepExp,
});

// ステージ番号は1から始まる前提なので、安全に1以上へ丸める
const normalizeStageNumber = (stageNumber: number): number =>
  Math.max(1, Math.floor(stageNumber));

// 「今クリアした」かつ「過去にクリア履歴がない」なら初回クリア
export const isFirstStageClear = ({
  previousEntry,
  isCleared,
}: StageFirstClearInput): boolean => {
  const wasCleared = Boolean(previousEntry?.cleared);
  return isCleared && !wasCleared;
};

// ステージ番号に応じた初回クリアボーナスを返す
export const getFirstClearBonusExp = (
  stageNumber: number,
  config?: Partial<StageClearRewardConfig>,
): number => {
  const safeStageNumber = normalizeStageNumber(stageNumber);
  const resolvedConfig = resolveStageClearRewardConfig(config);

  return (
    resolvedConfig.bonusBaseExp +
    (safeStageNumber - 1) * resolvedConfig.bonusStepExp
  );
};

// 初回クリア報酬をまとめて計算する
export const buildStageClearReward = ({
  stageNumber,
  isFirstClear,
  config,
}: StageClearRewardInput): StageClearReward => {
  const resolvedConfig = resolveStageClearRewardConfig(config);
  const baseExp = resolvedConfig.baseClearExp;
  const bonus = isFirstClear ? getFirstClearBonusExp(stageNumber, resolvedConfig) : 0;

  return {
    baseExp,
    firstClearBonusExp: bonus,
    totalExp: baseExp + bonus,
  };
};
