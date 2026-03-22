import type { Metadata } from "next";
import { Domine, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Sidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";

const domine = Domine({
  variable: "--font-domine",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wildlife Pop Analysis Dashboard",
  description: "Global wildlife species decline assessment & RAG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${domine.variable} ${bricolage.variable} antialiased bg-[#09090b] text-zinc-100 flex flex-col md:flex-row`}
        style={{ fontFamily: "var(--font-bricolage)" }}
      >
        <Sidebar />
        <main className="flex-1 md:ml-64 min-h-screen pb-16 md:pb-0">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}
