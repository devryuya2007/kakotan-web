import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const USER_CONFIG_STORAGE_KEY = 'user-config:max-count';

export const initialUserConfig = {
  reiwa3: {maxCount: 20, sectionId: 'reiwa3'},
  reiwa4: {maxCount: 20, sectionId: 'reiwa4'},
  reiwa5: {maxCount: 20, sectionId: 'reiwa5'},
  reiwa6: {maxCount: 20, sectionId: 'reiwa6'},
  reiwa7: {maxCount: 20, sectionId: 'reiwa7'},
} as const;

type UserConfigState = typeof initialUserConfig;
type YearKey = keyof UserConfigState;

type UserConfigContextValue = {
  config: UserConfigState;
  setMaxCount: (year: YearKey, value: number) => void;
};

const UserConfigContext = createContext<UserConfigContextValue | undefined>(
  undefined,
);

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

export function useUserConfig() {
  const context = useContext(UserConfigContext);
  if (!context) {
    throw new Error('useUserConfig must be used inside a UserConfigProvider');
  }
  return context;
}
