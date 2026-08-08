"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { backToTechPage } from "@/i18n/strings";

export default function LabSampleBackLink({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const { locale } = useLocale();
  return (
    <Link
      href={`/lab/${slug}`}
      className="text-sm text-text-secondary transition-colors hover:text-text-primary"
    >
      {backToTechPage(title)[locale]}
    </Link>
  );
}
