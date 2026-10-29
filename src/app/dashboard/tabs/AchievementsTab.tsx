"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Award, ExternalLink, Gamepad2, Info, Link2, Medal, RefreshCw, Star } from "lucide-react";
import { formatDateTime, formatRelative } from "../format";
import { Callout, Card, EmptyState, ErrorLine, FactGrid, SectionTitle, Spinner, primaryButton, secondaryButton } from "../ui";

type Game = {
  game_id: number; title: string; console_name: string; icon: string | null;
  earned: number; earned_hardcore: number; total: number; last_earned_at: string | null; award: string | null;
};
type Unlock = {
  id: number; title: string; description: string; points: number; badge: string | null; hardcore: boolean;
  earned_at: string; game_id: number; game_title: string; console_name: string;
};
type Snapshot = {
  configured: boolean;
  link: { user: string; avatar: string | null } | null;
  achievements: {
    points: number; softcore_points: number; true_points: number; rank: number | null; total_ranked: number | null;
    games: Game[]; recent: Unlock[];
  } | null;
};

const AWARDS: Record<string, string> = {
  mastered: "Dominado",
  completed: "Completo",
  "beaten-hardcore": "Zerado (hardcore)",
  "beaten-softcore": "Zerado",
};
const number = (value: number) => value.toLocaleString("pt-BR");

export function AchievementsTab({ token, onLinkAccount }: { token: () => Promise<string | undefined>; onLinkAccount: () => void }) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/app/player/achievements", { headers: { Authorization: `Bearer ${await token()}` } });
      const result = await response.json();
      if (!response.ok) setError(result.error ?? "Não foi possível carregar suas conquistas.");
      else setData(result);
    } catch {
      setError("Não foi possível falar com o site. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (!data) return error ? <ErrorLine>{error}</ErrorLine> : <Spinner label="Lendo suas conquistas no RetroAchievements..." />;

  if (!data.configured) {
    return (
      <Callout icon={Info} title="Conquistas em ativação">
        A leitura do RetroAchievements ainda está sendo ativada no site. Suas conquistas aparecem aqui assim que ela for ligada.
      </Callout>
    );
  }

  if (!data.link) {
    return (
      <EmptyState icon={Award} title="Ligue sua conta do RetroAchievements">
        <p>A conta é a mesma dos recordes: informe seu usuário do RA uma vez e as duas abas passam a usá-la.</p>
        <button onClick={onLinkAccount} className={`${primaryButton} mt-5`}>
          <Link2 className="h-3.5 w-3.5" /> Ligar conta na aba Recordes
        </button>
      </EmptyState>
    );
  }

  const a = data.achievements;
  const games = [...(a?.games ?? [])].sort((x, y) => (y.last_earned_at ?? "").localeCompare(x.last_earned_at ?? ""));
  const earned = games.reduce((sum, g) => sum + g.earned, 0);

  return (
    <div className="space-y-10">
      <section>
        <SectionTitle
          title={
            <span className="flex items-center gap-3">
              {data.link.avatar && <Image src={data.link.avatar} alt="" width={32} height={32} unoptimized className="h-8 w-8 rounded-lg border border-border object-cover" />}
              {data.link.user}
            </span>
          }
          description="Lido agora do RetroAchievements. Conquistas valem tanto no modo normal quanto no hardcore."
        >
          <div className="flex flex-wrap gap-2">
            <button onClick={load} disabled={loading} className={secondaryButton}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> {loading ? "Lendo o RA..." : "Atualizar"}
            </button>
            <a href={`https://retroachievements.org/user/${encodeURIComponent(data.link.user)}`} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
              Perfil no RA <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </SectionTitle>
        {error && <div className="mb-4"><ErrorLine>{error}</ErrorLine></div>}
        <FactGrid
          items={[
            { label: "Conquistas", value: number(earned), detail: `em ${number(games.length)} ${games.length === 1 ? "jogo" : "jogos"}`, icon: Award },
            { label: "Pontos hardcore", value: number(a?.points ?? 0), detail: `${number(a?.true_points ?? 0)} pontos reais (RetroPoints)`, icon: Star },
            { label: "Pontos normais", value: number(a?.softcore_points ?? 0), detail: "Conquistas sem o modo hardcore", icon: Gamepad2 },
            {
              label: "Posição no RA",
              value: a?.rank ? `#${number(a.rank)}` : "—",
              detail: a?.rank && a.total_ranked ? `de ${number(a.total_ranked)} jogadores` : "O RA só classifica quem tem pontos hardcore",
              icon: Medal,
            },
          ]}
        />
      </section>

      <section>
        <SectionTitle title="Últimas conquistas" description="As 30 mais recentes, dos últimos 3 anos." />
        {!a?.recent.length ? (
          <EmptyState icon={Award} title="Nenhuma conquista nos últimos 3 anos">
            Ligue o RetroAchievements no RIESCADE (Ajustes de jogo → Contas) e jogue um jogo com conquistas.
          </EmptyState>
        ) : (
          <Card className="p-0">
            <ul className="divide-y divide-border">
              {a.recent.map((u) => (
                <li key={`${u.id}-${u.earned_at}`} className="flex items-center gap-4 px-5 py-3">
                  {u.badge ? (
                    <Image src={u.badge} alt="" width={40} height={40} unoptimized className="h-10 w-10 shrink-0 rounded border border-border" />
                  ) : (
                    <Award className="h-10 w-10 shrink-0 text-primary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{u.title}</p>
                    {u.description && <p className="truncate text-xs text-muted-foreground">{u.description}</p>}
                    <p className="truncate font-mono text-[11px] text-muted-foreground">{u.game_title} · {u.console_name}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm font-bold text-primary">{u.points} pts{u.hardcore ? " · HC" : ""}</p>
                    <p className="font-mono text-[11px] text-muted-foreground" title={formatDateTime(u.earned_at)}>{formatRelative(u.earned_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <section>
        <SectionTitle title="Progresso por jogo" description="Jogos em que você já desbloqueou alguma conquista." />
        {games.length === 0 ? (
          <EmptyState icon={Gamepad2} title="Nenhum jogo com conquistas ainda" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {games.map((g) => {
              const percent = g.total ? Math.round((g.earned / g.total) * 100) : 0;
              return (
                <a
                  key={g.game_id}
                  href={`https://retroachievements.org/game/${g.game_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border bg-card/40 p-4 transition-colors hover:border-primary/60"
                >
                  {g.icon && <Image src={g.icon} alt="" width={48} height={48} unoptimized className="h-12 w-12 shrink-0 rounded border border-border" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{g.title}</p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      {g.console_name}{g.award && AWARDS[g.award] ? ` · ${AWARDS[g.award]}` : ""}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                      {g.earned} de {g.total} · {percent}%{g.earned_hardcore ? ` · ${g.earned_hardcore} no hardcore` : ""}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
