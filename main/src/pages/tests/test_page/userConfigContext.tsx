import {type ReactNode, useEffect, useMemo, useState} from 'react';

import {initialUserConfig} from './initialUserConfig';
import {
  type UserConfigContextValue,
  type UserConfigState,
  type YearKey,
  UserConfigContext,
} from './userConfigStore';

const USER_CONFIG_STORAGE_KEY = 'user-config:max-count';

const loadStoredConfig = (): UserConfigState => {
  if (typeof window === 'undefined') return initialUserConfig;
  try {
    const raw = window.localStorage.getItem(USER_CONFIG_STORAGE_KEY);
    if (!raw) return initialUserConfig;
    const parsed = JSON.parse(raw) as Partial<UserConfigState>;
    return {
      ...initialUserConfig,
      ...parsed,
    };
  } catch (error) {
    console.warn('Failed to load user config', error);
    return initialUserConfig;
  }
};

export function UserConfigProvider({children}: {children: ReactNode}) {
  const [config, setConfig] = useState<UserConfigState>(() =>
    loadStoredConfig(),
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        USER_CONFIG_STORAGE_KEY,
        JSON.stringify(config),
      );
    } catch (error) {
      console.warn('Failed to persist user config', error);
    }
  }, [config]);

  const setMaxCount = (year: YearKey, value: number) => {
    setConfig((prev) => ({
      ...prev,
      [year]: {...prev[year], maxCount: value},
    }));
  };

  const value = useMemo<UserConfigContextValue>(
    () => ({
      config,
      setMaxCount,
    }),
    [config],
  );

  return (
    <UserConfigContext.Provider value={value}>
      {children}
    </UserConfigContext.Provider>
  );
}
