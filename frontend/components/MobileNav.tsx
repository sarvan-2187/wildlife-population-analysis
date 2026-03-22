"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, BrainCircuit, Table, BookOpen } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  
  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/species", label: "Species", icon: Table },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/models", label: "Models", icon: BrainCircuit },
    { href: "/docs", label: "Docs", icon: BookOpen },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-[#27272a] flex justify-around items-center z-50 shadow-2xl bg-[#09090b]/80">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
