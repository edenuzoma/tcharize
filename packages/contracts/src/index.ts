import { z } from "zod";

export const languages = [
  { code: "en", name: "English", localName: "English", available: true },
  { code: "ha", name: "Hausa", localName: "Hausa", available: true },
  { code: "ig", name: "Igbo", localName: "Igbo", available: true },
  { code: "yo", name: "Yoruba", localName: "Yorùbá", available: true },
  { code: "pcm", name: "Nigerian Pidgin", localName: "Naijá", available: true },
] as const;

export const languageCodeSchema = z.enum(["en", "ha", "ig", "yo", "pcm"]);
export type LanguageCode = z.infer<typeof languageCodeSchema>;

export const translateRequestSchema = z
  .object({
    text: z.string().trim().min(1).max(20_000),
    sourceLanguage: languageCodeSchema,
    targetLanguage: languageCodeSchema,
    explain: z.boolean().default(true),
    projectId: z.string().optional(),
  })
  .refine((value) => value.sourceLanguage !== value.targetLanguage, {
    message: "Pick two different languages.",
    path: ["targetLanguage"],
  });

export type TranslateRequest = z.infer<typeof translateRequestSchema>;

export const translateResponseSchema = z.object({
  translation: z.string(),
  explanation: z.string().optional(),
  provider: z.string(),
  model: z.string(),
});

export type TranslateResponse = z.infer<typeof translateResponseSchema>;

export const speechRequestSchema = z.object({
  text: z.string().trim().min(1).max(5_000),
  language: languageCodeSchema.exclude(["en"]),
});

export type SpeechRequest = z.infer<typeof speechRequestSchema>;

// Authentication schemas
export const requestOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address."),
  displayName: z.string().trim().min(1).max(100).optional(),
});
export type RequestOtpInput = z.infer<typeof requestOtpSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address."),
  code: z.string().trim().length(6, "The verification code must be 6 digits."),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const passwordLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
export type PasswordLoginInput = z.infer<typeof passwordLoginSchema>;

export const passwordSignupSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  displayName: z.string().trim().min(1, "Please provide your name.").max(100),
  organizationName: z.string().trim().min(1).max(100).optional(),
  accountType: z.enum(["individual", "team"]).default("individual"),
});
export type PasswordSignupInput = z.infer<typeof passwordSignupSchema>;

export const verifySignupSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address."),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code."),
});
export type VerifySignupInput = z.infer<typeof verifySignupSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address."),
  code: z.string().trim().length(6, "The verification code must be 6 digits."),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const authResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    displayName: z.string().nullable().optional(),
  }),
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

// Batch translation schemas
export const batchTranslateRequestSchema = z.object({
  texts: z.array(z.string().trim().min(1)).min(1).max(100),
  sourceLanguage: languageCodeSchema,
  targetLanguage: languageCodeSchema,
  explain: z.boolean().default(false),
  projectId: z.string().optional(),
});
export type BatchTranslateRequest = z.infer<typeof batchTranslateRequestSchema>;

export const batchTranslateResponseSchema = z.object({
  translations: z.array(translateResponseSchema),
  totalChanged: z.number(),
  targetLanguage: languageCodeSchema,
});
export type BatchTranslateResponse = z.infer<typeof batchTranslateResponseSchema>;

// Glossary entry schemas
export const glossaryEntrySchema = z.object({
  id: z.string().optional(),
  projectId: z.string(),
  sourceLanguage: languageCodeSchema,
  targetLanguage: languageCodeSchema,
  sourceTerm: z.string().trim().min(1).max(200),
  targetTerm: z.string().trim().min(1).max(200),
  notes: z.string().max(500).optional(),
});
export type GlossaryEntryInput = z.infer<typeof glossaryEntrySchema>;

// Billing, Subscriptions & Plans
export const planTierSchema = z.enum(["FREE", "BUILDER", "TEAM"]);
export type PlanTier = z.infer<typeof planTierSchema>;

export const PLANS = {
  FREE: {
    id: "FREE" as const,
    name: "Free",
    priceKobo: 0,
    priceNaira: 0,
    wordLimit: 10_000,
    features: [
      "10,000 words per month",
      "Hausa, Igbo, Yoruba & Pidgin",
      "Community support",
      "Web translation playground",
    ],
  },
  BUILDER: {
    id: "BUILDER" as const,
    name: "Builder",
    priceKobo: 1_500_000, // ₦15,000 in kobo
    priceNaira: 15_000,
    wordLimit: 100_000,
    features: [
      "100,000 words per month",
      "All 5 languages & N-ATLaS models",
      "API access & developer SDK",
      "Unlimited glossary terms",
      "Standard email support",
    ],
  },
  TEAM: {
    id: "TEAM" as const,
    name: "Team",
    priceKobo: 6_000_000, // ₦60,000 in kobo
    priceNaira: 60_000,
    wordLimit: 500_000,
    features: [
      "500,000 words per month",
      "Priority inference queue",
      "Multi-user team workspaces",
      "Custom brand voice & glossaries",
      "Dedicated Slack/WhatsApp support",
    ],
  },
} as const;

export const initializePaymentSchema = z.object({
  plan: planTierSchema,
  organizationId: z.string(),
  callbackUrl: z.string().url().optional(),
});
export type InitializePaymentInput = z.infer<typeof initializePaymentSchema>;

export const apiKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  prefix: z.string(),
  lastUsedAt: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type ApiKeyDto = z.infer<typeof apiKeySchema>;

