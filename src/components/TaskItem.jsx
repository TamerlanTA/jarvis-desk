import {
  CATEGORIES,
  PRIORITIES,
  formatDueDate,
  getAlmatyDate,
} from "../utils/tasks.js";
import Icon from "./Icon.jsx";

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const overdue = !task.completed && task.dueDate < getAlmatyDate();

  return (
    <li className={`task-item${task.completed ? " is-completed" : ""}`}>
      <label className="task-checkbox">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={`Выполнено: ${task.title}`}
        />
        <span className="check-visual">
          <Icon name="check" size={18} />
        </span>
      </label>
      <div className="task-content">
        <h3>{task.title}</h3>
        <div className="task-meta">
          <span
            className={`category-label category-${CATEGORIES.indexOf(task.category)}`}
          >
            {task.category}
          </span>
          <span className="priority">
            <span
              className={`priority-dot priority-${PRIORITIES.indexOf(task.priority)}`}
            />
            {task.priority}
          </span>
          <span className={overdue ? "due-date overdue" : "due-date"}>
            <Icon name="calendar" size={16} />
            <time dateTime={task.dueDate}>{formatDueDate(task.dueDate)}</time>
            {overdue && " · Просрочено"}
          </span>
        </div>
      </div>
      <div className="task-actions">
        <button
          type="button"
          className="icon-button"
          onClick={() => onEdit(task)}
          aria-label={`Редактировать: ${task.title}`}
          title="Редактировать"
        >
          <Icon name="edit" />
        </button>
        <button
          type="button"
          className="icon-button danger"
          onClick={() => onDelete(task)}
          aria-label={`Удалить: ${task.title}`}
          title="Удалить"
        >
          <Icon name="trash" />
        </button>
      </div>
    </li>
  );
}
