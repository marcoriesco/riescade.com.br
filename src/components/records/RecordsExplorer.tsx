"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, Trophy, Users } from "lucide-react";

export type PublicRecordRow = {
  leaderboard_id: number;
  game_id: number;
  game_title: string;
  console_name: string;
  game_icon: string | null;
  leaderboard_title: string;
  leaderboard_description: string;
  formatted_score: string;
  achieved_at: string;
  ra_user: string;
  ra_avatar: string | null;
  players: number;
};

const PAGE = 30;
const date = (value: string) => new Date(value).toLocaleDateString("pt-BR");

export function RecordsExplorer({ records }: { records: PublicRecordRow[] }) {
  const [query, setQuery] = useState("");
  const [system, setSystem] = useState("");
  const [shown, setShown] = useState(PAGE);

  const consoles = useMemo(() => [...new Set(records.map((r) => r.console_name).filter(Boolean))].sort(), [records]);

  const games = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const byGame = new Map<number, { title: string; console: string; icon: string | null; records: PublicRecordRow[] }>();
    for (const record of records) {
      if (system && record.console_name !== system) continue;
      if (needle && ![record.game_title, record.leaderboard_title, record.ra_user].some((v) => v.toLowerCase().includes(needle))) continue;
      const game = byGame.get(record.game_id) ?? { title: record.game_title, console: record.console_name, icon: record.game_icon, records: [] };
      game.records.push(record);
      byGame.set(record.game_id, game);
    }
    return [...byGame.entries()];
  }, [records, query, system]);

  if (records.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
        <Trophy className="mx-auto h-8 w-8 text-primary/60" />
        <p className="mt-4 font-semibold text-foreground">Nenhum recorde publicado ainda</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Os primeiros recordes aparecem quando os jogadores ligarem a conta do RetroAchievements na área de membro.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Recordes por jogo">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Buscar</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShown(PAGE); }}
            placeholder="Buscar jogo, placar ou jogador"
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </label>
        <label className="sm:w-64">
          <span className="sr-only">Sistema</span>
          <select
            value={system}
            onChange={(e) => { setSystem(e.target.value); setShown(PAGE); }}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">Todos os sistemas</option>
            {consoles.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
      </div>

      {games.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum recorde encontrado.</p>
      ) : (
        <div className="space-y-4">
          {games.slice(0, shown).map(([id, game]) => (
            <article key={id} className="overflow-hidden rounded-lg border border-border bg-card/40">
              <header className="flex items-center gap-3 border-b border-border px-5 py-3">
                {game.icon && <Image src={game.icon} alt="" width={36} height={36} unoptimized className="h-9 w-9 rounded border border-border" />}
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-foreground">{game.title}</h2>
                  <p className="font-mono text-[11px] text-muted-foreground">{game.console}</p>
                </div>
              </header>
              <ul className="divide-y divide-border">
                {game.records.map((record) => (
                  <li key={record.leaderboard_id} className="grid gap-2 px-5 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-6">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">{record.leaderboard_title}</p>
                      {record.leaderboard_description && <p className="text-xs text-muted-foreground">{record.leaderboard_description}</p>}
                    </div>
                    <a
                      href={`https://retroachievements.org/user/${encodeURIComponent(record.ra_user)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-foreground hover:text-primary"
                    >
                      {record.ra_avatar && <Image src={record.ra_avatar} alt="" width={20} height={20} unoptimized className="h-5 w-5 rounded" />}
                      {record.ra_user}
                    </a>
                    <div className="flex items-center gap-4 sm:justify-end">
                      <span className="font-mono text-sm font-bold text-primary">{record.formatted_score}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground" title={`${record.players} jogadores RIESCADE neste placar`}>
                        <Users className="h-3 w-3" />
                        {record.players} · {date(record.achieved_at)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}

      {games.length > shown && (
        <div className="mt-6 text-center">
          <button onClick={() => setShown((n) => n + PAGE)} className="font-mono text-xs text-primary hover:underline">
            Mostrar mais jogos ({games.length - shown})
          </button>
        </div>
      )}
    </section>
  );
}
