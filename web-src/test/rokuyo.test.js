import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

test("existing lunar script exposes the current rokuyo APIs", async () => {
  const source = await readFile(
    new URL("../public/lunar-rokuyo.js", import.meta.url),
    "utf8",
  );
  const context = { window: {} };

  vm.runInNewContext(source, context);

  assert.equal(typeof context.window.getRokuyoFromDate, "function");
  assert.equal(typeof context.window.getRokuyoComment, "function");
  assert.equal(
    context.window.getRokuyoFromDate(new Date(2026, 6, 28)),
    "友引",
  );
});
