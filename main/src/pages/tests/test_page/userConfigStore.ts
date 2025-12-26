import {createContext} from "react";

import type {YearKey} from "@/data/yearRegistry";

import type {SoundPreferenceState, UserConfigState} from "./initialUserConfig";

export type UserConfigContextValue = {
  config: UserConfigState;
  setMaxCount: (year: YearKey, value: number) => void;
  setSoundEnabled: (value: boolean) => void;
  setVibrationEnabled: (value: boolean) => void;
  updateSoundPreference: (next: Partial<SoundPreferenceState>) => void;
};

export const UserConfigContext = createContext<
  UserConfigContextValue | undefined
>(undefined);
