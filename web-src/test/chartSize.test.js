import test from "node:test";
import assert from "node:assert/strict";
import {
  CHART_SIZES,
  DEFAULT_CHART_SIZE,
  normalizeChartSize,
} from "../src/lib/chartSize.js";
import { loadSettings, saveSettings } from "../src/lib/storage.js";

function createStorage(values) {
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null;
    },
    removeItem(key) {
      delete values[key];
    },
    setItem(key, value) {
      values[key] = value;
    },
  };
}

test("chart size options are small, medium, and large with medium as default", () => {
  assert.deepEqual(
    CHART_SIZES.map(({ value, label }) => [value, label]),
    [
      ["small", "小"],
      ["medium", "中"],
      ["large", "大"],
    ],
  );
  assert.equal(DEFAULT_CHART_SIZE, "medium");
});

test("missing or unknown chart sizes fall back to medium", () => {
  assert.equal(normalizeChartSize(undefined), "medium");
  assert.equal(normalizeChartSize(null), "medium");
  assert.equal(normalizeChartSize("huge"), "medium");
  assert.equal(normalizeChartSize("small"), "small");
  assert.equal(normalizeChartSize("large"), "large");
});

test("chart size persists across launches and old settings become medium", () => {
  const values = {};
  globalThis.localStorage = createStorage(values);

  for (const size of ["small", "medium", "large"]) {
    saveSettings({
      darkMode: false,
      showDetailedStats: true,
      showChartTooltip: true,
      chartSize: size,
    });
    assert.equal(normalizeChartSize(loadSettings().chartSize), size);
  }

  // Settings saved by 1.0.1 have no chartSize.
  values["fortune-settings"] = JSON.stringify({
    darkMode: true,
    showDetailedStats: true,
  });
  assert.equal(normalizeChartSize(loadSettings().chartSize), "medium");
});
