export function reverseWords(str) {
  return str.replace(/\S+/g, (word) => [...word].reverse().join(''));
}
