export function toJapanTime(date = new Date()) {
  const utcDate = new Date(
    date.getTime() + date.getTimezoneOffset() * 60 * 1000,
  );

  return new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
}

export function getRokuyo(date = new Date()) {
  return window.getRokuyoFromDate(toJapanTime(date));
}
