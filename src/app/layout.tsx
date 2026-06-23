import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "@/app/globals.css";
import { GlobalStoreProvider } from "@/core/store/GlobalStore";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aura Calendar | Production-Grade Interactive Calendar",
  description: "A visually stunning, interactive calendar component built with Next.js, TypeScript, and Framer Motion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
      </head>
      <body className="font-inter min-h-full flex flex-col bg-background text-foreground">
        <GlobalStoreProvider>
          {children}
        </GlobalStoreProvider>
      </body>
    </html>
  );
}