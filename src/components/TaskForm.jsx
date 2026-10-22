import { useState } from "react";
import {
  CATEGORIES,
  PRIORITIES,
  getAlmatyDate,
  validateTask,
} from "../utils/tasks.js";
import Icon from "./Icon.jsx";

export default function TaskForm({ task, onSave, onClose }) {
  const [values, setValues] = useState({
    title: task?.title ?? "",
    category: task?.category ?? CATEGORIES[0],
    priority: task?.priority ?? PRIORITIES[1],
    dueDate: task?.dueDate ?? getAlmatyDate(),
    description: task?.description ?? "",
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function changeField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateTask(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setIsSaving(true);
    setSaveError("");
    try {
      await onSave({
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
      });
    } catch (failure) {
      setSaveError(failure.message);
      setIsSaving(false);
    }
  }

  return (
    <section
      className="task-dialog task-editor"
      aria-labelledby="task-form-heading"
    >
      <div className="dialog-heading">
        <h2 id="task-form-heading">
          {task ? "Редактировать задачу" : "Новая задача"}
        </h2>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Закрыть форму"
          disabled={isSaving}
        >
          <Icon name="close" />
        </button>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <fieldset disabled={isSaving}>
          <label htmlFor="task-title">Название задачи</label>
          <input
            id="task-title"
            name="title"
            value={values.title}
            onChange={changeField}
            placeholder="Что нужно сделать?"
            maxLength={120}
            autoFocus
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          {errors.title && (
            <p className="field-error" id="title-error" role="alert">
              {errors.title}
            </p>
          )}
          <label htmlFor="task-description">Описание</label>
          <textarea
            id="task-description"
            name="description"
            value={values.description}
            onChange={changeField}
            maxLength={1000}
            rows={4}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? "description-error" : undefined
            }
          />
          {errors.description && (
            <p className="field-error" id="description-error" role="alert">
              {errors.description}
            </p>
          )}
          <div className="form-columns">
            <div>
              <label htmlFor="task-category">Направление</label>
              <select
                id="task-category"
                name="category"
                value={values.category}
                onChange={changeField}
              >
                {CATEGORIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              {errors.category && (
                <p className="field-error" role="alert">
                  {errors.category}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="task-priority">Приоритет</label>
              <select
                id="task-priority"
                name="priority"
                value={values.priority}
                onChange={changeField}
              >
                {PRIORITIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              {errors.priority && (
                <p className="field-error" role="alert">
                  {errors.priority}
                </p>
              )}
            </div>
          </div>
          <label htmlFor="task-date">Срок</label>
          <input
            id="task-date"
            type="date"
            name="dueDate"
            value={values.dueDate}
            onChange={changeField}
            aria-invalid={Boolean(errors.dueDate)}
            aria-describedby={errors.dueDate ? "date-error" : undefined}
          />
          {errors.dueDate && (
            <p className="field-error" id="date-error" role="alert">
              {errors.dueDate}
            </p>
          )}
          <div className="dialog-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={onClose}
            >
              Отмена
            </button>
            <button className="primary-button" type="submit">
              {isSaving ? "Сохраняем…" : task ? "Сохранить" : "Добавить задачу"}
            </button>
          </div>
        </fieldset>
        {saveError && (
          <p className="field-error" role="alert">
            {saveError}
          </p>
        )}
      </form>
    </section>
  );
}
