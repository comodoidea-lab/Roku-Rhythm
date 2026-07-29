import { Share } from "@capacitor/share";
import { format } from "date-fns";
import { getAssessment } from "./biorhythm.js";

function formatBiorhythmLine(label, value) {
  const rounded = Math.round(value);
  const signedValue = rounded > 0 ? `+${rounded}` : `${rounded}`;

  return `${label}　${signedValue}%（${getAssessment(value)}）`;
}

export function buildShareText({ date, rokuyo, comment, biorhythm }) {
  return [
    `🌙 Roku Rhythm｜${format(date, "M月d日")}のリズム`,
    `六曜：${rokuyo}`,
    ...(comment ? [`「${comment}」`] : []),
    "",
    "📈 バイオリズム",
    formatBiorhythmLine("身体", biorhythm.physical),
    formatBiorhythmLine("感情", biorhythm.emotional),
    formatBiorhythmLine("知性", biorhythm.intellectual),
    "",
    "#RokuRhythm #六曜 #バイオリズム",
    "",
    "※六曜とバイオリズムを楽しむための娯楽情報です。",
  ].join("\n");
}

export async function shareResult(result) {
  const text = buildShareText(result);
  const { value: canShare } = await Share.canShare();

  if (canShare) {
    await Share.share({
      title: `Roku Rhythm｜${format(result.date, "M月d日")}の六曜とバイオリズム`,
      text,
      dialogTitle: "結果を共有",
    });
    return "shared";
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return "copied";
  }

  throw new Error("sharing-unavailable");
}
