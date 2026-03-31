import Link from "next/link";

export default function Home() {
  return (
    <main className="portal-page relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 portal-stars" aria-hidden />
      <div className="absolute inset-0 portal-glow" aria-hidden />

      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-20 md:px-12">
        <p className="portal-kicker">Freedom2Win Prototype</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl">
          Learn Flutter. By Playing.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-100/80 md:text-xl">
          The portal is live. We can now test the first concept world with real
          drag-and-drop composition behavior.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link className="portal-button" href="/playground/widget-island">
            Enter Widget Island
          </Link>
          <span className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200/80">
            Prototype goal: interaction feel and learning clarity
          </span>
        </div>
      </section>

      <div className="portal-orbits" aria-hidden>
        <span>Scaffold</span>
        <span>AppBar</span>
        <span>Column</span>
        <span>Text</span>
        <span>Button</span>
      </div>
    </main>
  );
}
