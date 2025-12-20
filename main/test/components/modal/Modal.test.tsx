import {render, screen, fireEvent} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {Modal} from "@/components/modal/Modal";

// モーダルの開閉とイベントを確認する
describe("Modal", () => {
  test("openがfalseなら描画されない", () => {
    // 描画されないことをDOMで確認する
    render(<Modal open={false} onClose={vi.fn()} content={<div>hidden</div>} />);

    expect(document.body.querySelector("[role='presentation']")).toBeNull();
  });

  test("EscapeキーでonCloseが呼ばれる", () => {
    const onClose = vi.fn();

    render(<Modal open onClose={onClose} content={<div>inside</div>} />);

    fireEvent.keyDown(document, {key: "Escape"});

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("Escape以外のキーでは閉じない", () => {
    const onClose = vi.fn();

    render(<Modal open onClose={onClose} content={<div>inside</div>} />);

    fireEvent.keyDown(document, {key: "Enter"});

    expect(onClose).toHaveBeenCalledTimes(0);
  });

  test("外側クリックで閉じるが、中身クリックでは閉じない", () => {
    const onClose = vi.fn();

    render(<Modal open onClose={onClose} content={<div>inside</div>} />);

    const inside = screen.getByText("inside");
    fireEvent.click(inside);
    expect(onClose).toHaveBeenCalledTimes(0);

    const clickArea = document.querySelector("div.absolute.inset-0.grid");
    if (!clickArea) {
      throw new Error("モーダルのクリック領域が見つかりません");
    }

    fireEvent.click(clickArea);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
