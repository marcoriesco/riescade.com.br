import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CircleHelp,
  Cpu,
  Download,
  Factory,
  Gamepad2,
  Library,
  BookOpen,
} from "lucide-react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import {
  PLATFORMS,
  getPlatform,
  getPlatformGameCounts,
  relatedPlatforms,
  type Platform,
} from "@/lib/platforms";

export const revalidate = 86400;

const SITE_URL = "https://www.riescade.com.br";

export function generateStaticParams() {
  return PLATFORMS.map((platform) => ({ platform: platform.slug }));
}

function describe(platform: Platform) {
  const year = platform.content?.year ? ` (${platform.content.year})` : "";
  return `Jogue ${platform.name}${year} no PC com o RIESCADE: emulador configurado, biblioteca com capas e downloads integrados. Funciona com controle no Windows.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ platform: string }>;
}): Promise<Metadata> {
  const platform = getPlatform((await params).platform);
  if (!platform) return { title: "Plataforma não encontrada", robots: { index: false } };

  const title = `Jogue ${platform.name} no PC — RIESCADE`;
  const description = describe(platform);
  const image = platform.image ?? platform.logo ?? "/images/og-image.webp";
  return {
    title,
    description,
    alternates: { canonical: `/platforms/${platform.slug}` },
    robots: { index: platform.indexable, follow: true },
    openGraph: { type: "website", url: `/platforms/${platform.slug}`, title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

function faqFor(platform: Platform) {
  const bios = platform.content?.bios;
  return [
    {
      q: `Dá para jogar ${platform.name} no PC?`,
      a: `Sim. O RIESCADE reúne o emulador de ${platform.name} já configurado, organiza seus jogos com capas e informações e inicia tudo com um clique, usando controle, teclado ou mouse no Windows.`,
    },
    {
      q: `Preciso de BIOS para jogar ${platform.name}?`,
      a: bios
        ? `Sim, ${platform.name} necessita de arquivos de BIOS ou firmware. No RIESCADE, o pacote completo de BIOS está disponível para membros em Minha Conta → Downloads.`
        : `Na maioria dos casos, não. Os jogos de ${platform.name} rodam direto no emulador configurado pelo RIESCADE, sem arquivos de BIOS adicionais.`,
    },
    {
      q: "Posso jogar com controle?",
      a: "Sim. O RIESCADE detecta controles XInput, DirectInput e HID automaticamente e configura cada emulador, sem precisar mapear botões manualmente.",
    },
    {
      q: "Quanto custa?",
      a: "O aplicativo RIESCADE é gratuito. A assinatura de R$ 30 por mês, sem fidelidade, libera os downloads de jogos e mídias dentro do aplicativo, o pacote de BIOS e o suporte VIP.",
    },
  ];
}

export default async function PlatformPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const platform = getPlatform((await params).platform);
  if (!platform) notFound();

  const counts = await getPlatformGameCounts();
  const games = counts[platform.slug] ?? 0;
  const related = relatedPlatforms(platform);
  const faqs = faqFor(platform);
  const art = platform.image ?? platform.logo;
  const facts = [
    platform.content?.maker && { icon: Factory, label: "Fabricante", value: platform.content.maker },
    platform.content?.year && { icon: CalendarDays, label: "Lançamento", value: String(platform.content.year) },
    platform.kindLabel && { icon: Gamepad2, label: "Tipo", value: platform.kindLabel },
    games > 0 && { icon: Library, label: "Catálogo RIESCADE", value: `${games.toLocaleString("pt-BR")} jogos` },
    { icon: Cpu, label: "BIOS", value: platform.content?.bios ? "Obrigatória" : "Não necessária" },
  ].filter(Boolean) as { icon: typeof Factory; label: string; value: string }[];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Plataformas", item: `${SITE_URL}/platforms` },
        { "@type": "ListItem", position: 3, name: platform.name, item: `${SITE_URL}/platforms/${platform.slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
  ];

  return (
    <div className="site-page relative min-h-screen bg-background">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-6 pt-24 pb-28">
        {/* Breadcrumb Navigation idêntico ao wiki/[system] */}
        <nav aria-label="Navegação estrutural" className="pt-10 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Início</Link>
          <span className="mx-2">/</span>
          <Link href="/platforms" className="hover:text-foreground transition-colors">Plataformas</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{platform.name}</span>
        </nav>

        {/* HERO SECTION */}
        <header className="pb-12 pt-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 border border-primary/30 px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
                  <Gamepad2 className="h-3 w-3" />
                  {platform.kindLabel || "Plataforma"}
                </span>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {[platform.content?.maker, platform.content?.year].filter(Boolean).join(" · ")}
                </p>
              </div>

              <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-6xl text-foreground">
                Jogue <span className="text-primary">{platform.name}</span> no PC
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                {platform.content?.summary ??
                  `Os jogos de ${platform.name} organizados na biblioteca do RIESCADE, prontos para jogar no Windows com controle, capas e downloads sob demanda.`}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard#downloads"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-mono text-xs font-bold text-black transition-all hover:bg-accent shadow-sm"
                >
                  <Download className="size-4" />
                  Baixar RIESCADE
                </Link>
                <Link
                  href={`/wiki/${platform.slug}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 font-mono text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary"
                >
                  <BookOpen className="size-4" />
                  Ver guia na Wiki
                </Link>
              </div>
            </div>

            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-border bg-card p-6">
              {art ? (
                <Image
                  src={art}
                  alt={platform.name}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-contain p-6"
                />
              ) : (
                <Gamepad2 className="size-20 text-muted-foreground/30" />
              )}
            </div>
          </div>

          {/* FICHA (Lovable hairline style) */}
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg bg-border text-sm sm:grid-cols-2 lg:grid-cols-5 [&>div]:bg-card [&>div]:px-5 [&>div]:py-4">
            {facts.map((fact) => (
              <div key={fact.label}>
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <fact.icon className="size-3 text-primary" />
                  {fact.label}
                </p>
                <p className="mt-1 font-mono text-base text-foreground font-semibold">{fact.value}</p>
              </div>
            ))}
          </div>
        </header>

        {/* COMO JOGAR */}
        <section className="mt-8 border-t border-border/60 pt-12">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold text-primary">01</span>
            <span className="text-border">/</span>
            <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Como jogar {platform.name} no PC
            </h2>
          </div>

          <ol className="mt-8 space-y-0 max-w-3xl">
            {[
              {
                step: "1",
                title: "Baixe e extraia o aplicativo RIESCADE",
                text: "Gratuito para Windows 10 e 11. Baixe o instalador em Minha Conta e extraia na pasta de sua escolha (ex: C:\\RIESCADE).",
              },
              {
                step: "2",
                title: platform.content?.bios ? "Instale o Pack de BIOS na pasta bios\\" : "Faça login com sua conta Google",
                text: platform.content?.bios
                  ? `Os emuladores de ${platform.name} exigem arquivos de BIOS. Baixe o pack completo em Minha Conta e extraia dentro da pasta C:\\RIESCADE\\bios\\.`
                  : "Abra o RetroBat.exe e faça login com sua conta Google para sincronizar seu catálogo e habilitar os downloads com 1 clique.",
              },
              {
                step: "3",
                title: `Abra ${platform.name} e inicie a partida`,
                text: `Selecione a plataforma ${platform.name} na lista, escolha seu jogo e pressione o botão do controle. O emulador e as mídias são configurados automaticamente.`,
              },
            ].map((s) => (
              <li key={s.step} className="relative grid grid-cols-[2rem_1fr] gap-4 pb-8 last:pb-0">
                <span className="absolute bottom-0 left-[0.7rem] top-7 w-px bg-border" />
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary ring-4 ring-background">
                  {s.step}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground text-base">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          {platform.extensions.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card/50 p-4">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Formatos aceitos:</span>
              <div className="flex flex-wrap gap-1.5">
                {platform.extensions.map((ext) => (
                  <code key={ext} className="rounded border border-border bg-background px-2 py-0.5 font-mono text-xs text-foreground">
                    {ext}
                  </code>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* CTA ASSINATURA */}
        <section className="mt-16 rounded-lg border border-border bg-card p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground md:text-3xl">
                {games > 0 ? `${games.toLocaleString("pt-BR")} jogos de ${platform.name}` : platform.name}{" "}
                <span className="text-primary">a um clique</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Baixe jogos, capas 3D e mídias direto no aplicativo. Sem configurações complexas, com suporte VIP e catálogo ilimitado.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary flex-shrink-0" />
                  Downloads integrados diretamente ao RIESCADE
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary flex-shrink-0" />
                  Pack de BIOS completo incluído
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary flex-shrink-0" />
                  Mais de 250 plataformas reunidas na mesma interface
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-start md:items-end flex-shrink-0">
              <p className="font-display text-3xl font-bold text-foreground">
                R$ 30<span className="font-mono text-xs font-normal text-muted-foreground">/mês</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">Sem fidelidade. Cancele quando quiser.</p>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 font-mono text-xs font-bold text-black transition-all hover:bg-accent"
              >
                Assinar agora
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-title" className="mt-16 border-t border-border/60 pt-12 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold text-primary">02</span>
            <span className="text-border">/</span>
            <h2 id="faq-title" className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Perguntas frequentes sobre {platform.name}
            </h2>
          </div>

          <div className="mt-6 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-lg border border-border bg-card/40 p-4 transition-all open:bg-card open:border-primary/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground text-sm">
                  <span className="flex items-center gap-2.5">
                    <CircleHelp className="size-4 shrink-0 text-primary" />
                    {faq.q}
                  </span>
                  <span className="text-primary font-mono text-lg transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 pl-6 text-xs leading-relaxed text-muted-foreground border-t border-border/60 pt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* RELACIONADAS */}
        {related.length > 0 && (
          <section aria-labelledby="related-title" className="mt-16 border-t border-border/60 pt-12">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Sistemas relacionados
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {related.map((other) => (
                <Link
                  key={other.slug}
                  href={`/platforms/${other.slug}`}
                  className="group flex flex-col justify-between rounded-lg border border-border bg-card p-3.5 transition-all hover:border-primary/50"
                >
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{other.name}</span>
                  <span className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                    {other.content?.year ?? other.kindLabel}
                    <ArrowUpRight className="size-3 group-hover:text-primary" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
