import { addDays, format } from "date-fns";
import { calculateBiorhythm, getAssessment } from "./biorhythm.js";

export const receiptMetrics = [
  {
    key: "physical",
    label: "BODY",
    japaneseLabel: "身体",
    color: "#dc554f",
  },
  {
    key: "emotional",
    label: "EMOTION",
    japaneseLabel: "感情",
    color: "#2f9f95",
  },
  {
    key: "intellectual",
    label: "MIND",
    japaneseLabel: "知性",
    color: "#168ab2",
  },
];

export function formatSignedPercent(value) {
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

export function buildReceiptWaveData({ birthDate, date, days = 15 }) {
  return Array.from({ length: days }, (_, index) => {
    const targetDate = addDays(date, index - (days - 1));
    const values = calculateBiorhythm(birthDate, targetDate);

    return {
      index,
      date: targetDate,
      current: index === days - 1,
      physical: Math.round(values.physical),
      emotional: Math.round(values.emotional),
      intellectual: Math.round(values.intellectual),
    };
  });
}

export function buildReceiptModel({
  date,
  birthDate,
  rokuyo,
  comment,
  biorhythm,
}) {
  return {
    date,
    formattedDate: format(date, "yyyy / MM / dd"),
    filenameDate: format(date, "yyyy-MM-dd"),
    rokuyo,
    comment,
    biorhythm,
    metrics: receiptMetrics.map((metric) => ({
      ...metric,
      value: biorhythm[metric.key],
      formattedValue: formatSignedPercent(biorhythm[metric.key]),
      assessment: getAssessment(biorhythm[metric.key]),
    })),
    waves: buildReceiptWaveData({ birthDate, date }),
  };
}

export function createReceiptFilename(date) {
  return `roku-rhythm-${format(date, "yyyy-MM-dd")}.png`;
}
