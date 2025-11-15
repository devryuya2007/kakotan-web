import {yearsConfig} from '../yearsConfig';

import {useYearVocab} from '@/hooks/useYearVocab';

type YearKey = keyof typeof yearsConfig;

const createYearVocabHook = (year: YearKey) => {
  const {sectionId, maxCount} = yearsConfig[year];
  return () => useYearVocab(sectionId, maxCount);
};

export const useReiwa3Vocab = createYearVocabHook('reiwa3');
export const useReiwa4Vocab = createYearVocabHook('reiwa4');
export const useReiwa5Vocab = createYearVocabHook('reiwa5');
export const useReiwa6Vocab = createYearVocabHook('reiwa6');
export const useReiwa7Vocab = createYearVocabHook('reiwa7');
