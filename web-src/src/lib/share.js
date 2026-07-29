import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { format } from "date-fns";
import { getAssessment } from "./biorhythm.js";
import {
  createNativeReceiptFilename,
  createReceiptFilename,
} from "./receipt.js";
import {
  renderReceiptPng,
  renderReceiptPngBase64,
} from "./receiptImage.js";

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

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function withTimeout(promise, milliseconds, errorMessage) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(errorMessage));
    }, milliseconds);
  });

  return Promise.race([promise, timeout]).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

export function isCanceledShare(error) {
  return String(error?.message || error).toLowerCase().includes("canceled");
}

export function buildAndroidShareOptions({ result, text, uri }) {
  return {
    title: `Roku Rhythm｜${format(result.date, "M月d日")}の六曜とバイオリズム`,
    text,
    url: uri,
    dialogTitle: "結果を共有",
  };
}

export function isValidNativeReceiptFile({ uri, size }) {
  return uri.startsWith("file:") && size >= 10_000;
}

async function shareAndroidReceipt({
  result,
  text,
  beforeNativeShare,
}) {
  const { writeResult, fileInfo } = await withTimeout(
    (async () => {
      const base64 = await renderReceiptPngBase64(result);
      const filename = createNativeReceiptFilename(
        result.date,
        Date.now().toString(36),
      );
      const nextWriteResult = await Filesystem.writeFile({
        path: filename,
        directory: Directory.Cache,
        data: base64,
      });
      const nextFileInfo = await Filesystem.stat({
        path: filename,
        directory: Directory.Cache,
      });

      return {
        writeResult: nextWriteResult,
        fileInfo: nextFileInfo,
      };
    })(),
    12_000,
    "receipt-preparation-timeout",
  );

  if (
    !isValidNativeReceiptFile({
      uri: writeResult.uri,
      size: fileInfo.size,
    })
  ) {
    throw new Error("receipt-image-invalid");
  }

  await beforeNativeShare?.();

  const shareAttempt = Share.share(
    buildAndroidShareOptions({
      result,
      text,
      uri: writeResult.uri,
    }),
  ).then(
    () => ({ status: "completed" }),
    (error) => ({ status: "error", error }),
  );

  const immediateResult = await Promise.race([
    shareAttempt,
    wait(900).then(() => ({ status: "presented" })),
  ]);

  if (
    immediateResult.status === "error" &&
    !isCanceledShare(immediateResult.error)
  ) {
    throw immediateResult.error;
  }

  return "shared-image";
}

export async function shareResult(result, options = {}) {
  const text = buildShareText(result);
  const platform = Capacitor.getPlatform();

  if (platform === "android") {
    return shareAndroidReceipt({
      result,
      text,
      beforeNativeShare: options.beforeNativeShare,
    });
  }

  const image = await renderReceiptPng(result);
  const filename = createReceiptFilename(result.date);

  if (platform === "ios") {
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
