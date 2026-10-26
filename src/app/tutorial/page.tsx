import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Download,
  FolderArchive,
  Gamepad2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Como instalar e configurar o RIESCADE no Windows",
  description:
    "Passo a passo completo para instalar o RIESCADE no Windows: download do aplicativo, pack de BIOS, login com Google, emuladores e como jogar.",
  alternates: { canonical: "/tutorial" },
  openGraph: {
    title: "Como instalar e configurar o RIESCADE no Windows",
    description:
      "Guia oficial para instalar o RIESCADE no PC: download, pack de BIOS, login e execução de jogos.",
    type: "article",
    url: "https://www.riescade.com.br/tutorial",
  },
};

const REQUIREMENTS = [
  { item: "Sistema operacional", value: "Windows 10 ou Windows 11 (64 bits)", note: "Recomendado 64 bits atualizado" },
  { item: "Descompactador", value: "7-Zip ou WinRAR", note: "Necessário para extrair arquivos .7z e .zip" },
  { item: "Conta Google", value: "Mesma conta da assinatura", note: "Usada para liberar o catálogo e downloads" },
  { item: "Espaço em disco", value: "Mínimo 5 GB livres", note: "3 GB para BIOS + espaço para seus jogos" },
  { item: "Controles", value: "Xbox, PlayStation ou Genérico", note: "Mapeamento automático Plug & Play" },
];

const INSTALL_STEPS = [
  {
    step: "1",
    title: "Baixe o aplicativo RIESCADE e o Pack de BIOS",
    body: (
      <>
        Acesse a seção de downloads em{" "}
        <Link href="/dashboard#downloads" className="text-primary hover:underline font-medium">
          Minha Conta → Downloads
        </Link>
        . Baixe o instalador do <strong className="text-foreground">RIESCADE</strong> (arquivo compactado{" "}
        <code className="font-mono text-xs text-primary">.7z</code>) e o pacote completo de{" "}
        <strong className="text-foreground">BIOS</strong> (<code className="font-mono text-xs text-primary">bios.zip</code>).
      </>
    ),
  },
  {
    step: "2",
    title: "Extraia o RIESCADE em uma pasta dedicada",
    body: (
      <>
        Com o 7-Zip ou WinRAR, extraia o arquivo do aplicativo na raiz de um disco, por exemplo{" "}
        <code className="font-mono text-xs text-primary bg-card px-1.5 py-0.5 rounded border border-border">C:\RIESCADE\</code> ou em um HD externo.{" "}
        <span className="text-muted-foreground">
          Evite a pasta <em>Arquivos de Programas</em> para prevenir restrições de permissões do Windows.
        </span>
      </>
    ),
  },
  {
    step: "3",
    title: "Instale o Pack de BIOS na pasta bios\\",
    body: (
      <>
        Abra o arquivo <code className="font-mono text-xs text-foreground">bios.zip</code> baixado e extraia todo o seu conteúdo
        diretamente dentro da pasta <code className="font-mono text-xs text-primary bg-card px-1.5 py-0.5 rounded border border-border">C:\RIESCADE\bios\</code>.
        As BIOS são obrigatórias para que consoles como PS1, PS2, Saturn, Sega CD e Dreamcast possam inicializar os jogos.
      </>
    ),
  },
  {
    step: "4",
    title: "Inicie o RetroBat.exe e faça login com sua conta",
    body: (
      <>
        Dentro da pasta do RIESCADE, execute o arquivo <code className="font-mono text-xs text-primary font-bold">RetroBat.exe</code>.
        Na primeira inicialização, uma tela de boas-vindas exibirá a opção de <strong className="text-foreground">Entrar com Google</strong>.
        Clique no botão, conclua a autenticação na janela do navegador e volte para o aplicativo. Sua assinatura será reconhecida instantaneamente.
      </>
    ),
  },
  {
    step: "5",
    title: "Navegue pelo catálogo e comece a jogar",
    body: (
      <>
        Todos os jogos do catálogo na nuvem aparecem organizados por consoles, portáteis e arcades. Ao selecionar qualquer jogo pela primeira vez,
        o RIESCADE faz o download automático da ROM, das artes (capas 3D, títulos e vídeos) e do emulador pré-configurado. Em seguida, o jogo inicia sozinho!
      </>
    ),
  },
];

const FAQS = [
  {
    q: "O aplicativo diz que não possuo assinatura ativa.",
    a: "Confira se você fez login no aplicativo com o mesmo e-mail Google utilizado no momento da assinatura. Você pode checar o status da sua assinatura na página Minha Conta do site.",
  },
  {
    q: "O jogo aparece na lista mas a tela fecha e volta para o menu.",
    a: "Na grande maioria dos casos, isso ocorre pela falta das BIOS do sistema correspondente. Certifique-se de que extraiu o arquivo bios.zip completo dentro da subpasta bios\\ do RIESCADE.",
  },
  {
    q: "Posso adicionar minhas próprias ROMs e jogos que já possuo?",
    a: "Sim! O RIESCADE suporta tanto os jogos do catálogo em nuvem quanto suas próprias ROMs locais. Basta colocar os arquivos na subpasta correta em roms\\ (consulte a nossa Wiki de Sistemas) e pressionar F5 no aplicativo.",
  },
  {
    q: "Como conectar e configurar meu controle?",
    a: "O RIESCADE detecta controles de Xbox One/Series, PlayStation (DualShock 4 / DualSense), Nintendo Switch Pro e genéricos DirectInput/XInput de forma 100% Plug & Play. Ao conectar o controle via USB ou Bluetooth, ele já estará mapeado.",
  },
  {
    q: "Posso utilizar o RIESCADE em um HD externo ou Pendrive?",
    a: "Sim! O RIESCADE é totalmente portátil. Você pode manter toda a pasta em um HD externo ou SSD portátil e conectar em qualquer computador com Windows 10 ou 11.",
  },
];

export default function TutorialPage() {
  return (
    <div className="site-page relative min-h-screen bg-background">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "Como instalar e configurar o RIESCADE no Windows",
            step: INSTALL_STEPS.map((s, idx) => ({
              "@type": "HowToStep",
              position: idx + 1,
              name: s.title,
            })),
          }).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }).replace(/</g, "\\u003c"),
        }}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-6xl px-6 pt-24 pb-28"
      >
        {/* Breadcrumb Navigation idêntico ao wiki/[system] */}
        <nav aria-label="Navegação estrutural" className="pt-10 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Início
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Tutorial</span>
        </nav>

        {/* Tutorial Header */}
        <header className="pb-12 pt-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 border border-primary/30 px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
              <Sparkles className="h-3 w-3" />
              Guia Oficial
            </span>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Windows 10 & 11 · +240 Plataformas
            </p>
          </div>

          <div className="mt-4">
            <h1 className="max-w-4xl font-display text-4xl font-extrabold tracking-tight md:text-6xl text-foreground">
              Como instalar e configurar o <span className="text-primary">RIESCADE</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Do download ao primeiro jogo em poucos minutos. Baixe o aplicativo oficial, instale o pacote de BIOS
              e tenha acesso a uma central completa com mais de 240 sistemas retrô e modernos com downloads sob demanda.
            </p>
          </div>

          {/* Quick Info Grid 3 Cols (Lovable hairline style) */}
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg bg-border text-sm sm:grid-cols-3 [&>div]:bg-card [&>div]:px-5 [&>div]:py-4">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-mono">Compatibilidade</p>
              <p className="mt-1 font-mono text-base text-foreground">Windows 10 / 11 (64-bit)</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-mono">Autenticação</p>
              <p className="mt-1 font-mono text-base text-primary">Login com Google</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-mono">Arquivos essenciais</p>
              <p className="mt-1 font-mono text-base text-foreground">App + Pack de BIOS</p>
            </div>
          </div>
        </header>

        {/* 2-Column Layout: Main Article and Sticky "Nesta página" Sidebar */}
        <div className="grid gap-16 lg:grid-cols-[1fr_220px]">
          {/* Main Content Article */}
          <article className="max-w-3xl divide-y divide-border/60">
            {/* SEÇÃO 01: REQUISITOS */}
            <section id="requisitos" className="scroll-mt-24 py-12 first:border-t-0 first:pt-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-primary">01</span>
                <span className="text-border">/</span>
                <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  Requisitos do sistema
                </h2>
              </div>

              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Antes de iniciar o download, certifique-se de que seu computador atende aos requisitos básicos:
              </p>

              <div className="mt-6 overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-card text-xs uppercase text-muted-foreground font-mono border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Componente</th>
                      <th className="px-4 py-3">Requisito</th>
                      <th className="px-4 py-3 hidden sm:table-cell">Observação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-card/40">
                    {REQUIREMENTS.map((req) => (
                      <tr key={req.item} className="transition-colors hover:bg-card/80">
                        <td className="px-4 py-3 font-medium text-foreground">{req.item}</td>
                        <td className="px-4 py-3 font-mono text-xs text-primary">{req.value}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{req.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* SEÇÃO 02: PASSO A PASSO */}
            <section id="instalacao" className="scroll-mt-24 py-12">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-primary">02</span>
                <span className="text-border">/</span>
                <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  Passo a passo de instalação
                </h2>
              </div>

              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Siga as etapas abaixo para ter o RIESCADE funcionando no seu computador com todos os sistemas liberados:
              </p>

              <ol className="mt-8 space-y-0">
                {INSTALL_STEPS.map((step) => (
                  <li key={step.step} className="relative grid grid-cols-[2rem_1fr] gap-4 pb-8 last:pb-0">
                    <span className="absolute bottom-0 left-[0.7rem] top-7 w-px bg-border" />
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary ring-4 ring-background">
                      {step.step}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground text-base">{step.title}</h3>
                      <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {step.body}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Callout de dica no padrão border-l do Lovable */}
              <div className="mt-8 border-l-2 border-primary pl-4 text-sm text-muted-foreground leading-relaxed">
                <div className="flex items-center gap-2 font-semibold text-foreground mb-1">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Pronto para jogar
                </div>
                Não é necessário configurar emuladores manualmente. Cada núcleo do RetroArch ou emulador independente (DuckStation, PCSX2, Dolphin, RPCS3)
                já vem pré-configurado pelo RIESCADE para entregar a melhor qualidade gráfica e resposta do controle.
              </div>
            </section>

            {/* SEÇÃO 03: ADICIONAR JOGOS PRÓPRIOS */}
            <section id="adicionar-jogos" className="scroll-mt-24 py-12">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-primary">03</span>
                <span className="text-border">/</span>
                <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  Como adicionar seus próprios jogos e ROMs
                </h2>
              </div>

              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Além do catálogo em nuvem com downloads automáticos, você pode adicionar qualquer jogo ou coleção que já tenha no seu computador.
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-border bg-card/50 p-5">
                  <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <FolderArchive className="h-4 w-4 text-primary" />
                    1. Encontre a pasta do sistema
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    Dentro do diretório onde instalou o RIESCADE, acesse a pasta <code className="font-mono text-primary">roms\</code>.
                    Cada sistema possui sua própria subpasta dedicada:
                  </p>
                  <ul className="mt-3 space-y-1 font-mono text-xs text-muted-foreground">
                    <li>• Super Nintendo: <code className="text-foreground">roms\snes\</code></li>
                    <li>• PlayStation 1: <code className="text-foreground">roms\psx\</code></li>
                    <li>• PlayStation 2: <code className="text-foreground">roms\ps2\</code></li>
                    <li>• Jogos de PC / Windows: <code className="text-foreground">roms\windows\</code></li>
                  </ul>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-5">
                  <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4 text-primary" />
                    2. Coloque as ROMs nos formatos corretos
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    Para consoles de CD/DVD (PS1, PS2, Saturn), recomendamos utilizar o formato <code className="text-primary font-mono font-semibold">.chd</code> para economizar até 60% de espaço.
                    Para jogos de cartucho (Mega Drive, SNES, N64), formatos <code className="text-foreground font-mono">.zip</code> ou ROMs puras funcionam direto.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-5">
                  <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    3. Recarregue a lista no RIESCADE
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    Com o RIESCADE aberto, pressione a tecla <kbd className="rounded border border-border bg-black/50 px-1.5 py-0.5 font-mono text-[11px] text-foreground">F5</kbd> no teclado
                    ou pressione <strong className="text-foreground">START → Atualizar lista de jogos</strong> no controle. Os novos jogos aparecerão na hora!
                  </p>
                </div>
              </div>

              {/* Botão para consultar a Wiki completa */}
              <div className="mt-6 flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Consulte as pastas e extensões de cada console</p>
                  <p className="text-xs text-muted-foreground">Mais de 240 sistemas documentados com formatos recomendados e BIOS necessárias.</p>
                </div>
                <Link
                  href="/wiki"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 font-mono text-xs font-bold text-black transition-all hover:bg-accent flex-shrink-0"
                >
                  Abrir Wiki
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </section>

            {/* SEÇÃO 04: TEMAS */}
            <section id="temas" className="scroll-mt-24 py-12">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-primary">04</span>
                <span className="text-border">/</span>
                <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  Temas e personalização
                </h2>
              </div>

              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                O RIESCADE acompanha diversos temas visuais exclusivos inspirados no PlayStation 5, Xbox Series, CoinOPS,
                HyperSpin e interfaces arcade. Para trocar de tema:
              </p>

              <ol className="mt-4 list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Abra o RIESCADE e pressione o botão <strong className="text-foreground">START</strong> no controle (ou <strong className="text-foreground">Espaço</strong> no teclado).</li>
                <li>Navegue até a opção <strong className="text-foreground">Configurações de Interface (UI Settings)</strong>.</li>
                <li>Selecione <strong className="text-foreground">Tema (Theme Set)</strong> e escolha entre os temas instalados.</li>
                <li>O visual do sistema será alterado instantaneamente sem necessidade de reiniciar.</li>
              </ol>
            </section>

            {/* SEÇÃO 05: FAQ */}
            <section id="faq" className="scroll-mt-24 py-12">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-primary">05</span>
                <span className="text-border">/</span>
                <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  Perguntas frequentes
                </h2>
              </div>

              <div className="mt-6 space-y-3">
                {FAQS.map((faq) => (
                  <details
                    key={faq.q}
                    className="group rounded-lg border border-border bg-card/40 p-4 transition-all open:bg-card open:border-primary/40"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground text-sm">
                      <span>{faq.q}</span>
                      <span className="text-primary font-mono text-lg transition-transform group-open:rotate-45" aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground border-t border-border/60 pt-3">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            {/* SEÇÃO 06: SUPORTE */}
            <section id="suporte" className="scroll-mt-24 py-12">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-primary">06</span>
                <span className="text-border">/</span>
                <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  Suporte VIP e Comunidade
                </h2>
              </div>

              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Ficou com alguma dúvida ou precisa de ajuda para configurar um jogo específico? Nossa equipe e comunidade estão prontas para ajudar:
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href="https://chat.whatsapp.com/Kn2eA8g8FIp0aTYV0iNYSe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-mono text-xs font-bold text-black transition-all hover:bg-accent"
                >
                  <MessageCircle className="h-4 w-4" />
                  Comunidade no WhatsApp
                </a>
                <a
                  href="https://t.me/riescade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 font-mono text-xs font-bold text-foreground transition-all hover:border-primary hover:text-primary"
                >
                  <ExternalLink className="h-4 w-4" />
                  Canal no Telegram
                </a>
              </div>
            </section>
          </article>

          {/* Sticky Sidebar "Nesta página" estilo Lovable */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 border-l border-border pl-5 pt-2">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Nesta página
              </p>
              <nav className="mt-4 space-y-2 text-sm">
                <a
                  href="#requisitos"
                  className="block text-muted-foreground transition-colors hover:text-foreground text-xs"
                >
                  Requisitos do sistema
                </a>
                <a
                  href="#instalacao"
                  className="block text-muted-foreground transition-colors hover:text-foreground text-xs"
                >
                  Passo a passo
                </a>
                <a
                  href="#adicionar-jogos"
                  className="block text-muted-foreground transition-colors hover:text-foreground text-xs"
                >
                  Adicionar jogos próprios
                </a>
                <a
                  href="#temas"
                  className="block text-muted-foreground transition-colors hover:text-foreground text-xs"
                >
                  Temas e interface
                </a>
                <a
                  href="#faq"
                  className="block text-muted-foreground transition-colors hover:text-foreground text-xs"
                >
                  Perguntas frequentes
                </a>
                <a
                  href="#suporte"
                  className="block text-muted-foreground transition-colors hover:text-foreground text-xs"
                >
                  Suporte VIP
                </a>
              </nav>

              <div className="mt-10 border-t border-border/60 pt-6">
                <Link
                  href="/dashboard#downloads"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 border border-primary/30 px-3 py-2 font-mono text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                >
                  <Download className="h-3.5 w-3.5" />
                  Baixar RIESCADE
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
