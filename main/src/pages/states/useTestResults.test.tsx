import {render, screen} from "@testing-library/react";
import {describe, expect, test} from "vitest";

import {TestResultsContext} from "./TestReSultContext.shared";
import {useTestResults} from "./useTestResults";

// useTestResultsのエラーと通常系を確認する
describe("useTestResults", () => {
  test("Provider外だとエラーになる", () => {
    // Provider無しで使うと例外が投げられることを確認する
    function Probe() {
      useTestResults();
      return <div>ok</div>;
    }

    expect(() => render(<Probe />)).toThrow(
      "useTestResults は TestResultsProvider の内側で使ってね",
    );
  });

  test("Provider内なら値を取得できる", () => {
    // Providerを挟んだ場合は正常に描画できることを確認する
    function Probe() {
      const {totalXp} = useTestResults();
      return <div>xp:{totalXp}</div>;
    }

    const contextValue = {
      correct: [],
      incorrect: [],
      totalXp: 120,
      sessionHistory: [],
      solvedPhrases: [],
      missedPhrases: [],
      recordResult: () => {},
      applyXp: () => {},
      reset: () => {},
      addSession: () => {},
    };

    render(
      <TestResultsContext.Provider value={contextValue}>
        <Probe />
      </TestResultsContext.Provider>,
    );

    expect(screen.getByText("xp:120")).toBeInTheDocument();
  });
});
