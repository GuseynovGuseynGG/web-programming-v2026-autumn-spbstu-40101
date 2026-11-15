export function countVowels(str) {
  if (typeof str !== 'string') {
    return 0;
  }

  const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
  let count = 0;

  for (const char of str.toLowerCase()) {
    if (vowels.has(char)) {
      count++;
    }
  }

  return count;
}
