import React from 'react';

function Favorites({books, onRemove}) {
  return (
    <section className="favorites" data-testid="favorites">
      <h2>
        Избранное: <span data-testid="favorites-count">{books.length}</span>
      </h2>
      {books.length === 0 && <p>Пока ничего нет</p>}
      <ul data-testid="favorites-list">
        {books.map((book) => (
          <li key={book.id} data-testid="favorite-item">
            <span>
              {book.title} — {book.price} ₽
            </span>
            <button
              type="button"
              data-testid="remove-favorite"
              onClick={() => onRemove(book.id)}
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Favorites;
