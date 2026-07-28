import test from "node:test";
import assert from "node:assert/strict";
import { buildShareText } from "../src/lib/share.js";

test("share text contains the selected date and rounded values", () => {
  const text = buildShareText({
    date: new Date(2026, 6, 29),
    rokuyo: "大安",
    biorhythm: {
      physical: 12.4,
      emotional: -5.6,
      intellectual: 88.8,
    },
  });

  assert.match(text, /7月29日/);
  assert.match(text, /六曜: 大安/);
  assert.match(text, /身体: 12%/);
  assert.match(text, /感情: -6%/);
  assert.match(text, /知性: 89%/);
  assert.match(text, /娯楽情報/);
});
