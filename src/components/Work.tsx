import Image from "next/image";
import { projects } from "@/data/portfolio";

export default function Work() {
  return (
    <section id="work" className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500">
        Work
      </h2>
      <h3 className="mt-2 text-3xl font-semibold tracking-tight">Case Studies</h3>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <a
            key={project.id}
            href={project.link ?? "#"}
            className="group flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition-colors hover:border-zinc-600"
          >
            <div className="flex h-32 items-center justify-center rounded-xl bg-zinc-800/60">
              <Image
                src={project.image}
                alt={project.title}
                width={48}
                height={48}
                className="opacity-80 dark:invert"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>{project.role}</span>
              <span>{project.year}</span>
            </div>
            <h4 className="text-xl font-medium tracking-tight group-hover:text-zinc-50">
              {project.title}
            </h4>
            <p className="text-sm text-zinc-400">{project.summary}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
