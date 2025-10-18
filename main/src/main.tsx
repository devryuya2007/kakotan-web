import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import Menu from "./menu.tsx";

import TestPageMainCompornent7 from "./components/test_7/main.tsx";
import TestPageMainCompornent5 from "./components/test_5/main.tsx";
import TestPageMainCompornent4 from "./components/test_4/main.tsx";
import TestPageMainCompornent3 from "./components/test_3/main.tsx";
import TestPageMainCompornent6 from "./components/test_6/main.tsx";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element #root not found");
}

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/menu", element: <Menu /> },
  { path: "/components/test_7/main", element: <TestPageMainCompornent7 /> },
  { path: "/components/test_6/main", element: <TestPageMainCompornent6 /> },
  { path: "/components/test_5/main", element: <TestPageMainCompornent5 /> },
  { path: "/components/test_4/main", element: <TestPageMainCompornent4 /> },
  { path: "/components/test_3/main", element: <TestPageMainCompornent3 /> },
]);

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
