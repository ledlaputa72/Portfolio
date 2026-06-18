import { profile } from "@/data/portfolio";

export default function Hero() {
  return (
    <section
      id="top"
      className="mx-auto flex max-w-5xl flex-col gap-6 px-6 pt-24 pb-20 sm:pt-32"
    >
      <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
        {profile.role}
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
        {profile.name}
      </h1>
      <p className="max-w-xl text-lg text-zinc-400">{profile.tagline}</p>
      <div className="flex gap-4 pt-2">
        <a
          href="#work"
          className="rounded-full bg-zinc-50 px-5 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-300"
        >
          작업물 보기
        </a>
        <a
          href="#contact"
          className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-500"
        >
          연락하기
        </a>
      </div>
    </section>
  );
}
