import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";

export default function FocusTimer({ onRunningChange }) {
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [endsAt, setEndsAt] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const isRunning = endsAt !== null;

  useEffect(() => {
    if (endsAt === null) return;
    // Считаем от времени окончания: фоновая вкладка не замедлит отсчёт.
    const intervalId = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        setEndsAt(null);
        setIsComplete(true);
        onRunningChange?.(false);
      }
    }, 200);
    return () => clearInterval(intervalId);
  }, [endsAt, onRunningChange]);

  function chooseDuration(value) {
    setMinutes(value);
    setSecondsLeft(value * 60);
    setEndsAt(null);
    setIsComplete(false);
    onRunningChange?.(false);
  }

  function toggleTimer() {
    if (isRunning) {
      setSecondsLeft(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
      setEndsAt(null);
      onRunningChange?.(false);
    } else {
      const remaining = secondsLeft || minutes * 60;
      setSecondsLeft(remaining);
      setEndsAt(Date.now() + remaining * 1000);
      setIsComplete(false);
      onRunningChange?.(true);
    }
  }

  const time = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return (
    <section className="panel focus-panel" aria-labelledby="focus-heading">
      <h2 id="focus-heading">Время для фокуса</h2>
      <div
        className="duration-options"
        role="group"
        aria-label="Длительность сессии"
      >
        {[25, 15, 5].map((value) => (
          <button
            type="button"
            className="duration-button"
            key={value}
            aria-pressed={minutes === value}
            onClick={() => chooseDuration(value)}
          >
            {value} мин
          </button>
        ))}
      </div>
      <output
        className={`timer-display${isRunning ? " is-running" : ""}`}
        role="timer"
        aria-live="off"
        aria-label="Осталось времени"
      >
        {time}
      </output>
      <div className="timer-controls">
        <button type="button" className="primary-button" onClick={toggleTimer}>
          <Icon name={isRunning ? "pause" : "play"} />
          {isRunning ? "Пауза" : isComplete ? "Ещё раз" : "Начать"}
        </button>
        <button
          type="button"
          className="secondary-button timer-reset"
          aria-label="Сбросить таймер"
          title="Сбросить таймер"
          onClick={() => chooseDuration(minutes)}
        >
          <Icon name="reset" />
        </button>
      </div>
      <p className={isComplete ? "timer-message" : "sr-only"} role="status">
        {isComplete ? "Сессия завершена. Время сделать перерыв." : ""}
      </p>
    </section>
  );
}
