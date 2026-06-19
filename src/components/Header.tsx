import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-bg-secondary/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-text-primary"
        >
          Steve Jung
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/lab"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Lab
          </Link>
        </nav>
      </div>
    </header>
  );
}
