import {StrictMode} from "react";

import type {ConfigDefaults, PostHogConfig} from "posthog-js";
import {PostHogProvider} from "posthog-js/react";
import {createRoot} from "react-dom/client";
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

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
import {GaPageViewTracker} from "./components/analytics/GaPageViewTracker";

import "./index.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element #root not found");
}

// PostHogの接続先とモードをまとめておく（後で読む人が迷わないように）
const postHogOptions: Partial<PostHogConfig> = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  // PostHogの推奨デフォルト日付を型で明示する
  defaults: "2025-11-30" as ConfigDefaults,
  capture_exceptions: true, // エラーキャプチャの有効化
  debug: import.meta.env.MODE === "development",
};

const AppShell = () => {
  return (
    <>
      <GaPageViewTracker />
      <Outlet />
    </>
  );
};

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
    {/* PostHogのキーはenvから取り、全ページで計測できるようにする */}
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={postHogOptions}
    >
      <UserConfigProvider>
        <TestResultsProvider>
          <RouterProvider router={router} />
        </TestResultsProvider>
      </UserConfigProvider>
    </PostHogProvider>
  </StrictMode>,
);
