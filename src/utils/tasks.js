export const CATEGORIES = ["Агентство", "Контент", "Учёба"];
export const PRIORITIES = ["Высокий", "Средний", "Низкий"];

export function getAlmatyDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Almaty",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function formatDueDate(value) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

export function createInitialTasks() {
  const today = getAlmatyDate();
  return [
    {
      id: "demo-1",
      title: "Подготовить демо автоматизации",
      category: "Агентство",
      priority: "Высокий",
      dueDate: today,
      completed: false,
    },
    {
      id: "demo-2",
      title: "Собрать идеи для Reels",
      category: "Контент",
      priority: "Средний",
      dueDate: today,
      completed: false,
    },
    {
      id: "demo-3",
      title: "Подготовиться к защите React",
      category: "Учёба",
      priority: "Средний",
      dueDate: today,
      completed: false,
    },
    {
      id: "demo-4",
      title: "Разобрать входящие задачи",
      category: "Агентство",
      priority: "Низкий",
      dueDate: today,
      completed: true,
    },
  ];
}

export function validateTask(values) {
  const errors = {};
  if (values.title.trim().length < 3 || values.title.trim().length > 120) {
    errors.title = "Название должно содержать от 3 до 120 символов.";
  }
  if (!CATEGORIES.includes(values.category))
    errors.category = "Выбери направление.";
  if (!PRIORITIES.includes(values.priority))
    errors.priority = "Выбери приоритет.";
  if (!isValidDate(values.dueDate)) errors.dueDate = "Укажи корректную дату.";
  return errors;
}

export function isValidTask(task) {
  return (
    task !== null &&
    typeof task === "object" &&
    typeof task.id === "string" &&
    task.id.length > 0 &&
    typeof task.title === "string" &&
    CATEGORIES.includes(task.category) &&
    PRIORITIES.includes(task.priority) &&
    typeof task.dueDate === "string" &&
    isValidDate(task.dueDate) &&
    typeof task.completed === "boolean" &&
    Object.keys(validateTask(task)).length === 0
  );
}
