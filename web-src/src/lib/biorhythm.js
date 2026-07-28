export function calculateBiorhythm(birthDate, targetDate) {
  const days = Math.floor(
    (targetDate.getTime() - birthDate.getTime()) / (24 * 60 * 60 * 1000),
  );

  return {
    physical: Math.sin((2 * Math.PI * days) / 23) * 100,
    emotional: Math.sin((2 * Math.PI * days) / 28) * 100,
    intellectual: Math.sin((2 * Math.PI * days) / 33) * 100,
  };
}

export function getAssessment(value) {
  if (value >= 80) return "極めて良い";
  if (value >= 60) return "非常に良い";
  if (value >= 30) return "やや良い";
  if (value >= 10) return "少し良い";
  if (value >= -10) return "普通";
  if (value >= -30) return "少し悪い";
  if (value >= -60) return "やや危険";
  if (value >= -80) return "非常に危険";
  return "極めて危険";
}

export function getAssessmentColor(value) {
  if (value >= 60) return "#22c55e";
  if (value >= 30) return "#3b82f6";
  if (value >= -30) return "#6b7280";
  return "#ef4444";
}
