"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, BrainCircuit, Table, BookOpen } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/species", label: "Species", icon: Table },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/models", label: "Models", icon: BrainCircuit },
    { href: "/docs", label: "Docs", icon: BookOpen },
  ];

  return (
    <aside className="hidden md:flex w-64 h-screen border-r border-[#27272a] glass-panel flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-[#27272a] gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center font-black text-zinc-900 text-xs">
          ED
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          EcoDynamix
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#27272a]">
        <div className="flex items-center gap-3 px-2">
           <div className="w-8 h-8 rounded-full bg-zinc-800 flex justify-center items-center text-[10px] font-bold text-zinc-400 border border-zinc-700">
            SYS
          </div>
          <div className="text-sm">
            <p className="font-medium text-zinc-200">Researcher</p>
            <p className="text-xs text-zinc-500">EcoDynamix Core</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
