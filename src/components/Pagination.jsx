export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  disabled,
}) {
  if (total === 0) return null;
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => start + index,
  );
  return (
    <nav className="pagination" aria-label="Страницы задач">
      <p>
        Показано {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}{" "}
        из {total}
      </p>
      <div className="pagination-buttons">
        <button
          type="button"
          disabled={disabled || page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Назад
        </button>
        {pages.map((number) => (
          <button
            key={number}
            type="button"
            aria-label={`Страница ${number}`}
            aria-current={page === number ? "page" : undefined}
            disabled={disabled}
            onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled || page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Далее
        </button>
      </div>
    </nav>
  );
}
