export function validateBirthDate(year, month, day, now = new Date()) {
  if (!year || !month || !day) {
    return {
      valid: false,
      error: "生年月日を入力してください",
    };
  }

  const normalizedYear = year.padStart(4, "0");
  const normalizedMonth = month.padStart(2, "0");
  const normalizedDay = day.padStart(2, "0");
  const birthDate = `${normalizedYear}-${normalizedMonth}-${normalizedDay}`;
  const parsedDate = new Date(`${birthDate}T00:00:00`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getFullYear() !== Number(year) ||
    parsedDate.getMonth() + 1 !== Number(month) ||
    parsedDate.getDate() !== Number(day)
  ) {
    return {
      valid: false,
      error: "正しい日付を入力してください",
    };
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (parsedDate > today) {
    return {
      valid: false,
      error: "未来の日付は入力できません",
    };
  }

  return {
    valid: true,
    birthDate,
  };
}
