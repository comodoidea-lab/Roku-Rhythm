import test from "node:test";
import assert from "node:assert/strict";
import { validateBirthDate } from "../src/lib/validation.js";

const today = new Date(2026, 6, 29);

test("valid birth date is normalized", () => {
  assert.deepEqual(validateBirthDate("1990", "1", "2", today), {
    valid: true,
    birthDate: "1990-01-02",
  });
});

test("missing and impossible dates are rejected", () => {
  assert.equal(validateBirthDate("", "1", "2", today).valid, false);
  assert.equal(validateBirthDate("2025", "2", "29", today).valid, false);
  assert.equal(validateBirthDate("2026", "13", "1", today).valid, false);
});

test("future dates are rejected", () => {
  const result = validateBirthDate("2026", "7", "30", today);

  assert.equal(result.valid, false);
  assert.equal(result.error, "未来の日付は入力できません");
});
