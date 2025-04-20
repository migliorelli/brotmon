"use client";

import { Button } from "@/components/ui/button";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function NavbarLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();

  return (
    <Button
      variant="outline"
      className={clsx(
        "hover:bg-secondary border-0 shadow-none dark:bg-transparent",
        pathname === href && "bg-secondary dark:bg-secondary",
      )}
    >
      <Link href={href} className="h-full w-full">
        {children}
      </Link>
    </Button>
  );
}
