import { CATEGORIES } from "../utils/tasks.js";
import Icon from "./Icon.jsx";

export default function TaskFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  pageSize,
  onPageSizeChange,
}) {
  return (
    <div className="task-filters">
      <div className="search-row">
        <label className="search-field">
          <Icon name="search" />
          <span className="sr-only">Поиск задач</span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Найти задачу…"
            maxLength={120}
          />
        </label>
        <select
          aria-label="Статус задач"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="all">Все статусы</option>
          <option value="active">В работе</option>
          <option value="completed">Готово</option>
        </select>
      </div>
      <div className="sort-row">
        <label>
          Сортировка
          <select
            aria-label="Сортировка задач"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
          >
            <option value="newest">Сначала новые</option>
            <option value="dueDate">По сроку</option>
            <option value="priority">По приоритету</option>
            <option value="title">По названию</option>
          </select>
        </label>
        <label>
          На странице
          <select
            aria-label="Задач на странице"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {[6, 12, 24].map((size) => (
              <option value={size} key={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div
        className="category-filters"
        role="group"
        aria-label="Направление задач"
      >
        {["Все", ...CATEGORIES].map((item) => (
          <button
            key={item}
            className="filter-button"
            type="button"
            aria-pressed={category === item}
            onClick={() => onCategoryChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
