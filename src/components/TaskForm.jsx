import { useState } from 'react';
import { CATEGORIES, PRIORITIES, getAlmatyDate, validateTask } from '../utils/tasks.js';
import Icon from './Icon.jsx';

export default function TaskForm({ task, onSave, onClose }) {
  const [values, setValues] = useState({
    title: task?.title ?? '', category: task?.category ?? CATEGORIES[0],
    priority: task?.priority ?? PRIORITIES[1], dueDate: task?.dueDate ?? getAlmatyDate(),
  });
  const [errors, setErrors] = useState({});

  function changeField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateTask(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave({ ...values, title: values.title.trim() });
  }

  return (
    <dialog className="task-dialog" ref={(node) => { if (node && !node.open) node.showModal(); }} onCancel={onClose} aria-labelledby="task-form-heading">
      <div className="dialog-heading">
        <h2 id="task-form-heading">{task ? 'Редактировать задачу' : 'Новая задача'}</h2>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть форму"><Icon name="close" /></button>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="task-title">Название задачи</label>
        <input id="task-title" name="title" value={values.title} onChange={changeField} placeholder="Что нужно сделать?" maxLength={120} autoFocus aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'title-error' : undefined} />
        {errors.title && <p className="field-error" id="title-error" role="alert">{errors.title}</p>}
        <div className="form-columns">
          <div>
            <label htmlFor="task-category">Направление</label>
            <select id="task-category" name="category" value={values.category} onChange={changeField}>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select>
            {errors.category && <p className="field-error" role="alert">{errors.category}</p>}
          </div>
          <div>
            <label htmlFor="task-priority">Приоритет</label>
            <select id="task-priority" name="priority" value={values.priority} onChange={changeField}>{PRIORITIES.map((item) => <option key={item}>{item}</option>)}</select>
            {errors.priority && <p className="field-error" role="alert">{errors.priority}</p>}
          </div>
        </div>
        <label htmlFor="task-date">Срок</label>
        <input id="task-date" type="date" name="dueDate" value={values.dueDate} onChange={changeField} aria-invalid={Boolean(errors.dueDate)} aria-describedby={errors.dueDate ? 'date-error' : undefined} />
        {errors.dueDate && <p className="field-error" id="date-error" role="alert">{errors.dueDate}</p>}
        <div className="dialog-actions">
          <button className="secondary-button" type="button" onClick={onClose}>Отмена</button>
          <button className="primary-button" type="submit">{task ? 'Сохранить' : 'Добавить задачу'}</button>
        </div>
      </form>
    </dialog>
  );
}
