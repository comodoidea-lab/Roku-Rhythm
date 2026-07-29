import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { format } from "date-fns";
import { getAssessment } from "./biorhythm.js";
import { createReceiptFilename } from "./receipt.js";
import { renderReceiptPng } from "./receiptImage.js";

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

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const encoded = String(reader.result).split(",")[1];
      if (encoded) resolve(encoded);
      else reject(new Error("image-encoding-failed"));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareResult(result) {
  const text = buildShareText(result);
  const image = await renderReceiptPng(result);
  const filename = createReceiptFilename(result.date);

  if (Capacitor.isNativePlatform()) {
    const base64 = await blobToBase64(image);
    await Filesystem.writeFile({
      path: filename,
      directory: Directory.Cache,
      data: base64,
    });
    const { uri } = await Filesystem.getUri({
      path: filename,
      directory: Directory.Cache,
    });

    await Share.share({
      title: `Roku Rhythm｜${format(result.date, "M月d日")}の六曜とバイオリズム`,
      text,
      files: [uri],
      dialogTitle: "結果を共有",
    });
    return "shared-image";
  }

  const file = new File([image], filename, { type: "image/png" });
  const canShareFile =
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] });

  if (canShareFile) {
    await navigator.share({
      title: `Roku Rhythm｜${format(result.date, "M月d日")}の六曜とバイオリズム`,
      text,
      files: [file],
    });
    return "shared-image";
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  }

  downloadBlob(image, filename);
  return "downloaded";
}
