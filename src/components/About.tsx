import { about } from "@/data/portfolio";

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500">
        About
      </h2>
      <h3 className="mt-2 text-3xl font-semibold tracking-tight">소개</h3>

      <div className="mt-10 grid gap-12 sm:grid-cols-2">
        <div>
          <p className="text-zinc-400">{about.summary}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {about.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-zinc-800/60 px-3 py-1.5 text-sm text-zinc-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <ol className="space-y-6 border-l border-zinc-800 pl-6">
          {about.timeline.map((item) => (
            <li key={item.title} className="relative">
              <span className="absolute -left-[31px] top-1.5 h-2 w-2 rounded-full bg-zinc-500" />
              <p className="text-xs text-zinc-500">{item.year}</p>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-zinc-400">{item.org}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
