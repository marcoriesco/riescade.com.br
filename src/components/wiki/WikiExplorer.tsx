"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import type { WikiSystem } from "@/lib/wiki";

interface WikiExplorerProps {
  systems: WikiSystem[];
}

const CATEGORIES = [
  { id: "all", label: "Todos os sistemas" },
  { id: "custom", label: "⭐ Exclusivos RIESCADE" },
  { id: "console", label: "Consoles" },
  { id: "portable", label: "Portáteis" },
  { id: "arcade", label: "Arcade & Dumps" },
  { id: "computer", label: "Computadores" },
  { id: "port", label: "Ports & Recomps" },
];

export function WikiExplorer({ systems }: WikiExplorerProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedFolder, setCopiedFolder] = useState<string | null>(null);

  const copyToClipboard = (folderPath: string) => {
    navigator.clipboard.writeText(folderPath);
    setCopiedFolder(folderPath);
    setTimeout(() => setCopiedFolder(null), 2000);
  };

  const filteredSystems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return systems.filter((system) => {
      // Category filter
      if (selectedCategory === "custom" && !system.isCustomRiescade) return false;
      if (
        selectedCategory !== "all" &&
        selectedCategory !== "custom" &&
        system.hardware !== selectedCategory
      ) {
        return false;
      }

      // Search filter
      if (!query) return true;

      const matchName = system.name.toLowerCase().includes(query);
      const matchFolder = system.folder.toLowerCase().includes(query);
      const matchId = system.id.toLowerCase().includes(query);
      const matchMaker = system.manufacturer.toLowerCase().includes(query);
      const matchExt = system.extensions.some((ext) => ext.toLowerCase().includes(query));

      return matchName || matchFolder || matchId || matchMaker || matchExt;
    });
  }, [systems, search, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Bar */}
      <div className="rounded-lg border border-border bg-card p-4 md:p-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, pasta (ex: psx, arcadedumps), fabricante ou extensão (.chd, .iso)..."
            className="w-full rounded-md border border-border bg-background py-2.5 pl-10 pr-16 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-md px-3 py-1.5 font-mono text-xs transition-colors ${
                  isSelected
                    ? "bg-primary/15 border border-primary/40 text-primary font-semibold"
                    : "border border-border/60 bg-background/50 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
        <p>
          Mostrando <strong className="text-foreground">{filteredSystems.length}</strong> sistemas
          {search && ` para "${search}"`}
        </p>
      </div>

      {/* List / Table View */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-background text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">Sistema</th>
                <th scope="col" className="px-4 py-3">Pasta de ROMs</th>
                <th scope="col" className="px-4 py-3">Extensões aceitas</th>
                <th scope="col" className="px-4 py-3">BIOS</th>
                <th scope="col" className="px-4 py-3">Emulador padrão</th>
                <th scope="col" className="px-4 py-3 text-right">Guia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredSystems.map((system) => (
                <tr
                  key={system.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {system.logo && (
                        <div className="relative h-6 w-12 flex-shrink-0">
                          <Image
                            src={system.logo}
                            alt=""
                            fill
                            unoptimized
                            sizes="48px"
                            className="object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/wiki/${system.slug}`}
                            className="font-bold text-foreground hover:text-primary transition-colors text-xs sm:text-sm"
                          >
                            {system.name}
                          </Link>
                          {system.isCustomRiescade && (
                            <span className="rounded bg-primary/15 px-1 py-0.2 font-mono text-[9px] font-bold text-primary">
                              MOD
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {[system.manufacturer !== "Vários" ? system.manufacturer : null, system.release].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-background px-2 py-0.5 font-mono text-xs text-primary border border-border">
                        {system.folderPath}
                      </code>
                      <button
                        onClick={() => copyToClipboard(system.folderPath)}
                        className="rounded p-1 text-muted-foreground hover:text-primary transition-colors"
                        title="Copiar pasta"
                      >
                        {copiedFolder === system.folderPath ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {system.extensions.slice(0, 3).map((ext) => (
                        <span
                          key={ext}
                          className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          {ext}
                        </span>
                      ))}
                      {system.extensions.length > 3 && (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          +{system.extensions.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {system.biosRequired ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400 font-mono">
                        <AlertCircle className="h-3 w-3" />
                        Obrigatória
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400 font-mono">
                        <CheckCircle2 className="h-3 w-3" />
                        Dispensada
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {system.defaultEmulator?.name || "windows"}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/wiki/${system.slug}`}
                      className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary hover:underline"
                    >
                      <span>Ver guia</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
