"use client";
import { useEffect, useMemo, useState } from "react";
import { Clock3, Gamepad2, History, Layers, Play, Search } from "lucide-react";
import { formatPlayTime, formatRelative, formatDateTime } from "../format";
import { Callout, EmptyState, ErrorLine, FactGrid, Label, SectionTitle, Spinner } from "../ui";

type PlayedGame = {
  system: string;
  systemName: string;
  path: string;
  title: string;
  playCount: number;
  playTime: number;
  lastPlayed: string | null;
};
type Activity = { games: PlayedGame[]; totals: { games: number; playTime: number; playCount: number; systems: number } };

const SORTS = {
  recent: { label: "Recentes", compare: (a: PlayedGame, b: PlayedGame) => (b.lastPlayed ?? "").localeCompare(a.lastPlayed ?? "") },
  time: { label: "Mais tempo", compare: (a: PlayedGame, b: PlayedGame) => b.playTime - a.playTime },
  count: { label: "Mais vezes", compare: (a: PlayedGame, b: PlayedGame) => b.playCount - a.playCount },
} as const;
type Sort = keyof typeof SORTS;
const PAGE = 50;

export function GamesTab({ token }: { token: () => Promise<string | undefined> }) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const response = await fetch("/api/app/player/activity", { headers: { Authorization: `Bearer ${await token()}` } });
        const body = await response.json();
        if (!alive) return;
        if (response.ok) setActivity(body);
        else setError(body.error ?? "Não foi possível carregar seus jogos.");
      } catch {
        if (alive) setError("Não foi possível carregar seus jogos. Verifique sua conexão.");
      }
    })();
    return () => { alive = false; };
  }, [token]);

  const list = useMemo(() => {
    if (!activity) return [];
    const needle = query.trim().toLowerCase();
    return activity.games
      .filter((g) => !needle || g.title.toLowerCase().includes(needle) || g.systemName.toLowerCase().includes(needle))
      .sort(SORTS[sort].compare);
  }, [activity, query, sort]);

  if (error) return <ErrorLine>{error}</ErrorLine>;
  if (!activity) return <Spinner label="Carregando seus jogos..." />;

  if (activity.games.length === 0) {
    return (
      <EmptyState icon={Gamepad2} title="Nenhum jogo registrado ainda">
        Entre com esta conta no RIESCADE (menu RIESCADE → Conta) e jogue. Ao fechar cada jogo, o tempo, o número de partidas e
        a data aparecem aqui.
      </EmptyState>
    );
  }

  const last = activity.games.find((g) => g.lastPlayed);
  const top = [...activity.games].sort(SORTS.time.compare)[0];

  return (
    <div className="space-y-10">
      {last && (
        <Callout icon={Play} title={<>Último jogo: <span className="text-primary">{last.title}</span></>}>
          {last.systemName} · {formatDateTime(last.lastPlayed)} · {formatPlayTime(last.playTime)} no total
        </Callout>
      )}

      <FactGrid
        items={[
          { label: "Tempo total", icon: Clock3, value: formatPlayTime(activity.totals.playTime), detail: top?.playTime ? `Mais jogado: ${top.title}` : undefined },
          { label: "Jogos", icon: Gamepad2, value: activity.totals.games.toLocaleString("pt-BR"), detail: "Com pelo menos uma partida" },
          { label: "Partidas", icon: History, value: activity.totals.playCount.toLocaleString("pt-BR"), detail: "Vezes que um jogo foi aberto" },
          { label: "Sistemas", icon: Layers, value: activity.totals.systems.toLocaleString("pt-BR"), detail: "Consoles e arcades diferentes" },
        ]}
      />

      <section>
        <SectionTitle title="Seus jogos" description="Os números vêm do RIESCADE em todos os seus computadores conectados a esta conta." />

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block sm:w-80">
            <span className="sr-only">Buscar jogo</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShown(PAGE); }}
              placeholder="Buscar jogo ou sistema"
              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </label>
          <div role="group" aria-label="Ordenar" className="flex gap-1 rounded-lg border border-border bg-card p-1">
            {(Object.keys(SORTS) as Sort[]).map((key) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                aria-pressed={sort === key}
                className={`rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${sort === key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {SORTS[key].label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-card text-left">
              <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-mono [&>th]:text-[11px] [&>th]:font-normal [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-muted-foreground">
                <th>Jogo</th>
                <th>Última vez</th>
                <th className="text-right">Tempo</th>
                <th className="text-right">Partidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.slice(0, shown).map((game) => (
                <tr key={`${game.system}/${game.path}`} className="transition-colors hover:bg-card/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{game.title}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{game.systemName}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" title={formatDateTime(game.lastPlayed)}>{formatRelative(game.lastPlayed)}</td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">{formatPlayTime(game.playTime)}</td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">{game.playCount || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <p className="mt-4 text-sm text-muted-foreground">Nenhum jogo encontrado para “{query}”.</p>}
        {list.length > shown && (
          <div className="mt-4 flex items-center justify-between">
            <Label>{shown} de {list.length}</Label>
            <button onClick={() => setShown((n) => n + PAGE)} className="font-mono text-xs text-primary hover:underline">Mostrar mais</button>
          </div>
        )}
      </section>
    </div>
  );
}
