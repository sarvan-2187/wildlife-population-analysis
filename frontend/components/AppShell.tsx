"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <div className="min-h-screen bg-shell text-zinc-100 flex flex-col md:flex-row relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 bg-aurora" />
      {!isLanding && <Sidebar />}
      <main className={`relative z-10 flex-1 min-h-screen ${isLanding ? "" : "md:ml-72 pb-20 md:pb-0"}`}>
        {children}
      </main>
      {!isLanding && <MobileNav />}
    </div>
  );
}
