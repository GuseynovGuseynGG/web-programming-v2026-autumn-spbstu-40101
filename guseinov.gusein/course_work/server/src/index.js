import "./loadEnv.js";
import cors from "cors";
import express from "express";
import session from "express-session";
import { readJson, writeJson } from "./store.js";
import { withStatus } from "./orderStatus.js";
import { hashPassword, isHashedPassword, verifyPassword } from "./passwords.js";
import { loadSessionSecret } from "./secret.js";

const PORT = Number(process.env.PORT) || 8080;
const app = express();
app.disable("x-powered-by");

const allowedOrigins = String(process.env.CORS_ORIGIN || "http://localhost:3000,http://127.0.0.1:3000")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

function isRussianPhone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) return true;
  return digits.length === 10;
}

function isValidEmail(value) {
  const email = String(value ?? "").trim();
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

function sanitizeText(value, max) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .slice(0, max);
}

function notFound(_req, res) {
  res.status(404).json({ error: "Not found" });
}

async function migratePasswords() {
  const users = await readJson("users.json");
  let changed = false;
  for (const user of users) {
    if (!isHashedPassword(user.password)) {
      user.password = await hashPassword(user.password);
      changed = true;
    }
  }
  if (changed) await writeJson("users.json", users);
}

const sessionSecret = await loadSessionSecret();
await migratePasswords();
const dummyPasswordHash = await hashPassword("invalid");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use(
  session({
    name: "gadget.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 * 24 * 7 },
  }),
);

function requireUser(req, res, next) {
  if (!req.session.user) {
    res.status(401).json({ error: "Необходима авторизация" });
    return;
  }
  next();
}

const api = express.Router();

api.post("/register", async (req, res) => {
  const username = sanitizeText(req.body?.username, 32).trim();
  const password = String(req.body?.password ?? "");
  if (username.length < 3) {
    res.status(400).json({ error: "Логин должен содержать минимум 3 символа" });
    return;
  }
  if (password.length < 6 || password.length > 128) {
    res.status(400).json({ error: "Пароль должен содержать от 6 до 128 символов" });
    return;
  }
  const users = await readJson("users.json");
  if (users.some((item) => item.username.toLowerCase() === username.toLowerCase())) {
    res.status(409).json({ error: "Пользователь с таким логином уже есть" });
    return;
  }
  users.push({ username, password: await hashPassword(password) });
  await writeJson("users.json", users);
  req.session.user = { username };
  res.status(201).json({ user: req.session.user });
});

api.post("/login", async (req, res) => {
  const username = sanitizeText(req.body?.username, 32).trim();
  const password = String(req.body?.password ?? "");
  const users = await readJson("users.json");
  const user = users.find((item) => item.username.toLowerCase() === username.toLowerCase());
  const ok = await verifyPassword(password, user?.password ?? dummyPasswordHash);
  if (!user || !ok) {
    res.status(401).json({
      error: "такого пользователя нет, возможно неправильный логин или пароль - проверьте данные",
    });
    return;
  }
  if (!isHashedPassword(user.password)) {
    user.password = await hashPassword(password);
    await writeJson("users.json", users);
  }
  req.session.user = { username: user.username };
  res.json({ user: req.session.user });
});

api.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("gadget.sid");
    res.json({ ok: true });
  });
});

api.get("/me", (req, res) => {
  res.json({ user: req.session.user ?? null });
});

api.get("/goods", async (_req, res) => {
  const goods = await readJson("goods.json");
  res.json(goods);
});

api.get("/orders", requireUser, async (req, res) => {
  const orders = await readJson("orders.json");
  const mine = orders
    .filter((order) => order.username === req.session.user.username)
    .map((order) => withStatus(order, orders));
  res.json(mine);
});

api.post("/orders", requireUser, async (req, res) => {
  const { items, customer } = req.body ?? {};
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Корзина пуста" });
    return;
  }
  if (!customer?.phone) {
    res.status(400).json({ error: "Укажите телефон" });
    return;
  }
  if (!isRussianPhone(customer.phone)) {
    res.status(400).json({ error: "Введите российский номер телефона" });
    return;
  }
  if (!isValidEmail(customer.email)) {
    res.status(400).json({ error: "Введите корректный email" });
    return;
  }
  if (!customer?.payment) {
    res.status(400).json({ error: "Выберите способ оплаты" });
    return;
  }
  if (customer.delivery === "delivery" && !customer.address) {
    res.status(400).json({ error: "Укажите адрес доставки" });
    return;
  }

  const goods = await readJson("goods.json");
  const lines = items.map((line) => {
    const product = goods.find((item) => item.id === Number(line.id));
    if (!product) return null;
    const quantity = Math.max(1, Number(line.quantity) || 1);
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      total: product.price * quantity,
    };
  }).filter(Boolean);

  if (!lines.length) {
    res.status(400).json({ error: "Нет корректных товаров" });
    return;
  }

  const orders = await readJson("orders.json");
  const number = String(60000 + orders.length + Math.floor(Math.random() * 8000));
  const safeCustomer = {
    phone: sanitizeText(customer.phone, 32),
    email: sanitizeText(customer.email, 254).trim(),
    delivery: customer.delivery === "delivery" ? "delivery" : "pickup",
    address: sanitizeText(customer.address, 500),
    payment: customer.payment === "cash" ? "cash" : "card",
    wrap: Boolean(customer.wrap),
  };
  const order = {
    id: number,
    number,
    username: req.session.user.username,
    date: new Date().toISOString(),
    items: lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    total: lines.reduce((sum, line) => sum + line.total, 0),
    customer: safeCustomer,
  };
  orders.push(order);
  await writeJson("orders.json", orders);
  res.status(201).json(withStatus(order, orders));
});

api.delete("/orders/:number", requireUser, async (req, res) => {
  const reason = sanitizeText(req.body?.reason, 500).trim();
  if (reason.length < 3) {
    res.status(400).json({ error: "Укажите причину отмены (минимум 3 символа)" });
    return;
  }
  const number = sanitizeText(req.params.number, 32);
  const orders = await readJson("orders.json");
  const index = orders.findIndex(
    (order) => order.number === number && order.username === req.session.user.username,
  );
  if (index === -1) {
    res.status(404).json({ error: "Заказ не найден" });
    return;
  }
  orders.splice(index, 1);
  await writeJson("orders.json", orders);
  res.json({ ok: true });
});

api.use(notFound);

app.use("/api", api);
app.use(notFound);
app.use((err, _req, res, _next) => {
  res.status(500).json({ error: "Внутренняя ошибка" });
});

app.listen(PORT, "0.0.0.0");
