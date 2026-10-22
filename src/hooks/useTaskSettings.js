import { useEffect, useState } from "react";
import { SORT_OPTIONS } from "../utils/tasks.js";

const KEY = "klick-desk.settings.v1";

export default function useTaskSettings() {
  const [sort, setSort] = useState("newest");
  const [pageSize, setPageSize] = useState(6);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (SORT_OPTIONS.includes(saved?.sort)) setSort(saved.sort);
      if ([6, 12, 24].includes(saved?.pageSize)) setPageSize(saved.pageSize);
    } catch {
      /* При недоступных настройках используем значения по умолчанию. */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ sort, pageSize }));
    } catch {
      /* Ошибка настроек не блокирует чтение задач. */
    }
  }, [sort, pageSize, loaded]);

  return { sort, setSort, pageSize, setPageSize };
}
