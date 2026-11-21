export function moveZerosToEnd(arr) {
  const nonZeros = arr.filter((value) => value !== 0);
  const zeros = arr.filter((value) => value === 0);
  return nonZeros.concat(zeros);
}
