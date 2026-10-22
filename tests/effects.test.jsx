import { StrictMode } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FocusTimer from "../src/components/FocusTimer.jsx";
import WeatherWidget from "../src/components/WeatherWidget.jsx";
import { validateTask } from "../src/utils/tasks.js";

const validWeather = {
  current: {
    temperature_2m: 20,
    apparent_temperature: 17,
    weather_code: 0,
    wind_speed_10m: 5,
  },
};
const successResponse = () => ({ ok: true, json: async () => validWeather });

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("timer cleanup", () => {
  it("counts down, pauses, resumes, completes and removes its interval", () => {
    vi.useFakeTimers();
    const { unmount } = render(
      <StrictMode>
        <FocusTimer />
      </StrictMode>,
    );
    fireEvent.click(screen.getByRole("button", { name: "5 мин" }));
    fireEvent.click(screen.getByRole("button", { name: "Начать" }));
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.getByRole("timer").textContent).toBe("04:54");
    fireEvent.click(screen.getByRole("button", { name: "Пауза" }));
    act(() => vi.advanceTimersByTime(20000));
    expect(screen.getByRole("timer").textContent).toBe("04:54");
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Начать" }));
    act(() => vi.advanceTimersByTime(294000));
    expect(screen.getByRole("timer").textContent).toBe("00:00");
    expect(screen.getByRole("status").textContent).toContain(
      "Сессия завершена",
    );
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Ещё раз" }));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("resets a running session when a different duration is chosen", () => {
    vi.useFakeTimers();
    render(<FocusTimer />);
    fireEvent.click(screen.getByRole("button", { name: "Начать" }));
    act(() => vi.advanceTimersByTime(5000));
    fireEvent.click(screen.getByRole("button", { name: "15 мин" }));
    expect(screen.getByRole("timer").textContent).toBe("15:00");
    expect(screen.getByRole("button", { name: "Начать" })).toBeTruthy();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("weather fetch effect", () => {
  it("shows loading, renders a real response shape and aborts the request on unmount", async () => {
    let resolveResponse;
    const fetchMock = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveResponse = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { unmount } = render(<WeatherWidget />);
    expect(screen.getByRole("status").textContent).toContain("Загружаем");
    await act(async () => resolveResponse(successResponse()));
    expect(screen.getByText("20°")).toBeTruthy();
    expect(screen.getByText("Ясно")).toBeTruthy();
    unmount();
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
  });

  it("handles HTTP failure and recovers after Retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce(successResponse());
    vi.stubGlobal("fetch", fetchMock);
    render(<WeatherWidget />);
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Не удалось загрузить",
    );
    fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(await screen.findByText("20°")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBe(null);
  });

  it("rejects malformed API data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ current: { temperature_2m: null } }),
      }),
    );
    render(<WeatherWidget />);
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Не удалось загрузить",
    );
    expect(screen.queryByText("NaN°")).toBe(null);
  });

  it("times out a stalled request and clears pending timers", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (url, { signal }) =>
          new Promise((resolve, reject) => {
            signal.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            );
          }),
      ),
    );
    const { unmount } = render(<WeatherWidget />);
    await act(async () => vi.advanceTimersByTime(12000));
    expect(screen.getByRole("alert").textContent).toContain(
      "долго не отвечает",
    );
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("form validation", () => {
  it("rejects whitespace titles and impossible calendar dates", () => {
    const errors = validateTask({
      title: "   ",
      category: "Учёба",
      priority: "Средний",
      dueDate: "2026-02-30",
    });
    expect(Object.keys(errors).sort()).toEqual(["dueDate", "title"]);
  });
});
