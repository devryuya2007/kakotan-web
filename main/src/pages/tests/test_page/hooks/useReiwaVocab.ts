import {initialUserConfig, useUserConfig} from '../userConfigContext';

import {useYearVocab} from '@/hooks/useYearVocab';

type YearKey = keyof typeof initialUserConfig;

const createYearVocabHook = (year: YearKey) => {
  return () => {
    const {config} = useUserConfig();
    const {sectionId, maxCount} = config[year];
    return useYearVocab(sectionId, maxCount);
  };
};

export const useReiwa3Vocab = createYearVocabHook('reiwa3');
export const useReiwa4Vocab = createYearVocabHook('reiwa4');
export const useReiwa5Vocab = createYearVocabHook('reiwa5');
export const useReiwa6Vocab = createYearVocabHook('reiwa6');
export const useReiwa7Vocab = createYearVocabHook('reiwa7');
