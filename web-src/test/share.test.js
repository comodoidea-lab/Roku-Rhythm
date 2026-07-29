import test from "node:test";
import assert from "node:assert/strict";
import { buildShareText } from "../src/lib/share.js";

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
