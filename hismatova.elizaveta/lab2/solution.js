function hexToRgb(hexColor) {
  if (typeof hexColor !== 'string') {
    throw new Error('Hex color should be a string');
  }
  if (hexColor.length !== 7) {
    throw new RangeError('Hex color should contain 7 symbols');
  }
  if (hexColor[0] !== '#') {
    throw new Error('Hex color should start with #');
  }
  const red = parseInt(hexColor[1] + hexColor[2], 16);
  if (isNaN(red)) {
    throw new Error('Invalid red hex color');
  }
  const green = parseInt(hexColor[3] + hexColor[4], 16);
  if (isNaN(green)) {
    throw new Error('Invalid green hex color');
  }
  const blue = parseInt(hexColor[5] + hexColor[6], 16);
  if (isNaN(blue)) {
    throw new Error('Invalid blue hex color');
  }
  return `rgb(${red}, ${green}, ${blue})`;
}

export {hexToRgb};
