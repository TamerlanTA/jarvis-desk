import { useState } from 'react';
import Header from './components/Header.jsx';
import TaskSummary from './components/TaskSummary.jsx';
import TaskFilters from './components/TaskFilters.jsx';
import TaskList from './components/TaskList.jsx';
import TaskForm from './components/TaskForm.jsx';
import DeleteDialog from './components/DeleteDialog.jsx';
import Icon from './components/Icon.jsx';
import { createInitialTasks } from './utils/tasks.js';

export default function App() {
  const [tasks, setTasks] = useState(createInitialTasks);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Все');
  const [status, setStatus] = useState('all');
  const [formTask, setFormTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTask, setDeleteTask] = useState(null);

  const visibleTasks = tasks.filter((task) => (
    task.title.toLocaleLowerCase('ru').includes(search.trim().toLocaleLowerCase('ru'))
    && (category === 'Все' || task.category === category)
    && (status === 'all' || (status === 'completed' ? task.completed : !task.completed))
  ));

  function openForm(task = null) {
    setFormTask(task);
    setIsFormOpen(true);
  }

  function saveTask(values) {
    setTasks((current) => formTask
      ? current.map((task) => task.id === formTask.id ? { ...task, ...values } : task)
      : [...current, { ...values, id: crypto.randomUUID(), completed: false }]);
    setIsFormOpen(false);
  }

  function toggleTask(id) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task));
  }

  function resetFilters() {
    setSearch('');
    setCategory('Все');
    setStatus('all');
  }

  return (
    <>
      <Header />
      <main className="workspace">
        <section className="intro">
          <div>
            <h1>Всё важное. На одном столе.</h1>
            <p>Задачи, фокус и немного ясности на сегодня.</p>
          </div>
          <time className="today">{new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Almaty' }).format(new Date())}</time>
        </section>
        <div className="dashboard-grid">
          <section className="panel tasks-panel" aria-labelledby="tasks-heading">
            <div className="panel-heading">
              <h2 id="tasks-heading">Мои задачи</h2>
              <button className="primary-button" type="button" onClick={() => openForm()}><Icon name="plus" />Новая задача</button>
            </div>
            <TaskSummary tasks={tasks} />
            <TaskFilters search={search} onSearchChange={setSearch} category={category} onCategoryChange={setCategory} status={status} onStatusChange={setStatus} />
            <TaskList tasks={visibleTasks} totalCount={tasks.length} onToggle={toggleTask} onEdit={openForm} onDelete={setDeleteTask} onResetFilters={resetFilters} />
          </section>
        </div>
        <footer>Меньше шума. Больше сделанного.</footer>
      </main>
      {isFormOpen && <TaskForm key={formTask?.id ?? 'new'} task={formTask} onSave={saveTask} onClose={() => setIsFormOpen(false)} />}
      {deleteTask && <DeleteDialog task={deleteTask} onClose={() => setDeleteTask(null)} onConfirm={() => {
        setTasks((current) => current.filter((task) => task.id !== deleteTask.id));
        setDeleteTask(null);
      }} />}
    </>
  );
}
