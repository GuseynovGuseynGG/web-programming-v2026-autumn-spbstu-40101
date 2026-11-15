export function intersection(arr1, arr2) {
  const arr3 = [];
  for (const elem1 of arr1) {
    for (const elem2 of arr2) {
      if (elem1 === elem2) {
        arr3.push(elem1);
        break;
      }
    }
  }
  return arr3;
}
