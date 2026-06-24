"use client";

import Link from "next/link";
import { useCallback, useRef, type ReactNode } from "react";

const OPEN_GUARD_MS = 800;

type LinkClassName = string | undefined;

/** External reference URL — single window.open to avoid duplicate tabs in Cursor preview */
export function LabExternalLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: LinkClassName;
  children: ReactNode;
}) {
  const guardRef = useRef(false);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (guardRef.current) return;
      guardRef.current = true;

      window.open(href, "_blank", "noopener,noreferrer");

      window.setTimeout(() => {
        guardRef.current = false;
      }, OPEN_GUARD_MS);
    },
    [href],
  );

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

/** Full-page sample — always opens in a new tab */
export function LabSampleLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: LinkClassName;
  children: ReactNode;
}) {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </Link>
  );
}
