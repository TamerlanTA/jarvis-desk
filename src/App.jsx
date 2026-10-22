import { useState } from "react";
import Header from "./components/Header.jsx";
import TaskSummary from "./components/TaskSummary.jsx";
import TaskFilters from "./components/TaskFilters.jsx";
import TaskList from "./components/TaskList.jsx";
import TaskForm from "./components/TaskForm.jsx";
import TaskDetails from "./components/TaskDetails.jsx";
import DeleteDialog from "./components/DeleteDialog.jsx";
import Pagination from "./components/Pagination.jsx";
import Icon from "./components/Icon.jsx";
import FocusTimer from "./components/FocusTimer.jsx";
import WeatherWidget from "./components/WeatherWidget.jsx";
import Mascot from "./components/Mascot.jsx";
import useTasks from "./hooks/useTasks.js";
import useTaskSettings from "./hooks/useTaskSettings.js";
import useDebouncedValue from "./hooks/useDebouncedValue.js";
import { taskApi } from "./api/taskApi.js";

export default function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [formTask, setFormTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTask, setDeleteTask] = useState(null);
  const [isFocusing, setIsFocusing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const { sort, setSort, pageSize, setPageSize } = useTaskSettings();
  const debouncedSearch = useDebouncedValue(search);
  const { result, loadState, error, reload } = useTasks({
    search: debouncedSearch,
    category,
    status,
    sort,
    page,
    pageSize,
  });

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
    setNotice("");
  }

  function resetFilters() {
    setSearch("");
    setCategory("Все");
    setStatus("all");
    setPage(1);
  }

  function openForm(task = null) {
    setFormTask(task);
    setSelectedId(null);
    setIsFormOpen(true);
    setNotice("");
    setActionError("");
  }

  async function saveTask(values) {
    setBusy(true);
    try {
      if (formTask) await taskApi.update(formTask.id, values);
      else await taskApi.create(values);
      setIsFormOpen(false);
      setNotice(formTask ? "Изменения сохранены." : "Задача добавлена.");
      if (!formTask) {
        resetFilters();
        setSort("newest");
      }
      reload();
    } finally {
      setBusy(false);
    }
  }

  async function toggleTask(task) {
    setBusy(true);
    setActionError("");
    try {
      await taskApi.update(task.id, { completed: !task.completed });
      setNotice(
        task.completed ? "Задача возвращена в работу." : "Задача выполнена.",
      );
      reload();
    } catch (failure) {
      setActionError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  function requestDelete(task) {
    setDeleteTask(task);
    setActionError("");
  }

  async function confirmDelete() {
    setBusy(true);
    setActionError("");
    try {
      await taskApi.remove(deleteTask.id);
      setDeleteTask(null);
      setSelectedId(null);
      setNotice("Задача удалена.");
      reload();
    } catch (failure) {
      setActionError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <main className="workspace">
        <section className="intro">
          <div className="intro-copy">
            <h1>Дела на сегодня.</h1>
            <p>Задачи, фокус и погода в Алматы.</p>
            <time className="today">
              {new Intl.DateTimeFormat("ru-RU", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "Asia/Almaty",
              }).format(new Date())}
            </time>
          </div>
          <Mascot
            isFocusing={isFocusing}
            allCompleted={
              result.summary.total > 0 &&
              result.summary.completed === result.summary.total
            }
          />
        </section>
        <div className="dashboard-grid">
          <section
            className="panel tasks-panel"
            aria-labelledby="tasks-heading"
          >
            <div className="panel-heading">
              <h2 id="tasks-heading">Мои задачи</h2>
              {!isFormOpen && (
                <button
                  className="primary-button"
                  type="button"
                  disabled={busy || loadState !== "success"}
                  onClick={() => openForm()}
                >
                  <Icon name="plus" />
                  Новая задача
                </button>
              )}
            </div>
            <TaskSummary summary={result.summary} />
            {notice && (
              <p className="success-message" role="status">
                {notice}
              </p>
            )}
            {deleteTask && (
              <DeleteDialog
                task={deleteTask}
                busy={busy}
                error={actionError}
                onClose={() => {
                  setDeleteTask(null);
                  setActionError("");
                }}
                onConfirm={confirmDelete}
              />
            )}
            {actionError && !deleteTask && (
              <p className="field-error" role="alert">
                {actionError}
              </p>
            )}
            {isFormOpen ? (
              <TaskForm
                key={formTask?.id ?? "new"}
                task={formTask}
                onSave={saveTask}
                onClose={() => setIsFormOpen(false)}
              />
            ) : selectedId ? (
              <TaskDetails
                key={selectedId}
                id={selectedId}
                onBack={() => setSelectedId(null)}
                onEdit={openForm}
                onDelete={requestDelete}
              />
            ) : (
              <>
                <TaskFilters
                  search={search}
                  onSearchChange={(value) => changeFilter(setSearch, value)}
                  category={category}
                  onCategoryChange={(value) => changeFilter(setCategory, value)}
                  status={status}
                  onStatusChange={(value) => changeFilter(setStatus, value)}
                  sort={sort}
                  onSortChange={(value) => changeFilter(setSort, value)}
                  pageSize={pageSize}
                  onPageSizeChange={(value) => changeFilter(setPageSize, value)}
                />
                {loadState === "loading" ? (
                  <p className="list-loading" role="status">
                    Загружаем задачи…
                  </p>
                ) : loadState === "error" ? (
                  <div className="list-error">
                    <p role="alert">{error}</p>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={reload}
                    >
                      Повторить загрузку задач
                    </button>
                  </div>
                ) : (
                  <>
                    <TaskList
                      tasks={result.items}
                      totalCount={result.summary.total}
                      busy={busy}
                      onToggle={toggleTask}
                      onSelect={(id) => {
                        setSelectedId(id);
                        setNotice("");
                      }}
                      onEdit={openForm}
                      onDelete={requestDelete}
                      onResetFilters={resetFilters}
                    />
                    <Pagination
                      page={result.page}
                      pageSize={result.pageSize}
                      totalPages={result.totalPages}
                      total={result.total}
                      onPageChange={setPage}
                      disabled={busy}
                    />
                  </>
                )}
              </>
            )}
          </section>
          <aside className="utility-rail" aria-label="Фокус и погода">
            <FocusTimer onRunningChange={setIsFocusing} />
            <WeatherWidget />
          </aside>
        </div>
        <footer className="site-footer">
          <span>Klick Desk</span>
          <span>Задачи сохраняются в этом браузере</span>
        </footer>
      </main>
    </>
  );
}
