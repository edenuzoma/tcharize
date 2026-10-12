# Tcharize

Tcharize is a Nigeria-first localization platform. It helps teams translate digital products into Yoruba, Hausa, Igbo, and Nigerian Pidgin, while leaving room for more African languages. It also includes a browser extension for translating the page someone is reading and a voice layer for people who prefer to listen.

The product language should stay simple enough for a five-year-old to follow: short sentences, familiar words, one clear action at a time.

## Repository map

```text
apps/
  web/          Next.js product site and dashboard
  api/          NestJS modular-monolith API
  extension/    WXT browser extension
packages/
  contracts/    Shared schemas, DTOs, and language metadata
  database/     PostgreSQL schema and database client
  ui/           Shared React UI primitives and brand tokens
docs/           Product and architecture decisions
infrastructure/ Local and deployment infrastructure
```

## Start locally

Requirements: Node.js 22+, pnpm 11+, and Docker.

```bash
Copy-Item .env.example .env.local
docker compose -f infrastructure/docker-compose.yml up -d
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000/api/v1
- API health: http://localhost:4000/api/v1/health

The extension runs through its own WXT development command:

```bash
pnpm --filter @tcharize/extension dev
```

## Security

Never commit real keys. The original brief contained credential-shaped values. Rotate them before any deployment, then put the new values only in a local `.env.local` file or the hosting provider's secret store.

`NATLAS_BASE_URL` must be a callable inference server or dedicated endpoint. `https://huggingface.co/NCAIR1` is the model repository page, not an inference API.

## Useful commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

See [docs/architecture.md](docs/architecture.md) for the system boundaries and [docs/roadmap.md](docs/roadmap.md) for the delivery order.

The typed Python SDK lives in [`sdks/python`](sdks/python). Production setup and release gates live in [`docs/deployment.md`](docs/deployment.md).

