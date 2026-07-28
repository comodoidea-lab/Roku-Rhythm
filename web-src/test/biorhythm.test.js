import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateBiorhythm,
  getAssessment,
  getAssessmentColor,
} from "../src/lib/biorhythm.js";

test("birth date starts all three cycles at zero", () => {
  const birthDate = new Date("1990-01-01T00:00:00Z");
  const values = calculateBiorhythm(birthDate, birthDate);

  assert.equal(values.physical, 0);
  assert.equal(values.emotional, 0);
  assert.equal(values.intellectual, 0);
});

test("biorhythm cycles return to zero after their periods", () => {
  const birthDate = new Date("1990-01-01T00:00:00Z");

  assert.ok(
    Math.abs(
      calculateBiorhythm(
        birthDate,
        new Date("1990-01-24T00:00:00Z"),
      ).physical,
    ) < 1e-10,
  );
  assert.ok(
    Math.abs(
      calculateBiorhythm(
        birthDate,
        new Date("1990-01-29T00:00:00Z"),
      ).emotional,
    ) < 1e-10,
  );
  assert.ok(
    Math.abs(
      calculateBiorhythm(
        birthDate,
        new Date("1990-02-03T00:00:00Z"),
      ).intellectual,
    ) < 1e-10,
  );
});

test("assessment labels and colors preserve current boundaries", () => {
  assert.equal(getAssessment(80), "とても高い");
  assert.equal(getAssessment(10), "少し高め");
  assert.equal(getAssessment(-10), "安定");
  assert.equal(getAssessment(-81), "とても低い");
  assert.equal(getAssessmentColor(60), "#22c55e");
  assert.equal(getAssessmentColor(30), "#3b82f6");
  assert.equal(getAssessmentColor(-30), "#6b7280");
  assert.equal(getAssessmentColor(-31), "#ef4444");
});
