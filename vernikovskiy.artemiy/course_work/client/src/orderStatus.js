const DAY = 24 * 60 * 60 * 1000;

export const ORDER_STAGES = [
  { id: "received", label: "Поступил на обработку" },
  { id: "packing", label: "Собирается" },
  { id: "shipping", label: "В пути" },
  { id: "delivered", label: "Доставлено" },
];

export function shopLoad(orders, now = Date.now()) {
  const recent = (orders ?? []).filter((order) => now - new Date(order.date).getTime() < 17 * DAY);
  const volume = recent.reduce((sum, order) => sum + (order.itemCount || 1), 0);
  return Math.min(1, Math.max(0.08, recent.length / 8 * 0.55 + volume / 30 * 0.4));
}

function mixLoad(order, load) {
  const n = Number(String(order.number).replace(/\D/g, "")) || 1;
  const personal = (n % 97) / 96;
  return Math.min(1, Math.max(0, load * 0.6 + personal * 0.4));
}

export function orderTimeline(order, orders = [], now = Date.now()) {
  const load = mixLoad(order, shopLoad(orders, now));
  const created = new Date(order.date).getTime();
  const processingMs = Math.round(2000 + load * 5000);
  const packingMs = Math.round((0.35 + load * 2.65) * DAY);
  const shippingMs = Math.round((1.5 + load * 12.5) * DAY);
  const receivedUntil = created + processingMs;
  const packingUntil = receivedUntil + packingMs;
  const shippingUntil = packingUntil + shippingMs;
  return { load, processingMs, packingMs, shippingMs, created, receivedUntil, packingUntil, shippingUntil };
}

export function getOrderStatus(order, orders = [], now = Date.now()) {
  const timeline = orderTimeline(order, orders, now);
  let index = 3;
  if (now < timeline.receivedUntil) index = 0;
  else if (now < timeline.packingUntil) index = 1;
  else if (now < timeline.shippingUntil) index = 2;
  return {
    ...ORDER_STAGES[index],
    index,
    timeline,
    stages: ORDER_STAGES.map((stage, i) => ({ ...stage, done: i < index, current: i === index })),
  };
}
