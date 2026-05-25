"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm text-zinc-600">{description}</p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="h-11 rounded-full border border-zinc-300 px-5 text-sm font-semibold text-zinc-700"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="h-11 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
