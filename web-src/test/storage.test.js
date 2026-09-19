import test from "node:test";
import assert from "node:assert/strict";
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

test("chart tooltip setting persists across launches and defaults to on", () => {
  const values = {};
  globalThis.localStorage = createStorage(values);

  saveSettings({ darkMode: false, showDetailedStats: true, showChartTooltip: false });
  assert.equal(loadSettings().showChartTooltip, false);

  saveSettings({ darkMode: false, showDetailedStats: true, showChartTooltip: true });
  assert.equal(loadSettings().showChartTooltip, true);

  // Settings saved before this option existed must keep the tooltip on;
  // App.jsx treats anything other than false as on.
  values["fortune-settings"] = JSON.stringify({ darkMode: true, showDetailedStats: true });
  assert.notEqual(loadSettings().showChartTooltip, false);
});
