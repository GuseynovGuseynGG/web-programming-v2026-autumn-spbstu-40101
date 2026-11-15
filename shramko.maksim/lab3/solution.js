export function difference(arr1, arr2) {
  const excluded = new Set(arr2);

  return arr1.filter((item) => !excluded.has(item));
}
