export default function DeleteDialog({ task, onConfirm, onClose }) {
  return (
    <dialog
      className="task-dialog delete-dialog"
      ref={(node) => {
        if (node && !node.open) node.showModal();
      }}
      onCancel={onClose}
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
        >
          Отмена
        </button>
        <button type="button" className="delete-button" onClick={onConfirm}>
          Удалить задачу
        </button>
      </div>
    </dialog>
  );
}
