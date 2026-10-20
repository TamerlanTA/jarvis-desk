export default function TaskSummary({ tasks }) {
  const completed = tasks.filter((task) => task.completed).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <section className="task-summary" aria-label="Прогресс всех задач">
      <div className="summary-counts">
        <span>Всего <strong>{tasks.length}</strong></span><span className="separator">/</span>
        <span>В работе <strong>{tasks.length - completed}</strong></span><span className="separator">/</span>
        <span>Готово <strong>{completed}</strong></span>
      </div>
      <div className="progress-line">
        <progress max="100" value={progress} aria-label="Выполнено задач" />
        <span>{progress}%</span>
      </div>
    </section>
  );
}
