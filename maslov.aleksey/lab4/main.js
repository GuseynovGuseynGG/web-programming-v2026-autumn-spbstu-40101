import {Product} from './model.js';

const STORAGE_KEY = 'products';

function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw).map(
        (p) => new Product(p.id, p.name, p.categories, p.price),
      );
    }
  } catch (e) {
    console.error('Failed to parse localStorage', e);
  }
  return [];
}

function saveProducts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save', e);
  }
}

let products = loadProducts();
const listElement = document.querySelector('[data-testid="entity-list"]');
const formElement = document.querySelector('form[data-testid="entity-form"]');

function runAsync(action) {
  return new Promise((resolve) => {
    setTimeout(() => {
      action();
      saveProducts();
      render();
      resolve();
    }, 150);
  });
}

function render() {
  listElement.innerHTML = '';

  products.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-testid', 'entity-card');

    const title = document.createElement('h3');
    title.textContent = `${p.name} (#${p.id})`;

    const price = document.createElement('p');
    price.textContent = `Цена: ${p.price}`;

    const cats = document.createElement('p');
    cats.textContent = `Категории (${p.categoryCount}): ${p.categories.join(', ')}`;

    const catInput = document.createElement('input');
    catInput.type = 'text';
    catInput.placeholder = 'Категория';

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Добавить категорию';
    addBtn.addEventListener('click', () => {
      runAsync(() => p.addCategory(catInput.value));
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Удалить категорию';
    removeBtn.addEventListener('click', () => {
      runAsync(() => p.removeCategory(catInput.value.trim()));
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить товар';
    deleteBtn.setAttribute('data-testid', 'delete-entity');
    deleteBtn.setAttribute('data-id', p.id);
    deleteBtn.addEventListener('click', () => {
      runAsync(() => {
        products = products.filter((x) => x.id !== p.id);
      });
    });

    card.append(title, price, cats, catInput, addBtn, removeBtn, deleteBtn);
    listElement.appendChild(card);
  });
}

formElement.addEventListener('submit', (e) => {
  e.preventDefault();

  const id = document.getElementById('id').value;
  const name = document.getElementById('name').value;
  const price = Number(document.getElementById('price').value);
  const categoriesText = document.getElementById('categories').value;
  const categories = categoriesText
    ? categoriesText.split(',').map((c) => c.trim())
    : [];

  runAsync(() => {
    products.push(new Product(id, name, categories, price));
  }).then(() => formElement.reset());
});

render();
