import { profile } from "@/data/portfolio";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 px-6 py-8 text-center text-sm text-zinc-500">
      © {new Date().getFullYear()} {profile.name}. All rights reserved.
    </footer>
  );
}
