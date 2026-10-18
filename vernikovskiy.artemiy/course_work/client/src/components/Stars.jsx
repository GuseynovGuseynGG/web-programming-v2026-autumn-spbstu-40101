export default function Stars({ value }) {
  return (
    <span className="stars" title={`Рейтинг ${value}`}>
      <span className="stars__icon" aria-hidden>
        ★
      </span>
      {value}
    </span>
  );
}
