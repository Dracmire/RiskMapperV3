import React from "react";

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modalHeader">
          <div className="modalTitle">{title}</div>
          <button className="iconBtn" onClick={onClose} type="button" aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="modalBody">{children}</div>
        <div className="modalFooter">
          <button className="btn" onClick={onClose} type="button">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}