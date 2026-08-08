"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  CATEGORY_LABELS,
  CONFIDENCE_LABELS,
  DIFFICULTY_LABELS,
  type LabSite,
} from "@/data/lab-sites";
import type { LabExperiment } from "@/components/lab/experiments/registry";
import { LabExternalLink, LabSampleLink } from "@/components/lab/LabLinks";
import { useLocale } from "@/i18n/LocaleProvider";
import { UI, styleStudyHeading } from "@/i18n/strings";

export default function LabSiteDetail({
  site,
  notes,
  hasSample,
  demo,
}: {
  site: LabSite;
  notes: LabExperiment["notes"] | null;
  hasSample: boolean;
  demo: ReactNode;
}) {
  const { locale } = useLocale();

  return (
    <section className="mx-auto w-full max-w-[900px] px-6 py-16">
      <Link
        href="/lab"
        className="text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        ← Lab
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
        {styleStudyHeading(site.title)[locale]}
      </h1>

      <LabExternalLink
        href={site.url}
        className="mt-2 inline-block text-sm text-accent hover:text-accent-hover"
      >
        {site.url} ↗
      </LabExternalLink>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary">
          {CATEGORY_LABELS[site.category][locale]}
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary">
          {CONFIDENCE_LABELS[site.confidence][locale]}
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary">
          {UI.difficultyPrefix[locale]}: {DIFFICULTY_LABELS[site.difficulty][locale]}
        </span>
      </div>

      {hasSample ? (
        <LabSampleLink
          href={`/lab/${site.slug}/sample`}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          {UI.viewFullSample[locale]}
        </LabSampleLink>
      ) : null}

      <div className="mt-10">
        <h2 className="text-lg font-bold text-text-primary">{UI.conceptHeading[locale]}</h2>
        <p className="mt-2 text-text-secondary">{site.concept[locale]}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-text-primary">{UI.signatureHeading[locale]}</h2>
        <p className="mt-2 text-text-secondary">{site.signature[locale]}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-text-primary">{UI.techniquesHeading[locale]}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {site.techniques.map((technique) => (
            <span
              key={technique.en}
              className="rounded-full bg-bg-tertiary px-3 py-1 text-sm text-text-primary"
            >
              {technique[locale]}
            </span>
          ))}
        </div>
      </div>

      {notes ? (
        <>
          <div className="mt-10">
            <h2 className="text-lg font-bold text-text-primary">{UI.coreDemoHeading[locale]}</h2>
            <p className="mt-2 text-sm text-text-secondary">{UI.coreDemoDesc[locale]}</p>
            <div className="mx-[calc(50%-50vw)] mt-4 w-screen">{demo}</div>
            {hasSample ? (
              <LabSampleLink
                href={`/lab/${site.slug}/sample`}
                className="mt-4 inline-block text-sm text-accent hover:text-accent-hover"
              >
                {UI.viewFullSample[locale]}
              </LabSampleLink>
            ) : null}
          </div>

          <div className="mt-12">
            <h2 className="text-lg font-bold text-text-primary">{UI.librariesHeading[locale]}</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-text-secondary">
              {notes.libraries.map((lib) => (
                <li key={lib.en}>{lib[locale]}</li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold text-text-primary">{UI.pointsHeading[locale]}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary">
              {notes.points.map((point) => (
                <li key={point.en}>{point[locale]}</li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold text-text-primary">{notes.snippet.label[locale]}</h2>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-bg-secondary p-4 text-xs text-text-secondary">
              <code>{notes.snippet.code}</code>
            </pre>
          </div>
        </>
      ) : (
        <div className="mt-10 flex min-h-[60vh] items-center justify-center rounded-lg border border-dashed border-border bg-bg-secondary text-center">
          <p className="px-6 text-text-muted">{UI.plannedPlaceholder[locale]}</p>
        </div>
      )}

      <Link
        href="/lab"
        className="mt-10 inline-block text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        {UI.backToLab[locale]}
      </Link>
    </section>
  );
}
