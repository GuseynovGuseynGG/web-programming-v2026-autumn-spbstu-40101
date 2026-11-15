export function shuffleArray(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('shuffleArray: аргумент должен быть массивом');
  }

  const result = [...arr];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
