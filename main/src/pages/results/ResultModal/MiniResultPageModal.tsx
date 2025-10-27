import { useEffect, useReducer, useRef, useState } from "react";

export default function MiniResultPageModal() {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpenModal) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!modalRef.current) return;
      if (modalRef.current.contains(event.target as Node)) return;
      setIsOpenModal(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("touchstart", handlePointerDown);
    };
  }, [isOpenModal, onclose]);

  return <div ref={modalRef}>MiniResultPageModal</div>;
}
