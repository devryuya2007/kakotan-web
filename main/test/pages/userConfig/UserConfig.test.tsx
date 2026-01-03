import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test } from "vitest";

import UserConfig from "@/pages/userConfig/userConfig";
import { UserConfigProvider } from "@/pages/tests/test_page/userConfigContext";

const renderUserConfig = () =>
  render(
    <MemoryRouter>
      <UserConfigProvider>
        <UserConfig />
      </UserConfigProvider>
    </MemoryRouter>
  );

describe("UserConfig", () => {
  beforeEach(() => {
    window.requestAnimationFrame = (callback) => {
      callback(0);
      return 0;
    };
    window.cancelAnimationFrame = () => {};
    localStorage.clear();
  });

  test("インポート成功時に上部通知が表示される", async () => {
    const user = userEvent.setup();
    renderUserConfig();

    const file = new File([
      JSON.stringify([{ phrase: "apple", mean: "りんご" }]),
    ], "success.json", {
      type: "application/json",
    });

    const input = screen.getByLabelText("select file");
    await user.upload(input, file);

    await waitFor(() => {
      expect(
        screen.getByText("Import complete: 1 words added.")
      ).toBeInTheDocument();
    });
  });

  test("不正なJSON形式だとエラーが表示される", async () => {
    const user = userEvent.setup();
    renderUserConfig();

    const file = new File([JSON.stringify({ foo: "bar" })], "invalid.json", {
      type: "application/json",
    });

    const input = screen.getByLabelText("select file");
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Use an array of items with \"phrase\" and \"mean\", or a JSON with \"key\", \"label\", and \"vocab\"."
      );
    });
  });
});
