import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import Modal from "../components/Modal.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ProductModal from "../components/ProductModal.jsx";

const PAGE_SIZE = 9;
const SORTS = [
  { id: "new", label: "Новые" },
  { id: "popular", label: "Популярные" },
  { id: "cheap", label: "Подешевле" },
  { id: "expensive", label: "Подороже" },
];

export default function Catalog() {
  const [goods, setGoods] = useState([]);
  const [sort, setSort] = useState("new");
  const [draft, setDraft] = useState(null);
  const [applied, setApplied] = useState(null);
  const [page, setPage] = useState(1);
  const [opened, setOpened] = useState(null);

  useEffect(() => {
    api("/goods").then((items) => {
      setGoods(items);
      const prices = items.map((item) => item.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const initial = { min, max, from: min, to: max, types: [], colors: [] };
      setDraft(initial);
      setApplied(initial);
    });
  }, []);

  const types = useMemo(() => [...new Set(goods.map((item) => item.type))], [goods]);
  const colors = useMemo(() => [...new Set(goods.map((item) => item.color))], [goods]);

  const filtered = useMemo(() => {
    if (!applied) return [];
    let list = goods.filter((item) => item.price >= applied.from && item.price <= applied.to);
    if (applied.types.length) list = list.filter((item) => applied.types.includes(item.type));
    if (applied.colors.length) list = list.filter((item) => applied.colors.includes(item.color));
    const sorted = [...list];
    if (sort === "new") sorted.sort((a, b) => b.novelty - a.novelty);
    if (sort === "popular") sorted.sort((a, b) => b.popularity - a.popularity);
    if (sort === "cheap") sorted.sort((a, b) => a.price - b.price);
    if (sort === "expensive") sorted.sort((a, b) => b.price - a.price);
    return sorted;
  }, [applied, goods, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function toggle(listName, value) {
    setDraft((currentDraft) => {
      const list = currentDraft[listName];
      return {
        ...currentDraft,
        [listName]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
      };
    });
  }

  function reset() {
    if (!draft) return;
    const next = { ...draft, from: draft.min, to: draft.max, types: [], colors: [] };
    setDraft(next);
    setApplied(next);
    setPage(1);
  }

  if (!draft) return <div className="container catalog">Загрузка…</div>;

  return (
    <div className="container catalog">
      <h1>Каталог товаров</h1>
      <div className="catalog__layout">
        <div>
          <div className="chips">
            {SORTS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={sort === item.id ? "chip is-active" : "chip"}
                onClick={() => {
                  setSort(item.id);
                  setPage(1);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          {slice.length ? (
            <div className="grid">
              {slice.map((product) => (
                <ProductCard key={product.id} product={product} onOpen={setOpened} />
              ))}
            </div>
          ) : (
            <p className="empty">Товары по вашему запросу не найдены</p>
          )}
          <Pagination page={current} pages={pages} onChange={setPage} />
        </div>

        <aside className="filters">
          <h3>Цена, ₽</h3>
          <div className="filters__prices">
            <label>
              От
              <input
                type="number"
                value={draft.from}
                onChange={(event) => setDraft({ ...draft, from: Number(event.target.value) })}
              />
            </label>
            <label>
              До
              <input
                type="number"
                value={draft.to}
                onChange={(event) => setDraft({ ...draft, to: Number(event.target.value) })}
              />
            </label>
          </div>
          <div className="range">
            <input
              type="range"
              min={draft.min}
              max={draft.max}
              value={draft.from}
              onChange={(event) =>
                setDraft({ ...draft, from: Math.min(Number(event.target.value), draft.to) })
              }
            />
            <input
              type="range"
              min={draft.min}
              max={draft.max}
              value={draft.to}
              onChange={(event) =>
                setDraft({ ...draft, to: Math.max(Number(event.target.value), draft.from) })
              }
            />
          </div>

          <h3>Тип товара</h3>
          {types.map((type) => (
            <label key={type} className="check">
              <input
                type="checkbox"
                checked={draft.types.includes(type)}
                onChange={() => toggle("types", type)}
              />
              {type}
            </label>
          ))}

          <h3>Цвет</h3>
          {colors.map((color) => (
            <label key={color} className="check">
              <input
                type="checkbox"
                checked={draft.colors.includes(color)}
                onChange={() => toggle("colors", color)}
              />
              {color}
            </label>
          ))}

          <div className="filters__actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                setApplied({ ...draft });
                setPage(1);
              }}
            >
              Показать
            </button>
            <button type="button" className="link-btn" onClick={reset}>
              Сбросить
            </button>
          </div>
        </aside>
      </div>

      <Modal open={Boolean(opened)} onClose={() => setOpened(null)} className="modal--wide">
        <ProductModal product={opened} onClose={() => setOpened(null)} />
      </Modal>
    </div>
  );
}

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const items = [];
  if (pages <= 3) {
    for (let i = 1; i <= pages; i += 1) items.push(i);
  } else {
    items.push(1, 2, 3, "…", pages);
  }
  return (
    <div className="pagination">
      {items.map((item, index) =>
        item === "…" ? (
          <span key={`e${index}`}>…</span>
        ) : (
          <button
            key={item}
            type="button"
            className={item === page ? "is-active" : ""}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ),
      )}
    </div>
  );
}
