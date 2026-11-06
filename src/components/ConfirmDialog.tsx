import { useEffect } from "react";

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onCancel]);

  return (
    <div
      className="no-print fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="pop-in w-full max-w-md rounded-2xl border border-ink-600 bg-ink-850 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-lg font-bold text-ink-100">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-300">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-ink-600 px-4 py-2 text-sm font-medium text-ink-200 transition hover:bg-ink-700"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
