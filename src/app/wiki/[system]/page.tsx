import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { CopyPathButton } from "@/components/wiki/CopyPathButton";
import { CodeBlock } from "@/components/wiki/CodeBlock";
import {
  getAllWikiSystems,
  getWikiSystem,
  getRelatedWikiSystems,
  HARDWARE_LABELS,
  WikiSection,
} from "@/lib/wiki";
import {
  Sparkles,
  Gamepad2,
  AlertCircle,
} from "lucide-react";

export const revalidate = 86400;

const SITE_URL = "https://www.riescade.com.br";

export function generateStaticParams() {
  const params: { system: string }[] = [];
  const seen = new Set<string>();
  for (const s of getAllWikiSystems()) {
    if (!seen.has(s.slug)) {
      seen.add(s.slug);
      params.push({ system: s.slug });
    }
    if (s.id && !seen.has(s.id)) {
      seen.add(s.id);
      params.push({ system: s.id });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ system: string }>;
}): Promise<Metadata> {
  const { system: slug } = await params;
  const system = getWikiSystem(slug);
  if (!system) return { title: "Sistema não encontrado - Wiki RIESCADE", robots: { index: false } };

  const title = `Como instalar jogos de ${system.name} — Wiki RIESCADE`;
  const description = `Guia completo para adicionar jogos de ${system.name} ao RIESCADE: pasta ${system.folderPath}, extensões ${system.extensions.slice(0, 5).join(", ")}, BIOS e emuladores.`;
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

  // Build the unified sections list for page & sidebar table of contents
  interface NavSection {
    id: string;
    title: string;
    type: "custom" | "instructions" | "formats" | "bios" | "emulators" | "notes";
    customSection?: WikiSection;
  }

  const navSections: NavSection[] = [];

  if (system.sections && system.sections.length > 0) {
    system.sections.forEach((s) => {
      navSections.push({
        id: s.id,
        title: s.title,
        type: "custom",
        customSection: s,
      });
    });
  }

  // Standard instructions section
  if (system.instructions && system.instructions.length > 0) {
    navSections.push({
      id: "resumo",
      title: system.sections && system.sections.length > 0 ? "Resumo" : "Passo a passo",
      type: "instructions",
    });
  }

  // Formats section
  if (system.extensions && system.extensions.length > 0) {
    navSections.push({
      id: "formatos",
      title: "Formatos aceitos",
      type: "formats",
    });
  }

  // BIOS section (if required or has files)
  if (system.biosRequired || system.biosFiles.length > 0) {
    navSections.push({
      id: "bios",
      title: "Requisitos de BIOS",
      type: "bios",
    });
  }

  // Emulators section (if multiple emulators)
  if (system.emulators && system.emulators.length > 1) {
    navSections.push({
      id: "emuladores",
      title: "Emuladores e configurações",
      type: "emulators",
    });
  }

  // Tips and notes section
  if (system.notes && system.notes.length > 0 && (!system.sections || system.sections.length === 0)) {
    navSections.push({
      id: "dicas",
      title: "Dicas e particularidades",
      type: "notes",
    });
  }

  return (
    <div className="site-page relative min-h-screen bg-background">
      <Header />

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-6 pt-24 pb-28">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Navegação estrutural" className="pt-10 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Início
          </Link>
          <span className="mx-2">/</span>
          <Link href="/wiki" className="hover:text-foreground transition-colors">
            Wiki
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{system.name}</span>
        </nav>

        {/* System Header */}
        <header className="pb-12 pt-8">
          <div className="flex flex-wrap items-center gap-2">
            {system.isCustomRiescade && (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 border border-primary/30 px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
                <Sparkles className="h-3 w-3" />
                Exclusivo RIESCADE
              </span>
            )}
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {[hardwareLabel, system.release, system.manufacturer !== "Vários" ? system.manufacturer : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>

          <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="max-w-3xl font-display text-4xl font-extrabold tracking-tight md:text-6xl text-foreground">
                Como instalar jogos de <span className="text-primary">{system.name}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                {system.summary}
              </p>
            </div>

            {system.logo && (
              <div className="relative h-16 w-36 flex-shrink-0 self-start md:self-auto">
                <Image
                  src={system.logo}
                  alt={`Logo de ${system.name}`}
                  fill
                  unoptimized
                  sizes="144px"
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </div>

          {/* Quick Info Grid 3 Cols (Lovable hairline style) */}
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg bg-border text-sm sm:grid-cols-3 [&>div]:bg-card [&>div]:px-5 [&>div]:py-4">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-mono">Pasta</p>
              <p className="mt-1 flex items-center gap-3 font-mono text-base text-foreground">
                {system.folderPath}
                <CopyPathButton path={system.folderPath} label="Copiar" />
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-mono">BIOS</p>
              <p className={`mt-1 text-base font-semibold ${system.biosRequired ? "text-amber-400" : "text-emerald-400"}`}>
                {system.biosRequired ? "Obrigatória" : "Não necessária"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-mono">Emulador padrão</p>
              <p className="mt-1 font-mono text-base text-foreground">
                {system.defaultEmulator?.name || "windows"}
              </p>
            </div>
          </div>
        </header>

        {/* 2-Column Layout: Main Article and Sticky "Nesta página" Sidebar */}
        <div className="grid gap-16 lg:grid-cols-[1fr_220px]">
          {/* Main Content Article */}
          <article className="max-w-3xl divide-y divide-border/60">
            {navSections.map((nav, sIdx) => {
              const sectionNum = String(sIdx + 1).padStart(2, "0");

              // 1. Custom Detailed Section (e.g. Windows stores, .game, .uwp, .gameexe, PSX m3u, etc.)
              if (nav.type === "custom" && nav.customSection) {
                const s = nav.customSection;
                return (
                  <section
                    key={s.id || sIdx}
                    id={s.id}
                    className="scroll-mt-24 py-12 first:border-t-0 first:pt-4"
                  >
                    <p className="font-mono text-xs text-primary">{sectionNum}</p>
                    <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl text-foreground">
                      {s.title}
                    </h2>

                    <div className="mt-4 leading-7 text-muted-foreground [&_strong]:text-foreground">
                      {s.description && <p>{s.description}</p>}

                      {/* Callout */}
                      {s.callout && (
                        <div className="mt-6 border-l-2 border-primary pl-4">
                          {s.callout.title && (
                            <p className="font-semibold text-foreground">{s.callout.title}</p>
                          )}
                          <p className="mt-1 text-muted-foreground leading-relaxed">{s.callout.text}</p>
                        </div>
                      )}

                      {/* Steps with vertical connecting line */}
                      {s.steps && s.steps.length > 0 && (
                        <ol className="mt-6">
                          {s.steps.map((st, stepIdx) => {
                            const isLast = stepIdx === s.steps!.length - 1;
                            return (
                              <li key={stepIdx} className="relative grid grid-cols-[2rem_1fr] gap-3 pb-6 last:pb-0">
                                {!isLast && (
                                  <span className="absolute bottom-0 left-[0.7rem] top-7 w-px bg-border" />
                                )}
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 font-mono text-xs text-primary">
                                  {st.stepNumber || stepIdx + 1}
                                </span>
                                <div>
                                  <p className="font-semibold text-foreground">{st.title}</p>
                                  <p className="mt-1 text-muted-foreground leading-relaxed">{st.text}</p>
                                  {st.code && (
                                    <div className="mt-3">
                                      <CodeBlock code={st.code} language={st.codeLang || "text"} />
                                    </div>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ol>
                      )}

                      {/* Code Snippets */}
                      {s.snippets && s.snippets.length > 0 && (
                        <div className="space-y-4">
                          {s.snippets.map((snip, snipIdx) => (
                            <CodeBlock
                              key={snipIdx}
                              code={snip.code}
                              language={snip.language}
                              filename={snip.filename}
                              description={snip.description}
                            />
                          ))}
                        </div>
                      )}

                      {/* Table */}
                      {s.table && (
                        <div className="mt-6 overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border/40">
                              <tr>
                                {s.table.headers.map((h, i) => (
                                  <th key={i} className="pb-3 font-normal">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 font-mono">
                              {s.table.rows.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  {row.map((cell, cIdx) => (
                                    <td
                                      key={cIdx}
                                      className={`py-3 ${
                                        cIdx === 0
                                          ? "font-sans text-foreground font-medium"
                                          : cIdx === row.length - 1
                                          ? "text-primary"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </section>
                );
              }

              // 2. Instructions / Summary Section (Clean connected list)
              if (nav.type === "instructions") {
                return (
                  <section
                    key="resumo"
                    id="resumo"
                    className="scroll-mt-24 py-12 first:border-t-0 first:pt-4"
                  >
                    <p className="font-mono text-xs text-primary">{sectionNum}</p>
                    <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl text-foreground">
                      {nav.title}
                    </h2>
                    <div className="mt-4 leading-7 text-muted-foreground [&_strong]:text-foreground">
                      <ol className="mt-6">
                        {system.instructions.map((step, idx) => {
                          const isLast = idx === system.instructions.length - 1;
                          return (
                            <li key={idx} className="relative grid grid-cols-[2rem_1fr] gap-3 pb-6 last:pb-0">
                              {!isLast && (
                                <span className="absolute bottom-0 left-[0.7rem] top-7 w-px bg-border" />
                              )}
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 font-mono text-xs text-primary">
                                {idx + 1}
                              </span>
                              <div>
                                <p className="text-muted-foreground leading-relaxed">{step}</p>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </section>
                );
              }

              // 3. Accepted Formats Section
              if (nav.type === "formats") {
                return (
                  <section
                    key="formatos"
                    id="formatos"
                    className="scroll-mt-24 py-12 first:border-t-0 first:pt-4"
                  >
                    <p className="font-mono text-xs text-primary">{sectionNum}</p>
                    <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl text-foreground">
                      Formatos aceitos
                    </h2>
                    <div className="mt-4 leading-7 text-muted-foreground [&_strong]:text-foreground">
                      {system.recommendedFormat && (
                        <p className="mb-4">
                          Formato recomendado:{" "}
                          <strong className="font-mono text-primary">{system.recommendedFormat}</strong>
                        </p>
                      )}
                      <p className="font-mono text-sm leading-8">
                        {system.extensions.map((ext) => (
                          <span key={ext} className="mr-4 text-foreground">
                            {ext}
                          </span>
                        ))}
                      </p>
                    </div>
                  </section>
                );
              }

              // 4. BIOS Requirements Section
              if (nav.type === "bios") {
                return (
                  <section
                    key="bios"
                    id="bios"
                    className="scroll-mt-24 py-12 first:border-t-0 first:pt-4"
                  >
                    <p className="font-mono text-xs text-primary">{sectionNum}</p>
                    <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl text-foreground">
                      Requisitos de BIOS
                    </h2>
                    <div className="mt-4 leading-7 text-muted-foreground [&_strong]:text-foreground">
                      {system.biosRequired ? (
                        <div>
                          <p>
                            Este sistema exige arquivos de BIOS para inicializar os jogos com compatibilidade total.
                          </p>
                          {system.biosFiles.length > 0 && (
                            <ul className="mt-4 space-y-2 font-mono text-sm">
                              {system.biosFiles.map((file) => (
                                <li key={file} className="flex items-center gap-2 text-foreground">
                                  <AlertCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                  <span>{file}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {system.biosNotes && (
                            <p className="mt-4 text-sm text-muted-foreground">{system.biosNotes}</p>
                          )}
                          <div className="mt-6 border-l-2 border-primary pl-4">
                            <p className="font-semibold text-foreground">Instalação automática</p>
                            <p className="mt-1 text-muted-foreground">
                              Membros RIESCADE instalam o pacote completo de BIOS com 1 clique pela Central de Downloads.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p>
                          Este sistema não exige arquivos de BIOS externos. O emulador inicia as ROMs imediatamente via HLE.
                        </p>
                      )}
                    </div>
                  </section>
                );
              }

              // 5. Emulators Section
              if (nav.type === "emulators") {
                return (
                  <section
                    key="emuladores"
                    id="emuladores"
                    className="scroll-mt-24 py-12 first:border-t-0 first:pt-4"
                  >
                    <p className="font-mono text-xs text-primary">{sectionNum}</p>
                    <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl text-foreground">
                      Emuladores e configurações
                    </h2>
                    <div className="mt-4 leading-7 text-muted-foreground [&_strong]:text-foreground">
                      <p>
                        Emulador padrão:{" "}
                        <strong className="font-mono text-primary">
                          {system.defaultEmulator?.name}
                          {system.defaultEmulator?.core ? ` (${system.defaultEmulator.core})` : ""}
                        </strong>
                      </p>

                      <div className="mt-6 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border/40">
                            <tr>
                              <th className="pb-3 font-normal">Emulador</th>
                              <th className="pb-3 font-normal">Cores Disponíveis</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40 font-mono">
                            {system.emulators.map((emu, eIdx) => (
                              <tr key={eIdx}>
                                <td className="py-3 font-sans font-medium text-foreground">{emu.name}</td>
                                <td className="py-3 text-muted-foreground">
                                  {emu.cores.length > 0 ? emu.cores.join(", ") : "Standalone"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-6 border-l-2 border-primary pl-4">
                        <p className="font-semibold text-foreground">Como trocar de emulador</p>
                        <p className="mt-1 text-muted-foreground">
                          No menu de jogos do RIESCADE, pressione X (ou botão de opções do controle) sobre o título e acesse Opções Avançadas do Jogo → Emulador.
                        </p>
                      </div>
                    </div>
                  </section>
                );
              }

              // 6. Notes Section
              if (nav.type === "notes") {
                return (
                  <section
                    key="dicas"
                    id="dicas"
                    className="scroll-mt-24 py-12 first:border-t-0 first:pt-4"
                  >
                    <p className="font-mono text-xs text-primary">{sectionNum}</p>
                    <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl text-foreground">
                      Dicas e particularidades
                    </h2>
                    <div className="mt-4 leading-7 text-muted-foreground [&_strong]:text-foreground space-y-4">
                      {system.notes.map((n, nIdx) => (
                        <div key={nIdx} className="border-l-2 border-primary pl-4">
                          <p>{n}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              return null;
            })}
          </article>

          {/* Sticky Right Sidebar "Nesta página" */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 border-l border-border pl-5 pt-2">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Nesta página
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {navSections.map((nav) => (
                  <li key={nav.id}>
                    <a
                      href={`#${nav.id}`}
                      className="text-muted-foreground transition-colors hover:text-primary block leading-snug"
                    >
                      {nav.title}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-border/60">
                <Link
                  href="/wiki"
                  className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  ← Todos os sistemas
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Systems in the bottom */}
        {related.length > 0 && (
          <section aria-labelledby="related-title" className="mt-24 border-t border-border pt-12">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Explorar mais
            </p>
            <h2 id="related-title" className="text-xl font-bold tracking-tight text-foreground mb-8">
              Outros sistemas {system.manufacturer !== "Vários" ? `da ${system.manufacturer}` : `de ${hardwareLabel}`}
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/wiki/${item.slug}`}
                  className="group flex flex-col justify-between rounded-lg border border-border/80 bg-card p-4 transition-all duration-200 hover:border-primary/50 hover:bg-card/70"
                >
                  <div className="relative h-12 w-full mb-3 flex items-center justify-center">
                    {item.logo ? (
                      <Image
                        src={item.logo}
                        alt=""
                        fill
                        unoptimized
                        sizes="96px"
                        className="object-contain transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <Gamepad2 className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <span className="font-mono text-[10px] text-muted-foreground mt-1 block truncate">
                      {item.folderPath}
                    </span>
                  </div>
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
