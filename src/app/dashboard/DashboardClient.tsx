"use client";

import { useState, useEffect, useCallback, useRef, type KeyboardEvent } from "react";
import Link from "next/link";
import { supabase, type Subscription } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertCircle, ArrowRight, CheckCircle2, Crown, Download, Gamepad2, Palette, Trophy, XCircle, type LucideIcon } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { CancelSubscriptionModal } from "@/components/CancelSubscriptionModal";
import { Callout, primaryButton } from "./ui";
import { SubscriptionTab, type SubscriptionDetails } from "./tabs/SubscriptionTab";
import { GamesTab } from "./tabs/GamesTab";
import { RecordsTab } from "./tabs/RecordsTab";
import { DownloadsTab, type BiosAsset, type ReleaseInfo } from "./tabs/DownloadsTab";
import { ThemesTab, type RetroBatTheme } from "./tabs/ThemesTab";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

// The subscription always comes first: without it, it is where the player learns how to subscribe.
const TABS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "assinatura", label: "Assinatura", icon: Crown },
  { id: "jogos", label: "Meus jogos", icon: Gamepad2 },
  { id: "recordes", label: "Recordes", icon: Trophy },
  { id: "downloads", label: "Downloads", icon: Download },
  { id: "temas", label: "Temas", icon: Palette },
];
type TabId = (typeof TABS)[number]["id"];

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

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-page flex min-h-screen flex-col bg-background">
      <Header />
      {children}
    </div>
  );
}

export default function DashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [details, setDetails] = useState<SubscriptionDetails | null>(null);
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
  const requestedTab = searchParams.get("tab");
  const [tab, setTab] = useState<TabId>(TABS.some((t) => t.id === requestedTab) ? requestedTab! : "assinatura");
  // Tabs are mounted on first visit and kept, so switching back does not refetch.
  const [visited, setVisited] = useState<Set<TabId>>(() => new Set([tab]));
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const hasAccess =
    !!subscription &&
    ACTIVE_STATUSES.has(subscription.status) &&
    (!subscription.end_date || new Date(subscription.end_date) > new Date());

  const selectTab = useCallback((id: TabId, focus = false) => {
    setTab(id);
    setVisited((previous) => (previous.has(id) ? previous : new Set(previous).add(id)));
    if (focus) tabRefs.current[id]?.focus();
    const url = new URL(window.location.href);
    if (id === "assinatura") url.searchParams.delete("tab");
    else url.searchParams.set("tab", id);
    window.history.replaceState(null, "", url);
  }, []);

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = TABS.findIndex((t) => t.id === tab);
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: TABS.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectTab(TABS[(next + TABS.length) % TABS.length].id, true);
  };

  const fetchSubscription = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle();

    if (error) console.error("Error fetching subscription:", error);
    setSubscription(error ? null : data);
    if (!data) {
      setDetails(null);
      return;
    }

    const token = await accessToken();
    const body = await fetchJson<{ subscription: SubscriptionDetails | null }>("/api/app/subscription", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDetails(body?.subscription ?? null);
  }, []);

  const handleSignIn = useCallback(async () => {
    setAuthRedirecting(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/dashboard" },
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
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await accessToken()}` },
          body: JSON.stringify({ sessionId, userId: user?.id }),
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
        const { data: { session } } = await supabase.auth.getSession();
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

  // Release metadata is public; it only fills versions and sizes.
  useEffect(() => {
    fetchJson<ReleaseInfo>("/api/app/retrobat/latest").then(setRetroBatRelease);
    fetchJson<{ themes: RetroBatTheme[] }>("/api/app/retrobat/themes").then((body) => setRetroBatThemes(body?.themes ?? []));
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await accessToken()}` },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_1" }),
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
    const body = await fetchJson<{ downloadUrl?: string }>(`/api/app/retrobat/themes/${encodeURIComponent(theme.id)}/download`, {
      method: "POST",
      headers: { Authorization: `Bearer ${await accessToken()}` },
    });
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
    const body = await fetchJson<{ downloadUrl?: string }>(`/api/app/bios/downloads/${biosAsset.id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ clientVersion: "web-dashboard" }),
    });
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await accessToken()}` },
        body: JSON.stringify({ subscriptionId: subscription.subscription_id }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setShowCancelModal(false);
        await fetchSubscription(user.id);
      } else {
        console.error("Erro ao cancelar assinatura:", result);
        alert("Erro ao cancelar sua assinatura. Por favor, tente novamente ou entre em contato com o suporte.");
      }
    } catch (error) {
      console.error("Erro na requisição de cancelamento:", error);
      alert("Erro ao processar sua solicitação. Por favor, verifique sua conexão e tente novamente.");
    } finally {
      setCancellingSubscription(false);
    }
  };

  if (loading || authRedirecting) {
    return (
      <PageShell>
        <div id="main-content" role="main" tabIndex={-1} className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            {loading ? "Verificando autenticação..." : "Redirecionando para autenticação..."}
          </div>
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <div id="main-content" role="main" tabIndex={-1} className="flex flex-1 items-center justify-center px-6 pt-28 pb-16">
          <div className="w-full max-w-md rounded-lg border border-border bg-card/40 p-8">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Minha conta</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-foreground">
              Área do <span className="text-primary">membro</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Entre com sua conta Google para ver sua assinatura, seus jogos e recordes, e baixar o RIESCADE e o pack de BIOS. No
              primeiro acesso, a conta é criada automaticamente.
            </p>
            <button onClick={handleSignIn} disabled={authRedirecting} className={`${primaryButton} mt-8 w-full py-3`}>
              <FontAwesomeIcon icon={faGoogle} className="h-4 w-4" />
              Entrar com Google
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  const firstName = (user.user_metadata?.full_name as string | undefined)?.split(" ")[0];

  return (
    <div className="site-page relative min-h-screen bg-background">
      <Header />

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        userEmail={user.email || ""}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        isSubmitting={cancellingSubscription}
      />

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-6 pt-24 pb-28">
        <nav aria-label="Navegação estrutural" className="pt-10 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">Início</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Minha conta</span>
        </nav>

        <header className="flex flex-col justify-between gap-6 pb-10 pt-8 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Minha conta</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              {firstName ? <>Olá, <span className="text-primary">{firstName}</span></> : <>Sua <span className="text-primary">conta</span></>}
            </h1>
          </div>
          <Link
            href="/tutorial"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-border bg-card px-5 py-2.5 font-mono text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary md:self-auto"
          >
            Como começar
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </header>

        <div className="mb-8 space-y-3 empty:hidden">
          {success && (
            <Callout icon={CheckCircle2} tone="success" title={verifyingSession ? "Confirmando seu pagamento..." : "Pagamento confirmado! Sua assinatura está ativa."}>
              Baixe o RIESCADE na aba Downloads e entre com a mesma conta Google usada na assinatura.
            </Callout>
          )}
          {canceled && (
            <Callout icon={XCircle} tone="danger" title="Pagamento cancelado">
              Nenhuma cobrança foi feita. Se tiver dúvidas, fale com o suporte.
            </Callout>
          )}
          {actionError && (
            <div role="alert">
              <Callout icon={AlertCircle} tone="warning" title={actionError} />
            </div>
          )}
        </div>

        <div role="tablist" aria-label="Seções da conta" className="-mx-6 mb-10 flex gap-1 overflow-x-auto border-b border-border px-6">
          {TABS.map(({ id, label, icon: Icon }) => {
            const selected = tab === id;
            return (
              <button
                key={id}
                ref={(node) => { tabRefs.current[id] = node; }}
                role="tab"
                id={`tab-${id}`}
                aria-selected={selected}
                aria-controls={`panel-${id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectTab(id)}
                onKeyDown={onTabKey}
                className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 font-mono text-xs uppercase tracking-wider transition-colors ${
                  selected ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${selected ? "text-primary" : ""}`} />
                {label}
                {id === "assinatura" && !hasAccess && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-label="Sem assinatura ativa" />}
              </button>
            );
          })}
        </div>

        {TABS.map(({ id }) =>
          visited.has(id) ? (
            <section key={id} role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} hidden={tab !== id} tabIndex={0} className="focus:outline-none">
              {id === "assinatura" && (
                <SubscriptionTab
                  user={user}
                  subscription={subscription}
                  details={details}
                  hasAccess={hasAccess}
                  pending={pendingAction}
                  onCheckout={handleCheckout}
                  onManageBilling={handleManageBilling}
                  onCancel={() => setShowCancelModal(true)}
                />
              )}
              {id === "jogos" && <GamesTab token={accessToken} />}
              {id === "recordes" && <RecordsTab token={accessToken} />}
              {id === "downloads" && (
                <DownloadsTab
                  release={retroBatRelease}
                  bios={biosAsset}
                  hasAccess={hasAccess}
                  pending={pendingAction}
                  onBios={handleBiosDownload}
                  onCheckout={handleCheckout}
                />
              )}
              {id === "temas" && (
                <ThemesTab themes={retroBatThemes} hasAccess={hasAccess} pending={pendingAction} onDownload={handleThemeDownload} onCheckout={handleCheckout} />
              )}
            </section>
          ) : null
        )}
      </main>

      <Footer />
    </div>
  );
}
