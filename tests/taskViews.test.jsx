import { StrictMode } from "react";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import App from "../src/App.jsx";
import useTasks from "../src/hooks/useTasks.js";
import useTaskSettings from "../src/hooks/useTaskSettings.js";
import { taskApi, TASKS_KEY } from "../src/api/taskApi.js";
import initialTasks from "../src/data/tasks.json";

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          current: {
            temperature_2m: 20,
            apparent_temperature: 17,
            weather_code: 0,
            wind_speed_10m: 5,
          },
        }),
      }),
  );
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const query = {
  search: "",
  category: "Все",
  status: "all",
  sort: "newest",
  page: 1,
  pageSize: 6,
};

it("ignores stale list responses even if a provider ignores AbortSignal", async () => {
  const pending = [];
  vi.spyOn(taskApi, "list").mockImplementation(
    () => new Promise((resolve) => pending.push(resolve)),
  );
  const { result, rerender } = renderHook((props) => useTasks(props), {
    initialProps: query,
  });
  rerender({ ...query, search: "новый" });
  const latest = {
    items: [{ id: "new" }],
    total: 1,
    summary: { total: 100, completed: 20 },
  };
  await act(async () => pending[1](latest));
  await act(async () => pending[0]({ ...latest, items: [{ id: "stale" }] }));
  expect(result.current.result.items[0].id).toBe("new");
});

it("reads saved settings before writing defaults and persists changes", () => {
  localStorage.setItem(
    "klick-desk.settings.v1",
    JSON.stringify({ sort: "title", pageSize: 24 }),
  );
  const { result } = renderHook(useTaskSettings, { wrapper: StrictMode });
  expect(result.current.sort).toBe("title");
  expect(result.current.pageSize).toBe(24);
  act(() => result.current.setPageSize(12));
  expect(
    JSON.parse(localStorage.getItem("klick-desk.settings.v1")).pageSize,
  ).toBe(12);
});

it("paginates, resets filters to page one, opens detail and edits a task", async () => {
  render(<App />);
  const list = await screen.findByRole("list", { name: "Задачи" });
  expect(within(list).getAllByRole("checkbox")).toHaveLength(6);
  fireEvent.click(screen.getByRole("button", { name: "Страница 2" }));
  await waitFor(() =>
    expect(
      screen
        .getByRole("button", { name: "Страница 2" })
        .getAttribute("aria-current"),
    ).toBe("page"),
  );
  fireEvent.change(screen.getByLabelText("Сортировка задач"), {
    target: { value: "title" },
  });
  await waitFor(() =>
    expect(
      screen
        .getByRole("button", { name: "Страница 1" })
        .getAttribute("aria-current"),
    ).toBe("page"),
  );
  const taskButton = within(
    screen.getByRole("list", { name: "Задачи" }),
  ).getAllByRole("button")[0];
  fireEvent.click(taskButton);
  expect(
    await screen.findByRole("button", { name: "Редактировать задачу" }),
  ).toBeTruthy();
  expect(screen.getByText("ID")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Редактировать задачу" }));
  fireEvent.change(screen.getByLabelText("Название задачи"), {
    target: { value: "Отредактировано на защите" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Сохранить", exact: true }),
  );
  expect(await screen.findByText("Изменения сохранены.")).toBeTruthy();
  await waitFor(() =>
    expect(
      JSON.parse(localStorage.getItem(TASKS_KEY)).tasks.some(
        (task) => task.title === "Отредактировано на защите",
      ),
    ).toBe(true),
  );
});

it("creates a validated item, fetches it in detail and deletes it", async () => {
  render(<App />);
  await screen.findByRole("list", { name: "Задачи" });
  fireEvent.click(screen.getByRole("button", { name: "Новая задача" }));
  fireEvent.click(screen.getByRole("button", { name: "Добавить задачу" }));
  expect(screen.getByText(/Название должно/)).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Название задачи"), {
    target: { value: "Новая задача для защиты" },
  });
  fireEvent.change(screen.getByLabelText("Описание"), {
    target: { value: "Проверка list/detail" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Добавить задачу" }));
  fireEvent.click(
    await screen.findByRole("button", {
      name: "Новая задача для защиты",
      exact: true,
    }),
  );
  expect(await screen.findByText("Проверка list/detail")).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "Удалить задачу", exact: true }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Подтвердить удаление" }));
  expect(await screen.findByText("Задача удалена.")).toBeTruthy();
  await screen.findByRole("list", { name: "Задачи" });
  expect(
    screen.queryByRole("button", {
      name: "Новая задача для защиты",
      exact: true,
    }),
  ).toBe(null);
});

it("shows an API error and recovers through Retry", async () => {
  localStorage.setItem(TASKS_KEY, "{broken");
  render(<App />);
  expect(
    await screen.findByText(/Сохранённые данные не перезаписаны/),
  ).toBeTruthy();
  localStorage.setItem(
    TASKS_KEY,
    JSON.stringify({ version: 2, tasks: initialTasks }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Повторить загрузку задач" }),
  );
  expect(await screen.findByRole("list", { name: "Задачи" })).toBeTruthy();
});

it("shows an empty main list without fake pagination", async () => {
  localStorage.setItem(TASKS_KEY, JSON.stringify({ version: 2, tasks: [] }));
  render(<App />);
  expect(await screen.findByText("Задач пока нет")).toBeTruthy();
  expect(screen.queryByRole("navigation", { name: "Страницы задач" })).toBe(
    null,
  );
  expect(screen.getByAltText("Маскот Клик").getAttribute("src")).toContain(
    "idle",
  );
});
