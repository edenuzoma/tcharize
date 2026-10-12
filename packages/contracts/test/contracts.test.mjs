import { test } from "node:test";
import assert from "node:assert/strict";
import {
  translateRequestSchema,
  requestOtpSchema,
  verifyOtpSchema,
  batchTranslateRequestSchema,
  languages,
} from "../dist/index.cjs";

test("languages metadata contains 5 supported languages", () => {
  assert.equal(languages.length, 5);
  const codes = languages.map((l) => l.code);
  assert.deepEqual(codes, ["en", "ha", "ig", "yo", "pcm"]);
});

test("translateRequestSchema validates source and target languages", () => {
  const valid = translateRequestSchema.safeParse({
    text: "Good morning",
    sourceLanguage: "en",
    targetLanguage: "yo",
    explain: true,
  });
  assert.equal(valid.success, true);

  const sameLanguage = translateRequestSchema.safeParse({
    text: "Good morning",
    sourceLanguage: "en",
    targetLanguage: "en",
  });
  assert.equal(sameLanguage.success, false);
});

test("requestOtpSchema validates emails properly", () => {
  const valid = requestOtpSchema.safeParse({ email: "user@tcharize.com" });
  assert.equal(valid.success, true);

  const invalid = requestOtpSchema.safeParse({ email: "not-an-email" });
  assert.equal(invalid.success, false);
});

test("verifyOtpSchema requires exactly 6 digits", () => {
  const valid = verifyOtpSchema.safeParse({ email: "user@tcharize.com", code: "123456" });
  assert.equal(valid.success, true);

  const invalid = verifyOtpSchema.safeParse({ email: "user@tcharize.com", code: "12" });
  assert.equal(invalid.success, false);
});

test("batchTranslateRequestSchema validates batch of texts", () => {
  const valid = batchTranslateRequestSchema.safeParse({
    texts: ["Hello", "How are you?"],
    sourceLanguage: "en",
    targetLanguage: "ig",
  });
  assert.equal(valid.success, true);
});
