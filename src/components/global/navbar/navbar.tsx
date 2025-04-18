import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import { JoinBattlePopover } from "./join-battle-popover";
import { NavbarLink } from "./navbar-link";

export function Navbar() {
  return (
    <div className="sticky top-0 left-0 h-16 w-full shadow-xs bg-background">
      <div className="container mx-auto flex h-full items-center px-4">
        <Link
          href="/"
          className="hover:bg-secondary/80 flex items-center rounded-lg pr-4 pl-2"
        >
          <img src="/icon.png" height={48} width={48} />
          <span className="text-2xl font-bold">
            <span className="text-pink-400">Brot</span>mon
          </span>
        </Link>

        <div className="ml-auto flex items-center">
          <nav className="mr-2 hidden items-center gap-2 md:flex">
            <NavbarLink href="/">Teambuilder</NavbarLink>
            <NavbarLink href="/brotdex">Brotdex</NavbarLink>
            <JoinBattlePopover />
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
