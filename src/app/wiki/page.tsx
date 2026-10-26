import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { PageIntro, ExploreLink } from "@/components/PageIntro";
import { WikiExplorer } from "@/components/wiki/WikiExplorer";
import { getAllWikiSystems } from "@/lib/wiki";
import {
  FolderArchive,
  Sparkles,
  FileCheck2,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Wiki de Instalação de ROMs e Sistemas - RIESCADE",
  description:
    "Guia completo de instalação de ROMs no RIESCADE: pastas corretas, extensões aceitas (.chd, .iso, .zip, .game), BIOS necessárias e emuladores para mais de 240 sistemas.",
  alternates: { canonical: "/wiki" },
  openGraph: {
    title: "Wiki de Instalação de ROMs e Sistemas - RIESCADE",
    description:
      "Guia completo de pastas, extensões e requisitos de BIOS para instalar jogos no RIESCADE.",
    type: "website",
    url: "https://www.riescade.com.br/wiki",
  },
};

export default function WikiPage() {
  const systems = getAllWikiSystems();

  return (
    <div className="site-page relative flex min-h-screen flex-col bg-background">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12)_0%,transparent_65%)]" />
      <Header />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 mx-auto w-full max-w-7xl flex-grow px-6 pb-24 pt-32 md:px-12"
      >
        <PageIntro
          eyebrow="Wiki RIESCADE"
          title={
            <>
              Guia de instalação de <span className="text-gradient-primary">ROMs & Sistemas.</span>
            </>
          }
          description="Consulte a pasta exata de cada sistema, formatos aceitos, requisitos de BIOS e emuladores configurados no RIESCADE para instalar suas próprias ROMs."
        >
          <ExploreLink href="/tutorial">Tutorial passo a passo</ExploreLink>
        </PageIntro>

        {/* Quick 3-Step Overview */}
        <section
          aria-labelledby="quick-guide-title"
          className="mb-12 grid gap-4 sm:grid-cols-3"
        >
          <div className="flex flex-col rounded-2xl border border-white/10 bg-card/40 p-5 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary mb-3">
              <FolderArchive className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground text-sm">1. Coloque na pasta certa</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Cada sistema possui uma subpasta própria dentro do diretório <code className="text-primary font-mono text-[11px]">roms\</code> do RIESCADE (ex: <code className="text-primary font-mono text-[11px]">roms\psx\</code> ou <code className="text-primary font-mono text-[11px]">roms\arcadedumps\</code>).
            </p>
          </div>

          <div className="flex flex-col rounded-2xl border border-white/10 bg-card/40 p-5 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary mb-3">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground text-sm">2. Use o formato ideal</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Para consoles em disco (PS1, PS2, Saturn), recomendamos <strong className="text-foreground">.chd</strong> para economizar até 60% de espaço. Em cartuchos, use <strong className="text-foreground">.zip</strong> ou roms puras.
            </p>
          </div>

          <div className="flex flex-col rounded-2xl border border-white/10 bg-card/40 p-5 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary mb-3">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground text-sm">3. Atualize a lista no app</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Após adicionar novos jogos, abra o RIESCADE e pressione <kbd className="rounded border border-white/20 bg-black/40 px-1 py-0.5 font-mono text-[10px] text-foreground">F5</kbd> ou vá em <strong className="text-foreground">Menu Principal → Atualizar Lista de Jogos</strong>.
            </p>
          </div>
        </section>

        {/* Assinatura Auto-Download Callout */}
        <section className="mb-12 overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/10 via-card to-primary/5 p-6 md:p-8 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 font-mono text-[11px] font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Dica RIESCADE
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                Prefere não baixar e configurar ROMs manualmente?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Com a assinatura RIESCADE, você baixa jogos, capas, vídeos e o pacote completo de BIOS com apenas 1 clique direto dentro da biblioteca do aplicativo. Esta Wiki é o guia oficial para quem prefere adicionar jogos próprios ou explorar os sistemas modificados.
              </p>
            </div>
            <Link
              href="/#about"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-6 py-3 text-sm font-bold text-black transition-all hover:bg-accent hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] flex-shrink-0"
            >
              <span>Conhecer assinatura</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Interactive Explorer (Search, Categories, Cards, Table) */}
        <WikiExplorer systems={systems} />

        {/* General FAQ Section */}
        <section aria-labelledby="wiki-faq-title" className="mt-20 border-t border-white/10 pt-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 id="wiki-faq-title" className="font-display text-2xl font-bold uppercase tracking-tight text-foreground md:text-3xl">
              Dúvidas frequentes sobre <span className="text-gradient-primary">instalação de ROMs</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tudo o que você precisa saber para manter sua coleção organizada no RIESCADE.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-card/40 p-6">
              <h3 className="font-bold text-foreground text-base">
                Onde fica a pasta de ROMs no meu PC?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Dentro da pasta onde você extraiu o RIESCADE (por exemplo, <code className="text-primary font-mono text-xs">C:\RIESCADE\roms\</code>). Dentro dela você encontrará todas as subpastas listadas nesta wiki, como <code className="text-primary font-mono text-xs">\roms\snes\</code>, <code className="text-primary font-mono text-xs">\roms\psx\</code>, etc.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/40 p-6">
              <h3 className="font-bold text-foreground text-base">
                Por que o formato CHD (.chd) é tão recomendado?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                O formato CHD compacta imagens de CD e DVD sem nenhuma perda de qualidade, eliminando múltiplos arquivos <code className="font-mono text-xs">.bin/.cue</code> e reduzindo o espaço em disco em até 60%. O DuckStation (PS1), PCSX2 (PS2), Flycast (Dreamcast) e Beetle Saturn rodam CHD nativamente.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/40 p-6">
              <h3 className="font-bold text-foreground text-base">
                Como organizar jogos de vários discos (multidisco)?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Para jogos como Final Fantasy VII (3 CDs) ou Metal Gear Solid (2 CDs), crie um arquivo de texto com a extensão <code className="text-primary font-mono text-xs">.m3u</code> com o nome do jogo (ex: <code className="font-mono text-xs">Final Fantasy VII.m3u</code>). Dentro dele, liste o nome exato dos arquivos de cada disco, um por linha. Dessa forma, seus saves funcionam em todos os discos.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/40 p-6">
              <h3 className="font-bold text-foreground text-base">
                Como instalar os sistemas exclusivos como Arcade Dumps e PGM3 Viper?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Consulte os guias específicos de <Link href="/wiki/arcadedumps" className="text-primary hover:underline">Arcade Dumps</Link> e <Link href="/wiki/pgm3viper" className="text-primary hover:underline">PGM3 / Viper</Link>. Esses sistemas utilizam executáveis próprios (LinuxLoader e Kitsune) e exigem que os arquivos disparadores (<code className="font-mono text-xs">.bat</code> ou <code className="font-mono text-xs">.game</code>) estejam na raiz da respectiva pasta.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
