import { Share } from "@capacitor/share";
import { format } from "date-fns";

export function buildShareText({ date, rokuyo, biorhythm }) {
  return [
    `Roku Rhythm｜${format(date, "M月d日")}`,
    `六曜: ${rokuyo}`,
    `身体: ${Math.round(biorhythm.physical)}%`,
    `感情: ${Math.round(biorhythm.emotional)}%`,
    `知性: ${Math.round(biorhythm.intellectual)}%`,
    "",
    "※六曜とバイオリズムを楽しむための娯楽情報です。",
  ].join("\n");
}

export async function shareResult(result) {
  const text = buildShareText(result);
  const { value: canShare } = await Share.canShare();

  if (canShare) {
    await Share.share({
      title: "Roku Rhythm",
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
