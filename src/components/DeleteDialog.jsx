export default function DeleteDialog({
  task,
  onConfirm,
  onClose,
  busy,
  error,
}) {
  return (
    <section
      className="delete-dialog"
      aria-labelledby="delete-heading"
      aria-describedby="delete-description"
    >
      <h2 id="delete-heading">Удалить задачу?</h2>
      <p id="delete-description">«{task.title}» будет удалена из списка.</p>
      <div className="dialog-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={onClose}
          autoFocus
          disabled={busy}
        >
          Отмена
        </button>
        <button
          type="button"
          className="delete-button"
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? "Удаляем…" : "Подтвердить удаление"}
        </button>
      </div>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </section>
  );
}
