import { useContext } from "react";
import { TestResultsContext } from "./TestReSultContext.shared";

export function useTestResults() {
  const context = useContext(TestResultsContext);
  if (!context) {
    throw new Error("useTestResults は TestResultsProvider の内側で使ってね");
  }
  return context;
}
