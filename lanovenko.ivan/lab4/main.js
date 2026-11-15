import {User} from './model.js';

const STORAGE_KEY = 'lab4.users';
const DELAY_MS = 300;

const list = document.querySelector('[data-testid="entity-list"]');
const form = document.querySelector('[data-testid="entity-form"]');
const message = document.querySelector('[data-testid="message"]');

let users = loadUsers();

function loadUsers() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data.map((item) => User.fromJSON(item)) : [];
  } catch {
    return [];
  }
}

function saveUsers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function showMessage(text) {
  message.textContent = text;
}

// Любая операция изменения выполняется асинхронно: Promise + setTimeout.
function runAsync(action) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(action());
      } catch (error) {
        reject(error);
      }
    }, DELAY_MS);
  });
}

function perform(action) {
  return runAsync(action)
    .then(() => {
      saveUsers();
      render();
      showMessage('');
      return true;
    })
    .catch((error) => {
      showMessage(error.message);
      return false;
    });
}

function findUser(id) {
  const user = users.find((item) => item.id === id);
  if (!user) {
    throw new Error(`Пользователь с ID ${id} не найден`);
  }
  return user;
}

function addUser(id, name) {
  return perform(() => {
    if (users.some((user) => user.id === id)) {
      throw new Error(`Пользователь с ID ${id} уже существует`);
    }
    users.push(new User(id, name));
  });
}

function removeUser(id) {
  return perform(() => {
    users = users.filter((user) => user.id !== id);
    users.forEach((user) => user.removeFriend(id));
  });
}

function addFriend(userId, friendId) {
  return perform(() => findUser(userId).addFriend(friendId));
}

function removeFriend(userId, friendId) {
  return perform(() => findUser(userId).removeFriend(friendId));
}

function createFriendItem(user, friendId) {
  const item = document.createElement('li');
  item.className = 'friend-item';

  const friend = users.find((candidate) => candidate.id === friendId);
  const label = document.createElement('span');
  label.textContent = friend
    ? `${friend.name} (ID ${friendId})`
    : `ID ${friendId}`;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button button-secondary';
  button.dataset.testid = 'remove-friend';
  button.textContent = 'Удалить друга';
  button.addEventListener('click', () => removeFriend(user.id, friendId));

  item.append(label, button);
  return item;
}

function createFriendForm(user) {
  const friendForm = document.createElement('form');
  friendForm.className = 'friend-form';
  friendForm.dataset.testid = 'friend-form';

  const input = document.createElement('input');
  input.type = 'number';
  input.name = 'friendId';
  input.required = true;
  input.placeholder = 'ID друга';
  input.setAttribute('aria-label', `ID друга для ${user.name}`);

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'button';
  button.textContent = 'Добавить друга';

  friendForm.append(input, button);
  friendForm.addEventListener('submit', (event) => {
    event.preventDefault();
    addFriend(user.id, Number(input.value)).then((ok) => {
      if (ok) {
        friendForm.reset();
      }
    });
  });
  return friendForm;
}

function createCard(user) {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.testid = 'entity-card';

  const title = document.createElement('h2');
  title.className = 'card-title';
  title.textContent = user.name;

  const userId = document.createElement('p');
  userId.className = 'card-id';
  userId.textContent = `ID: ${user.id}`;

  const friendsTitle = document.createElement('h3');
  friendsTitle.className = 'card-subtitle';
  friendsTitle.textContent = `Друзья (${user.friendCount})`;

  const friendList = document.createElement('ul');
  friendList.className = 'friend-list';
  if (user.friendCount === 0) {
    const empty = document.createElement('li');
    empty.className = 'friend-empty';
    empty.textContent = 'Друзей пока нет';
    friendList.append(empty);
  } else {
    user.friends.forEach((friendId) =>
      friendList.append(createFriendItem(user, friendId)),
    );
  }

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'button button-danger';
  deleteButton.dataset.testid = 'delete-entity';
  deleteButton.textContent = 'Удалить пользователя';
  deleteButton.addEventListener('click', () => removeUser(user.id));

  card.append(
    title,
    userId,
    friendsTitle,
    friendList,
    createFriendForm(user),
    deleteButton,
  );
  return card;
}

function render() {
  list.replaceChildren();
  if (users.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Пользователей пока нет';
    list.append(empty);
    return;
  }
  users.forEach((user) => list.append(createCard(user)));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const id = Number(data.get('id'));
  const name = String(data.get('name')).trim();

  if (!Number.isInteger(id) || name === '') {
    showMessage('Укажите целочисленный ID и имя');
    return;
  }
  addUser(id, name).then((ok) => {
    if (ok) {
      form.reset();
    }
  });
});

window.addEventListener('pagehide', saveUsers);

render();
