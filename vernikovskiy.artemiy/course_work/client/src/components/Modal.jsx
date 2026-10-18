import { useEffect } from "react";

export default function Modal({ open, onClose, children, className = "" }) {
  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal ${className}`} onClick={(event) => event.stopPropagation()} role="dialog">
        <button type="button" className="modal__close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
