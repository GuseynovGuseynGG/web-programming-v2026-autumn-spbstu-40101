function calculate(a, operator, b) {
  switch (operator) {
    case '+':
      return a + b;

    case '-':
      return a - b;

    case '*':
      return a * b;

    case '/':
      if (b === 0) {
        throw new Error('Деление на ноль');
      }
      return a / b;

    default:
      throw new Error('Неизвестный оператор');
  }
}

export function calculateExpression(expr) {
  if (typeof expr !== 'string' || expr.trim() === '') {
    throw new Error('Выражение не должно быть пустым');
  }

  const parts = expr.match(/\d+(?:\.\d+)?|[+\-*/]/g);

  const numbers = parts.map((part) => {
    if (part === '+' || part === '-' || part === '*' || part === '/') {
      return part;
    }

    return Number(part);
  });

  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] === '*' || numbers[i] === '/') {
      const result = calculate(numbers[i - 1], numbers[i], numbers[i + 1]);

      numbers.splice(i - 1, 3, result);
      i--;
    }
  }

  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] === '+' || numbers[i] === '-') {
      const result = calculate(numbers[i - 1], numbers[i], numbers[i + 1]);

      numbers.splice(i - 1, 3, result);
      i--;
    }
  }

  return numbers[0];
}
