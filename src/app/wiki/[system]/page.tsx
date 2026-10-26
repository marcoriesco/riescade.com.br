import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { CopyPathButton } from "@/components/wiki/CopyPathButton";
import {
  getAllWikiSystems,
  getWikiSystem,
  getRelatedWikiSystems,
  HARDWARE_LABELS,
} from "@/lib/wiki";
import {
  Folder,
  Cpu,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Gamepad2,
  Info,
} from "lucide-react";

export const revalidate = 86400;

const SITE_URL = "https://www.riescade.com.br";

export function generateStaticParams() {
  return getAllWikiSystems().map((system) => ({ system: system.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ system: string }>;
}): Promise<Metadata> {
  const { system: slug } = await params;
  const system = getWikiSystem(slug);
  if (!system) return { title: "Sistema não encontrado - Wiki RIESCADE", robots: { index: false } };

  const title = `Como instalar ROMs de ${system.name} no RIESCADE - Wiki`;
  const description = `Guia completo de instalação de ${system.name} no RIESCADE: pasta ${system.folderPath}, extensões ${system.extensions.slice(0, 5).join(", ")}, requisitos de BIOS e emuladores.`;
  const image = system.logo || system.image || "/images/og-image.webp";

  return {
    title,
    description,
    alternates: { canonical: `/wiki/${system.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE_URL}/wiki/${system.slug}`,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function WikiSystemPage({
  params,
}: {
  params: Promise<{ system: string }>;
}) {
  const { system: slug } = await params;
  const system = getWikiSystem(slug);
  if (!system) notFound();

  const related = getRelatedWikiSystems(system);
  const hardwareLabel = HARDWARE_LABELS[system.hardware] || system.hardware;

  return (
    <div className="site-page relative flex min-h-screen flex-col bg-background">
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12)_0%,transparent_65%)]" />
      <Header />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 mx-auto w-full max-w-5xl flex-grow px-6 pb-24 pt-32 md:px-12"
      >
        {/* Breadcrumb Navigation */}
        <nav aria-label="Navegação estrutural" className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Início
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/wiki" className="hover:text-primary transition-colors">
            Wiki
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate">{system.name}</span>
        </nav>

        {/* System Header */}
        <div className="rounded-3xl border border-white/10 bg-card/60 p-6 md:p-10 backdrop-blur-md shadow-xl shadow-black/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {system.isCustomRiescade && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 border border-primary/40 px-2.5 py-0.5 font-mono text-[11px] font-bold text-primary">
                    <Sparkles className="h-3 w-3" />
                    Exclusivo RIESCADE
                  </span>
                )}
                <span className="rounded-full bg-white/5 border border-white/10 px-3 py-0.5 font-mono text-xs text-muted-foreground">
                  {hardwareLabel}
                </span>
                {system.release && (
                  <span className="rounded-full bg-white/5 border border-white/10 px-3 py-0.5 font-mono text-xs text-muted-foreground">
                    Ano: {system.release}
                  </span>
                )}
                <span className="rounded-full bg-white/5 border border-white/10 px-3 py-0.5 font-mono text-xs text-muted-foreground">
                  {system.manufacturer}
                </span>
              </div>

              <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
                Como instalar ROMs de <span className="text-gradient-primary">{system.name}</span>
              </h1>

              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-3xl">
                {system.summary}
              </p>
            </div>

            {system.logo && (
              <div className="relative h-20 w-36 flex-shrink-0 self-center md:self-start bg-black/30 p-2 rounded-2xl border border-white/5">
                <Image
                  src={system.logo}
                  alt={`Logo de ${system.name}`}
                  fill
                  sizes="144px"
                  className="object-contain p-1"
                  priority
                />
              </div>
            )}
          </div>

          {/* Big Folder Location Card */}
          <div className="mt-8 rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/15 via-black/40 to-primary/5 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-black flex-shrink-0 shadow-md">
                  <Folder className="h-6 w-6" />
                </div>
                <div>
                  <span className="block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Pasta de instalação no PC:
                  </span>
                  <div className="mt-0.5 font-mono text-base md:text-lg font-bold text-foreground select-all">
                    {system.folderPath}
                  </div>
                </div>
              </div>

              <CopyPathButton path={system.folderPath} className="self-start sm:self-auto" />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {/* Main Info Column (2 cols) */}
          <div className="space-y-8 md:col-span-2">
            {/* Step-by-step Guide */}
            <section aria-labelledby="steps-title" className="rounded-3xl border border-white/10 bg-card/40 p-6 md:p-8 backdrop-blur-sm">
              <h2 id="steps-title" className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary text-sm font-mono font-bold">
                  1
                </span>
                Passo a Passo de Instalação
              </h2>

              <ol className="mt-6 space-y-4">
                {system.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-mono font-semibold text-primary flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            {/* Formats and Extensions */}
            <section aria-labelledby="formats-title" className="rounded-3xl border border-white/10 bg-card/40 p-6 md:p-8 backdrop-blur-sm">
              <h2 id="formats-title" className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary text-sm font-mono font-bold">
                  2
                </span>
                Formatos & Extensões Aceitas
              </h2>

              {/* Recommended format callout */}
              <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <span className="block font-mono text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
                  Formato recomendado:
                </span>
                <p className="mt-1 font-bold text-base text-foreground">
                  {system.recommendedFormat}
                </p>
              </div>

              {/* All accepted extensions */}
              <div className="mt-5">
                <span className="block text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">
                  Todas as extensões suportadas pelo emulador:
                </span>
                <div className="flex flex-wrap gap-2">
                  {system.extensions.map((ext) => (
                    <span
                      key={ext}
                      className="rounded-lg border border-white/10 bg-black/40 px-3 py-1 font-mono text-xs text-foreground"
                    >
                      {ext}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Special notes & tips */}
            {system.notes.length > 0 && (
              <section aria-labelledby="notes-title" className="rounded-3xl border border-white/10 bg-card/40 p-6 md:p-8 backdrop-blur-sm">
                <h2 id="notes-title" className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary text-sm font-mono font-bold">
                    3
                  </span>
                  Dicas e Particularidades
                </h2>

                <div className="mt-6 space-y-3">
                  {system.notes.map((note, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-2xl border border-white/5 bg-black/30 p-4 text-sm text-foreground/90 leading-relaxed"
                    >
                      <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Column (1 col) */}
          <div className="space-y-6">
            {/* BIOS Requirements Card */}
            <div className="rounded-3xl border border-white/10 bg-card/50 p-6 backdrop-blur-sm">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                Requisitos de BIOS
              </h3>

              <div className="mt-4">
                {system.biosRequired ? (
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-400">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Obrigatória para iniciar
                    </span>

                    {system.biosFiles.length > 0 && (
                      <div className="mt-3">
                        <span className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                          Arquivos necessários:
                        </span>
                        <ul className="space-y-1">
                          {system.biosFiles.map((file) => (
                            <li
                              key={file}
                              className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-xs text-foreground break-all"
                            >
                              {file}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {system.biosNotes && (
                      <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                        {system.biosNotes}
                      </p>
                    )}

                    <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs text-muted-foreground">
                      💡 <strong className="text-foreground">Dica RIESCADE:</strong> Assinantes instalam o pack completo de BIOS com 1 clique pelo menu de downloads do aplicativo.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Dispensada / Emulação HLE
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Este sistema não exige arquivos de BIOS para rodar jogos. O emulador inicia suas ROMs imediatamente.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Emulators Card */}
            <div className="rounded-3xl border border-white/10 bg-card/50 p-6 backdrop-blur-sm">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                Emuladores no RIESCADE
              </h3>

              <div className="mt-4 space-y-4">
                {system.defaultEmulator && (
                  <div>
                    <span className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                      Emulador padrão:
                    </span>
                    <p className="mt-1 font-mono text-sm font-bold text-primary">
                      {system.defaultEmulator.name}
                      {system.defaultEmulator.core && (
                        <span className="block font-normal text-xs text-muted-foreground">
                          Core: {system.defaultEmulator.core}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {system.emulators.length > 1 && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                      Emuladores alternativos:
                    </span>
                    <div className="space-y-2">
                      {system.emulators
                        .filter((e) => e.name !== system.defaultEmulator?.name)
                        .map((emu) => (
                          <div
                            key={emu.name}
                            className="rounded-xl border border-white/5 bg-black/30 p-2 text-xs font-mono"
                          >
                            <span className="text-foreground font-semibold">{emu.name}</span>
                            {emu.cores.length > 0 && (
                              <span className="block text-[11px] text-muted-foreground mt-0.5">
                                Cores: {emu.cores.slice(0, 3).join(", ")}
                                {emu.cores.length > 3 ? "..." : ""}
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground/80 leading-relaxed pt-2 border-t border-white/5">
                  Para trocar o emulador no RIESCADE, selecione o jogo, pressione <kbd className="font-mono text-[10px] text-foreground">X</kbd> (ou botão de opções do controle) e acesse <strong className="text-foreground">Opções Avançadas do Jogo → Emulador</strong>.
                </p>
              </div>
            </div>

            {/* Back link */}
            <div className="pt-2">
              <Link
                href="/wiki"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar para a Wiki</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Related Systems */}
        {related.length > 0 && (
          <section aria-labelledby="related-title" className="mt-20 border-t border-white/10 pt-12">
            <h2 id="related-title" className="text-lg font-bold tracking-tight text-foreground mb-6">
              Outros sistemas {system.manufacturer !== "Vários" ? `da ${system.manufacturer}` : `da categoria ${hardwareLabel}`}
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/wiki/${item.slug}`}
                  className="group flex flex-col items-center text-center rounded-2xl border border-white/10 bg-card/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-card/70"
                >
                  <div className="relative h-12 w-20 mb-3">
                    {item.logo ? (
                      <Image
                        src={item.logo}
                        alt=""
                        fill
                        className="object-contain transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <Gamepad2 className="h-8 w-8 text-muted-foreground mx-auto" />
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <span className="font-mono text-[10px] text-muted-foreground mt-1">
                    {item.folderPath}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
