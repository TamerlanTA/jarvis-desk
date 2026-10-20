import { useEffect, useState } from 'react';
import { createInitialTasks, isValidTask } from '../utils/tasks.js';

const STORAGE_KEY = 'jarvis-desk.tasks.v1';

export default function useStoredTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [storageError, setStorageError] = useState('');

  // Сначала читаем данные. Флаг canSave защищает их от записи пустого списка.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        setTasks(createInitialTasks());
      } else {
        const saved = JSON.parse(raw);
        if (saved.version !== 1 || !Array.isArray(saved.tasks)
          || !saved.tasks.every(isValidTask)
          || new Set(saved.tasks.map((task) => task.id)).size !== saved.tasks.length) {
          throw new Error('Invalid saved tasks');
        }
        setTasks(saved.tasks);
      }
      setCanSave(true);
    } catch {
      setTasks(createInitialTasks());
      setStorageError('Не удалось прочитать сохранённые задачи. Изменения доступны только до закрытия вкладки. Исходные данные не перезаписаны.');
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!canSave) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tasks }));
      setStorageError('');
    } catch {
      setStorageError('Не удалось сохранить задачи в браузере. Не закрывай вкладку, если хочешь продолжить работу с изменениями.');
    }
  }, [tasks, canSave]);

  return { tasks, setTasks, isLoaded, storageError };
}
