"use client";
import { PageIntro, ExploreLink } from "@/components/PageIntro";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase, type Subscription } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Zap,
  Shield,
  User as UserIcon,
  Download,
  AlertCircle,
  XCircle,
  Gamepad2,
  CalendarDays,
  Clock3,
  Check,
  CheckCircle2,
  Sparkles,
  Monitor,
  Cpu,
  Lock,
  CreditCard,
  RefreshCw,
  Crown,
  Palette,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { CancelSubscriptionModal } from "@/components/CancelSubscriptionModal";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

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
  "Biblioteca integrada ao RIESCADE OS e ao RIESCADE RetroBat",
  "Downloads seguros dentro dos aplicativos",
  "Pack de BIOS completo para download",
  "Comunidade VIP — Suporte prioritário",
  "250+ Plataformas — Atari até Switch",
  "RetroAchievements + Scraping automático",
];

interface SubscriptionDetails {
  status?: string;
  plan_name?: string | null;
  amount?: number | null;
  currency?: string | null;
  interval?: string | null;
  cancel_at_period_end?: boolean;
  start_date?: string | null;
  end_date?: string | null;
}

interface ReleaseInfo {
  version: string;
  size: number | null;
  updatedAt?: string | null;
}

interface RetroBatTheme {
  id: string;
  name: string;
  description: string;
  previewUrl: string | null;
  fileName: string | null;
  size: number | null;
  version: string | null;
}

interface BiosAsset {
  id: string;
  file_size: number | null;
}

const formatAccountDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(value))
    : "Não informado";

const formatAccountDateTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "Não informado";

const formatAccountAge = (value?: string | null) => {
  if (!value) return "Não informado";
  const createdAt = new Date(value);
  const now = new Date();
  const months =
    (now.getFullYear() - createdAt.getFullYear()) * 12 +
    now.getMonth() -
    createdAt.getMonth();
  if (months < 1) {
    const days = Math.max(
      1,
      Math.floor((now.getTime() - createdAt.getTime()) / 86_400_000)
    );
    return `${days} ${days === 1 ? "dia" : "dias"}`;
  }
  if (months < 12) return `${months} ${months === 1 ? "mês" : "meses"}`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths
    ? `${years} ${years === 1 ? "ano" : "anos"} e ${remainingMonths} ${remainingMonths === 1 ? "mês" : "meses"}`
    : `${years} ${years === 1 ? "ano" : "anos"}`;
};

const formatSize = (bytes?: number | null) => {
  if (!bytes) return null;
  const gb = bytes / 1024 ** 3;
  return gb >= 1
    ? `${gb.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} GB`
    : `${Math.round(bytes / 1024 ** 2)} MB`;
};

const formatPrice = (details: SubscriptionDetails | null) => {
  if (details?.amount == null || !details.currency) return "R$ 30";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: details.currency.toUpperCase(),
  }).format(details.amount / 100);
};

// Drive's uc links stop on an HTML virus-scan page for big files like bios.zip.
function directDriveUrl(url: string) {
  try {
    const parsed = new URL(url);
    const id = parsed.searchParams.get("id");
    if (parsed.hostname === "drive.google.com" && parsed.pathname === "/uc" && id) {
      return `https://drive.usercontent.google.com/download?id=${encodeURIComponent(id)}&export=download&confirm=t`;
    }
  } catch {}
  return url;
}

async function accessToken() {
  return (await supabase.auth.getSession()).data.session?.access_token;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, init);
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

function SectionHeading({ eyebrow, title, highlight, description }: {
  eyebrow: string;
  title: string;
  highlight: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-primary">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
        {title} <span className="text-gradient-primary">{highlight}</span>
      </h2>
      {description && (
        <p className="mt-3 max-w-3xl text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

function StatTile({ icon: Icon, label, value, detail, tone = "default" }: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
  tone?: "default" | "success" | "warning";
}) {
  const valueColor =
    tone === "success" ? "text-[#14d52a]" : tone === "warning" ? "text-amber-400" : "text-foreground";
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-card to-primary/[0.035] p-5">
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
        <Icon className="size-4 text-primary" />
      </div>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 font-display text-xl font-bold uppercase ${valueColor}`}>{value}</p>
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}

function DownloadCard({ icon: Icon, tag, name, description, features, install, meta, children, locked }: {
  icon: LucideIcon;
  tag: string;
  name: ReactNode;
  description: string;
  features: string[];
  install: string;
  meta: string[];
  children: ReactNode;
  locked?: boolean;
}) {
  return (
    <article className="group flex flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-card to-primary/[0.035] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_60px_hsl(var(--primary)/0.08)]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="glow-primary flex size-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 transition-colors group-hover:border-primary/60">
          <Icon className="size-5 text-primary" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/[0.08] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
          {locked && <Lock className="size-3" />}
          {tag}
        </span>
      </div>
      <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">{name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>

      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-primary/50 bg-primary/10">
              <Check className="size-3 text-primary" />
            </span>
            <span className="text-sm text-foreground/80">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-xl border border-border bg-black/30 p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Como instalar</p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">{install}</p>
      </div>

      <div className="mt-auto pt-6">
        {meta.length > 0 && (
          <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {meta.join(" · ")}
          </p>
        )}
        {children}
      </div>
    </article>
  );
}

const primaryButton =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-6 font-display text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_12px_45px_hsl(var(--primary)/0.3)] transition-all hover:-translate-y-0.5 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";
const secondaryButton =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-black/40 px-6 font-display text-sm font-bold uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";

export default function DashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [details, setDetails] = useState<SubscriptionDetails | null>(null);
  const [osRelease, setOsRelease] = useState<ReleaseInfo | null>(null);
  const [retroBatRelease, setRetroBatRelease] = useState<ReleaseInfo | null>(null);
  const [biosAsset, setBiosAsset] = useState<BiosAsset | null>(null);
  const [retroBatThemes, setRetroBatThemes] = useState<RetroBatTheme[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [authRedirecting, setAuthRedirecting] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [pendingAction, setPendingAction] = useState<"checkout" | "portal" | "bios" | `theme:${string}` | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const sessionId = searchParams.get("session_id");

  const hasAccess =
    !!subscription &&
    ACTIVE_STATUSES.has(subscription.status) &&
    (!subscription.end_date || new Date(subscription.end_date) > new Date());

  const fetchSubscription = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) console.error("Error fetching subscription:", error);
    setSubscription(error ? null : data);
    if (!data) {
      setDetails(null);
      return;
    }

    const token = await accessToken();
    const body = await fetchJson<{ subscription: SubscriptionDetails | null }>(
      "/api/app/subscription",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setDetails(body?.subscription ?? null);
  }, []);

  const handleSignIn = useCallback(async () => {
    setAuthRedirecting(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });

      if (error) {
        console.error("Erro ao iniciar login:", error);
        setAuthRedirecting(false);
      } else if (data) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error signing in:", error);
      setAuthRedirecting(false);
    }
  }, []);

  const verifyCheckoutSession = useCallback(
    async (sessionId: string) => {
      setVerifyingSession(true);
      try {
        const response = await fetch("/api/verify-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await accessToken()}`,
          },
          body: JSON.stringify({
            sessionId,
            userId: user?.id,
          }),
        });

        if (response.ok) {
          await fetchSubscription(user?.id || "");
        } else {
          const responseData = await response.json().catch(() => ({}));
          console.error("Falha ao verificar sessão:", responseData.message);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      } finally {
        router.replace("/dashboard");
        setVerifyingSession(false);
      }
    },
    [user, router, fetchSubscription]
  );

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          await fetchSubscription(session.user.id);
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [fetchSubscription]);

  // Release metadata is public; it only fills versions and sizes on the cards.
  useEffect(() => {
    fetchJson<ReleaseInfo>("/api/app/update/latest").then(setOsRelease);
    fetchJson<ReleaseInfo>("/api/app/retrobat/latest").then(setRetroBatRelease);
    fetchJson<{ themes: RetroBatTheme[] }>("/api/app/retrobat/themes").then((body) =>
      setRetroBatThemes(body?.themes ?? [])
    );
  }, []);

  useEffect(() => {
    if (!hasAccess) {
      setBiosAsset(null);
      return;
    }
    accessToken().then((token) =>
      fetchJson<{ assets: BiosAsset[] }>("/api/app/bios/catalog", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((catalog) => setBiosAsset(catalog?.assets[0] ?? null))
    );
  }, [hasAccess]);

  useEffect(() => {
    if (!success || !sessionId || verifyingSession) return;
    if (user) {
      verifyCheckoutSession(sessionId);
      return;
    }
    const timeout = setTimeout(() => router.replace("/dashboard"), 5000);
    return () => clearTimeout(timeout);
  }, [success, sessionId, user, verifyingSession, router, verifyCheckoutSession]);

  const handleCheckout = async () => {
    if (!user) return;
    setPendingAction("checkout");
    setActionError(null);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await accessToken()}`,
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_1",
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
        return;
      }
      setActionError("Não foi possível abrir o pagamento. Tente novamente em instantes.");
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setActionError("Não foi possível abrir o pagamento. Verifique sua conexão.");
    }
    setPendingAction(null);
  };

  const handleManageBilling = async () => {
    setPendingAction("portal");
    setActionError(null);
    const body = await fetchJson<{ url?: string }>("/api/app/subscription/portal", {
      method: "POST",
      headers: { Authorization: `Bearer ${await accessToken()}` },
    });
    if (body?.url) {
      window.location.href = body.url;
      return;
    }
    setActionError("Não foi possível abrir o gerenciamento de pagamento. Fale com o suporte.");
    setPendingAction(null);
  };

  const handleThemeDownload = async (theme: RetroBatTheme) => {
    setPendingAction(`theme:${theme.id}`);
    setActionError(null);
    const body = await fetchJson<{ downloadUrl?: string }>(
      `/api/app/retrobat/themes/${encodeURIComponent(theme.id)}/download`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${await accessToken()}` },
      }
    );
    setPendingAction(null);
    if (body?.downloadUrl) {
      window.location.assign(body.downloadUrl);
      return;
    }
    setActionError(`Não foi possível liberar o tema ${theme.name} agora. Aguarde um minuto e tente novamente.`);
  };

  const handleBiosDownload = async () => {
    if (!biosAsset) return;
    setPendingAction("bios");
    setActionError(null);
    const body = await fetchJson<{ downloadUrl?: string }>(
      `/api/app/bios/downloads/${biosAsset.id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await accessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientVersion: "web-dashboard" }),
      }
    );
    setPendingAction(null);
    if (body?.downloadUrl) {
      window.location.assign(directDriveUrl(body.downloadUrl));
      return;
    }
    setActionError("Não foi possível liberar o pack de BIOS agora. Aguarde um minuto e tente novamente.");
  };

  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;

    setCancellingSubscription(true);
    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await accessToken()}`,
        },
        body: JSON.stringify({
          subscriptionId: subscription.subscription_id,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setShowCancelModal(false);
        await fetchSubscription(user.id);
      } else {
        console.error("Erro ao cancelar assinatura:", result);
        alert(
          "Erro ao cancelar sua assinatura. Por favor, tente novamente ou entre em contato com o suporte."
        );
      }
    } catch (error) {
      console.error("Erro na requisição de cancelamento:", error);
      alert(
        "Erro ao processar sua solicitação. Por favor, verifique sua conexão e tente novamente."
      );
    } finally {
      setCancellingSubscription(false);
    }
  };

  if (loading || authRedirecting) {
    return (
      <div className="flex site-page min-h-screen flex-col bg-background">
        <Header />
        <div id="main-content" role="main" tabIndex={-1} className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-primary border-opacity-50 mx-auto"></div>
            <p className="text-lg text-foreground/80">
              {loading ? "Verificando autenticação..." : "Redirecionando para autenticação..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex site-page min-h-screen flex-col bg-background">
        <Header />
        <div id="main-content" role="main" tabIndex={-1} className="flex flex-1 items-center justify-center px-6 pt-28">
          <div className="w-full max-w-md rounded-2xl border border-primary/40 bg-gradient-to-b from-primary/[0.07] to-background/90 p-8 text-center">
            <div className="glow-primary mx-auto mb-6 flex size-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <Gamepad2 className="size-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold uppercase text-foreground">
              Área do <span className="text-gradient-primary">membro</span>
            </h1>
            <p className="mt-3 text-muted-foreground">
              Entre com sua conta Google para ver sua assinatura e baixar o
              RIESCADE OS, o RIESCADE RetroBat e o pack de BIOS. Se for seu
              primeiro acesso, a conta é criada automaticamente.
            </p>
            <button onClick={handleSignIn} disabled={authRedirecting} className={`${primaryButton} mt-8`}>
              <FontAwesomeIcon icon={faGoogle} className="h-4 w-4" />
              Entrar com Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  const firstName = (user.user_metadata?.full_name as string | undefined)?.split(" ")[0];
  const avatarUrl = (user.user_metadata?.avatar_url || user.user_metadata?.picture) as string | undefined;
  const status = details?.status ?? subscription?.status;
  const statusLabel = subscription ? STATUS_LABELS[status ?? ""] ?? "Inativa" : "Sem assinatura";
  const periodEnd = details?.end_date ?? subscription?.end_date;
  const cancelsAtPeriodEnd = !!details?.cancel_at_period_end;
  const biosSize = formatSize(biosAsset?.file_size);

  return (
    <div className="site-page relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.10)_0%,transparent_60%)]" />

      <Header />

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        userEmail={user.email || ""}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        isSubmitting={cancellingSubscription}
      />

      <main id="main-content" tabIndex={-1} className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-32 md:px-12">
        <PageIntro
          eyebrow="Minha conta"
          title={<>{firstName ? `Olá, ${firstName}.` : "Seu próximo"} <span className="text-gradient-primary">{firstName ? "Bora jogar?" : "play."}</span></>}
          description="Acompanhe sua assinatura, veja há quanto tempo faz parte da RIESCADE e baixe os sistemas e o pack de BIOS."
        >
          <ExploreLink href="/tutorial">Como começar</ExploreLink>
        </PageIntro>

        {success && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-[#14d52a]/30 bg-[#14d52a]/10 p-5 animate-fade-in">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#14d52a]" />
            <div>
              <p className="font-semibold text-foreground">
                {verifyingSession ? "Confirmando seu pagamento..." : "Pagamento confirmado! Sua assinatura está ativa."}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Baixe um dos sistemas abaixo e entre com a mesma conta Google usada na assinatura.
              </p>
            </div>
          </div>
        )}

        {canceled && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-900/20 p-5 animate-fade-in">
            <XCircle className="mt-0.5 size-5 shrink-0 text-red-400" />
            <p className="text-red-300">
              Pagamento cancelado. Nenhuma cobrança foi feita. Se tiver dúvidas, fale com o suporte.
            </p>
          </div>
        )}

        {actionError && (
          <div role="alert" className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-900/20 p-5">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-400" />
            <p className="text-amber-200">{actionError}</p>
          </div>
        )}

        {/* RESUMO */}
        <section aria-label="Resumo da conta" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon={CalendarDays}
            label="Na RIESCADE há"
            value={formatAccountAge(user.created_at)}
            detail={`Desde ${formatAccountDate(user.created_at)}`}
          />
          <StatTile
            icon={Crown}
            label="Assinatura"
            value={statusLabel}
            tone={hasAccess ? "success" : subscription ? "warning" : "default"}
            detail={
              hasAccess
                ? `Assinante há ${formatAccountAge(subscription!.created_at)}`
                : subscription
                  ? `Assinou em ${formatAccountDate(subscription.created_at)}`
                  : "Assine para liberar os downloads"
            }
          />
          <StatTile
            icon={RefreshCw}
            label={hasAccess && !cancelsAtPeriodEnd ? "Próxima renovação" : "Acesso até"}
            value={hasAccess && periodEnd ? new Date(periodEnd).toLocaleDateString("pt-BR") : "—"}
            detail={
              hasAccess
                ? cancelsAtPeriodEnd
                  ? "Não será renovada"
                  : `${formatPrice(details)} por ${details?.interval === "year" ? "ano" : "mês"}`
                : "Nenhum período ativo"
            }
          />
          <StatTile
            icon={Clock3}
            label="Último acesso"
            value={user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("pt-BR") : "—"}
            detail={formatAccountDateTime(user.last_sign_in_at)}
          />
        </section>

        {/* CONTA + ASSINATURA */}
        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-card to-primary/[0.035] p-7 xl:col-span-2">
            <div className="flex items-center gap-4 border-b border-border pb-6">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="size-16 shrink-0 rounded-2xl border border-primary/50 object-cover shadow-[0_0_24px_hsl(var(--primary)/0.2)]"
                />
              ) : (
                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-primary/50 bg-primary/15">
                  <UserIcon className="size-7 text-primary" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Perfil RIESCADE</p>
                <h2 className="mt-1 truncate font-display text-xl font-bold text-foreground">
                  {user.user_metadata?.full_name || "Jogador"}
                </h2>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <dl className="mt-6 space-y-4 text-sm">
              {[
                ["Conta criada em", formatAccountDate(user.created_at)],
                ["Login", "Google"],
                ["Plano", hasAccess ? details?.plan_name || "RIESCADE Membro" : "Gratuito"],
                ["Assinante desde", subscription ? formatAccountDate(subscription.created_at) : "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 rounded-xl border border-border bg-black/30 p-4 text-xs leading-relaxed text-muted-foreground">
              Use esta mesma conta Google para entrar no RIESCADE OS e no RIESCADE RetroBat.
              Os aplicativos abrem o navegador nesta conta para liberar o acesso.
            </p>
          </div>

          {hasAccess ? (
            <div className="relative overflow-hidden rounded-2xl border-2 border-primary/50 bg-gradient-to-b from-primary/[0.07] to-background/90 p-7 xl:col-span-3">
              <CornerBrackets />
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                      {details?.plan_name || "RIESCADE Membro"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-display text-5xl font-bold text-foreground">{formatPrice(details)}</span>
                    <span className="font-mono text-sm text-muted-foreground">/{details?.interval === "year" ? "ano" : "mês"}</span>
                  </div>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#14d52a]/50 bg-[#14d52a]/10 px-3 py-1 font-mono text-xs font-bold uppercase text-[#14d52a]">
                  <span className="size-2 rounded-full bg-[#14d52a]" />
                  {statusLabel}
                </span>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InfoBox label="Assinante desde" value={formatAccountDate(subscription!.created_at)} />
                <InfoBox
                  label="Período atual"
                  value={`${new Date(details?.start_date ?? subscription!.start_date).toLocaleDateString("pt-BR")} — ${periodEnd ? new Date(periodEnd).toLocaleDateString("pt-BR") : "—"}`}
                />
                <InfoBox
                  label={cancelsAtPeriodEnd ? "Encerra em" : "Renova em"}
                  value={periodEnd ? formatAccountDate(periodEnd) : "—"}
                />
              </div>

              {cancelsAtPeriodEnd && (
                <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-900/20 p-4 text-sm text-amber-200">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  Sua assinatura não será renovada. O acesso continua até o fim do período atual.
                </p>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button onClick={handleManageBilling} disabled={pendingAction === "portal"} className={`${secondaryButton} sm:w-auto`}>
                  <CreditCard className="size-4" />
                  {pendingAction === "portal" ? "Abrindo..." : "Pagamento e faturas"}
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-900/30 hover:text-red-300"
                >
                  <XCircle className="size-4" />
                  Cancelar assinatura
                </button>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border-2 border-primary/50 bg-gradient-to-b from-primary/[0.07] to-background/90 p-7 animate-pulse-glow xl:col-span-3">
              <CornerBrackets />
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-primary" />
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                  {subscription ? "Reative sua assinatura" : "Torne-se membro"}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold text-foreground md:text-6xl">R$ 30</span>
                <span className="font-mono text-sm text-muted-foreground">/mês</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {subscription
                  ? `Sua assinatura está ${statusLabel.toLowerCase()}. Reative para voltar a baixar jogos e o pack de BIOS.`
                  : "Assinatura mensal sem fidelidade. Cancele quando quiser."}
              </p>

              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {MEMBER_BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-primary/50 bg-primary/10">
                      <Check className="size-3 text-primary" />
                    </span>
                    <span className="text-sm text-foreground/80">{benefit}</span>
                  </li>
                ))}
              </ul>

              <button onClick={handleCheckout} disabled={pendingAction === "checkout"} className={`${primaryButton} mt-8 h-14 text-base`}>
                <Zap className="size-5" />
                {pendingAction === "checkout" ? "Abrindo pagamento..." : subscription ? "Reativar assinatura" : "Assinar agora"}
              </button>
              <p className="mt-3 text-center font-mono text-xs text-muted-foreground">
                Pagamento 100% seguro via Stripe.
              </p>
            </div>
          )}
        </section>

        {/* DOWNLOADS */}
        <section id="downloads" className="mt-20 scroll-mt-28">
          <SectionHeading
            eyebrow="Downloads"
            title="Central de"
            highlight="downloads"
            description="Escolha como quer jogar. O RIESCADE OS é a experiência completa e mais simples de usar. O RIESCADE RetroBat é para quem prefere a interface clássica do EmulationStation. Os dois usam a mesma conta e a mesma assinatura."
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <DownloadCard
              icon={Monitor}
              tag="Recomendado"
              name={<>RIESCADE <span className="text-primary">OS</span></>}
              description="Nosso aplicativo próprio para Windows 11. Transforma o PC em uma central de jogos com biblioteca, emuladores e downloads em uma única interface, pensada para TV e controle."
              features={[
                "+250 plataformas com downloads de jogos dentro do app",
                "Emuladores, BIOS e temas instalados automaticamente",
                "RetroAchievements, scraping e multiplayer com amigos",
                "Atualizações automáticas pelo próprio aplicativo",
              ]}
              install="Extraia o arquivo .7z, abra o RIESCADE OS e entre em Configurações → Minha conta com sua conta Google."
              meta={[
                osRelease ? `Versão ${osRelease.version}` : "",
                formatSize(osRelease?.size) ?? "",
                "Windows 11",
              ].filter(Boolean)}
            >
              <a href="/api/app/update/download" className={primaryButton}>
                <Download className="size-4" />
                Baixar RIESCADE OS
              </a>
            </DownloadCard>

            <DownloadCard
              icon={Gamepad2}
              tag="EmulationStation"
              name={<>RIESCADE <span className="text-primary">RetroBat</span></>}
              description="O RetroBat com EmulationStation, já configurado e integrado à RIESCADE. Os jogos do catálogo aparecem na sua biblioteca e são baixados na hora em que você abre."
              features={[
                retroBatRelease ? `Baseado no RetroBat ${retroBatRelease.version}` : "Baseado no RetroBat mais recente",
                "Jogo, mídia e emulador baixados automaticamente ao jogar",
                "Login com Google na primeira abertura",
                "Independente: não precisa do RIESCADE OS instalado",
              ]}
              install="Extraia o .7z em uma pasta de sua preferência, execute RetroBat.exe e entre com sua conta Google. Sem assinatura, use “Continuar sem login” para usar como RetroBat comum."
              meta={[
                retroBatRelease ? `Versão ${retroBatRelease.version}` : "",
                formatSize(retroBatRelease?.size) ?? "",
                "Windows",
              ].filter(Boolean)}
            >
              {retroBatRelease ? (
                <a href="/api/app/retrobat/download" className={primaryButton}>
                  <Download className="size-4" />
                  Baixar RIESCADE RetroBat
                </a>
              ) : (
                <button disabled className={primaryButton}>Em breve</button>
              )}
            </DownloadCard>

            <DownloadCard
              icon={Cpu}
              tag={hasAccess ? "Membros" : "Exclusivo para membros"}
              locked={!hasAccess}
              name={<>Pack de <span className="text-primary">BIOS</span></>}
              description="Os arquivos de sistema que vários emuladores exigem para rodar jogos de consoles como PlayStation, Saturn, Dreamcast, Neo Geo e muitos outros."
              features={[
                "Pacote único com as BIOS de todas as plataformas suportadas",
                "Necessário para o RIESCADE RetroBat",
                "No RIESCADE OS as BIOS já são baixadas automaticamente",
              ]}
              install="Extraia o conteúdo do bios.zip dentro da pasta bios do RIESCADE RetroBat."
              meta={["bios.zip", biosSize ?? ""].filter(Boolean)}
            >
              {hasAccess ? (
                <button
                  onClick={handleBiosDownload}
                  disabled={!biosAsset || pendingAction === "bios"}
                  className={primaryButton}
                >
                  <Download className="size-4" />
                  {pendingAction === "bios" ? "Liberando..." : biosAsset ? "Baixar pack de BIOS" : "Carregando..."}
                </button>
              ) : (
                <button onClick={handleCheckout} disabled={pendingAction === "checkout"} className={secondaryButton}>
                  <Lock className="size-4" />
                  Assinar para liberar
                </button>
              )}
            </DownloadCard>
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-surface/30 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-3 text-sm text-muted-foreground">
              <Shield className="mt-0.5 size-4 shrink-0 text-primary" />
              {hasAccess
                ? "Os downloads de jogos ficam dentro dos aplicativos. Use sua conta somente nos seus próprios dispositivos."
                : "Os aplicativos são gratuitos. A assinatura libera os downloads de jogos dentro deles e o pack de BIOS."}
            </p>
            <ExploreLink href="/tutorial">Ver tutorial</ExploreLink>
          </div>
        </section>

        {/* TEMAS RETROBAT */}
        <section id="temas" className="mt-20 scroll-mt-28">
          <SectionHeading
            eyebrow="Temas"
            title="Temas exclusivos"
            highlight="RIESCADE"
            description="O RIESCADE RetroBat já vem com o tema RIESCADE Origins. Os temas abaixo são exclusivos para membros e podem ser instalados quando quiser."
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {(retroBatThemes ?? []).map((theme) => {
              const pending = pendingAction === `theme:${theme.id}`;
              return (
                <article
                  key={theme.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-card to-primary/[0.035] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
                >
                  <div className="relative aspect-video border-b border-white/10 bg-black/40">
                    <ThemePreview previewUrl={theme.previewUrl} name={theme.name} />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-black/70 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                      {!hasAccess && <Lock className="size-3" />}
                      {hasAccess ? "Membros" : "Exclusivo para membros"}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-xl font-bold uppercase tracking-wide text-foreground">
                      RIESCADE <span className="text-primary">{theme.name}</span>
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{theme.description}</p>
                    <div className="mt-auto pt-6">
                      <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        {[theme.version ? `v${theme.version}` : "", theme.fileName ?? `${theme.id}.retrobat.zip`, formatSize(theme.size) ?? ""].filter(Boolean).join(" · ")}
                      </p>
                      {!theme.fileName ? (
                        <button disabled className={secondaryButton}>Em breve</button>
                      ) : hasAccess ? (
                        <button
                          onClick={() => handleThemeDownload(theme)}
                          disabled={pending}
                          className={primaryButton}
                        >
                          <Download className="size-4" />
                          {pending ? "Liberando..." : "Baixar tema"}
                        </button>
                      ) : (
                        <button onClick={handleCheckout} disabled={pendingAction === "checkout"} className={secondaryButton}>
                          <Lock className="size-4" />
                          Assinar para liberar
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-black/30 p-6">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Como instalar</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              Extraia o .zip dentro da pasta <code className="font-mono text-foreground">emulationstation\.emulationstation\themes</code> do
              RIESCADE RetroBat. Depois, no EmulationStation, abra Configurações da interface → Conjunto de temas e escolha o tema.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function CornerBrackets() {
  return (
    <>
      <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-primary" />
      <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-primary" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-primary" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-primary" />
    </>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-black/35 p-4">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function ThemePreview({ previewUrl, name }: { previewUrl: string | null; name: string }) {
  const [error, setError] = useState(false);

  if (!previewUrl || error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-black/60 to-primary/10">
        <Palette className="size-10 text-primary/60" />
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{name}</span>
      </div>
    );
  }

  return (
    <Image
      src={previewUrl}
      alt={`Tema ${name}`}
      fill
      unoptimized
      onError={() => setError(true)}
      sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw"
      className="object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}
