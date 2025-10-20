import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import HomePage from "./pages/home/HomePage";
import MenuPage from "./pages/menu/MenuPage";
import Reiwa3Page from "./pages/tests/test_page/Reiwa3Page";
import Reiwa4Page from "./pages/tests/test_page/Reiwa4Page";
import Reiwa5Page from "./pages/tests/test_page/Reiwa5Page";
import Reiwa6Page from "./pages/tests/test_page/Reiwa6Page";
import Reiwa7Page from "./pages/tests/test_page/Reiwa7Page";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element #root not found");
}

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/menu", element: <MenuPage /> },
  { path: "/tests/reiwa3", element: <Reiwa3Page /> },
  { path: "/tests/reiwa4", element: <Reiwa4Page /> },
  { path: "/tests/reiwa5", element: <Reiwa5Page /> },
  { path: "/tests/reiwa6", element: <Reiwa6Page /> },
  { path: "/tests/reiwa7", element: <Reiwa7Page /> },
]);

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
