export function isPerfectNumber(number) {
  if (number <= 1) {
    return false;
  }
  let sum = 0;
  for (let i = 1; i < number / 2 + 1; i++) {
    if (number % i === 0) {
      sum += i;
    }
  }
  return number === sum;
}
