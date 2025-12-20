import {Outlet} from "react-router-dom";

import {GaPageViewTracker} from "@/components/analytics/GaPageViewTracker";

export const AppShell = () => {
  return (
    <>
      <GaPageViewTracker />
      <Outlet />
    </>
  );
};
