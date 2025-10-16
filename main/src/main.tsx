import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import Menu, { BodyStyle } from "./menu.tsx";
import TestPageMainCompornent from "./components/test_7/main.tsx";
const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element #root not found");
}

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/menu", element: <Menu BodyStyle={BodyStyle} /> },
  { path: "/components/test_7/main", element: <TestPageMainCompornent /> },
]);

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
