import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/theme-provider";
import type { Metadata } from "next";
import { Funnel_Sans } from "next/font/google";
import "./globals.css";

const font = Funnel_Sans({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Brotmon",
  description:
    "A realtime turn-based battle game inspired by Pokémon's combat system, featuring Brainrot characters.",
  authors: {
    name: "Miguel Migliorelli Bringhenti",
    url: "https://migliorelli.dev",
  },
  creator: "Miguel Migliorelli Bringhenti",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster toastOptions={{ closeButton: true }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
