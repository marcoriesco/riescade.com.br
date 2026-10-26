"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Copy,
  Check,
  Folder,
  Cpu,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  LayoutGrid,
  List,
  ArrowRight,
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
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
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

  const customHighlights = useMemo(() => {
    return systems.filter((s) => s.isCustomRiescade);
  }, [systems]);

  return (
    <div className="space-y-8">
      {/* Search and Category Filter Bar */}
      <div className="rounded-lg border border-border bg-card p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
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

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border-t border-border pt-3 md:border-t-0 md:pt-0 self-end md:self-auto">
            <button
              onClick={() => setViewMode("grid")}
              aria-label="Visualização em grade"
              className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-primary text-black font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              aria-label="Visualização em tabela"
              className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-primary text-black font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
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

      {/* RIESCADE Custom Systems Highlight Banner */}
      {(selectedCategory === "all" || selectedCategory === "custom") && !search && (
        <section aria-labelledby="custom-systems-title" className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 id="custom-systems-title" className="text-base font-bold tracking-tight text-foreground">
              Sistemas Exclusivos & Modificados no RIESCADE
            </h2>
            <span className="rounded bg-primary/15 border border-primary/30 px-2 py-0.5 font-mono text-[10px] text-primary font-semibold">
              Especial
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {customHighlights.map((system) => (
              <div
                key={system.id}
                className="group flex flex-col justify-between rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-block rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                        MODIFICADO
                      </span>
                      <h3 className="mt-1.5 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {system.name}
                      </h3>
                      <p className="font-mono text-xs text-muted-foreground">{system.manufacturer}</p>
                    </div>

                    {system.logo && (
                      <div className="relative h-8 w-16 flex-shrink-0">
                        <Image
                          src={system.logo}
                          alt={system.name}
                          fill
                          unoptimized
                          sizes="64px"
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Folder path copy */}
                  <div className="mt-3 flex items-center justify-between rounded border border-border bg-background px-2.5 py-1.5">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Folder className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span className="font-mono text-xs text-foreground truncate">
                        {system.folderPath}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(system.folderPath)}
                      className="ml-2 flex items-center gap-1 rounded border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-all hover:border-primary hover:text-primary flex-shrink-0"
                      title="Copiar caminho"
                    >
                      {copiedFolder === system.folderPath ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">OK</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-2.5 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Formato:</span>{" "}
                    <span className="font-mono text-primary text-[11px]">{system.recommendedFormat}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60">
                  <Link
                    href={`/wiki/${system.slug}`}
                    className="inline-flex w-full items-center justify-between text-xs font-semibold text-primary hover:underline"
                  >
                    <span>Ver guia de instalação</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
        <p>
          Mostrando <strong className="text-foreground">{filteredSystems.length}</strong> sistemas
          {search && ` para "${search}"`}
        </p>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSystems.map((system) => {
            const hasBios = system.biosRequired;

            return (
              <div
                key={system.id}
                className="group flex flex-col justify-between rounded-lg border border-border bg-card p-4 transition-all hover:border-border/80 hover:bg-card/90"
              >
                <div>
                  {/* Top Bar: Logo & Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {system.isCustomRiescade && (
                          <span className="inline-block rounded bg-primary/15 px-1 py-0.5 font-mono text-[9px] font-bold text-primary">
                            MOD
                          </span>
                        )}
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {[system.manufacturer !== "Vários" ? system.manufacturer : null, system.release].filter(Boolean).join(" · ")}
                        </span>
                      </div>
                      <h3 className="mt-1 font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {system.name}
                      </h3>
                    </div>

                    {system.logo && (
                      <div className="relative h-8 w-14 flex-shrink-0">
                        <Image
                          src={system.logo}
                          alt=""
                          fill
                          unoptimized
                          sizes="56px"
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Folder Box */}
                  <div className="mt-3 flex items-center justify-between rounded border border-border bg-background px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <Folder className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="font-mono text-xs text-foreground truncate select-all">
                        {system.folderPath}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(system.folderPath)}
                      className="ml-1.5 flex items-center rounded p-1 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                      title="Copiar caminho"
                    >
                      {copiedFolder === system.folderPath ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>

                  {/* Info Badges */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {hasBios ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] text-amber-400">
                        <AlertCircle className="h-2.5 w-2.5" />
                        BIOS obrigatória
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Sem BIOS
                      </span>
                    )}

                    {system.defaultEmulator && (
                      <span className="inline-flex items-center gap-1 rounded bg-muted/60 border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        <Cpu className="h-2.5 w-2.5" />
                        {system.defaultEmulator.name}
                      </span>
                    )}
                  </div>

                  {/* Extensions */}
                  <div className="mt-2.5">
                    <div className="flex flex-wrap gap-1">
                      {system.extensions.slice(0, 3).map((ext) => (
                        <span
                          key={ext}
                          className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          {ext}
                        </span>
                      ))}
                      {system.extensions.length > 3 && (
                        <span className="font-mono text-[10px] text-primary self-center">
                          +{system.extensions.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer link */}
                <div className="mt-4 pt-2.5 border-t border-border/60">
                  <Link
                    href={`/wiki/${system.slug}`}
                    className="inline-flex w-full items-center justify-between text-xs font-semibold text-muted-foreground transition-colors group-hover:text-primary"
                  >
                    <span>Instruções e detalhes</span>
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background text-xs font-mono uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3">Sistema</th>
                  <th scope="col" className="px-4 py-3">Pasta de ROMs</th>
                  <th scope="col" className="px-4 py-3">Extensões</th>
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
                            {system.manufacturer}
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
                        <span>Ver</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
