import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import { AlertCircle, CalendarDays, Check, CreditCard, Crown, RefreshCw, User as UserIcon, XCircle, Zap } from "lucide-react";
import type { Subscription } from "@/lib/supabase";
import { formatAge, formatDate, formatShortDate } from "../format";
import { Callout, Card, FactGrid, Label, SectionTitle, primaryButton, quietButton, secondaryButton } from "../ui";

export interface SubscriptionDetails {
  status?: string;
  plan_name?: string | null;
  amount?: number | null;
  currency?: string | null;
  interval?: string | null;
  cancel_at_period_end?: boolean;
  start_date?: string | null;
  end_date?: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Ativa",
  trialing: "Em período de teste",
  past_due: "Pagamento pendente",
  unpaid: "Não paga",
  incomplete: "Pagamento incompleto",
  incomplete_expired: "Expirada",
  canceled: "Cancelada",
  paused: "Pausada",
};

const MEMBER_BENEFITS = [
  "Biblioteca integrada ao aplicativo RIESCADE",
  "Downloads seguros dentro do aplicativo",
  "Pack de BIOS completo para download",
  "Temas exclusivos para membros",
  "250+ plataformas, do Atari ao Switch",
  "Comunidade VIP e suporte prioritário",
];

const formatPrice = (details: SubscriptionDetails | null) => {
  if (details?.amount == null || !details.currency) return "R$ 30";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: details.currency.toUpperCase() }).format(details.amount / 100);
};

export function SubscriptionTab({ user, subscription, details, hasAccess, pending, onCheckout, onManageBilling, onCancel }: {
  user: User;
  subscription: Subscription | null;
  details: SubscriptionDetails | null;
  hasAccess: boolean;
  pending: string | null;
  onCheckout: () => void;
  onManageBilling: () => void;
  onCancel: () => void;
}) {
  const status = details?.status ?? subscription?.status;
  const statusLabel = subscription ? STATUS_LABELS[status ?? ""] ?? "Inativa" : "Sem assinatura";
  const periodEnd = details?.end_date ?? subscription?.end_date;
  const cancelsAtPeriodEnd = !!details?.cancel_at_period_end;
  const interval = details?.interval === "year" ? "ano" : "mês";
  const avatarUrl = (user.user_metadata?.avatar_url || user.user_metadata?.picture) as string | undefined;

  return (
    <div className="space-y-10">
      {!hasAccess && (
        <section aria-labelledby="subscribe-title" className="overflow-hidden rounded-lg border border-primary/50 bg-card">
          <div className="grid gap-px bg-border md:grid-cols-[1.1fr_1fr] [&>div]:bg-card">
            <div className="p-6 md:p-8">
              <Label icon={Crown}>{subscription ? "Reative sua assinatura" : "Você ainda não é membro"}</Label>
              <h2 id="subscribe-title" className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                {subscription ? <>Volte a jogar com a <span className="text-primary">assinatura</span></> : <>Assine e libere a <span className="text-primary">biblioteca</span></>}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {subscription
                  ? `Sua assinatura está ${statusLabel.toLowerCase()}. Reative para voltar a baixar jogos, o pack de BIOS e os temas exclusivos.`
                  : "O aplicativo é gratuito. A assinatura libera os downloads de jogos dentro dele, o pack de BIOS e os temas exclusivos. Sem fidelidade: cancele quando quiser."}
              </p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold text-foreground">R$ 30</span>
                <span className="font-mono text-sm text-muted-foreground">/mês</span>
              </div>
              <button onClick={onCheckout} disabled={pending === "checkout"} className={`${primaryButton} mt-6 w-full py-3.5 text-sm sm:w-auto`}>
                <Zap className="h-4 w-4" />
                {pending === "checkout" ? "Abrindo pagamento..." : subscription ? "Reativar assinatura" : "Assinar agora"}
              </button>
              <p className="mt-3 font-mono text-[11px] text-muted-foreground">Pagamento seguro via Stripe. Use a mesma conta Google no aplicativo.</p>
            </div>
            <div className="p-6 md:p-8">
              <Label>O que a assinatura libera</Label>
              <ul className="mt-4 space-y-3">
                {MEMBER_BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-sm text-foreground/85">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section>
        <SectionTitle title="Assinatura" description={hasAccess ? "Sua assinatura está em dia. O acesso vale em todos os seus computadores com esta conta." : undefined} />
        <FactGrid
          items={[
            { label: "Status", icon: Crown, value: <span className={hasAccess ? "text-[#14d52a]" : subscription ? "text-amber-400" : ""}>{statusLabel}</span>, detail: hasAccess ? `Assinante há ${formatAge(subscription!.created_at)}` : subscription ? `Assinou em ${formatDate(subscription.created_at)}` : "Assine para liberar os downloads" },
            { label: "Plano", icon: CreditCard, value: hasAccess ? details?.plan_name || "RIESCADE Membro" : "Gratuito", detail: hasAccess ? `${formatPrice(details)} por ${interval}` : "Aplicativo sem downloads de jogos" },
            { label: hasAccess && !cancelsAtPeriodEnd ? "Próxima renovação" : "Acesso até", icon: RefreshCw, value: hasAccess && periodEnd ? formatShortDate(periodEnd) : "—", detail: hasAccess ? (cancelsAtPeriodEnd ? "Não será renovada" : "Renovação automática") : "Nenhum período ativo" },
            { label: "Na RIESCADE há", icon: CalendarDays, value: formatAge(user.created_at), detail: `Desde ${formatDate(user.created_at)}` },
          ]}
        />

        {hasAccess && cancelsAtPeriodEnd && (
          <div className="mt-4">
            <Callout icon={AlertCircle} tone="warning" title="Sua assinatura não será renovada">
              O acesso continua até {formatDate(periodEnd)}. Para continuar depois disso, reative em Pagamento e faturas.
            </Callout>
          </div>
        )}

        {hasAccess && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button onClick={onManageBilling} disabled={pending === "portal"} className={secondaryButton}>
              <CreditCard className="h-4 w-4" />
              {pending === "portal" ? "Abrindo..." : "Pagamento e faturas"}
            </button>
            {!cancelsAtPeriodEnd && (
              <button onClick={onCancel} className={quietButton}>
                <XCircle className="h-4 w-4" />
                Cancelar assinatura
              </button>
            )}
          </div>
        )}
      </section>

      <section>
        <SectionTitle title="Conta" />
        <Card className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" width={48} height={48} unoptimized referrerPolicy="no-referrer" className="h-12 w-12 shrink-0 rounded-lg border border-border object-cover" />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{user.user_metadata?.full_name || "Jogador"}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs md:text-right">
            <dt className="text-muted-foreground">Login</dt>
            <dd className="font-medium text-foreground">Google</dd>
            <dt className="text-muted-foreground">Assinante desde</dt>
            <dd className="font-medium text-foreground">{subscription ? formatShortDate(subscription.created_at) : "—"}</dd>
          </dl>
        </Card>
        <p className="mt-3 text-xs text-muted-foreground">
          Use esta mesma conta Google para entrar no RIESCADE. O aplicativo abre o navegador nesta conta para liberar o acesso.
        </p>
      </section>
    </div>
  );
}
