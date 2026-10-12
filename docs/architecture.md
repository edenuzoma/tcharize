# Architecture

## Shape

Tcharize is a monorepo with three independently deployable applications. The API is a modular monolith: one process and one database, with strict domain modules. This keeps the first release simple without turning the code into one large, tangled module.

```text
Web app ─────────────┐
Browser extension ──┼── HTTPS ── NestJS API ── PostgreSQL
Future SDK / CLI ───┘                 │
                                      ├── Redis queues + rate limits
                                      ├── N-ATLAS text + ASR
                                      ├── voice synthesis provider
                                      ├── Brevo OTP
                                      ├── Paystack
                                      └── Algolia
```

## API modules

- `auth`: passwordless email OTP, sessions, roles, and organization membership.
- `organizations`: teams, invitations, and permissions.
- `projects`: source apps, environments, API keys, and integrations.
- `localization`: engines, jobs, content segments, glossaries, translation memory, rules, and brand voice.
- `quality`: automated scores, explanations, reviewer assignments, and approvals.
- `speech`: N-ATLAS ASR, text-to-speech jobs, and audio metadata.
- `billing`: plans, usage, Paystack checkout, and webhook handling.
- `integrations`: Git providers, CMS connections, webhooks, and future CLI/SDK access.
- `health`: readiness and liveness checks.

Each module owns its controllers, application services, and persistence adapter. Modules may call another module through an exported service or an application event, never by reaching into another module's internals.

## Translation flow

1. The client sends source text, a source language, and one or more target languages.
2. The API creates a translation job and splits content into safe segments.
3. The localization engine adds the project's glossary, rules, voice, and translation-memory context.
4. The N-ATLAS adapter performs supported Nigerian-language work. Provider adapters can be added for languages outside its scope.
5. The quality module scores the result and explains likely problems in plain language.
6. Approved results enter translation memory and return to the source system.

The browser extension never receives provider secrets. It sends page segments to the API using a short-lived user session. Dynamic DOM changes are observed and translated in batches. Password inputs, hidden text, code blocks, and user-marked private regions are excluded.

## Language identifiers

- English: `en`
- Hausa: `ha`
- Igbo: `ig`
- Yoruba: `yo`
- Nigerian Pidgin: `pcm`

Keep BCP 47 language tags at every boundary. Store display names separately so the platform can add African languages without changing database structure.

The official N-ATLaS text-model card currently names English, Hausa, Igbo, and Yoruba. Tcharize still treats Nigerian Pidgin as a core product language, but its provider must be separately selected and evaluated rather than mislabelled as official N-ATLaS coverage.

## Deployment

- Web: Cloudflare Workers through the Next.js OpenNext adapter.
- API: a Node.js container on a provider that supports long-running processes and background workers; Cloudflare can proxy and protect it.
- Extension: Chrome Web Store first, then Firefox Add-ons.
- Database: managed PostgreSQL with backups and connection pooling.
- Jobs and short-lived state: Redis-backed queues, rate limits, and cache. PostgreSQL remains the durable source of truth.

## Security rules

- Hash OTPs, API keys, and refresh tokens at rest.
- Give OTPs a short expiry and a strict attempt/rate limit.
- Verify Paystack webhooks before changing subscriptions.
- Keep model, email, payment, and search admin keys server-side.
- Store only necessary page text and make retention visible to users.
- Log access and translation decisions without logging secrets or private page content.

