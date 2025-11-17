import {createContext} from 'react';

import {initialUserConfig} from './initialUserConfig';

export type UserConfigState = typeof initialUserConfig;
export type YearKey = keyof UserConfigState;

export type UserConfigContextValue = {
  config: UserConfigState;
  setMaxCount: (year: YearKey, value: number) => void;
};

export const UserConfigContext = createContext<UserConfigContextValue | undefined>(
  undefined,
);
