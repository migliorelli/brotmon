"use client";

import { Button } from "@/components/ui/button";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavbarLink({
  href,
  children,
}: {
  href: string;
  children: any;
}) {
  const pathname = usePathname();

  return (
    <Button
      variant="outline"
      className={clsx(
        "hover:bg-secondary border-0 shadow-none",
        pathname === href && "bg-secondary/80",
      )}
    >
      <Link href={href} className="h-full w-full">
        {children}
      </Link>
    </Button>
  );
}
