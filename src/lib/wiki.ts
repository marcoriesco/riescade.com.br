import wikiSystemsJson from "@/data/wiki-systems.json";

export interface WikiEmulator {
  name: string;
  cores: string[];
}

export interface WikiCodeSnippet {
  code: string;
  language: string;
  filename?: string;
  description?: string;
}

export interface WikiTable {
  headers: string[];
  rows: string[][];
}

export interface WikiCallout {
  type: "info" | "warning" | "tip" | "danger";
  title?: string;
  text: string;
}

export interface WikiStep {
  stepNumber?: number;
  title: string;
  text: string;
  code?: string;
  codeLang?: string;
}

export interface WikiSection {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  callout?: WikiCallout;
  snippets?: WikiCodeSnippet[];
  table?: WikiTable;
  steps?: WikiStep[];
}

export interface WikiSystem {
  id: string;
  slug: string;
  name: string;
  fullname: string;
  manufacturer: string;
  hardware: string;
  release: string | null;
  folder: string;
  folderPath: string;
  extensions: string[];
  recommendedFormat: string;
  biosRequired: boolean;
  biosFiles: string[];
  biosNotes: string | null;
  defaultEmulator: {
    name: string;
    core?: string | null;
  } | null;
  emulators: WikiEmulator[];
  platform: string;
  theme: string;
  isCustomRiescade: boolean;
  summary: string;
  logo: string | null;
  image: string | null;
  notes: string[];
  instructions: string[];
  sections?: WikiSection[];
}

export const WIKI_SYSTEMS: WikiSystem[] = wikiSystemsJson as WikiSystem[];

export const HARDWARE_LABELS: Record<string, string> = {
  all: "Todos os sistemas",
  custom: "Exclusivos RIESCADE",
  console: "Consoles de mesa",
  portable: "Portáteis",
  arcade: "Arcade & Dumps",
  computer: "Computadores clássicos",
  port: "Ports & Recompilações",
  pinball: "Pinball",
  engine: "Engines & Outros",
};

export function getAllWikiSystems(): WikiSystem[] {
  return WIKI_SYSTEMS;
}

export function getWikiSystem(slug: string): WikiSystem | undefined {
  const normalized = slug.toLowerCase();
  return WIKI_SYSTEMS.find(
    (s) => s.slug.toLowerCase() === normalized || s.id.toLowerCase() === normalized || s.folder.toLowerCase() === normalized
  );
}

export function getCustomRiescadeSystems(): WikiSystem[] {
  return WIKI_SYSTEMS.filter((s) => s.isCustomRiescade);
}

export function getRelatedWikiSystems(system: WikiSystem, limit = 6): WikiSystem[] {
  return WIKI_SYSTEMS.filter(
    (other) =>
      other.id !== system.id &&
      (other.manufacturer === system.manufacturer || other.hardware === system.hardware)
  ).slice(0, limit);
}
