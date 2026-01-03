import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test } from "vitest";

import UserConfig from "@/pages/userConfig/userConfig";
import { UserConfigProvider } from "@/pages/tests/test_page/userConfigContext";

const ensureFileText = (file: File, content: string) => {
  if (typeof file.text === "function") return;
  Object.defineProperty(file, "text", {
    value: async () => content,
  });
};

const buildTestFile = (name: string, content: string): File => {
  const file = new File([content], name, { type: "application/json" });
  ensureFileText(file, content);
  return file;
};

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
    if (!("ResizeObserver" in window)) {
      class ResizeObserverMock {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
      window.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
    }
  });

  test("インポート成功時に上部通知が表示される", async () => {
    const user = userEvent.setup();
    renderUserConfig();

    const file = buildTestFile(
      "success.json",
      JSON.stringify([{ phrase: "apple", mean: "りんご" }])
    );

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

    const file = buildTestFile("invalid.json", JSON.stringify({ foo: "bar" }));

    const input = screen.getByLabelText("select file");
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Use an array of items with \"phrase\" and \"mean\", or a JSON with \"key\", \"label\", and \"vocab\"."
      );
    });
  });
});
