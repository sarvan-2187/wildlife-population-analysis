import type { Metadata } from "next";
import { Cormorant_Garamond, Open_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "../components/AppShell";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const openSans = Open_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EcoDynamix Intelligence Dashboard",
  description: "Global species decline assessment & RAG powered by EcoDynamix",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${openSans.variable} antialiased`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
