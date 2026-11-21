export function findLongestPalindrome(str) {
  const chars = Array.from(str);

  if (chars.length === 0) {
    return '';
  }

  let bestStart = 0;
  let bestLength = 1;

  function expand(left, right) {
    while (left >= 0 && right < chars.length && chars[left] === chars[right]) {
      const currentLength = right - left + 1;

      if (currentLength > bestLength) {
        bestStart = left;
        bestLength = currentLength;
      }

      left -= 1;
      right += 1;
    }
  }

  for (let i = 0; i < chars.length; i += 1) {
    expand(i, i);
    expand(i, i + 1);
  }

  return chars.slice(bestStart, bestStart + bestLength).join('');
}
