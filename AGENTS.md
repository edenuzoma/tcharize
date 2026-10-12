# Tcharize engineering guide

## Product mission

Tcharize is Nigeria's localization engineering and translation frontier AI. It helps people translate and understand websites, apps, documents, and product content in English, Hausa, Igbo, Yoruba, and Nigerian Pidgin, with a path to more African languages.

Write every user-facing sentence so a five-year-old can understand it: short words, short sentences, one clear action, and a helpful next step. Never make the interface feel childish or patronizing.

## Non-negotiable experience rules

- Preserve the established clean, playful, gamified visual language: lime `#9eff1f`, purple `#801fff`, generous rounded cards, tactile shadows, friendly motion, and strong whitespace.
- Bree Serif is the display face; Lora/serif is the reading face.
- Every new screen must work in system, light, and dark modes. Use semantic theme tokens instead of hard-coded white/black surfaces.
- Keep the theme control in the header and respect the operating-system preference by default.
- Use the supplied Tcharize brand assets. Do not redraw, stretch, recolor, or crop the mark.
- Meet WCAG AA contrast, support keyboard use, keep visible focus states, label icon buttons, and respect reduced-motion preferences.
- Mobile is a first-class target. Test the smallest supported layout before declaring a page complete.

## Repository and architecture

This is a pnpm/Turborepo monorepo:

- `apps/web`: Next.js App Router website, auth, dashboard, docs, blog, and product UI.
- `apps/api`: NestJS modular monolith. It is one deployable service with strict domain boundaries.
- `apps/extension`: WXT/React Manifest V3 browser extension.
- `packages/contracts`: shared Zod schemas, DTOs, events, and language metadata.
- `packages/database`: Prisma client and PostgreSQL schema.
- `packages/ui`: shared shadcn-style primitives and brand components.
- `infrastructure`: local Docker services and deployment configuration.
- `docs`: architecture, decisions, runbooks, validation evidence, and roadmap.

Backend modules own their controllers, application services, and persistence. A module must not reach into another module's internals. Communicate through exported application services or domain events.

Keep the web, API, and extension independently deployable. Never put a server secret or provider credential in the web or extension bundle.

## Supported languages

Use BCP 47 tags at boundaries:

- English: `en`
- Hausa: `ha`
- Igbo: `ig`
- Yoruba: `yo`
- Nigerian Pidgin: `pcm`

The product supports all five above. The official `NCAIR1/N-ATLaS` model card currently lists English, Hausa, Igbo, and Yoruba. Do not claim official Pidgin coverage without a measured provider/evaluation. Route Pidgin through a separately validated adapter or clearly label best-effort behavior.

## Localization engine principles

- Treat translation as a job with source, target, status, usage, provider, model, and traceable quality data.
- Apply glossary terms, do-not-translate rules, brand voice, translation memory, and locale-specific rules before model inference.
- Store model access behind provider interfaces. Controllers must never call Hugging Face or N-ATLaS directly.
- Support synchronous requests for small work and queued jobs for documents, websites, and multi-language work.
- Provide plain-language quality explanations. Automated scores assist native reviewers; they do not replace them.
- Human approval is required when a project or score threshold demands it.
- Preserve source formatting and placeholders. Never translate secrets, code, URLs, or interpolation keys.

## Browser extension safety

- The extension sends text only to the Tcharize API. It never receives model or infrastructure secrets.
- Skip passwords, inputs, editable regions, scripts, styles, code, hidden content, and `[data-tcharize-ignore]` regions.
- Batch and deduplicate DOM text. Preserve originals and always provide a restore action.
- Ask for the smallest browser permissions possible. Explain page-text handling and retention in plain language.
- Dynamic-page support must avoid infinite MutationObserver loops.

## Data, auth, billing, and infrastructure

- PostgreSQL is the source of truth. Redis is for queues, rate limits, short-lived caches, and ephemeral coordination—not durable business records.
- Hash OTPs, refresh tokens, and API keys. OTPs need expiry, attempt limits, resend limits, and per-IP/per-email throttles.
- Brevo handles email OTP delivery. Never log OTPs or provider responses containing secrets.
- Verify Paystack webhook signatures and make webhook processing idempotent before changing billing state.
- Store money as integer kobo and display pricing in naira.
- Use Algolia search-only keys in the client. Admin keys stay server-side.
- Add structured logs, request IDs, audit events, health/readiness checks, metrics, and error reporting to production paths.

## Environment and secrets

- Local secrets live in the root `.env.local`, which is ignored by Git.
- Keep `.env.example` current with blank placeholders and safe local defaults.
- Never print, commit, copy into docs, or expose secret values in tests, screenshots, logs, client bundles, or chat.
- `NATLAS_BASE_URL` must be a callable inference endpoint (self-hosted vLLM/TGI or a dedicated endpoint), not a Hugging Face organization or model webpage.
- `HUGGINGFACE_TOKEN` is for gated model download/deployment. `NATLAS_API_KEY` authenticates the configured inference endpoint and may be the same token only when that endpoint uses Hugging Face authentication.
- Fail fast on missing required production configuration. Development-only fallbacks must be clearly labeled.

## Code standards

- TypeScript strict mode stays enabled. Avoid `any`; validate external input with Zod or Nest pipes.
- Prefer server components. Add `"use client"` only at an interactive boundary.
- Reuse `@tcharize/ui` primitives and semantic design tokens before creating local one-off styles.
- Keep functions small, names explicit, and errors useful to users and operators.
- Add tests with every meaningful behavior: unit tests for domain logic, integration tests for modules/providers, and end-to-end tests for critical user journeys.
- Database changes require a Prisma migration. External events and webhooks require idempotency tests.

## Required verification

Before handing off a change, run the checks proportional to its scope. For cross-project changes run all of them:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Also verify the affected UI in light and dark modes, mobile and desktop, and test API health plus one real success and failure path. Do not claim N-ATLaS integration is live until a non-demo request reaches a callable endpoint and its response is recorded.

## Delivery order

Prioritize a trustworthy vertical slice over many disconnected pages:

1. Environment validation, database, Redis, observability, and CI.
2. OTP authentication, organizations, roles, projects, and API keys.
3. Translation jobs, provider routing, glossary, memory, rules, brand voice, and quality review.
4. Dashboard and playground backed by persisted jobs and usage.
5. Browser extension page translation, restore, voice, privacy, and rate limits.
6. Paystack billing, developer API/SDK/CLI, integrations, docs/search, marketing pages, and review workflows.

Use the referenced Watermelon/shadcn blocks as starting layouts, then re-theme and simplify them for Tcharize. Do not paste registry output blindly or let a block dictate domain boundaries.

