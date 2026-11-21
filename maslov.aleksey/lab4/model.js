export class Product {
  constructor(id, name, categories = [], price = 0) {
    this.id = Number(id);
    this.name = String(name);
    this.categories = Array.isArray(categories) ? [...categories] : [];
    this.price = Number(price);
  }

  addCategory(category) {
    const c = category.trim();
    if (c && !this.categories.includes(c)) {
      this.categories.push(c);
    }
  }

  removeCategory(category) {
    this.categories = this.categories.filter((c) => c !== category);
  }

  get categoryCount() {
    return this.categories.length;
  }
}

export function groupProductsByCategory(products) {
  const groups = {};
  for (const p of products) {
    for (const c of p.categories) {
      if (!groups[c]) {
        groups[c] = [];
      }
      groups[c].push(p);
    }
  }
  return groups;
}

export function getUniqueCategories(products) {
  return [...new Set(products.flatMap((p) => p.categories))].sort();
}

const PRICE_RANGES = [
  {label: '0-1000', min: 0, max: 1000},
  {label: '1000–5000', min: 1000, max: 5000},
  {label: '5000+', min: 5000, max: Infinity},
];

export function groupProductsByPriceRange(products, ranges = PRICE_RANGES) {
  const groups = {};
  for (const r of ranges) {
    groups[r.label] = products.filter(
      (p) => p.price >= r.min && p.price < r.max,
    );
  }
  return groups;
}

export function findProductsByCategory(products, category) {
  return products.filter((p) => p.categories.includes(category));
}

export function findProductsAbovePrice(products, price) {
  return products.filter((p) => p.price > price);
}
