function assertId(value, label) {
  if (!Number.isInteger(value)) {
    throw new TypeError(`${label} должен быть целым числом`);
  }
}

export class User {
  constructor(id, name, friends = []) {
    assertId(id, 'id');
    if (typeof name !== 'string' || name.trim() === '') {
      throw new TypeError('name должен быть непустой строкой');
    }
    if (!Array.isArray(friends)) {
      throw new TypeError('friends должен быть массивом');
    }
    friends.forEach((friendId) => assertId(friendId, 'id друга'));

    this.id = id;
    this.name = name.trim();
    this.friends = [...new Set(friends)].filter((friendId) => friendId !== id);
  }

  get friendCount() {
    return this.friends.length;
  }

  addFriend(friendId) {
    assertId(friendId, 'id друга');
    if (friendId === this.id) {
      throw new Error('Нельзя добавить в друзья самого себя');
    }
    if (!this.friends.includes(friendId)) {
      this.friends.push(friendId);
    }
    return this;
  }

  removeFriend(friendId) {
    this.friends = this.friends.filter((id) => id !== friendId);
    return this;
  }

  toJSON() {
    return {id: this.id, name: this.name, friends: [...this.friends]};
  }

  static fromJSON(data) {
    return new User(data.id, data.name, data.friends ?? []);
  }
}

// Группировка по количеству друзей: {количество: [пользователи]}.
export function groupUsersByFriendCount(users) {
  const groups = {};
  for (const user of users) {
    (groups[user.friendCount] ??= []).push(user);
  }
  return groups;
}

// Уникальный список id всех друзей.
export function getUniqueFriends(users) {
  return [...new Set(users.flatMap((user) => user.friends))];
}

// Пользователи, у которых есть друг с заданным id.
export function findUsersWithFriend(users, friendId) {
  return users.filter((user) => user.friends.includes(friendId));
}

// Пользователи, у которых друзей больше заданного числа.
export function findUsersAboveFriendCount(users, count) {
  return users.filter((user) => user.friendCount > count);
}

// Пользователи без друзей.
export function findUsersWithoutFriends(users) {
  return users.filter((user) => user.friendCount === 0);
}
