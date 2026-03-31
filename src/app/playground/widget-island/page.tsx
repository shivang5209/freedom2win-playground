import Link from "next/link";
import { WidgetIslandPrototype } from "@/components/worlds/widget-island-prototype";

export default function WidgetIslandPage() {
  return (
    <main className="widget-world min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Widget Island
        </h1>
        <Link
          href="/"
          className="rounded-full border border-sky-100/20 px-4 py-2 text-sm text-sky-100 transition hover:border-sky-100/50"
        >
          Back to Portal
        </Link>
      </div>

      <p className="mx-auto mt-4 w-full max-w-7xl text-sm text-slate-200/80 md:text-base">
        Drag widgets from the tray into the phone preview. Hover tree nodes to
        inspect where each widget renders.
      </p>

      <div className="mx-auto mt-6 w-full max-w-7xl">
        <WidgetIslandPrototype />
      </div>
    </main>
  );
}
