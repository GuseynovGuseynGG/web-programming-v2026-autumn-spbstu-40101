# Gadget Hub

Учебный интернет-магазин гаджетов: React-фронтенд, Express-бэкенд, JSON-хранилище, Docker и Nginx. Проект выполнен по макетам из `docs/templates/`.

Возможности: регистрация и вход, cookie-сессии, каталог с фильтрами/сортировкой/пагинацией, корзина в `localStorage`, оформление и отмена заказов, динамические статусы заказов, запуск через `npm run dev` и Docker Compose.

## Демо-доступ

```text
логин: student
пароль: gadget123
```

Нового пользователя можно зарегистрировать через интерфейс.

## Содержание

1. Стек
2. Архитектура
3. Структура проекта
4. Быстрый старт
5. Переменные окружения
6. Docker
7. API
8. Модели данных
9. Аутентификация и сессии
10. Безопасность
11. Логика статусов заказа
12. Frontend
13. Разработка
14. Сценарий приёмки
15. Troubleshooting
16. Макеты и исходники

## Стек

| Слой | Технологии |
|---|---|
| Frontend | React, Vite, React Router, Context API (`AuthContext`, `CartContext`, `GuestPromptContext`) |
| Backend | Node.js 18+, Express, cookie-сессии, `scrypt` для паролей |
| Хранилище | JSON-файлы в `server/data/` |
| Инфраструктура | Docker, Docker Compose, Nginx, multi-stage build |

## Архитектура

```text
client/   — React SPA
server/   — Express API и JSON-данные
docker/   — Dockerfile, Nginx config
```

Dev: Vite на `:3000` отдаёт SPA и проксирует `/api` → `:8080`.
Docker: Nginx на `:3000` отдаёт собранный фронтенд и проксирует `/api` → `api:8080`; данные монтируются из `./server/data`.

Слои:

| Слой | Где |
|---|---|
| UI (страницы, компоненты) | `client/src/pages`, `client/src/components` |
| Состояние | `client/src/context` |
| HTTP-клиент | `client/src/api.js` |
| Роутинг, сессии, валидация | `server/src/index.js` |
| Бизнес-логика статусов | `server/src/orderStatus.js`, `client/src/orderStatus.js` |
| JSON-хранилище | `server/src/store.js` |
| Пароли и секрет сессии | `server/src/passwords.js`, `server/src/secret.js` |

## Структура проекта

```text
.
├── .env.example
├── client
│   ├── vite.config.js
│   ├── public/{fonts, images/{goods,icons,social}}
│   └── src
│       ├── App.jsx, main.jsx, api.js, orderStatus.js, styles.css
│       ├── components/  Carousel, Layout, Modal, ProductCard,
│       │                ProductModal, Quantity, Stars
│       ├── context/     AuthContext, CartContext, GuestPrompt
│       └── pages/       Home, Login, Catalog, Cart
├── server
│   ├── data/{goods,orders,users}.json
│   └── src/  index.js, loadEnv.js, orderStatus.js,
│             passwords.js, secret.js, store.js
├── docker/   api.Dockerfile, web.Dockerfile, nginx.conf
├── docker-compose.yml
└── docs/templates/  Course_project.pdf, Gadget Hub.fig,
                     Gadget Hub - pages.pdf, Gadget Hub - UI kit.pdf,
                     Gadget Hub Assets.zip
```

## Быстрый старт

Требования: Node.js 18+, npm.

```bash
cp .env.example .env
# задайте SESSION_SECRET в .env

npm install
npm install --prefix server
npm install --prefix client
npm run dev
```

- фронтенд: http://localhost:3000
- API: http://localhost:8080

Остановка — `Ctrl+C`. Если `SESSION_SECRET` не задан, сервер создаст `server/.session-secret` (права `0600`); для стабильных сессий между перезапусками лучше задавать переменную окружения.

## Переменные окружения

`.env` не коммитится; шаблон — `.env.example`.

| Переменная | Пример | Назначение |
|---|---|---|
| `WEB_PORT` | `3000` | порт фронтенда в Docker Compose |
| `API_PORT` | `8080` | порт API в Docker Compose |
| `SESSION_SECRET` | `change-me` | секрет cookie-сессии |
| `CORS_ORIGIN` | `http://localhost:3000,http://127.0.0.1:3000` | разрешённые origin через запятую |

`SESSION_SECRET` — длинная случайная строка: `openssl rand -hex 32`.

## Docker

```bash
cp .env.example .env
docker compose up --build
```

- фронтенд: http://localhost:3000 (Nginx)
- API: http://localhost:8080

Nginx (`docker/nginx.conf`): отдаёт статику, проксирует `/api` на `api:8080`, пробрасывает `Cookie`, `server_tokens off`, gzip, `client_max_body_size 32k`.

Данные монтируются из `./server/data` — заказы и пользователи переживают перезапуск. Сброс: остановить контейнеры и заменить `server/data/orders.json` и `server/data/users.json` на `[]`.

Полезные команды:

```bash
docker compose logs -f          # все логи
docker compose logs -f api      # только API
docker compose down             # остановить
docker compose up --build -d    # пересобрать и запустить в фоне
```

## API

Базовый URL: `http://localhost:8080/api` (или `http://localhost:3000/api` через прокси). Все ответы — JSON; ошибки — `{ "error": "текст" }`. Авторизация — cookie-сессия; клиент шлёт `credentials: "include"`.

| Метод | Путь | Auth | Назначение |
|---|---|---:|---|
| `GET` | `/api/goods` | нет | список товаров |
| `POST` | `/api/register` | нет | регистрация |
| `POST` | `/api/login` | нет | вход |
| `POST` | `/api/logout` | да | выход |
| `GET` | `/api/me` | нет | текущий пользователь или `null` |
| `GET` | `/api/orders` | да | заказы пользователя (со `status`) |
| `POST` | `/api/orders` | да | создать заказ |
| `DELETE` | `/api/orders/:number` | да | отменить заказ (нужна причина) |

**`GET /api/goods`** → `Product[]`.

**`POST /api/register`** — `{ "username", "password" }` → `{ "user": { "username" } }`, устанавливает cookie. Ошибки: пустой логин/пароль, пользователь существует.

**`POST /api/login`** — `{ "username", "password" }` → `{ "user" }`, устанавливает cookie. Неверные данные → ошибка.

**`POST /api/logout`** — `{}` → завершает сессию.

**`GET /api/me`** — `{ "user": { "username" } }` или `{ "user": null }`. Используется при загрузке SPA для восстановления сессии.

**`GET /api/orders`** → `Order[]`. Поле `status` вычисляется сервером (см. «Логика статусов заказа»).

**`POST /api/orders`** — `{ "items": [{ "id", "quantity" }], "phone" }` → `{ "order" }`. Сервер проверяет авторизацию, находит товары по `id`, считает `itemCount`, генерирует `number`, сохраняет заказ. После успеха клиент очищает корзину.

**`DELETE /api/orders/:number`** — `{ "reason": "..." }`, причина обязательна.

Пример:

```bash
curl -i -c cookies.txt -X POST http://localhost:8080/api/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"student","password":"gadget123"}'

curl -b cookies.txt http://localhost:8080/api/orders
```

## Модели данных

**Товар** (`server/data/goods.json`):

```json
{
  "id": 1,
  "name": "Ноутбук Pro",
  "price": 79990,
  "image": "/images/goods/image_2.png",
  "type": "ноутбуки",
  "color": "серебристый",
  "novelty": 7,
  "popularity": 9
}
```

`novelty` и `popularity` — баллы для сортировки; `type` и `color` попадают в фильтры автоматически.

**Пользователь** (`server/data/users.json`): `{ "username", "password" }`, пароль — `scrypt:<salt_hex>:<hash_hex>`. Поддержка «сырого» пароля оставлена только для совместимости демо-данных.

**Заказ** (`server/data/orders.json`): `number`, `date` (ISO), `itemCount`, `items[]`, `phone`; `status` добавляется сервером при выдаче.

## Аутентификация и сессии

- Регистрация/вход → сервер хеширует или проверяет пароль → ставит cookie.
- Восстановление сессии при загрузке SPA: `GET /api/me`.
- Выход: `POST /api/logout`, клиент очищает `user` в `AuthContext`.
- Приватный маршрут `/cart` обёрнут в `PrivateRoute`: пока `ready=false` — ничего не рендерим; без `user` — редирект на `/login`; иначе — корзина.

## Безопасность

- **Пароли:** `scrypt`, соль 16 байт, ключ 32 байта, сравнение через `timingSafeEqual`.
- **Session secret:** приоритет `SESSION_SECRET` → `server/.session-secret` → автогенерация (`0600`). В Docker обязательно задавайте `SESSION_SECRET`, иначе сессии слетят при пересоздании контейнера.
- **Path traversal:** `store.js` требует `.json` и совпадения `path.basename(name) === name`.
- **CORS:** только origin из `CORS_ORIGIN`.
- **Vite:** `fs.deny` закрывает `.env`, `.session-secret`, `server/**`, `data/**`.
- **Nginx:** `server_tokens off`, `client_max_body_size 32k`, проксирование только на `api:8080`.
- **Клиентская валидация не заменяет серверную.** Сервер обязан повторно проверять все входящие данные.

## Логика статусов заказа

Статус вычисляется динамически по `date`, `number` и текущей загруженности магазина. Жёсткого поля «текущий статус» в JSON нет.

Этапы:

| # | ID | Название |
|---:|---|---|
| 0 | `received` | Поступил на обработку |
| 1 | `packing` | Собирается |
| 2 | `shipping` | В пути |
| 3 | `delivered` | Доставлено |

Загруженность магазина (`shopLoad`, окно 17 дней):

```text
load = recent.length / 8 * 0.55 + volume / 30 * 0.4
load = clamp(load, 0.08, 1)
```

Персональная добавка к заказу (`mixLoad`):

```text
personal  = (numberDigits % 97) / 96
mixedLoad = clamp(load * 0.6 + personal * 0.4, 0, 1)
```

Длительности:

```text
processingMs = round(2000 + mixedLoad * 5000)            // 2–7 сек
packingMs    = round((0.35 + mixedLoad * 2.65) * DAY)
shippingMs   = round((1.5  + mixedLoad * 12.5) * DAY)
```

Границы: `receivedUntil = created + processingMs`, `packingUntil = receivedUntil + packingMs`, `shippingUntil = packingUntil + shippingMs`. Статус — первый индекс, чья граница ещё не пройдена; иначе `delivered`.

Логика дублируется в `server/src/orderStatus.js` и `client/src/orderStatus.js` — при изменении формул синхронизируйте оба файла.

## Frontend

| Путь | Страница | Доступ |
|---|---|---|
| `/` | Главная | открыт |
| `/login` | Вход / регистрация | открыт |
| `/catalog` | Каталог | открыт |
| `/cart` | Корзина и история | только авторизованным |

**`AuthContext`:** `user`, `ready`, методы `login`, `register`, `logout`; при монтировании — `GET /api/me`.

**`CartContext`:** хранит корзину в `localStorage` под ключом `gadget-hub-cart`. Методы: `add(product)`, `setQuantity(id, quantity)` (при `<= 0` удаляет), `remove(ids)`, `clear()`. Элемент корзины — `{ id, name, price, image, quantity }`.

**Гость:** добавление в корзину перехватывается `GuestPromptContext` — показывается уведомление о необходимости входа.

**Каталог:** товары через `GET /api/goods`, фильтрация/сортировка/пагинация — на клиенте.

- Сортировка: `new` (по `novelty` ↓), `popular` (по `popularity` ↓), `cheap` (по `price` ↑), `expensive` (по `price` ↓).
- Фильтры: цена (от/до), тип, цвет. Применяются только по кнопке «Показать» (черновик `draft`).
- Пагинация: `PAGE_SIZE = 9`.

**Карточка товара:** открывается в `Modal`, закрывается по крестику, `Esc` и клику по оверлею (если реализовано в `Modal.jsx`).

**Карусель:** 3 видимых карточки, зацикливание через дублирование массива, стрелки отключаются, если товаров меньше трёх.

**Валидация:** `isRussianPhone` — 10 цифр или 11 с `7`/`8`; `isValidEmail` — пустое допустимо, иначе regex + длина ≤ 254.

## Разработка

**Новый товар** — добавьте объект в `server/data/goods.json`. Требования: уникальный `id`, существующий файл в `client/public/images/goods/`, `type`/`color` попадут в фильтры автоматически, `novelty`/`popularity` влияют на сортировку.

**Изменить сроки доставки** — правьте константы в `server/src/orderStatus.js` и `client/src/orderStatus.js`:

```js
const processingMs = Math.round(2000 + load * 5000);
const packingMs    = Math.round((0.35 + load * 2.65) * DAY);
const shippingMs   = Math.round((1.5  + load * 12.5) * DAY);
```

**Сбросить пользователей и заказы** — замените `server/data/users.json` и `server/data/orders.json` на `[]`. Удаление `student` сломает демо-вход.

**Посмотреть данные** — `cat server/data/goods.json` или `jq . server/data/goods.json`.

**Рекомендуемые улучшения:**

1. Вынести `orderStatus.js` в общий пакет, убрать дублирование client/server.
2. Добавить серверную валидацию тела заказа.
3. Покрыть тестами `passwords.js`, `orderStatus.js`, API.
4. Заменить JSON на SQLite/PostgreSQL при росте.
5. Добавить OpenAPI/Swagger.
6. Настроить CI: линтер, сборка, docker build.

## Сценарий приёмки

- [ ] **Главная** — шапка, навигация, карусели хитов и новинок, карточка товара в модалке.
- [ ] **Гость и корзина** — товар не добавляется, показывается уведомление.
- [ ] **Вход, пустые поля** — красная подсветка и сообщение.
- [ ] **Неверный пароль** — ошибка, пользователь остаётся гостем.
- [ ] **Вход `student / gadget123`** — успешен, корзина доступна.
- [ ] **Каталог** — сортировка, фильтры, пагинация, добавление в корзину.
- [ ] **Корзина** — список, изменение количества, удаление, итог, обязательный телефон.
- [ ] **Оформление** — заказ создан, корзина очищена, заказ в истории.
- [ ] **Статус** — присутствует, соответствует этапам, первый этап проходит быстро.
- [ ] **Отмена** — `DELETE /api/orders/:number` с причиной.
- [ ] **Выход** — сессия завершена, доступ к корзине ограничен.

## Troubleshooting

| Проблема | Решение |
|---|---|
| Порт 3000/8080 занят | Остановите `npm run dev` перед Docker; `lsof -i :3000`; измените `WEB_PORT`/`API_PORT` в `.env` |
| После перезапуска Docker слетела сессия | Задайте постоянный `SESSION_SECRET` в `.env` |
| Корзина пустая после перезагрузки | Проверьте `localStorage` под ключом `gadget-hub-cart`; приватный режим браузера блокирует `localStorage` |
| Товары не отображаются | Валидный JSON в `server/data/goods.json`; картинки в `client/public/images/goods/` |
| CORS-ошибка | Добавьте origin фронтенда в `CORS_ORIGIN` |
| Docker не видит изменения | `docker compose up --build`; при необходимости `down` и снова `up --build` |
| JSON повреждён | `node -e "JSON.parse(require('fs').readFileSync('server/data/orders.json','utf8')); console.log('OK')"` |

## Макеты и исходники

| Файл | Содержание |
|---|---|
| `docs/templates/Course_project.pdf` | ТЗ |
| `docs/templates/Gadget Hub.fig` | Макет Figma |
| `docs/templates/Gadget Hub - pages.pdf` | Рендеры страниц |
| `docs/templates/Gadget Hub - UI kit.pdf` | UI kit |
| `docs/templates/Gadget Hub Assets.zip` | Архив ассетов |
| `client/public/images` | Картинки и иконки |
| `client/public/fonts` | Шрифт Rubik |
