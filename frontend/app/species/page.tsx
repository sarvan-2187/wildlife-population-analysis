"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  ArrowUpDown, 
  Filter, 
  Bird, 
  Waves, 
  Mountain, 
  Database, 
  ChevronRight,
  ClipboardList,
  Sparkles,
  Globe
} from "lucide-react";

export default function SpeciesPage() {
  const [species, setSpecies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [systemFilter, setSystemFilter] = useState("All Systems");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/dashboard")
      .then(res => res.json())
      .then(data => {
        setSpecies(data.species_data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching species data:", err);
        setLoading(false);
      });
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const uniqueSystems = ["All Systems", ...Array.from(new Set(species.map(s => s.system)))];
  const uniqueStatuses = ["All Status", "Declining", "Stable", "Growing"];

  const filteredSpecies = species.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.system.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.binomial.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSystem = systemFilter === "All Systems" || s.system === systemFilter;
    const matchesStatus = statusFilter === "All Status" || s.status === statusFilter;
    return matchesSearch && matchesSystem && matchesStatus;
  });

  const sortedSpecies = [...filteredSpecies].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Declining": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "Growing": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      default: return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    }
  };

  const getSystemIcon = (system: string) => {
    if (system.toLowerCase().includes("terrestrial")) return <Mountain className="w-4 h-4" />;
    if (system.toLowerCase().includes("marine")) return <Waves className="w-4 h-4" />;
    return <Bird className="w-4 h-4" />;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Accessing Species Record Set...</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col space-y-10 mb-20">
      <header className="space-y-6 border-b border-[#27272a] pb-8">
         <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20 border border-white/10">
               <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent tracking-tighter">
                EcoDynamix Species Inventory
              </h1>
              <div className="flex items-center gap-2 mt-1">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest leading-none pt-0.5">Database Sync: ACTIVE // LPD 2024</p>
              </div>
            </div>
         </div>
         
         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <p className="text-zinc-500 text-sm md:text-base leading-relaxed max-w-2xl">
              Comprehensive telemetry for 5,500+ species binomials. Filter by ecosystem, status, or region to analyze broad decline patterns.
            </p>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex gap-2">
                <select 
                  className="bg-[#0a0a0b] border border-[#27272a] rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer appearance-none pr-8 bg-no-repeat bg-[right_0.75rem_center] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%3D%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')]"
                  style={{ backgroundSize: '1rem' }}
                  value={systemFilter}
                  onChange={(e) => setSystemFilter(e.target.value)}
                >
                  {uniqueSystems.map(sys => <option key={sys} value={sys}>{sys}</option>)}
                </select>

                <select 
                   className="bg-[#0a0a0b] border border-[#27272a] rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer appearance-none pr-8 bg-no-repeat bg-[right_0.75rem_center] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%3D%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')]"
                   style={{ backgroundSize: '1rem' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {uniqueStatuses.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>

              <div className="relative group w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search species, binomials, or regions..."
                  className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
         </div>
      </header>

      {/* ── Desktop Summary Stats (New) ───────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: "Tracked Entities", value: species.length, icon: <Database /> },
           { label: "Global Coverage", value: "208 Regions", icon: <Globe /> },
           { label: "Critically Declining", value: species.filter(s => s.status === "Declining").length, icon: <TrendingDown className="text-red-500" /> },
           { label: "Neural Insights", value: "Enabled", icon: <Sparkles className="text-amber-500" /> },
         ].map((s, i) => (
           <div key={i} className="glass-panel p-5 rounded-[1.5rem] border border-zinc-900 flex justify-between items-center group">
              <div>
                <p className="text-[10px] text-zinc-600 font-black uppercase mb-1">{s.label}</p>
                <p className="text-xl font-black text-zinc-300 tracking-tighter">{s.value}</p>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900 group-hover:scale-110 transition-transform text-zinc-500">
                {s.icon}
              </div>
           </div>
         ))}
      </div>

      <div className="glass-panel overflow-hidden rounded-[2rem] border border-[#27272a] shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0a0a0b] border-b border-[#27272a]">
              <tr>
                {[
                  { label: "Binomial Designation", key: "name" },
                  { label: "Systems", key: "system" },
                  { label: "Territory", key: "region" },
                  { label: "Momentum", key: "growth" },
                  { label: "Census", key: "pop" },
                  { label: "Health Status", key: "status" },
                ].map((col) => (
                  <th 
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] cursor-pointer hover:text-zinc-100 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                       <ArrowUpDown className="w-3 h-3 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                       {col.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {sortedSpecies.map((s, i) => (
                <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-base font-black text-zinc-100 italic tracking-tight leading-none mb-1.5">{s.name}</span>
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{s.binomial}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold">
                       <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                          {getSystemIcon(s.system)}
                       </div>
                       {s.system}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs text-zinc-500 font-medium tracking-tight">{s.region}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <div className={`w-1 h-3 rounded-full ${s.growth < 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                       <span className={`text-sm font-black font-mono ${s.growth < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                         {s.growth > 0 ? '+' : ''}{s.growth}%
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-zinc-300 font-black tracking-tighter">
                    {s.pop.toLocaleString()}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusColor(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {sortedSpecies.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800">
                          <Search className="w-8 h-8 text-zinc-700" />
                       </div>
                       <p className="text-sm text-zinc-600 font-bold uppercase tracking-widest">No telemetry matching criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest border-t border-zinc-900 pt-8">
        <p className="flex items-center gap-2">
           <Database className="w-3 h-3" /> Showing {sortedSpecies.length} indexed observation points
        </p>
        <p className="text-zinc-500 italic">EcoDynamix Telemetry Feed // {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}

// Custom icon
function TrendingDown({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
      <polyline points="17 18 23 18 23 12"/>
    </svg>
  );
}
