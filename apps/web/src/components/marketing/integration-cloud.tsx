/* eslint-disable @next/next/no-img-element */

const integrations = [
  { name: "Next.js", slug: "nextjs" },
  { name: "React", slug: "react" },
  { name: "NestJS", slug: "nestjs" },
  { name: "TypeScript", slug: "typescript" },
  { name: "Node.js", slug: "nodejs" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "Redis", slug: "redis" },
  { name: "Cloudflare", slug: "cloudflare" },
  { name: "GitHub", slug: "github" },
] as const;

export function IntegrationCloud() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[.25em] text-secondary">
          Fits the tools you already use
        </p>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl">
          Your stack stays yours.
        </h2>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
        {integrations.map((item) => (
          <div
            key={item.slug}
            className="group grid min-h-28 place-items-center rounded-3xl border border-ink/10 bg-surface p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-secondary/30 hover:shadow-lg"
          >
            <img
              src={`https://logoforge.terravidhal.me/logos/${item.slug}/icon.svg`}
              alt=""
              className="h-8 w-8 object-contain transition group-hover:scale-110"
            />
            <span className="mt-3 text-xs font-bold">{item.name}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-xs text-ink/40">
        Brand artwork supplied by LogoForge for product identification.
      </p>
    </section>
  );
}
