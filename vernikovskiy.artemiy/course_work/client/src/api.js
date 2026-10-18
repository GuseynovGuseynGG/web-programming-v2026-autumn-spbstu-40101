function apiUrl(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized.startsWith("/api/") || normalized === "/api" ? normalized : `/api${normalized}`;
}

export async function api(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Ошибка запроса");
    error.status = response.status;
    throw error;
  }
  return data;
}

export function formatPrice(value) {
  return `${Number(value).toLocaleString("ru-RU")} ₽`;
}

export function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function formatDate(iso) {
  const date = new Date(iso);
  return date.toLocaleDateString("ru-RU");
}

export function isRussianPhone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    return true;
  }
  return digits.length === 10;
}

export function isValidEmail(value) {
  const email = String(value ?? "").trim();
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}
