# Contributing to Tcharize

Thank you for helping Nigerian languages work well online.

## Start here

1. Install Node.js 22, pnpm 11, Docker, and Python 3.9 or newer.
2. Copy `.env.example` to `.env.local`.
3. Add local secrets only to `.env.local`. Never commit them.
4. Start PostgreSQL and Redis with `docker compose -f infrastructure/docker-compose.yml up -d`.
5. Run `pnpm install`, `pnpm db:generate`, and `pnpm dev`.

## Before a pull request

Run these checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

For the Python SDK, also run `python -m pytest sdks/python/tests`.

Keep user text short and clear. Test mobile, desktop, light mode, dark mode, and keyboard use. Add tests for each meaningful behavior. Never include a real email code, API key, provider response, or customer text in an issue or test.
