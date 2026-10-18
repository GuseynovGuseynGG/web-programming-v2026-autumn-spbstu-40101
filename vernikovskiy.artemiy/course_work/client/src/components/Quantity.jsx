export default function Quantity({ value, onChange, compact }) {
  return (
    <div className={`qty ${compact ? "qty--compact" : ""}`}>
      <button type="button" aria-label="Уменьшить" onClick={() => onChange(value - 1)}>
        −
      </button>
      <span>{value}</span>
      <button type="button" aria-label="Увеличить" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
