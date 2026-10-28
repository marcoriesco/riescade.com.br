import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { RecordsExplorer } from "@/components/records/RecordsExplorer";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { listPublicRecords, type PublicRecord } from "@/lib/server/retroachievements";
import { ArrowRight, Gamepad2, Link2, Trophy } from "lucide-react";

// Refreshed by the records API whenever a player links, refreshes or hides their records.
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Recordes da comunidade — RIESCADE",
  description: "Os melhores placares dos jogadores RIESCADE em cada jogo, lidos dos leaderboards do RetroAchievements.",
  alternates: { canonical: "/recordes" },
  openGraph: {
    title: "Recordes da comunidade — RIESCADE",
    description: "Quem tem o melhor placar em cada jogo entre os jogadores RIESCADE.",
    type: "website",
    url: "https://www.riescade.com.br/recordes",
  },
};

async function loadRecords(): Promise<PublicRecord[]> {
  try {
    return await listPublicRecords(getSupabaseAdmin(), 1000);
  } catch (error) {
    console.error("Public records error:", error);
    return [];
  }
}

export default async function RecordsPage() {
  const records = await loadRecords();
  const players = new Set(records.map((r) => r.ra_user)).size;
  const games = new Set(records.map((r) => r.game_id)).size;

  return (
    <div className="site-page relative min-h-screen bg-background">
      <Header />

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-6 pt-24 pb-28">
        <nav aria-label="Navegação estrutural" className="pt-10 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">Início</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Recordes</span>
        </nav>

        <header className="pb-12 pt-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/15 px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
              <Trophy className="h-3 w-3" />
              Comunidade
            </span>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {games.toLocaleString("pt-BR")} jogos · {players.toLocaleString("pt-BR")} jogadores
            </p>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="max-w-4xl font-display text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">
                Recordes da <span className="text-primary">comunidade</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                O melhor placar de um jogador RIESCADE em cada leaderboard do RetroAchievements. Ligue sua conta RA na sua área de
                membro para entrar na disputa.
              </p>
            </div>
            <Link
              href="/dashboard?tab=recordes"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-border bg-card px-5 py-2.5 font-mono text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary md:self-auto"
            >
              Meus recordes
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-lg bg-border text-sm sm:grid-cols-3 [&>div]:bg-card [&>div]:px-5 [&>div]:py-4">
            <div>
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <Gamepad2 className="h-3.5 w-3.5 text-primary" />
                1. Jogue no RIESCADE
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Entre com sua conta RIESCADE no aplicativo.</p>
            </div>
            <div>
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <Trophy className="h-3.5 w-3.5 text-primary" />
                2. Ative o RetroAchievements
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                No menu do RIESCADE, ligue o RA. Suas pontuações vão para os placares enquanto você joga.
              </p>
            </div>
            <div>
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <Link2 className="h-3.5 w-3.5 text-primary" />
                3. Ligue sua conta RA
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Em <Link href="/dashboard?tab=recordes" className="text-primary hover:underline">Minha conta → Recordes</Link>. Você escolhe se aparece aqui.
              </p>
            </div>
          </div>
        </header>

        <RecordsExplorer records={records} />
      </main>

      <Footer />
    </div>
  );
}
