import HeroScene from "@/components/HeroScene";
import FadeInSection from "@/components/FadeInSection";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";

const impactStats = [
  { value: "5+", label: "Years as Marketing Manager at AVYCON" },
  { value: "4", label: "Team Members Managed" },
  { value: "5", label: "Case Studies — Web, Print, Trade Show, Digital, Brand" },
  { value: "4", label: "Languages — Global Site (EN/KO/JA/ES)" },
  { value: "4", label: "Countries — Trade Shows in a Single Year" },
  { value: "50+", label: "Print Pieces Over 5 Years" },
];

export default function Home() {
  return (
    <SmoothScrollProvider>
      <main className="flex flex-1 flex-col">
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
          <HeroScene />
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-6xl">
              B2B Hardware Marketing Manager
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
              From 138-page site specs to Wix Velo production builds — I plan,
              design, and ship.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#work"
                className="rounded-lg bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-hover"
              >
                View My Work
              </a>
              <a
                href="#contact"
                className="rounded-lg border border-border px-6 py-3 font-medium text-text-primary transition-colors hover:bg-bg-tertiary"
              >
                Download Resume
              </a>
            </div>
          </div>
        </section>

        <FadeInSection className="mx-auto w-full max-w-[1200px] px-6 py-24">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {impactStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-accent">
                  {stat.value}
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </main>
    </SmoothScrollProvider>
  );
}
