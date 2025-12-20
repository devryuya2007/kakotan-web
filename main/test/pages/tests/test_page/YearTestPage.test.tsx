import {render, screen} from "@testing-library/react";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {describe, expect, test, vi} from "vitest";

import YearTestPage from "@/pages/tests/test_page/YearTestPage";

const useYearVocabByKeyMock = vi.fn();

vi.mock("@/pages/tests/test_page/hooks/useYearVocabByKey", () => ({
  useYearVocabByKey: (year: string) => useYearVocabByKeyMock(year),
}));

vi.mock("@/pages/tests/test_page/layout/TestPageLayout", () => ({
  default: ({sectionId}: {sectionId: string}) => (
    <div data-testid="test-layout">{sectionId}</div>
  ),
}));

describe("YearTestPage", () => {
  test("指定年度のラベルとテストレイアウトが表示される", () => {
    useYearVocabByKeyMock.mockReturnValue({
      status: "ready",
      count: 1,
      error: null,
      questions: [
        {
          id: "q1",
          phrase: "word",
          mean: "意味",
          choices: ["意味"],
          answerIndex: 0,
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={["/tests/reiwa3"]}>
        <Routes>
          <Route path="/tests/:year" element={<YearTestPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Reiwa 3")).toBeInTheDocument();
    expect(screen.getByTestId("test-layout")).toHaveTextContent("令和3年");
  });

  test("不正な年度のときは案内文が表示される", () => {
    useYearVocabByKeyMock.mockReturnValue({
      status: "loading",
      count: 0,
      error: null,
      questions: [],
    });

    render(
      <MemoryRouter initialEntries={["/tests/unknown"]}>
        <Routes>
          <Route path="/tests/:year" element={<YearTestPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText(
        "年度が見つからないため、デフォルトの年度を表示しています。",
      ),
    ).toBeInTheDocument();
  });
});
