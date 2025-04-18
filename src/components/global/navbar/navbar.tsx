import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import { JoinBattlePopover } from "./join-battle-popover";
import { JoinBattleTitle } from "./join-battle-title";
import { NavbarLink } from "./navbar-link";

export function Navbar() {
  return (
    <div className="bg-background sticky top-0 left-0 h-16 w-full shadow-xs">
      <div className="container mx-auto grid h-full grid-cols-3 px-4">
        <Link
          href="/"
          className="hover:bg-secondary/80 my-2 flex items-center justify-self-start rounded-lg pr-4 pl-2"
        >
          <img src="/icon.png" height={48} width={48} />
          <span className="hidden text-2xl font-bold md:block">
            <span className="text-pink-400">Brot</span>mon
          </span>
        </Link>

        <JoinBattleTitle />

        <div className="col-start-3 flex items-center justify-self-end">
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
