import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { KIND_ORDER, PLATFORMS, getPlatformGameCounts } from "@/lib/platforms";
import { PLATFORM_KIND_LABELS } from "@/data/platform-content";
import { Gamepad2, ArrowRight } from "lucide-react";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Mais de 250 consoles, arcades e computadores para jogar no PC — RIESCADE",
  description:
    "Todas as plataformas do RIESCADE: Super Nintendo, Mega Drive, PlayStation, Nintendo 64, arcades Neo Geo e CPS, computadores clássicos e muito mais, para jogar no Windows.",
  alternates: { canonical: "/platforms" },
};

const SECTION_LABELS: Record<string, string> = {
  console: "Consoles de mesa",
  portable: "Portáteis",
  arcade: "Arcades",
  computer: "Computadores",
  peripheral: "Acessórios e expansões",
  engine: "Engines e fantasy consoles",
  system: "Sistemas",
  collection: "Coleções",
};

export default async function PlatformsPage() {
  const counts = await getPlatformGameCounts();
  const featured = PLATFORMS.filter((p) => p.indexable);
  const sections = KIND_ORDER.map((kind) => ({
    kind,
    items: featured
      .filter((p) => p.content?.kind === kind)
      .sort((a, b) => (a.content?.year ?? 9999) - (b.content?.year ?? 9999)),
  })).filter((section) => section.items.length > 0);

  return (
    <div className="site-page relative flex min-h-screen flex-col bg-background">
      <Header />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 mx-auto w-full max-w-7xl flex-grow px-6 pb-24 pt-28 md:px-12"
      >
        {/* Breadcrumb Clean */}
        <nav aria-label="Navegação estrutural" className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Início
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground">Plataformas</span>
        </nav>

        {/* Header no estilo Lovable */}
        <header className="pb-10 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 border border-primary/30 px-2.5 py-1 font-mono text-[11px] font-bold text-primary">
              <Gamepad2 className="h-3 w-3" />
              Catálogo de Sistemas
            </span>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              +250 Plataformas Catalogadas
            </p>
          </div>

          <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="max-w-4xl font-display text-4xl font-extrabold tracking-tight md:text-6xl text-foreground">
                Mais de 250 plataformas para <span className="text-primary">jogar no PC</span>
              </h1>
              <p className="mt-4 max-w-3xl text-lg text-muted-foreground leading-relaxed">
                Consoles, portáteis, arcades e computadores clássicos reunidos em uma única biblioteca com emuladores
                configurados, capas, mídias e downloads integrados no RIESCADE para Windows.
              </p>
            </div>

            <Link
              href="/tutorial"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 font-mono text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary flex-shrink-0 self-start md:self-auto"
            >
              <span>Como começar a jogar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Categorias Pills minimalistas */}
          <nav aria-label="Tipos de plataforma" className="mt-8 flex flex-wrap gap-1.5 border-t border-border/60 pt-6">
            {sections.map(({ kind, items }) => (
              <a
                key={kind}
                href={`#${kind}`}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                <span>{SECTION_LABELS[kind]}</span>
                <span className="text-[10px] text-primary font-bold">({items.length})</span>
              </a>
            ))}
          </nav>
        </header>

        {/* Seções por categoria */}
        {sections.map(({ kind, items }) => (
          <section key={kind} id={kind} aria-labelledby={`${kind}-title`} className="mb-14 scroll-mt-28">
            <div className="flex items-center gap-3 border-b border-border/60 pb-3 mb-6">
              <span className="font-mono text-xs font-semibold text-primary uppercase tracking-wider">
                {items.length} sistemas
              </span>
              <span className="text-border">/</span>
              <h2 id={`${kind}-title`} className="font-display text-xl font-bold uppercase tracking-tight text-foreground md:text-2xl">
                {SECTION_LABELS[kind] ?? PLATFORM_KIND_LABELS[kind]}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((platform) => {
                const games = counts[platform.slug] ?? 0;
                const art = platform.image ?? platform.logo;

                return (
                  <Link
                    key={platform.slug}
                    href={`/platforms/${platform.slug}`}
                    className="group flex flex-col justify-between overflow-hidden rounded-lg border border-border bg-card p-3.5 transition-all duration-200 hover:border-primary/50 hover:bg-card/90"
                  >
                    <div className="relative aspect-[4/3] rounded bg-background/60 p-3 mb-3 flex items-center justify-center overflow-hidden">
                      {art ? (
                        <Image
                          src={art}
                          alt={platform.name}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
                          className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <Gamepad2 className="h-10 w-10 text-muted-foreground/40" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate leading-tight">
                        {platform.name}
                      </h3>
                      <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                        <span>{[platform.content?.maker, platform.content?.year].filter(Boolean).join(" · ") || "Sistema"}</span>
                        {games > 0 && <span className="text-primary font-bold">{games.toLocaleString("pt-BR")}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <Footer />
    </div>
  );
}
