import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAndroidShareOptions,
  buildShareText,
  isCanceledShare,
  isValidNativeReceiptFile,
} from "../src/lib/share.js";
import {
  buildReceiptWaveData,
  createNativeReceiptFilename,
  createReceiptFilename,
  formatSignedPercent,
} from "../src/lib/receipt.js";

test("share text contains the date, advice, assessments, and rounded values", () => {
  const text = buildShareText({
    date: new Date(2026, 6, 29),
    rokuyo: "大安",
    comment: "良い流れの大安。新しい一歩に追い風。",
    biorhythm: {
      physical: 12.4,
      emotional: -5.6,
      intellectual: 88.8,
    },
  });

  assert.match(text, /7月29日/);
  assert.match(text, /六曜：大安/);
  assert.match(text, /良い流れの大安。新しい一歩に追い風。/);
  assert.match(text, /身体　\+12%（少し高め）/);
  assert.match(text, /感情　-6%（安定）/);
  assert.match(text, /知性　\+89%（とても高い）/);
  assert.match(text, /#RokuRhythm #六曜 #バイオリズム/);
  assert.match(text, /娯楽情報/);
});

test("receipt helpers format signed values and a stable PNG filename", () => {
  assert.equal(formatSignedPercent(22.4), "+22%");
  assert.equal(formatSignedPercent(-45.6), "-46%");
  assert.equal(formatSignedPercent(0), "0%");
  assert.equal(
    createReceiptFilename(new Date(2026, 6, 29)),
    "roku-rhythm-2026-07-29.png",
  );
  assert.equal(
    createNativeReceiptFilename(new Date(2026, 6, 29), "android-test"),
    "roku-rhythm-2026-07-29-android-test.png",
  );
});

test("receipt wave data ends on the selected date and uses real biorhythm values", () => {
  const date = new Date(2026, 6, 29);
  const waves = buildReceiptWaveData({
    birthDate: new Date(1975, 0, 9),
    date,
  });

  assert.equal(waves.length, 15);
  assert.equal(waves.filter((entry) => entry.current).length, 1);
  assert.equal(waves[14].current, true);
  assert.equal(waves[14].date.getTime(), date.getTime());
  assert.equal(typeof waves[14].physical, "number");
  assert.equal(typeof waves[14].emotional, "number");
  assert.equal(typeof waves[14].intellectual, "number");
});

test("Android shares one verified cache image as a URL", () => {
  const options = buildAndroidShareOptions({
    result: { date: new Date(2026, 6, 29) },
    text: "share text",
    uri: "file:///cache/roku-rhythm-android-test.png",
  });

  assert.equal(options.url, "file:///cache/roku-rhythm-android-test.png");
  assert.equal(options.text, "share text");
  assert.equal("files" in options, false);
  assert.equal(
    isValidNativeReceiptFile({
      uri: options.url,
      size: 32_000,
    }),
    true,
  );
  assert.equal(
    isValidNativeReceiptFile({
      uri: options.url,
      size: 500,
    }),
    false,
  );
  assert.equal(isCanceledShare(new Error("Share canceled")), true);
});
