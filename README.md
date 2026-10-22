# Klick Desk

Планировщик задач на React: направления «Агентство», «Контент» и «Учёба», таймер фокуса и погода в Алматы. Учебный проект для мидтерма и задания Task 4. Effects.

- [Открыть приложение](https://tamerlanta.github.io/jarvis-desk/)
- [Репозиторий](https://github.com/TamerlanTA/jarvis-desk)

## Возможности

- Добавление и редактирование задач: название, направление, приоритет, срок.
- Валидация названия (3–120 символов) и календарной даты.
- Отметка выполнения и удаление с подтверждением.
- Поиск с задержкой 300 мс, совместные фильтры по направлению и статусу.
- Счётчики задач и процент выполнения.
- Сохранение задач в localStorage между перезагрузками.
- Таймер на 5, 15 или 25 минут: старт, пауза, продолжение, сброс.
- Погода Алматы с состояниями загрузки, ошибки и повторным запросом.
- Маскот Клик: обычное состояние, фокус и завершение всех задач.
- Адаптивный интерфейс, управление формами с клавиатуры и закрытие диалогов через Escape.

## Запуск

Стек: React, Vite, JavaScript и обычный CSS. Шрифт Onest включён в сборку. Проверено на Node.js 26.0.0 и npm 11.12.1.

```bash
git clone https://github.com/TamerlanTA/jarvis-desk.git
cd jarvis-desk
npm ci
npm run dev
```

Открыть адрес из терминала, обычно `http://localhost:5173/jarvis-desk/`.

```bash
npm run build    # production-сборка в dist/
npm run preview  # просмотр production-сборки
npm run lint     # проверка JavaScript и hooks
npm test         # 14 тестов
```

## Тема курса → где в коде

| Тема                        | Файлы и реализация                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Компоненты и props          | `src/components/` — 11 отдельных компонентов. `TaskList` передаёт задачу и обработчики в `TaskItem`                                               |
| Lifting state up            | `App.jsx` владеет списком через `useStoredTasks`; список, сводка и форма используют общие данные. Состояние фокуса связывает таймер с маскотом    |
| Несколько useState          | `App.jsx` — поиск, фильтры и диалоги; `TaskForm.jsx` — значения и ошибки; `FocusTimer.jsx` — отсчёт; `WeatherWidget.jsx` — ответ и статус запроса |
| События                     | `TaskItem.jsx` — onClick/onChange; `TaskForm.jsx` — onSubmit и preventDefault; `TaskFilters.jsx` — поиск и select                                 |
| Управляемые формы           | `TaskForm.jsx` — value и onChange для каждого поля; `utils/tasks.js` — validateTask и isValidDate                                                 |
| Списки и key                | `TaskList.jsx` — map с key по постоянному ID; варианты полей и фильтров также имеют ключи                                                         |
| Условный рендеринг          | `TaskList.jsx` — пустой результат; `WeatherWidget.jsx` — loading/error/data; `App.jsx` — диалоги; `Mascot.jsx` — состояние персонажа              |
| Effect: чтение localStorage | `hooks/useStoredTasks.js`, первый useEffect, `[]` — загрузка и проверка данных при старте                                                         |
| Effect: запись localStorage | `hooks/useStoredTasks.js`, второй useEffect, `[tasks, canSave]` — сохранение после чтения и при изменениях                                        |
| Effect: fetch               | `components/WeatherWidget.jsx`, `[requestNumber]` — Open-Meteo, loading/error, таймаут и AbortController в cleanup                                |
| Effect: таймер              | `components/FocusTimer.jsx`, `[endsAt, onRunningChange]` — интервал отсчёта и clearInterval в cleanup                                             |
| Effect: debounce            | `hooks/useDebouncedValue.js`, `[value, delay]` — отложенный поиск и clearTimeout в cleanup                                                        |
| Стили                       | `styles.css` — Grid, Flexbox, media queries, focus-visible и reduced-motion                                                                       |

Пути в таблице относительны к `src/`, если не указан другой каталог. [Подробный разбор Effects](docs/EFFECTS.md).

## Как устроены данные

`App → TaskList → TaskItem`: данные идут вниз через props, события вызывают обработчики в App. Массив обновляется через map, filter или spread. Сводка и результаты фильтрации вычисляются из массива; отдельный state для них не нужен.

Черновик формы хранится в `TaskForm` и попадает в список после проверки. `Mascot` получает два props: `isFocusing` и `allCompleted`; по ним выбирает одно из трёх WebP-изображений. В приложении используются готовые изображения и оформление Klick: белый фон, Onest, синие кнопки и тонкие разделители.

Задачи хранятся под ключом `jarvis-desk.tasks.v1` в формате `{ version: 1, tasks: [...] }`. Ключ сохранён для совместимости с первой версией. ID новых задач создаются через crypto.randomUUID(). Четыре примера появляются только при отсутствии сохранённого списка; сохранённый пустой список не заполняется заново.

Хранилище относится к браузеру и origin. Таймер и фильтры сбрасываются при обновлении страницы. При ошибке чтения или записи появляется сообщение; повреждённая запись не перезаписывается автоматически.

## API

Погода: [Open-Meteo](https://open-meteo.com/en/docs), координаты Алматы, часовой пояс Asia/Almaty, ветер в км/ч. Ключ не требуется для некоммерческого использования. Ссылка на источник есть в виджете.

Для погоды нужна сеть. Ошибка запроса не мешает работать с задачами и таймером.

## Публикация

В `vite.config.js` указан `base: '/jarvis-desk/'`. Один экран, роутер не используется.

```bash
npm run deploy
```

Скрипт predeploy запускает сборку, затем gh-pages публикует dist в ветку `gh-pages`. В GitHub Pages выбраны `gh-pages` и корень `/`. Исходники коммитятся и отправляются в `main` отдельно; git push не заменяет npm run deploy.

## Проверки и защита

Тесты в `tests/effects.test.jsx` проверяют сохранение, ошибки хранилища, пустой список, cleanup таймера и debounce, HTTP-ошибку с повтором, некорректный ответ и таймаут погоды, валидацию и связь маскота с таймером и задачами.

[План защиты на 3–4 минуты и вопросы по коду](docs/DEFENSE.md).
