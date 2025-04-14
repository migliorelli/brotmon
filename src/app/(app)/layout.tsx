import { Navbar } from "@/components/global/navbar/navbar";
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      {children}
    </div>
  );
}
