"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, MessageSquare, BrainCircuit, Table, Globe2 } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  
  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Pulse", icon: LayoutDashboard },
    { href: "/regions", label: "Regions", icon: Globe2 },
    { href: "/species", label: "Species", icon: Table },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/models", label: "Models", icon: BrainCircuit },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-[#2d4b52] flex justify-around items-center z-50 shadow-2xl bg-[#08131d]/85">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive ? "text-[#7af0c7]" : "text-[#7f9f98] hover:text-[#d2f3ea]"
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
