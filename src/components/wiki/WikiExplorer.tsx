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
  Gamepad2,
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
    <div className="space-y-10">
      {/* Search and Filter Controls */}
      <div className="rounded-2xl border border-white/10 bg-card/60 p-4 md:p-6 backdrop-blur-md shadow-lg shadow-black/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, pasta (ex: psx, arcadedumps), fabricante ou extensão (.chd, .iso)..."
              className="w-full rounded-xl border border-white/10 bg-black/40 py-3.5 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-white/10 px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Limpar
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs text-muted-foreground font-mono mr-2 hidden sm:inline">
              Visualização:
            </span>
            <div className="flex rounded-xl border border-white/10 bg-black/30 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-primary text-black font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Modo Grade"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-primary text-black font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Modo Tabela"
              >
                <List className="h-3.5 w-3.5" />
                Tabela
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-white/5">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "border border-primary/60 bg-primary/20 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                    : "border border-white/5 bg-black/20 text-muted-foreground hover:border-white/20 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIESCADE Custom Systems Highlight Banner (shows when searching 'all' or 'custom' and no query) */}
      {(selectedCategory === "all" || selectedCategory === "custom") && !search && (
        <section aria-labelledby="custom-systems-title" className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h2 id="custom-systems-title" className="text-lg font-bold tracking-tight text-foreground">
              Sistemas Exclusivos & Modificados no RIESCADE
            </h2>
            <span className="rounded-full bg-primary/10 border border-primary/30 px-2 py-0.5 font-mono text-[11px] text-primary">
              Atenção especial
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customHighlights.map((system) => (
              <div
                key={system.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-card to-primary/[0.08] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_25px_hsl(var(--primary)/0.15)]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-block rounded-md bg-primary/20 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
                        Modificado
                      </span>
                      <h3 className="mt-2 text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {system.name}
                      </h3>
                      <p className="font-mono text-xs text-muted-foreground">{system.manufacturer}</p>
                    </div>

                    {system.logo && (
                      <div className="relative h-10 w-20 flex-shrink-0">
                        <Image
                          src={system.logo}
                          alt={system.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Folder path copy */}
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-2.5">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Folder className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="font-mono text-xs text-foreground truncate">
                        {system.folderPath}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(system.folderPath)}
                      className="ml-2 flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/20 hover:text-primary flex-shrink-0"
                      title="Copiar caminho"
                    >
                      {copiedFolder === system.folderPath ? (
                        <>
                          <Check className="h-3 w-3 text-green-400" />
                          <span className="text-green-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Highlights/Format */}
                  <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                    <p>
                      <strong className="text-foreground">Formato ideal:</strong>{" "}
                      <span className="font-mono text-primary">{system.recommendedFormat}</span>
                    </p>
                    {system.notes[0] && (
                      <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground/90">
                        💡 {system.notes[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5">
                  <Link
                    href={`/wiki/${system.slug}`}
                    className="inline-flex w-full items-center justify-between rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/25"
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Encontrados{" "}
          <strong className="font-mono font-bold text-foreground">
            {filteredSystems.length}
          </strong>{" "}
          sistemas
          {search && ` para "${search}"`}
        </p>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSystems.map((system) => {
            const hasBios = system.biosRequired;

            return (
              <div
                key={system.id}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-card/40 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-card/70 hover:shadow-lg hover:shadow-primary/[0.05]"
              >
                <div>
                  {/* Top Bar: Logo & Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {system.isCustomRiescade && (
                          <span className="inline-block rounded-md bg-primary/20 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-primary">
                            RIESCADE
                          </span>
                        )}
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {[system.manufacturer, system.release].filter(Boolean).join(" · ")}
                        </span>
                      </div>
                      <h3 className="mt-1 font-bold text-base text-foreground group-hover:text-primary transition-colors leading-tight truncate">
                        {system.name}
                      </h3>
                    </div>

                    {system.logo && (
                      <div className="relative h-9 w-16 flex-shrink-0">
                        <Image
                          src={system.logo}
                          alt=""
                          fill
                          className="object-contain transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                  </div>

                  {/* Folder Box */}
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Folder className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span className="font-mono text-xs text-foreground truncate select-all">
                        {system.folderPath}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(system.folderPath)}
                      className="ml-1.5 flex items-center rounded-lg p-1 text-muted-foreground hover:bg-white/10 hover:text-primary transition-colors flex-shrink-0"
                      title="Copiar caminho"
                    >
                      {copiedFolder === system.folderPath ? (
                        <Check className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Info Badges */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {/* BIOS badge */}
                    {hasBios ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                        <AlertCircle className="h-3 w-3" />
                        Requer BIOS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Sem BIOS
                      </span>
                    )}

                    {/* Emulator badge */}
                    {system.defaultEmulator && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                        <Cpu className="h-3 w-3" />
                        {system.defaultEmulator.name}
                      </span>
                    )}
                  </div>

                  {/* Extensions */}
                  <div className="mt-3">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                      Formatos aceitos:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {system.extensions.slice(0, 4).map((ext) => (
                        <span
                          key={ext}
                          className="rounded-md border border-white/5 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          {ext}
                        </span>
                      ))}
                      {system.extensions.length > 4 && (
                        <span className="rounded-md border border-white/5 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                          +{system.extensions.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer link */}
                <div className="mt-5 pt-3 border-t border-white/5">
                  <Link
                    href={`/wiki/${system.slug}`}
                    className="inline-flex w-full items-center justify-between text-xs font-semibold text-muted-foreground transition-colors group-hover:text-primary"
                  >
                    <span>Instruções e detalhes</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-black/40 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Sistema</th>
                  <th scope="col" className="px-5 py-3.5">Pasta ROMs</th>
                  <th scope="col" className="px-5 py-3.5">Extensões</th>
                  <th scope="col" className="px-5 py-3.5">BIOS</th>
                  <th scope="col" className="px-5 py-3.5">Emulador padrão</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSystems.map((system) => (
                  <tr
                    key={system.id}
                    className="transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {system.logo && (
                          <div className="relative h-6 w-12 flex-shrink-0">
                            <Image
                              src={system.logo}
                              alt=""
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/wiki/${system.slug}`}
                              className="font-bold text-foreground hover:text-primary transition-colors"
                            >
                              {system.name}
                            </Link>
                            {system.isCustomRiescade && (
                              <span className="rounded bg-primary/20 px-1 py-0.2 font-mono text-[9px] font-bold text-primary">
                                MOD
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {system.manufacturer}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-black/40 px-2 py-1 font-mono text-xs text-primary border border-white/10">
                          {system.folderPath}
                        </code>
                        <button
                          onClick={() => copyToClipboard(system.folderPath)}
                          className="rounded p-1 text-muted-foreground hover:text-primary transition-colors"
                          title="Copiar pasta"
                        >
                          {copiedFolder === system.folderPath ? (
                            <Check className="h-3.5 w-3.5 text-green-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {system.extensions.slice(0, 3).map((ext) => (
                          <span
                            key={ext}
                            className="rounded border border-white/5 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
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

                    <td className="px-5 py-4">
                      {system.biosRequired ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400 border border-amber-500/30">
                          <AlertCircle className="h-3 w-3" />
                          Requer BIOS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" />
                          Dispensada
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                      {system.defaultEmulator?.name || "Padrão"}
                      {system.defaultEmulator?.core && (
                        <span className="block text-[10px] text-muted-foreground/70">
                          core: {system.defaultEmulator.core}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/wiki/${system.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        Guia
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

      {filteredSystems.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-card/40 p-12 text-center">
          <Gamepad2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-bold text-foreground">Nenhum sistema encontrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Tente buscar com outro termo ou selecione a categoria &ldquo;Todos os sistemas&rdquo;.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("all");
            }}
            className="mt-5 rounded-xl border border-primary/50 bg-primary/10 px-5 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-all"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
