import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { PageIntro, ExploreLink } from "@/components/PageIntro";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Archive,
  Cpu,
  Download,
  Gamepad2,
  HardDrive,
  LogIn,
  Monitor,
  Play,
  Sparkles,
  Users,
  UserCheck,
  CircleHelp,
  ArrowDown,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Como instalar o RIESCADE OS e o RIESCADE RetroBat",
  description:
    "Passo a passo para instalar o RIESCADE OS ou o RIESCADE RetroBat no Windows: download, login, pack de BIOS, emuladores e download de jogos.",
  alternates: { canonical: "/tutorial" },
};

interface Step {
  icon: LucideIcon;
  title: string;
  body: React.ReactNode;
}

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded-md border border-border bg-black/40 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
    {children}
  </code>
);

const Path = ({ children }: { children: React.ReactNode }) => (
  <strong className="font-semibold text-foreground">{children}</strong>
);

const requirements = [
  { icon: Monitor, title: "Windows 10 ou 11", text: "Versão de 64 bits." },
  { icon: UserCheck, title: "Conta Google", text: "A mesma no site e nos aplicativos." },
  { icon: Sparkles, title: "Assinatura ativa", text: "Libera os downloads de jogos e de BIOS." },
  { icon: Archive, title: "7-Zip ou WinRAR", text: "Para extrair os arquivos .7z e .zip." },
  { icon: HardDrive, title: "Espaço em disco", text: "O pack de BIOS ocupa cerca de 3 GB, além do espaço dos jogos." },
];

const osSteps: Step[] = [
  {
    icon: Download,
    title: "Baixe o aplicativo",
    body: (
      <>
        Entre em <Link href="/dashboard" className="text-primary hover:text-accent">Minha conta</Link> e,
        na <Path>Central de downloads</Path>, clique em <Path>Baixar RIESCADE OS</Path>. O botão sempre
        entrega a versão mais recente.
      </>
    ),
  },
  {
    icon: Archive,
    title: "Extraia em uma pasta",
    body: (
      <>
        Extraia o arquivo <Code>RIESCADE_OS_vX.X.X.7z</Code> em uma pasta própria, por exemplo{" "}
        <Code>C:\RIESCADE OS</Code>. Evite a pasta <Path>Arquivos de Programas</Path> e mantenha a
        estrutura de pastas como veio no pacote.
      </>
    ),
  },
  {
    icon: Play,
    title: "Abra o RIESCADE OS",
    body: (
      <>
        Execute <Code>RIESCADE.exe</Code> na raiz da pasta. Ele funciona com controle, teclado e mouse,
        e se atualiza sozinho quando sair uma versão nova.
      </>
    ),
  },
  {
    icon: LogIn,
    title: "Entre com sua conta",
    body: (
      <>
        Vá em <Path>Configurações → Minha Conta</Path> e escolha <Path>Entrar com Google</Path>. O
        navegador abre o site da RIESCADE. Conclua o login e o navegador devolve você ao aplicativo.
        Use a mesma conta Google da sua assinatura.
      </>
    ),
  },
  {
    icon: Cpu,
    title: "Instale o pack de BIOS",
    body: (
      <>
        Em <Path>Configurações → Downloads</Path>, na seção <Path>Pacote de BIOS</Path>, clique em{" "}
        <Path>Baixar BIOS</Path>. O aplicativo baixa e instala tudo na pasta <Code>bios</Code>. Sem as
        BIOS, jogos de vários consoles aparecem na biblioteca mas não iniciam.
      </>
    ),
  },
  {
    icon: Gamepad2,
    title: "Baixe e jogue",
    body: (
      <>
        Abra uma plataforma, escolha um jogo e use <Path>Baixar jogo</Path>. O emulador necessário é
        instalado automaticamente quando faltar. Para levar tudo de uma vez, use{" "}
        <Path>Baixar plataforma completa</Path> e <Path>Baixar mídias completas</Path>.
      </>
    ),
  },
  {
    icon: Users,
    title: "Jogue online com amigos",
    body: (
      <>
        Em <Path>Jogar online → Amigos</Path>, compartilhe seu código de amizade, adicione amigos e
        convide para uma partida privada. Cada pessoa precisa ter o mesmo jogo instalado.
      </>
    ),
  },
];

const retroBatSteps: Step[] = [
  {
    icon: Download,
    title: "Baixe o RetroBat e o pack de BIOS",
    body: (
      <>
        Em <Link href="/dashboard" className="text-primary hover:text-accent">Minha conta</Link>, baixe o{" "}
        <Path>RIESCADE RetroBat</Path> e o <Path>Pack de BIOS</Path>. O RetroBat vem com a pasta{" "}
        <Code>bios</Code> vazia, por isso o pack é necessário aqui.
      </>
    ),
  },
  {
    icon: Archive,
    title: "Extraia os arquivos",
    body: (
      <>
        Extraia o <Code>RIESCADE-vX.X.X.7z</Code> em uma pasta própria, por exemplo{" "}
        <Code>C:\RIESCADE RetroBat</Code>. Depois extraia o conteúdo do <Code>bios.zip</Code> dentro da
        pasta <Code>bios</Code> do RetroBat.
      </>
    ),
  },
  {
    icon: LogIn,
    title: "Abra e entre com sua conta",
    body: (
      <>
        Execute <Code>RetroBat.exe</Code>. Na primeira abertura aparece a central RIESCADE: escolha{" "}
        <Path>Entrar com Google</Path>, conclua o login no navegador e volte. O catálogo é preparado e o
        RetroBat continua sozinho. Nas próximas vezes ele abre direto.
      </>
    ),
  },
  {
    icon: Gamepad2,
    title: "Escolha um jogo e jogue",
    body: (
      <>
        Os jogos do catálogo já aparecem na biblioteca do EmulationStation. Ao abrir um jogo que ainda
        não está no seu PC, uma tela mostra o progresso do download do jogo, das mídias e do emulador.
        Quando termina, o jogo inicia automaticamente.
      </>
    ),
  },
  {
    icon: Sparkles,
    title: "Ainda não assina?",
    body: (
      <>
        Use <Path>Continuar sem login</Path> para usar como um RetroBat comum, com seus próprios jogos.
        Depois de assinar, abra novamente e use <Path>Verificar assinatura novamente</Path>.
      </>
    ),
  },
];

const faqs = [
  {
    q: "Preciso instalar os dois?",
    a: "Não. Escolha um. O RIESCADE OS é a experiência completa e mais simples. O RIESCADE RetroBat é para quem prefere a interface do EmulationStation. A mesma assinatura vale para os dois.",
  },
  {
    q: "O aplicativo diz que não tenho assinatura.",
    a: "Confira se entrou com a mesma conta Google usada no pagamento. Você pode ver o status em Minha conta. Se acabou de assinar, saia e entre novamente no aplicativo.",
  },
  {
    q: "O jogo aparece mas não abre.",
    a: "Na maioria das vezes falta a BIOS do console. No RIESCADE OS, instale o pacote em Configurações → Downloads. No RetroBat, confira se o bios.zip foi extraído dentro da pasta bios.",
  },
  {
    q: "Posso usar meus próprios jogos?",
    a: "Sim. Coloque cada jogo na subpasta da plataforma dentro de roms (por exemplo roms\\snes) e atualize a biblioteca. Não coloque os jogos soltos na raiz de roms.",
  },
  {
    q: "Os arquivos antigos do Drive (RIESCADE_BASE) ainda funcionam?",
    a: "Esse era o método antigo de instalação manual. Hoje os jogos, mídias e emuladores são baixados dentro dos aplicativos, sem copiar pastas à mão.",
  },
];

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="relative space-y-4">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="group relative flex gap-5 rounded-2xl border border-white/10 bg-gradient-to-br from-card to-primary/[0.035] p-6 transition-colors hover:border-primary/40"
        >
          <div className="flex shrink-0 flex-col items-center">
            <span className="glow-primary flex size-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 font-display text-lg font-bold text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wide text-foreground">
              <step.icon className="size-4 shrink-0 text-primary" />
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function GuideHeader({ eyebrow, title, highlight, description }: {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-primary">{eyebrow}</span>
      <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
        {title} <span className="text-gradient-primary">{highlight}</span>
      </h2>
      <p className="mt-3 max-w-3xl text-muted-foreground">{description}</p>
    </div>
  );
}

export default function TutorialPage() {
  return (
    <div className="site-page relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.10)_0%,transparent_60%)]" />
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }).replace(/</g, "\\u003c"),
        }}
      />

      <main id="main-content" tabIndex={-1} className="relative z-10 mx-auto w-full max-w-5xl flex-grow px-6 pb-24 pt-32 md:px-12">
        <PageIntro
          eyebrow="Guia de instalação"
          title={<>Tudo pronto para <span className="text-gradient-primary">jogar.</span></>}
          description="Instale o RIESCADE OS ou o RIESCADE RetroBat, entre com sua conta e baixe seus jogos direto pelo aplicativo."
        >
          <ExploreLink href="/dashboard">Ir para downloads</ExploreLink>
        </PageIntro>

        {/* ESCOLHA */}
        <section aria-labelledby="choose-title">
          <h2 id="choose-title" className="sr-only">Escolha seu sistema</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <a
              href="#riescade-os"
              className="group rounded-2xl border-2 border-primary/50 bg-gradient-to-b from-primary/[0.07] to-background/90 p-7 transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_hsl(var(--primary)/0.12)]"
            >
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Recomendado</span>
              <h3 className="mt-2 font-display text-2xl font-bold uppercase text-foreground">
                RIESCADE <span className="text-primary">OS</span>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Nosso aplicativo completo. Biblioteca, emuladores, BIOS, temas e jogo online em uma só interface.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Ver passo a passo <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
              </span>
            </a>
            <a
              href="#riescade-retrobat"
              className="group rounded-2xl border border-white/10 bg-gradient-to-br from-card to-primary/[0.035] p-7 transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">EmulationStation</span>
              <h3 className="mt-2 font-display text-2xl font-bold uppercase text-foreground">
                RIESCADE <span className="text-primary">RetroBat</span>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                O RetroBat clássico integrado à RIESCADE. Os jogos são baixados na hora em que você abre.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Ver passo a passo <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
              </span>
            </a>
          </div>
        </section>

        {/* REQUISITOS */}
        <section aria-labelledby="requirements-title" className="mt-16">
          <h2 id="requirements-title" className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.3em] text-primary">
            Antes de começar
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {requirements.map((item) => (
              <li key={item.title} className="rounded-2xl border border-border bg-surface/30 p-4">
                <item.icon className="size-4 text-primary" />
                <p className="mt-3 text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="riescade-os" className="mt-20 scroll-mt-28">
          <GuideHeader
            eyebrow="Opção 1"
            title="Instalando o"
            highlight="RIESCADE OS"
            description="Do download ao primeiro jogo em poucos minutos. Tudo, inclusive BIOS e emuladores, é baixado de dentro do aplicativo."
          />
          <StepList steps={osSteps} />
        </section>

        <section id="riescade-retrobat" className="mt-20 scroll-mt-28">
          <GuideHeader
            eyebrow="Opção 2"
            title="Instalando o"
            highlight="RIESCADE RetroBat"
            description="Independente do RIESCADE OS. Não é preciso ter os dois instalados."
          />
          <StepList steps={retroBatSteps} />
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-title" className="mt-20">
          <GuideHeader
            eyebrow="Dúvidas"
            title="Perguntas"
            highlight="frequentes"
            description="Não encontrou sua resposta? Fale com a comunidade no WhatsApp ou no Telegram."
          />
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-white/10 bg-gradient-to-br from-card to-primary/[0.035] p-5 open:border-primary/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
                  <span className="flex items-center gap-3">
                    <CircleHelp className="size-4 shrink-0 text-primary" />
                    {faq.q}
                  </span>
                  <span className="text-primary transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 pl-7 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://chat.whatsapp.com/Kn2eA8g8FIp0aTYV0iNYSe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-primary bg-primary px-6 font-display text-sm font-bold uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-0.5 hover:bg-accent"
            >
              Suporte no WhatsApp
            </a>
            <a
              href="https://t.me/riescade"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 bg-black/40 px-6 font-display text-sm font-bold uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10"
            >
              Telegram
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
