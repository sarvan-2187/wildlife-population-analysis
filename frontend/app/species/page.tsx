"use client";

import { useState, useEffect } from "react";
import { Search, ArrowUpDown, Filter, Bird, Waves, Mountain } from "lucide-react";

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
                         s.region.toLowerCase().includes(searchTerm.toLowerCase());
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
        <p className="text-zinc-400">Loading species analytics...</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            Species Inventory
          </h1>
          <p className="text-zinc-400 mt-2">Comprehensive population metrics across all tracked binomials.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto md:items-center">
          <div className="flex gap-2">
            <select 
              className="bg-[#0a0a0b] border border-[#27272a] rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer"
              value={systemFilter}
              onChange={(e) => setSystemFilter(e.target.value)}
            >
              {uniqueSystems.map(sys => <option key={sys} value={sys}>{sys}</option>)}
            </select>

            <select 
              className="bg-[#0a0a0b] border border-[#27272a] rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {uniqueStatuses.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>

          <div className="relative group w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="glass-panel overflow-hidden rounded-2xl border border-[#27272a]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0a0a0b] border-b border-[#27272a]">
              <tr>
                {[
                  { label: "Species (Common / Scientific)", key: "name" },
                  { label: "System", key: "system" },
                  { label: "Region", key: "region" },
                  { label: "Avg Growth", key: "growth" },
                  { label: "Population", key: "pop" },
                  { label: "Status", key: "status" },
                ].map((col) => (
                  <th 
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-100 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {sortedSpecies.map((s, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-zinc-200">{s.name}</span>
                      <span className="text-[10px] text-zinc-500 italic font-medium">{s.binomial}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      {getSystemIcon(s.system)}
                      {s.system}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-zinc-500">{s.region}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-mono ${s.growth < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {s.growth > 0 ? '+' : ''}{s.growth}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300 font-mono">
                    {s.pop.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getStatusColor(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {sortedSpecies.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 italic">
                    No species matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs text-zinc-500">
        <p>Showing {sortedSpecies.length} species</p>
        <p>Data refreshed: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}
