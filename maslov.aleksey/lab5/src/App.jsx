import React, {useEffect, useState} from 'react';
import books from './Books.js';
import BookCard from './components/Bookcard.jsx';
import Favorites from './components/Favorites.jsx';

const STORAGE_KEY = 'favorites';

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read localStorage', e);
  }
  return [];
}

function App() {
  const [favoriteIds, setFavoriteIds] = useState(loadFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch (e) {
      console.error('Failed to save', e);
    }
  }, [favoriteIds]);

  function toggleFavorite(id) {
    setFavoriteIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }

  function removeFavorite(id) {
    setFavoriteIds((ids) => ids.filter((x) => x !== id));
  }

  const favoriteBooks = favoriteIds
    .map((id) => books.find((b) => b.id === id))
    .filter(Boolean);

  return (
    <div>
      <h1>Книжный магазин</h1>

      <Favorites books={favoriteBooks} onRemove={removeFavorite} />

      <h2>Книги</h2>
      <div data-testid="book-list">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            isFavorite={favoriteIds.includes(book.id)}
            onToggle={toggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
