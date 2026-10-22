import { useEffect, useState } from "react";
import { taskApi } from "../api/taskApi.js";
import { formatDueDate } from "../utils/tasks.js";

export default function TaskDetails({ id, onBack, onEdit, onDelete }) {
  const [task, setTask] = useState(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setTask(null);
    setError("");
    taskApi
      .get(id, { signal: controller.signal })
      .then((data) => {
        if (active) setTask(data);
      })
      .catch((failure) => {
        if (active && failure.name !== "AbortError") setError(failure.message);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [id, revision]);

  return (
    <section className="detail-view" aria-labelledby="detail-heading">
      <button className="text-button" type="button" onClick={onBack}>
        ← Назад к списку
      </button>
      {error ? (
        <div className="list-error">
          <p role="alert">{error}</p>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setRevision((value) => value + 1)}
          >
            Повторить
          </button>
        </div>
      ) : !task ? (
        <p role="status">Загружаем задачу…</p>
      ) : (
        <>
          <h2 id="detail-heading">{task.title}</h2>
          <p className="detail-description">
            {task.description || "Описание не добавлено."}
          </p>
          <dl className="task-details">
            <div>
              <dt>Направление</dt>
              <dd>{task.category}</dd>
            </div>
            <div>
              <dt>Приоритет</dt>
              <dd>{task.priority}</dd>
            </div>
            <div>
              <dt>Срок</dt>
              <dd>
                <time dateTime={task.dueDate}>
                  {formatDueDate(task.dueDate)} {task.dueDate.slice(0, 4)}
                </time>
              </dd>
            </div>
            <div>
              <dt>Статус</dt>
              <dd>{task.completed ? "Готово" : "В работе"}</dd>
            </div>
            <div>
              <dt>ID</dt>
              <dd>{task.id}</dd>
            </div>
          </dl>
          <div className="detail-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => onEdit(task)}
            >
              Редактировать задачу
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => onDelete(task)}
            >
              Удалить задачу
            </button>
          </div>
        </>
      )}
    </section>
  );
}
