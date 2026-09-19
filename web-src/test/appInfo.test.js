import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FALLBACK_APP_VERSION, formatAppVersion } from "../src/lib/appInfo.js";

test("app version label shows the native version and build", () => {
  assert.equal(formatAppVersion({ version: "1.1.0", build: "13" }), "1.1.0 (13)");
  assert.equal(formatAppVersion({ version: "1.1.0", build: "" }), "1.1.0");
});

test("app version falls back when native info is unavailable", () => {
  assert.equal(FALLBACK_APP_VERSION, "1.1.0");
  assert.equal(formatAppVersion(undefined), FALLBACK_APP_VERSION);
  assert.equal(formatAppVersion({ version: "" }), FALLBACK_APP_VERSION);
});

test("fallback version matches the iOS project MARKETING_VERSION", () => {
  const project = readFileSync(
    new URL("../ios/App/App.xcodeproj/project.pbxproj", import.meta.url),
    "utf8",
  );
  const versions = new Set(
    [...project.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map((m) => m[1]),
  );
  assert.deepEqual([...versions], [FALLBACK_APP_VERSION]);
});
