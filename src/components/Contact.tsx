import { profile } from "@/data/portfolio";

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500">
        Contact
      </h2>
      <h3 className="mt-2 text-3xl font-semibold tracking-tight">
        함께 일하고 싶다면
      </h3>
      <p className="mt-4 max-w-xl text-zinc-400">
        새로운 프로젝트나 협업 제안은 언제든 환영합니다. 이메일로 편하게
        연락해주세요.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href={`mailto:${profile.email}`}
          className="rounded-full bg-zinc-50 px-5 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-300"
        >
          {profile.email}
        </a>
        <a
          href={profile.social.github}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-medium transition-colors hover:border-zinc-500"
        >
          GitHub
        </a>
        <a
          href={profile.social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-medium transition-colors hover:border-zinc-500"
        >
          LinkedIn
        </a>
      </div>
    </section>
  );
}
