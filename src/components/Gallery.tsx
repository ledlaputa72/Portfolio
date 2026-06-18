import Image from "next/image";
import { gallery } from "@/data/portfolio";

export default function Gallery() {
  return (
    <section id="gallery" className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500">
        Gallery
      </h2>
      <h3 className="mt-2 text-3xl font-semibold tracking-tight">스냅샷</h3>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="flex aspect-square items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40"
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={40}
              height={40}
              className="opacity-70 dark:invert"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
