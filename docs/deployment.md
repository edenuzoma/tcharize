# Production deployment

## Services

- Deploy `apps/web` as the public Next.js application.
- Deploy `apps/api` as one NestJS service.
- Use managed PostgreSQL as the source of truth.
- Use managed Redis for rate limits, queues, and short-lived state.
- Deploy `infrastructure/modal/inference_app.py` to Modal for N-ATLaS inference.

## Secrets

Copy only the names from `.env.example` into the hosting provider. Keep values in its secret store. Rotate any token that has appeared in a terminal command, screenshot, or chat before launch.

`NATLAS_BASE_URL` and `TTS_BASE_URL` must point to callable HTTPS services. They must not point to a Hugging Face web page. Keep `HUGGINGFACE_TOKEN`, `NATLAS_API_KEY`, Brevo, Paystack, database, and Redis credentials out of web and extension bundles.

## Release gate

1. Apply Prisma migrations to a backed-up database.
2. Run lint, type checking, tests, and the production build.
3. Check `/api/v1/health` and `/api/v1/health/ready`.
4. Test one successful and one failed login, OTP signup, translation, speech request, and payment webhook.
5. Check mobile and desktop in system, light, and dark modes.
6. Confirm request IDs, structured logs, error reporting, database backups, and alerts in the chosen hosts.

## Speech license gate

The current Meta MMS speech checkpoints are marked CC BY-NC 4.0. They are suitable for non-commercial evaluation, but they are not a safe default for a paid production service. Replace them with a commercially licensed Nigerian-language speech provider or obtain written commercial permission before a commercial launch.
