export default function Mascot({ isFocusing, allCompleted }) {
  const mood = isFocusing ? "focus" : allCompleted ? "happy" : "idle";
  const caption = isFocusing
    ? "Идёт сессия фокуса"
    : allCompleted
      ? "Все задачи выполнены"
      : "Клик";

  return (
    <figure className={`mascot mascot-${mood}`}>
      <img
        src={`${import.meta.env.BASE_URL}images/klick-${mood}.webp`}
        alt="Маскот Клик"
        width="800"
        height="800"
        fetchPriority="high"
      />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
