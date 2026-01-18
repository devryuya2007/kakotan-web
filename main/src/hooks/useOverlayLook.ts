import { useCallback, useState } from "react";

export const useOverlayLock = () => {
  const [locked, setLocked] = useState(false);

  const lock = useCallback(() => {
    setLocked(true);
  }, []);

  const unlock = useCallback(() => {
    setLocked(false);
  }, []);

  return { locked, lock, unlock };
};
