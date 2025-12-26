import MenuPage from "@/pages/menu/MenuPage";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

describe("/menuのUIがレンダリングされる", () => {
  const renderMenuPage = () =>
    render(
      <MemoryRouter>
        <MenuPage />
      </MemoryRouter>
    );

  test("reiwa3~7+extraボタンが存在する", () => {
    renderMenuPage();

    const labels = ["Reiwa 3", "Reiwa 4", "Reiwa 5", "Reiwa 6", "Reiwa 7", "Extra"];

    labels.forEach((label) => {
      expect(screen.getByRole("button", { name: label })).toBeVisible();
    });
  });
});
