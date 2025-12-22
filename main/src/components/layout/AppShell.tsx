import {Outlet} from "react-router-dom";

import {GaPageViewTracker} from "@/components/analytics/GaPageViewTracker";
import {useButtonClickSound} from "@/hooks/useButtonClickSound";

export const AppShell = () => {
  useButtonClickSound();
  return (
    <>
      <GaPageViewTracker />
      <Outlet />
    </>
  );
};
