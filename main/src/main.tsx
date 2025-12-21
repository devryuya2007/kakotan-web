import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {RouterProvider, createBrowserRouter} from "react-router-dom";

import HomePage from "./pages/home/HomePage";
import MenuPage from "./pages/menu/MenuPage";
import MiniResultPage from "./pages/results/MiniResultPage";
import ResultsPage from "./pages/results/ResultsPage";
import StageSelectPage from "./pages/stages/StageSelectPage";
import StageTestPage from "./pages/stages/StageTestPage";
import {TestResultsProvider} from "./pages/states/TestReSultContext";
import YearTestPage from "./pages/tests/test_page/YearTestPage";
import {UserConfigProvider} from "./pages/tests/test_page/userConfigContext";
import UserConfig from "./pages/userConfig/userConfig";
import {AppShell} from "./components/layout/AppShell";

import "./index.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element #root not found");
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {index: true, element: <HomePage />},
      {path: "menu", element: <MenuPage />},
      {path: "results", element: <ResultsPage />},
      {path: "results/mini", element: <MiniResultPage />},
      {path: "stages/:year", element: <StageSelectPage />},
      {path: "stages/:year/:stageNumber", element: <StageTestPage />},
      {path: "tests/:year", element: <YearTestPage />},
      {path: "pages/user-config", element: <UserConfig />},
    ],
  },
]);

createRoot(container).render(
  <StrictMode>
    <UserConfigProvider>
      <TestResultsProvider>
        <RouterProvider router={router} />
      </TestResultsProvider>
    </UserConfigProvider>
  </StrictMode>,
);
