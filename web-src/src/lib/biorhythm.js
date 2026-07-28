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
  if (value >= 80) return "とても高い";
  if (value >= 60) return "高い";
  if (value >= 30) return "やや高め";
  if (value >= 10) return "少し高め";
  if (value >= -10) return "安定";
  if (value >= -30) return "少し低め";
  if (value >= -60) return "やや低め";
  if (value >= -80) return "低い";
  return "とても低い";
}

export function getAssessmentColor(value) {
  if (value >= 60) return "#22c55e";
  if (value >= 30) return "#3b82f6";
  if (value >= -30) return "#6b7280";
  return "#ef4444";
}
