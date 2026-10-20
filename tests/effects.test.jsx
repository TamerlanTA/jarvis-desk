import { StrictMode } from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useStoredTasks from '../src/hooks/useStoredTasks.js';
import useDebouncedValue from '../src/hooks/useDebouncedValue.js';
import FocusTimer from '../src/components/FocusTimer.jsx';
import WeatherWidget from '../src/components/WeatherWidget.jsx';
import { createInitialTasks, validateTask } from '../src/utils/tasks.js';

const storageKey = 'jarvis-desk.tasks.v1';
const validWeather = { current: { temperature_2m: 20, apparent_temperature: 17, weather_code: 0, wind_speed_10m: 5 } };
const successResponse = () => ({ ok: true, json: async () => validWeather });

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('localStorage effects', () => {
  it('hydrates existing tasks before writing, including StrictMode remount checks', () => {
    const existing = [{ ...createInitialTasks()[0], id: 'saved-task', title: 'Сохранённая задача' }];
    localStorage.setItem(storageKey, JSON.stringify({ version: 1, tasks: existing }));
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(useStoredTasks, { wrapper: StrictMode });
    expect(result.current.tasks).toEqual(existing);
    expect(result.current.isLoaded).toBe(true);
    expect(write.mock.calls.length).toBeGreaterThan(0);
    for (const [, raw] of write.mock.calls) expect(JSON.parse(raw).tasks).toEqual(existing);

    act(() => result.current.setTasks((tasks) => tasks.map((task) => ({ ...task, completed: true }))));
    expect(JSON.parse(localStorage.getItem(storageKey)).tasks[0].completed).toBe(true);
  });

  it('preserves an intentionally empty list across reloads', () => {
    localStorage.setItem(storageKey, JSON.stringify({ version: 1, tasks: [] }));
    const { result } = renderHook(useStoredTasks);
    expect(result.current.tasks).toEqual([]);
    expect(JSON.parse(localStorage.getItem(storageKey)).tasks).toEqual([]);
  });

  it('does not overwrite corrupt data and explains the temporary mode', () => {
    localStorage.setItem(storageKey, '{invalid json');
    const { result } = renderHook(useStoredTasks);
    act(() => result.current.setTasks([]));
    expect(result.current.storageError).toContain('Исходные данные не перезаписаны');
    expect(localStorage.getItem(storageKey)).toBe('{invalid json');
  });

  it('reports unavailable storage instead of crashing', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); });
    const { result } = renderHook(useStoredTasks);
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.storageError).toContain('Не удалось сохранить');
  });
});

describe('timer cleanup', () => {
  it('counts down, pauses, resumes, completes and removes its interval', () => {
    vi.useFakeTimers();
    const { unmount } = render(<StrictMode><FocusTimer /></StrictMode>);
    fireEvent.click(screen.getByRole('button', { name: '5 мин' }));
    fireEvent.click(screen.getByRole('button', { name: 'Начать' }));
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.getByRole('timer').textContent).toBe('04:54');
    fireEvent.click(screen.getByRole('button', { name: 'Пауза' }));
    act(() => vi.advanceTimersByTime(20000));
    expect(screen.getByRole('timer').textContent).toBe('04:54');
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Начать' }));
    act(() => vi.advanceTimersByTime(294000));
    expect(screen.getByRole('timer').textContent).toBe('00:00');
    expect(screen.getByRole('status').textContent).toContain('Сессия завершена');
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Ещё раз' }));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('resets a running session when a different duration is chosen', () => {
    vi.useFakeTimers();
    render(<FocusTimer />);
    fireEvent.click(screen.getByRole('button', { name: 'Начать' }));
    act(() => vi.advanceTimersByTime(5000));
    fireEvent.click(screen.getByRole('button', { name: '15 мин' }));
    expect(screen.getByRole('timer').textContent).toBe('15:00');
    expect(screen.getByRole('button', { name: 'Начать' })).toBeTruthy();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('debounce cleanup', () => {
  it('cancels the previous timeout during typing and the final timeout on unmount', () => {
    vi.useFakeTimers();
    const { result, rerender, unmount } = renderHook(({ query }) => useDebouncedValue(query), { initialProps: { query: '' } });
    rerender({ query: 'ре' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ query: 'реакт' });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe('');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('реакт');
    rerender({ query: 'другой запрос' });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('weather fetch effect', () => {
  it('shows loading, renders a real response shape and aborts the request on unmount', async () => {
    let resolveResponse;
    const fetchMock = vi.fn(() => new Promise((resolve) => { resolveResponse = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    const { unmount } = render(<WeatherWidget />);
    expect(screen.getByRole('status').textContent).toContain('Загружаем');
    await act(async () => resolveResponse(successResponse()));
    expect(screen.getByText('20°')).toBeTruthy();
    expect(screen.getByText('Ясно')).toBeTruthy();
    unmount();
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
  });

  it('handles HTTP failure and recovers after Retry', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, status: 503 }).mockResolvedValueOnce(successResponse());
    vi.stubGlobal('fetch', fetchMock);
    render(<WeatherWidget />);
    expect((await screen.findByRole('alert')).textContent).toContain('Не удалось загрузить');
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(await screen.findByText('20°')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBe(null);
  });

  it('rejects malformed API data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ current: { temperature_2m: null } }) }));
    render(<WeatherWidget />);
    expect((await screen.findByRole('alert')).textContent).toContain('Не удалось загрузить');
    expect(screen.queryByText('NaN°')).toBe(null);
  });

  it('times out a stalled request and clears pending timers', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));
    const { unmount } = render(<WeatherWidget />);
    await act(async () => vi.advanceTimersByTime(12000));
    expect(screen.getByRole('alert').textContent).toContain('долго не отвечает');
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('form validation', () => {
  it('rejects whitespace titles and impossible calendar dates', () => {
    const errors = validateTask({ title: '   ', category: 'Учёба', priority: 'Средний', dueDate: '2026-02-30' });
    expect(Object.keys(errors).sort()).toEqual(['dueDate', 'title']);
  });
});
