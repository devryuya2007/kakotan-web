import {useContext} from 'react';

import {UserConfigContext} from '../userConfigStore';

export function useUserConfig() {
  const context = useContext(UserConfigContext);
  if (!context) {
    throw new Error('useUserConfig must be used inside a UserConfigProvider');
  }
  return context;
}
