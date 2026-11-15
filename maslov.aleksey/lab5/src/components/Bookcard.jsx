import React from 'react';

function BookCard({book, isFavorite, onToggle}) {
  return (
    <article className="card" data-testid="book-card">
      <img src={book.cover} alt={`Обложка: ${book.title}`} width="130" />
      <div>
        <h3>{book.title}</h3>
        <p>Рейтинг: {book.rating}</p>
        <p>{book.description}</p>
        <p>Цена: {book.price} ₽</p>
        <button
          type="button"
          data-testid="favorite-add"
          className={isFavorite ? 'active' : ''}
          aria-pressed={isFavorite}
          onClick={() => onToggle(book.id)}
        >
          {isFavorite ? 'В избранном' : 'Добавить в избранное'}
        </button>
      </div>
    </article>
  );
}

export default BookCard;
