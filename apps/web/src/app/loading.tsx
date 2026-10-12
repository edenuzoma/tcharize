export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl animate-pulse px-5 py-8 lg:px-8">
      <div className="h-16 rounded-3xl bg-mist" />
      <div className="mx-auto mt-24 h-6 w-52 rounded-full bg-secondary/10" />
      <div className="mx-auto mt-6 h-16 max-w-4xl rounded-2xl bg-ink/10" />
      <div className="mx-auto mt-4 h-16 max-w-3xl rounded-2xl bg-ink/10" />
      <div className="mx-auto mt-8 h-12 w-56 rounded-full bg-primary/40" />
      <div className="mt-24 grid gap-5 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-64 rounded-[2rem] bg-mist" />
        ))}
      </div>
    </main>
  );
}
