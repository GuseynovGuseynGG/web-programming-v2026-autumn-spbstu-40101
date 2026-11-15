export function findMostFrequent(arr) {
  const counts = {};

  for (const element of arr) {
    if (counts[element] === undefined) {
      counts[element] = 1;
    } else {
      counts[element]++;
    }
  }

  let mostFrequent = null;
  let maxCount = 0;

  for (const element of arr) {
    if (counts[element] > maxCount) {
      maxCount = counts[element];
      mostFrequent = element;
    }
  }

  return mostFrequent;
}
