import {render, screen, fireEvent} from "@testing-library/react";
import {beforeEach, describe, expect, test, vi} from "vitest";

import type {WrongWordStat} from "../MiniResultPage";
import MiniResultPageModal from "./MiniResultPageModal";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// ミニリザルトのモーダル表示を確認する
describe("MiniResultPageModal", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  test("isOpenがfalseなら表示されない", () => {
    // モーダルがDOMに無いことを確認する
    render(
      <MiniResultPageModal isOpen={false} onClose={vi.fn()} wrongWords={[]} />,
    );

    expect(screen.queryByText("間違えた単語リスト")).toBeNull();
  });

  test("間違えた単語が無いときは空メッセージが出る", () => {
    // 0件表示の文言があることを確認する
    render(
      <MiniResultPageModal isOpen onClose={vi.fn()} wrongWords={[]} />,
    );

    expect(
      screen.getByText("今回は間違えた単語がありませんでした。"),
    ).toBeInTheDocument();
  });

  test("単語リストとボタン操作が動く", () => {
    // 1件以上のリストと遷移ボタンを確認する
    const onClose = vi.fn();
    const wrongWords: WrongWordStat[] = [
      {
        word: "apple",
        meaning: "りんご",
        missCount: 1,
        severity: "neutral",
      },
    ];

    render(
      <MiniResultPageModal isOpen onClose={onClose} wrongWords={wrongWords} />,
    );

    expect(screen.getByText("apple")).toBeInTheDocument();
    expect(screen.getByText("りんご")).toBeInTheDocument();

    const resultButton = screen.getByRole("button", {name: "結果ページへ"});
    fireEvent.click(resultButton);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/results");
  });

  test("外側クリックでonCloseが呼ばれる", () => {
    // モーダル外をクリックしたときに閉じるかを確認する
    const onClose = vi.fn();

    render(
      <MiniResultPageModal isOpen onClose={onClose} wrongWords={[]} />,
    );

    fireEvent.mouseDown(document.body);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("モーダル内クリックでは閉じない", () => {
    // 中身を触ったときに閉じないことを確認する
    const onClose = vi.fn();

    render(
      <MiniResultPageModal isOpen onClose={onClose} wrongWords={[]} />,
    );

    const modalHeading = screen.getByText("間違えた単語リスト");
    fireEvent.mouseDown(modalHeading);

    expect(onClose).not.toHaveBeenCalled();
  });

});
