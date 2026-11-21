const formatter = new Intl.RelativeTimeFormat('ru', {numeric: 'always'});

export function timeAgo(date) {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours >= 24) {
    return formatter.format(-Math.floor(hours / 24), 'day');
  }
  if (hours >= 1) {
    return formatter.format(-hours, 'hour');
  }
  return formatter.format(-minutes, 'minute');
}
