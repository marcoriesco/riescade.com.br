"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Circle, ExternalLink, Info, Link2, RefreshCw, Trophy, Unlink } from "lucide-react";
import { formatDateTime, formatRelative } from "../format";
import { Callout, Card, EmptyState, ErrorLine, Label, SectionTitle, Spinner, primaryButton, quietButton, secondaryButton } from "../ui";

type GameRecord = {
  leaderboard_id: number;
  game_id: number;
  game_title: string;
  console_name: string;
  game_icon: string | null;
  leaderboard_title: string;
  leaderboard_description: string;
  formatted_score: string;
  ra_rank: number | null;
  achieved_at: string;
};
type Snapshot = {
  configured: boolean;
  link: { user: string; avatar: string | null; public: boolean; refreshedAt: string | null } | null;
  records: GameRecord[];
};

export function RecordsTab({ token }: { token: () => Promise<string | undefined> }) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"link" | "refresh" | "public" | "unlink" | null>(null);
  const [username, setUsername] = useState("");
  const [showPublic, setShowPublic] = useState(true);

  const call = useCallback(async (method: string, body?: unknown) => {
    setError(null);
    try {
      const response = await fetch("/api/app/player/records", {
        method,
        headers: { Authorization: `Bearer ${await token()}`, ...(body ? { "Content-Type": "application/json" } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Não foi possível concluir. Tente novamente.");
        return false;
      }
      setData(result);
      return true;
    } catch {
      setError("Não foi possível falar com o site. Verifique sua conexão.");
      return false;
    }
  }, [token]);

  useEffect(() => { call("GET"); }, [call]);

  const games = useMemo(() => {
    const byGame = new Map<number, { title: string; console: string; icon: string | null; records: GameRecord[] }>();
    for (const record of data?.records ?? []) {
      const game = byGame.get(record.game_id) ?? { title: record.game_title, console: record.console_name, icon: record.game_icon, records: [] };
      game.records.push(record);
      byGame.set(record.game_id, game);
    }
    return [...byGame.entries()];
  }, [data]);

  const run = async (kind: NonNullable<typeof busy>, method: string, body?: unknown) => {
    setBusy(kind);
    const ok = await call(method, body);
    setBusy(null);
    return ok;
  };

  if (!data) return error ? <ErrorLine>{error}</ErrorLine> : <Spinner label="Carregando seus recordes..." />;

  const linked = !!data.link;
  const steps = [
    // The site cannot see the first two from here, so only the RA link is ever checked off.
    { done: false, title: "Entrar no RIESCADE com esta conta", text: "No aplicativo, menu RIESCADE → Conta. É assim que seus jogos chegam aqui." },
    { done: false, title: "Ligar o RetroAchievements no RIESCADE", text: "Ajustes de jogo → Contas → Ajustes das conquistas retrô: ative e entre com sua conta RA. Para entrar nos placares, ligue também o modo hardcore. As pontuações são enviadas ao RA enquanto você joga." },
    { done: linked, title: "Informar sua conta RA aqui", text: "Assim o site sabe de quem ler os recordes." },
  ];

  return (
    <div className="space-y-10">
      <Callout
        icon={Info}
        tone="warning"
        title="Os recordes dependem do RetroAchievements"
        action={<Link href="/recordes" className={secondaryButton}>Ver recordes públicos <ArrowRight className="h-3.5 w-3.5" /></Link>}
      >
        Para começar a contar seus recordes por jogo, é preciso estar logado no RIESCADE e jogar com o RetroAchievements (RA) ativado.
        O recorde de cada jogo é a sua melhor pontuação nos placares (leaderboards) do RA; jogos sem placar no RA ainda não têm recorde.
      </Callout>

      {!data.configured && (
        <Callout icon={Info} title="Recordes em ativação">
          A leitura dos placares do RetroAchievements ainda está sendo ativada no site. Seus recordes aparecem aqui assim que ela for ligada.
        </Callout>
      )}

      <section>
        <SectionTitle title="Como começar" />
        <ol className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 [&>li]:bg-card [&>li]:px-5 [&>li]:py-4">
          {steps.map((step, index) => (
            <li key={step.title}>
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {step.done ? <Check className="h-3.5 w-3.5 text-[#14d52a]" /> : <Circle className="h-3.5 w-3.5 text-primary" />}
                Passo {index + 1}
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">{step.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionTitle title="Conta RetroAchievements" />
        {data.link ? (
          <Card className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {data.link.avatar ? (
                  <Image src={data.link.avatar} alt="" width={40} height={40} unoptimized className="h-10 w-10 rounded-lg border border-border object-cover" />
                ) : (
                  <Trophy className="h-8 w-8 text-primary" />
                )}
                <div>
                  <p className="font-semibold text-foreground">{data.link.user}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {data.link.refreshedAt ? `Atualizado ${formatRelative(data.link.refreshedAt)}` : "Ainda não atualizado"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => run("refresh", "POST")} disabled={!data.configured || busy !== null} className={primaryButton}>
                  <RefreshCw className={`h-3.5 w-3.5 ${busy === "refresh" ? "animate-spin" : ""}`} />
                  {busy === "refresh" ? "Lendo o RA..." : "Atualizar recordes"}
                </button>
                <a href={`https://retroachievements.org/user/${encodeURIComponent(data.link.user)}`} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
                  Perfil no RA <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={data.link.public}
                  disabled={busy !== null}
                  onChange={(e) => run("public", "PATCH", { public: e.target.checked })}
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                />
                Mostrar meus recordes na página pública, com meu nome do RA
              </label>
              <button
                onClick={() => { if (confirm("Desligar a conta do RetroAchievements e apagar os recordes copiados para o site?")) run("unlink", "DELETE"); }}
                disabled={busy !== null}
                className={quietButton}
              >
                <Unlink className="h-3.5 w-3.5" />
                Desligar conta
              </button>
            </div>
            {error && <ErrorLine>{error}</ErrorLine>}
          </Card>
        ) : (
          <Card>
            <form
              className="space-y-4"
              onSubmit={(e) => { e.preventDefault(); run("link", "PUT", { username, public: showPublic }); }}
            >
              <label className="block">
                <Label>Usuário do RetroAchievements</Label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Ex.: MeuNomeNoRA"
                  className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none sm:w-80"
                />
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
                <input type="checkbox" checked={showPublic} onChange={(e) => setShowPublic(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                Mostrar meus recordes na página pública, com meu nome do RA
              </label>
              <p className="text-xs text-muted-foreground">Só o nome de usuário. O site nunca pede nem guarda sua senha do RA.</p>
              {error && <ErrorLine>{error}</ErrorLine>}
              <button type="submit" disabled={!data.configured || busy !== null || !username.trim()} className={primaryButton}>
                <Link2 className="h-3.5 w-3.5" />
                {busy === "link" ? "Conferindo no RA..." : "Ligar conta"}
              </button>
            </form>
          </Card>
        )}
      </section>

      <section>
        <SectionTitle title="Seus recordes" description="Sua melhor marca em cada placar do RA, dos seus 50 jogos mais recentes no RetroAchievements." />
        {games.length === 0 ? (
          <EmptyState icon={Trophy} title={linked ? "Nenhum recorde ainda" : "Ligue sua conta RA para ver seus recordes"}>
            {linked
              ? "Jogue um jogo com placar no RetroAchievements e depois clique em Atualizar recordes."
              : "Depois de ligar a conta, os placares em que você já pontuou aparecem aqui."}
          </EmptyState>
        ) : (
          <div className="space-y-4">
            {games.map(([id, game]) => (
              <Card key={id} className="p-0">
                <div className="flex items-center gap-3 border-b border-border px-5 py-3">
                  {game.icon && <Image src={game.icon} alt="" width={32} height={32} unoptimized className="h-8 w-8 rounded border border-border" />}
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{game.title}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{game.console}</p>
                  </div>
                </div>
                <ul className="divide-y divide-border">
                  {game.records.map((record) => (
                    <li key={record.leaderboard_id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm text-foreground">{record.leaderboard_title}</p>
                        {record.leaderboard_description && <p className="text-xs text-muted-foreground">{record.leaderboard_description}</p>}
                      </div>
                      <div className="flex shrink-0 items-center gap-4 sm:text-right">
                        <span className="font-mono text-sm font-bold text-primary">{record.formatted_score}</span>
                        <span className="font-mono text-[11px] text-muted-foreground" title={formatDateTime(record.achieved_at)}>
                          {record.ra_rank ? `#${record.ra_rank} no RA · ` : ""}{formatRelative(record.achieved_at)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
