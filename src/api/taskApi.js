import initialTasks from "../data/tasks.json";
import { isValidTask, validateTask, PRIORITIES } from "../utils/tasks.js";

export const TASKS_KEY = "klick-desk.tasks.v2";
const LEGACY_KEY = "jarvis-desk.tasks.v1";

// Задержка имитирует сеть; отмена запроса не допускает поздних изменений.
async function request(action, { signal } = {}) {
  await new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Запрос отменён", "AbortError"));
      return;
    }
    const abort = () => {
      clearTimeout(timeout);
      reject(new DOMException("Запрос отменён", "AbortError"));
    };
    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, 250);
    signal?.addEventListener("abort", abort, { once: true });
  });
  if (signal?.aborted) throw new DOMException("Запрос отменён", "AbortError");
  return JSON.parse(JSON.stringify(action()));
}

function parseTasks(raw, version) {
  const saved = JSON.parse(raw);
  if (
    saved?.version !== version ||
    !Array.isArray(saved.tasks) ||
    !saved.tasks.every(isValidTask) ||
    new Set(saved.tasks.map((task) => task.id)).size !== saved.tasks.length
  ) {
    throw new Error("Invalid saved tasks");
  }
  return saved.tasks;
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify({ version: 2, tasks }));
  } catch {
    throw new Error(
      "Не удалось сохранить задачи. Проверь доступ к хранилищу браузера.",
    );
  }
}

function readTasks() {
  let tasks;
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw !== null) return parseTasks(raw, 2);
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy === null) {
      tasks = initialTasks;
    } else {
      const oldTasks = parseTasks(legacy, 1).map((task) => ({
        ...task,
        description: task.description ?? "",
        createdAt: task.createdAt ?? new Date().toISOString(),
      }));
      // Пустой список сохраняем пустым. Старые записи не удаляем.
      const oldIds = new Set(oldTasks.map((task) => task.id));
      tasks = oldTasks.length
        ? [...oldTasks, ...initialTasks.filter((task) => !oldIds.has(task.id))]
        : [];
    }
  } catch {
    throw new Error(
      "Не удалось прочитать задачи. Сохранённые данные не перезаписаны.",
    );
  }
  saveTasks(tasks);
  return tasks;
}

function validate(values) {
  const errors = validateTask(values);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
}

export const taskApi = {
  list({
    search = "",
    category = "Все",
    status = "all",
    sort = "newest",
    page = 1,
    pageSize = 6,
    signal,
  } = {}) {
    return request(
      () => {
        const tasks = readTasks();
        const completed = tasks.filter((task) => task.completed).length;
        const query = search.trim().toLocaleLowerCase("ru");
        const filtered = tasks.filter(
          (task) =>
            `${task.title} ${task.description ?? ""}`
              .toLocaleLowerCase("ru")
              .includes(query) &&
            (category === "Все" || task.category === category) &&
            (status === "all" ||
              (status === "completed" ? task.completed : !task.completed)),
        );
        const compare =
          {
            newest: (a, b) =>
              (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
            dueDate: (a, b) => a.dueDate.localeCompare(b.dueDate),
            priority: (a, b) =>
              PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority),
            title: (a, b) => a.title.localeCompare(b.title, "ru"),
          }[sort] ?? ((a, b) => a.title.localeCompare(b.title, "ru"));
        filtered.sort((a, b) => compare(a, b) || a.id.localeCompare(b.id));
        const size = [6, 12, 24].includes(pageSize) ? pageSize : 6;
        const totalPages = Math.max(1, Math.ceil(filtered.length / size));
        const currentPage = Math.min(
          totalPages,
          Math.max(1, Math.trunc(page) || 1),
        );
        return {
          items: filtered.slice((currentPage - 1) * size, currentPage * size),
          total: filtered.length,
          page: currentPage,
          pageSize: size,
          totalPages,
          summary: { total: tasks.length, completed },
        };
      },
      { signal },
    );
  },

  get(id, options) {
    return request(() => {
      const task = readTasks().find((item) => item.id === id);
      if (!task) throw new Error("Задача не найдена.");
      return task;
    }, options);
  },

  create(values) {
    return request(() => {
      validate(values);
      const tasks = readTasks();
      const task = {
        ...values,
        title: values.title.trim(),
        description: values.description?.trim() ?? "",
        id: crypto.randomUUID(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      saveTasks([task, ...tasks]);
      return task;
    });
  },

  update(id, values) {
    return request(() => {
      const tasks = readTasks();
      const previous = tasks.find((task) => task.id === id);
      if (!previous) throw new Error("Задача не найдена.");
      const updated = {
        ...previous,
        ...values,
        id: previous.id,
        createdAt: previous.createdAt,
      };
      validate(updated);
      saveTasks(tasks.map((task) => (task.id === id ? updated : task)));
      return updated;
    });
  },

  remove(id) {
    return request(() => {
      const tasks = readTasks();
      if (!tasks.some((task) => task.id === id))
        throw new Error("Задача не найдена.");
      saveTasks(tasks.filter((task) => task.id !== id));
      return { id };
    });
  },
};
