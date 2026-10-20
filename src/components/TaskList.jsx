import TaskItem from './TaskItem.jsx';

export default function TaskList({ tasks, totalCount, onToggle, onEdit, onDelete, onResetFilters }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state" role="status">
        <span className="empty-mark" aria-hidden="true">↗</span>
        <h3>{totalCount === 0 ? 'Стол чист. Что дальше?' : 'Ничего не нашлось'}</h3>
        <p>{totalCount === 0 ? 'Добавь первую задачу — и начнём.' : 'Попробуй другой запрос или сбрось фильтры.'}</p>
        {totalCount > 0 && <button type="button" className="secondary-button" onClick={onResetFilters}>Сбросить фильтры</button>}
      </div>
    );
  }

  return <ul className="task-list" aria-label="Задачи">{tasks.map((task) => <TaskItem key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />)}</ul>;
}
