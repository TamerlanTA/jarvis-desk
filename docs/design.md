# Jarvis Desk — visual specification

Concept: `docs/design-concept.png`. A design reference, not an application screenshot.

- Dark charcoal #111310 canvas, #191c17 surfaces, #383e32 borders, #f3f4ef text, #b4b9b0 muted text, #d0ee94 lime accent. No photo assets, fonts or external UI libraries.
- System sans-serif: 52px desktop heading, 24–32px section headings, 16–18px controls, 14px metadata, 68px tabular timer. Native controls are explicitly styled.
- 1360px centered workspace, slim header, introduction, task panel / utility rail at about 70:30, 18px gutter, 12px panel corners. Below 980px stack panels; below 600px wrap filters and task metadata.
- Copy: jarvis desk; Личное пространство; Всё важное. На одном столе.; Задачи, фокус и немного ясности на сегодня.; Мои задачи; Новая задача; Всего / В работе / Готово; Найти задачу…; Все статусы; Все / Агентство / Контент / Учёба; Время для фокуса; Начать; Алматы; Ощущается как; Ветер; Данные Open-Meteo; Меньше шума. Больше сделанного.
- Components: Header, TaskSummary, TaskFilters, TaskList, TaskItem, TaskForm, FocusTimer, WeatherWidget, Icon. App owns tasks and filters; form owns draft fields; timer and weather own independent state.
- Outline icons use inline SVG with consistent 1.7px stroke. Buttons: lime primary, outlined secondary, transparent icon buttons with visible keyboard focus. All controls have hover/disabled states.
- Required extensions to the pictured state: accessible modal form for create/edit, validation errors, loading/error/retry weather states, empty list, delete confirmation with cancellation. Dialog uses native focus management and Escape; stays consistent with the design.
- Intentional corrections: current date and weather are live; seed deadlines relative to Almaty date; progress width is mathematically correct (1/4 = 25%, unlike the mockup). Wind is shown in km/h, matching API units. No compass direction without requested data.
