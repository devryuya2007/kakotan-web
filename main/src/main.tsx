import { StrictMode, useContext } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import Menu from "./menu.tsx";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element #root not found");
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />} />
      <Route path="/menu" element={<Menu />} />
    </>
  )
);

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
