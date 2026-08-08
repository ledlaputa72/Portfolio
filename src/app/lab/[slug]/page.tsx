import { notFound } from "next/navigation";
import { labSites } from "@/data/lab-sites";
import { labExperiments } from "@/components/lab/experiments/registry";
import LabSiteDetail from "@/components/lab/LabSiteDetail";

export function generateStaticParams() {
  return labSites.map((site) => ({ slug: site.slug }));
}

export default async function LabSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = labSites.find((s) => s.slug === slug);

  if (!site) {
    notFound();
  }

  const experiment = labExperiments[site.slug];
  const Demo = experiment?.Demo;

  return (
    <main className="flex flex-1 flex-col">
      <LabSiteDetail
        site={site}
        notes={experiment?.notes ?? null}
        hasSample={Boolean(experiment?.Sample)}
        demo={Demo ? <Demo /> : null}
      />
    </main>
  );
}
