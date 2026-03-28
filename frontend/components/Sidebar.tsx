"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, BrainCircuit, Table, BookOpen, Home, Globe2 } from "lucide-react";
import logo from "../assets/logo.svg";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Landing", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/regions", label: "Regions", icon: Globe2 },
    { href: "/species", label: "Species", icon: Table },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/models", label: "Models", icon: BrainCircuit },
    { href: "/docs", label: "Docs", icon: BookOpen },
  ];

  return (
    <aside className="hidden md:flex w-72 h-screen border-r border-[#2d4b52] glass-panel flex-col fixed left-0 top-0 z-20">
      <div className="h-20 flex items-center px-6 border-b border-[#2d4b52] gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0c1f2a] border border-[#2f5058] shadow-lg shadow-cyan-500/20 flex items-center justify-center overflow-hidden p-1.5">
          <Image src={logo} alt="EcoDynamix logo" className="w-full h-full object-contain" priority />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-linear-to-r from-[#e8fff6] to-[#7fd5c2] bg-clip-text text-transparent leading-none">
            EcoDynamix
          </h1>
          <p className="text-[10px] text-[#95b9b0] uppercase tracking-[0.16em] mt-1">Biodiversity Intelligence</p>
        </div>
      </div>

      {/* <div className="px-4 pt-4">
        <div className="glass-chip rounded-xl px-3 py-2 text-[10px] text-[#b6cfc7] uppercase tracking-[0.18em]">
          Scientific Mission
          <p className="mt-1 text-[#93aba4] normal-case tracking-normal">Measure, explain, and forecast global ecosystem risk.</p>
        </div>
      </div> */}

      <nav className="flex-1 px-4 py-5 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border ${
                isActive
                  ? "bg-[#103444]/55 border-[#5fc6ad]/45 text-[#91efd4]"
                  : "border-transparent text-[#9cb4ae] hover:bg-[#102836]/45 hover:text-[#d5f4ea]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#2d4b52]">
        <div className="rounded-xl px-3 py-2 bg-[#091822]/60 border border-[#2b4950]">
          <p className="text-[10px] text-[#86a59d] uppercase tracking-[0.14em]">Current Cycle</p>
          <p className="text-sm font-semibold text-[#daf6ee] mt-1">LPD 2024 + Forecast 2031</p>
        </div>
      </div>
    </aside>
  );
}
