import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { WikiExplorer } from "@/components/wiki/WikiExplorer";
import { getAllWikiSystems } from "@/lib/wiki";
import {
  FolderArchive,
  Sparkles,
  FileCheck2,
  RefreshCw,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Wiki de Instalação de ROMs e Sistemas — RIESCADE",
  description:
    "Guia completo de instalação de ROMs no RIESCADE: pastas corretas, extensões aceitas (.chd, .iso, .zip, .game), BIOS necessárias e emuladores para mais de 240 sistemas.",
  alternates: { canonical: "/wiki" },
  openGraph: {
    title: "Wiki de Instalação de ROMs e Sistemas — RIESCADE",
    description:
      "Guia completo de pastas, extensões e requisitos de BIOS para instalar jogos no RIESCADE.",
    type: "website",
    url: "https://www.riescade.com.br/wiki",
  },
};

const WIKI_FAQS = [
  {
    q: "Onde fica a pasta de ROMs no meu computador?",
    a: "Dentro do diretório onde você extraiu o RIESCADE (por exemplo, C:\\RIESCADE\\roms\\). Cada sistema possui sua própria subpasta dedicada, como \\roms\\snes\\, \\roms\\psx\\, \\roms\\windows\\, etc.",
  },
  {
    q: "Por que o formato CHD (.chd) é tão recomendado?",
    a: "O formato CHD compacta imagens de CD e DVD sem perda de qualidade, eliminando múltiplos arquivos .bin/.cue e reduzindo o consumo de disco em até 60%. O DuckStation (PS1), PCSX2 (PS2), Flycast (Dreamcast) e Beetle Saturn rodam .chd nativamente.",
  },
  {
    q: "Como organizar jogos de vários discos (multidisco)?",
    a: "Para jogos como Final Fantasy VII (3 CDs) ou Metal Gear Solid (2 CDs), crie um arquivo de texto com a extensão .m3u com o nome do jogo (ex: Final Fantasy VII.m3u). Dentro dele, liste o nome exato dos arquivos de cada disco, um por linha. Dessa forma, seus saves funcionam em todos os discos.",
  },
  {
    q: "Como instalar os sistemas exclusivos como Arcade Dumps e PGM3 Viper?",
    a: "Consulte os guias específicos de Arcade Dumps e PGM3 / Viper na Wiki. Esses sistemas utilizam executáveis próprios (LinuxLoader e Kitsune) e exigem que os arquivos disparadores (.bat ou .game) estejam na raiz da respectiva pasta.",
  },
];

export default function WikiPage() {
  const systems = getAllWikiSystems();

  return (
    <div className="site-page relative flex min-h-screen flex-col bg-background">
      <Header />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 mx-auto w-full max-w-7xl flex-grow px-6 pb-24 pt-28 md:px-12"
      >
        {/* Breadcrumb Clean Lovable */}
        <nav aria-label="Navegação estrutural" className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Início
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground">Wiki</span>
        </nav>

        {/* Wiki Header */}
        <header className="pb-10 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 border border-primary/30 px-2.5 py-1 font-mono text-[11px] font-bold text-primary">
              <BookOpen className="h-3 w-3" />
              Documentação Oficial
            </span>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              +240 Sistemas Catalogados · Formatos & Pastas
            </p>
          </div>

          <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="max-w-4xl font-display text-4xl font-extrabold tracking-tight md:text-6xl text-foreground">
                Wiki de Instalação de <span className="text-primary">ROMs & Sistemas</span>
              </h1>
              <p className="mt-4 max-w-3xl text-lg text-muted-foreground leading-relaxed">
                Consulte a pasta exata de cada console, extensões recomendadas, BIOS necessárias e os emuladores
                configurados no RIESCADE para adicionar suas próprias ROMs e jogos no PC.
              </p>
            </div>

            <Link
              href="/tutorial"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 font-mono text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary flex-shrink-0 self-start md:self-auto"
            >
              <span>Ver tutorial de instalação</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Quick 3-Step Overview (Lovable hairline style) */}
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg bg-border text-sm sm:grid-cols-3 [&>div]:bg-card [&>div]:px-5 [&>div]:py-4">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                <FolderArchive className="h-3.5 w-3.5 text-primary" />
                1. Pasta exata
              </p>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Cada sistema possui uma subpasta própria dentro de <code className="font-mono text-primary">roms\</code> (ex: <code className="font-mono text-foreground">roms\snes\</code>, <code className="font-mono text-foreground">roms\psx\</code>).
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                <FileCheck2 className="h-3.5 w-3.5 text-primary" />
                2. Formato ideal
              </p>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Em consoles de disco (PS1, PS2, Saturn), use <strong className="text-foreground">.chd</strong> para poupar até 60% de espaço. Em cartuchos, <strong className="text-foreground">.zip</strong> funciona direto.
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 text-primary" />
                3. Atualizar no app
              </p>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Após colocar os arquivos, abra o RIESCADE e pressione <kbd className="rounded border border-border bg-black/40 px-1 py-0.5 font-mono text-[10px] text-foreground">F5</kbd> ou START → Atualizar Lista de Jogos.
              </p>
            </div>
          </div>
        </header>

        {/* Assinatura Callout (Lovable border-l style) */}
        <section className="mb-12 border-l-2 border-primary bg-card/50 p-5 rounded-r-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="max-w-3xl space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                Prefere não baixar e configurar ROMs manualmente?
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Com a assinatura RIESCADE, você baixa jogos, capas 3D, vídeos e o pacote completo de BIOS com apenas 1 clique direto
                dentro da biblioteca do aplicativo. Esta Wiki é o guia oficial para quem prefere adicionar jogos próprios.
              </p>
            </div>
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 font-mono text-xs font-bold text-black transition-all hover:bg-accent flex-shrink-0"
            >
              <span>Conhecer assinatura</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Interactive Explorer (Search, Categories, Cards, Table) */}
        <WikiExplorer systems={systems} />

        {/* General FAQ Section */}
        <section aria-labelledby="wiki-faq-title" className="mt-20 border-t border-border/60 pt-16">
          <div className="max-w-2xl mb-8">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Dúvidas frequentes
            </p>
            <h2 id="wiki-faq-title" className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Perguntas sobre organização de ROMs
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tudo o que você precisa saber para manter sua coleção organizada no RIESCADE.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {WIKI_FAQS.map((faq) => (
              <div key={faq.q} className="rounded-lg border border-border bg-card/40 p-5">
                <h3 className="font-semibold text-foreground text-sm">
                  {faq.q}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
