import { ThemeProvider } from "@/contexts/theme-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brotmon",
  description: "A Pokemon Showdown like Brainrot game!",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
