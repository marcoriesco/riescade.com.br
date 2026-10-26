'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import {
	Zap,
	Trophy,
	Gamepad2,
	Users,
	Monitor,
	Download,
	Sparkles,
	Check,
	Play,
	Cpu,
	SlidersHorizontal,
	ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BlogPostsPreview from '@/components/BlogPostsPreview';
import { GoogleReviews } from '@/components/GoogleReviews';
import { HOME_FAQ } from '@/data/home-faq';

const screenshots = [
	{ src: '/screenshots/loading.webp', title: 'Loading', subtitle: 'RIESCADE' },
	{ src: '/screenshots/allgames.webp', title: 'Jogos', subtitle: 'RIESCADE' },
	{
		src: '/screenshots/emulators.webp',
		title: 'Emuladores',
		subtitle: 'RIESCADE',
	},
	{ src: '/screenshots/arcade.webp', title: 'Arcade', subtitle: 'RIESCADE' },
	{
		src: '/screenshots/sf3.webp',
		title: 'Street Fighter III',
		subtitle: 'Arcade',
	},
	{
		src: '/screenshots/switch.webp',
		title: 'Nintendo Switch',
		subtitle: 'Consoles',
	},
	{
		src: '/screenshots/mariowonder.webp',
		title: 'Super Mario Bros. Wonder',
		subtitle: 'Nintendo Switch',
	},
	{ src: '/screenshots/windows.webp', title: 'Windows', subtitle: 'PC Gamer' },
	{
		src: '/screenshots/n64dd.webp',
		title: 'Nintendo 64 Disk',
		subtitle: 'Extensões',
	},
	{ src: '/screenshots/psvita.webp', title: 'PS Vita', subtitle: 'Portáteis' },
	{
		src: '/screenshots/pinballm.webp',
		title: 'Pinball M',
		subtitle: 'Pinballs',
	},
	{ src: '/screenshots/doom3.webp', title: 'DOOM 3', subtitle: 'Ports' },
];

const features = [
	{
		icon: Zap,
		title: 'Alto Desempenho',
		description:
			'Jogabilidade ultrarrápida com emulação otimizada e latência mínima.',
	},
	{
		icon: Gamepad2,
		title: '+250 Plataformas',
		description:
			'Do Atari ao Nintendo Switch. Todos os consoles e arcades clássicos.',
	},
	{
		icon: Users,
		title: 'Comunidade VIP',
		description: 'Suporte no Discord, WhatsApp e Telegram com a comunidade.',
	},
	{
		icon: Download,
		title: 'Download Ilimitado',
		description: 'Downloads integrados diretamente ao aplicativo RIESCADE.',
	},
	{
		icon: Trophy,
		title: 'RetroAchievements',
		description:
			'Integração completa com RetroAchievements e scraping automático.',
	},
	{
		icon: Monitor,
		title: 'Biblioteca Inteligente',
		description:
			'Plataformas, favoritos e coleções em uma interface unificada.',
	},
];

const benefits = [
	'Biblioteca integrada ao RIESCADE',
	'Downloads seguros dentro do aplicativo',
	'Comunidade VIP — Suporte prioritário',
	'250+ Plataformas — Atari até Switch',
	'RetroAchievements + Scraping automático',
];

const popularPlatforms = [
	['snes', 'Super Nintendo'],
	['megadrive', 'Mega Drive'],
	['psx', 'PlayStation'],
	['ps2', 'PlayStation 2'],
	['n64', 'Nintendo 64'],
	['neogeo', 'Neo Geo'],
	['gba', 'Game Boy Advance'],
	['mastersystem', 'Master System'],
	['dreamcast', 'Dreamcast'],
	['cps2', 'Capcom CPS2'],
];

export default function HomeClient() {
	const router = useRouter();
	const [isLoggingIn, setIsLoggingIn] = useState(false);

	const handleLoginRedirect = useCallback(
		async (e: React.MouseEvent) => {
			e.preventDefault();
			if (isLoggingIn) return;
			setIsLoggingIn(true);

			try {
				const { data: sessionData } = await supabase.auth.getSession();
				if (sessionData?.session?.user) {
					router.push('/dashboard');
					return;
				}

				const { data, error } = await supabase.auth.signInWithOAuth({
					provider: 'google',
					options: {
						redirectTo: window.location.origin + '/dashboard',
					},
				});

				if (error) {
					console.error('Erro ao iniciar login:', error);
					setIsLoggingIn(false);
				} else if (data) {
					console.log('Login iniciado com sucesso, URL:', data.url);
					window.location.href = data.url;
				}
			} catch (error) {
				console.error('Error signing in:', error);
				setIsLoggingIn(false);
			}
		},
		[isLoggingIn, router],
	);

	return (
		<div className="min-h-screen">
			<Header />

			<main id="main-content" tabIndex={-1}>
				{/* HERO SECTION */}
				<section className="relative overflow-hidden border-b border-white/10 bg-black pt-28 lg:h-[100svh] lg:min-h-[820px] lg:pt-0">
					<video
						src="/video/riescade-os.mp4"
						autoPlay
						muted
						loop
						playsInline
						preload="metadata"
						poster="/images/hero-riescade-cyber.webp"
						aria-hidden="true"
						className="absolute inset-y-0 right-0 h-full w-auto max-w-none object-contain object-[68%_center]"
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-black via-black/45 to-transparent lg:via-black/15" />
					<div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />

					<div className="relative z-10 mx-auto flex min-h-[700px] max-w-[1380px] items-center px-6 py-16 sm:px-10 lg:h-[calc(100%-180px)] lg:min-h-0 lg:px-10 lg:py-0 lg:pt-28">
						<div className="max-w-[650px]">
							<div className="mb-7 inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/[0.08] px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-primary">
								<Gamepad2 className="h-4 w-4" />
								Feito para jogadores. Feito para você.
							</div>

							<h1 className="font-display font-bold text-[3.4rem] uppercase leading-[0.98] tracking-[-0.035em] text-white sm:text-7xl">
								Seu arcade.
								<span className="mt-2 block text-primary">Do seu jeito.</span>
							</h1>

							<p className="font-display font-light mt-6 max-w-md text-lg leading-relaxed text-white/62">
								Todos os seus jogos, em uma experiência
								<br />
								criada para transformar seu PC em uma
								<br />
								<span className="text-[#14d52a]">
									central de jogos definitiva.
								</span>
							</p>

							<div className="mt-12 flex flex-col gap-3 sm:flex-row">
								<button
									onClick={handleLoginRedirect}
									disabled={isLoggingIn}
									className="font-brand-condensed inline-flex h-14 items-center justify-center gap-3 rounded-xl border border-primary bg-primary px-8 font-display text-md font-bold uppercase tracking-[0.12em] text-white shadow-[0_12px_45px_hsl(var(--primary)/0.36)] transition-all hover:-translate-y-1 hover:bg-accent disabled:opacity-60"
								>
									<Download className="h-5 w-5" />
									{isLoggingIn ? 'Carregando...' : 'Baixar RIESCADE'}
								</button>
								<a
									href="#features"
									className="font-brand-condensed inline-flex h-14 items-center justify-center gap-3 rounded-xl border border-white/45 bg-black/40 px-8 font-display text-md font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary hover:bg-primary/10"
								>
									<Play className="h-5 w-5" />
									Conhecer recursos
								</a>
							</div>
							<p className="ml-20 mt-2 text-xs text-white/38">
								Grátis para Windows
							</p>

							<div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-medium text-white/70">
								<span className="flex items-center gap-2">
									<Monitor className="h-4 w-4 text-primary" />
									Windows 11
								</span>
								<span className="h-4 w-px bg-white/15" />
								<span className="flex items-center gap-2">
									<Gamepad2 className="h-4 w-4 text-primary" />
									+250 plataformas
								</span>
								<span className="h-4 w-px bg-white/15" />
								<span className="flex items-center gap-2">
									<Cpu className="h-4 w-4 text-primary" />
									Emuladores
								</span>
								<span className="h-4 w-px bg-white/15" />
								<span className="flex items-center gap-2">
									<SlidersHorizontal className="h-4 w-4 text-primary" />
									Controles
								</span>
								<span className="h-4 w-px bg-white/15" />
								<span className="flex items-center gap-2">
									<Users className="h-4 w-4 text-primary" />
									Multiplayer
								</span>
							</div>
						</div>
					</div>

					<a
						href="#features"
						className="absolute bottom-[40px] left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary lg:flex"
					>
						Scroll para explorar
						<ChevronDown className="h-5 w-5" />
					</a>
				</section>

				{/* FEATURES SECTION */}
				<section
					id="features"
					className="relative scroll-mt-28 py-24 overflow-hidden"
				>
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--surface))_0%,transparent_50%)]" />
					<div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
						<div className="text-center mb-16">
							<span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
								RECURSOS
							</span>
							<h2 className="mt-4 font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-foreground">
								Recursos de <span className="text-gradient-primary">Games</span>
							</h2>
							<p className="mt-4 text-muted-foreground max-w-xl mx-auto">
								Projetado para amantes de jogos retro e arcade clássico
							</p>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{features.map((feature) => (
								<div
									key={feature.title}
									className="group rounded-2xl border border-white/10 bg-gradient-to-br from-card to-primary/[0.035] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_60px_hsl(var(--primary)/0.08)]"
								>
									<div className="size-12 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center mb-6 group-hover:border-primary/60 transition-colors glow-primary">
										<feature.icon className="size-5 text-primary" />
									</div>
									<h3 className="font-display text-xl font-bold uppercase tracking-wide text-foreground mb-3">
										{feature.title}
									</h3>
									<p className="text-sm text-muted-foreground leading-relaxed">
										{feature.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* SCREENSHOTS SECTION */}
				<section
					id="platforms"
					className="relative scroll-mt-24 py-24 overflow-hidden"
				>
					<div className="absolute inset-0 grid-overlay opacity-30" />
					<div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
						<div className="text-center mb-16">
							<span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
								MULTISISTEMA
							</span>
							<h2 className="mt-4 font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-foreground">
								Mais de 250{' '}
								<span className="text-gradient-primary">Sistemas</span>
							</h2>
							<p className="mt-4 text-muted-foreground">
								Mais de 250 sistemas em um único lugar
							</p>
						</div>

						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{screenshots.map((shot) => (
								<div
									key={shot.title}
									className="group relative rounded-2xl bg-panel border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_hsl(var(--primary)/0.1)]"
								>
									<div className="aspect-video overflow-hidden relative w-full h-full">
										<Image
											src={shot.src}
											alt={shot.title}
											fill
                                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
											className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
										/>
										<div className="absolute inset-0 scanlines pointer-events-none mix-blend-overlay opacity-30" />
									</div>
									<div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-background/95 to-transparent">
										<div className="font-display font-bold text-sm uppercase text-foreground">
											{shot.title}
										</div>
										<div className="font-mono text-[10px] text-primary uppercase">
											{shot.subtitle}
										</div>
									</div>
								</div>
							))}
						</div>

						<div className="mt-10 flex flex-wrap items-center justify-center gap-2">
							{popularPlatforms.map(([slug, name]) => (
								<Link
									key={slug}
									href={`/platforms/${slug}`}
									className="rounded-xl border border-white/10 bg-card/60 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
								>
									{name}
								</Link>
							))}
							<Link
								href="/platforms"
								className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
							>
								Ver todas as plataformas →
							</Link>
						</div>
					</div>
				</section>

				{/* PRICING SECTION */}
				<section
					id="about"
					className="relative scroll-mt-24 py-24 overflow-hidden"
				>
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--surface))_0%,transparent_50%)]" />
					<div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
						<div className="text-center mb-16">
							<span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
								ACESSO
							</span>
							<h2 className="mt-4 font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-foreground">
								Potencialize Sua{' '}
								<span className="text-gradient-primary">Experiência</span>
							</h2>
							<p className="mt-4 text-muted-foreground">
								A melhor experiência de jogos retro aguarda por você
							</p>
						</div>

						<div className="max-w-lg mx-auto">
							<div className="relative rounded-3xl border-2 border-primary/50 bg-gradient-to-b from-primary/[0.07] to-background/90 backdrop-blur-sm overflow-hidden animate-pulse-glow">
								<div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
								<div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
								<div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
								<div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />

								<div className="p-8 md:p-10">
									<div className="flex items-center gap-3 mb-2">
										<Sparkles className="size-5 text-primary" />
										<span className="font-mono text-xs text-primary uppercase tracking-widest font-bold">
											Riescade Membro
										</span>
									</div>

									<div className="flex items-baseline gap-2 mt-4">
										<span className="font-display text-5xl md:text-6xl font-bold text-foreground">
											R$ 30
										</span>
										<span className="text-muted-foreground font-mono text-sm">
											/mês
										</span>
									</div>
									<p className="text-sm text-muted-foreground mt-2">
										Assinatura mensal sem fidelidade
									</p>

									<div className="mt-8 space-y-4">
										{benefits.map((b) => (
											<div
												key={b}
												className="flex items-start gap-3"
											>
												<div className="size-5 rounded-md border border-primary/50 bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
													<Check className="size-3 text-primary" />
												</div>
												<span className="text-sm text-foreground/80">{b}</span>
											</div>
										))}
									</div>

									<button
										onClick={handleLoginRedirect}
										disabled={isLoggingIn}
										className="mt-10 w-full h-14 rounded-xl flex items-center justify-center bg-primary text-primary-foreground font-display font-bold text-xl uppercase tracking-[0.15em] transition-all duration-300 hover:scale-[1.02] hover:bg-accent hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] disabled:opacity-70 disabled:cursor-not-allowed"
									>
										{isLoggingIn ? 'Carregando...' : 'Assinar Agora'}
									</button>
									<p className="text-center text-xs text-muted-foreground mt-4 font-mono">
										Processo 100% seguro. Cancele quando quiser.
									</p>
								</div>
							</div>

							<div className="mt-8 rounded-2xl p-6 border border-border bg-surface/30 text-center">
								<p className="text-sm text-muted-foreground italic">
									&quot;O melhor sistema de retrogames que já usei. Vale cada
									centavo pela experiência nostálgica!&quot;
								</p>
								<span className="text-xs text-primary font-mono mt-3 block">
									— Membro desde 2023
								</span>
							</div>
						</div>
					</div>
				</section>

				{/* BLOG SECTION */}
				<section className="relative py-24 overflow-hidden">
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--surface))_0%,transparent_50%)]" />
					<div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
						<div className="text-center mb-16">
							<span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
								BLOG
							</span>
							<h2 className="mt-4 font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-foreground">
								Blog <span className="text-gradient-primary">Riescade</span>
							</h2>
							<p className="mt-4 text-muted-foreground">
								Novidades e artigos sobre o universo dos jogos retro
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-6">
							<BlogPostsPreview />
						</div>

						<div className="text-center mt-12">
							<Link
								href="/blog"
								className="inline-flex items-center gap-2 font-mono text-sm text-primary hover:text-accent transition-colors uppercase tracking-widest"
							>
								Ver todos os artigos →
							</Link>
						</div>
					</div>
				</section>

				{/* TESTIMONIALS (Google Reviews) SECTION */}
				<section
					id="support"
					className="relative scroll-mt-24 py-24 overflow-hidden"
				>
					<div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
						<div className="text-center mb-16">
							<span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
								DEPOIMENTOS
							</span>
							<h2 className="mt-4 font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-foreground">
								O Que Nossos{' '}
								<span className="text-gradient-primary">Colaboradores</span>{' '}
								Dizem
							</h2>
							<p className="mt-4 text-muted-foreground">
								Avaliações reais de usuários satisfeitos
							</p>
						</div>

						<GoogleReviews slidesPerView={3} />
					</div>
				</section>

				{/* FAQ SECTION */}
				<section id="faq" className="relative scroll-mt-24 py-24 overflow-hidden">
					<div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12">
						<div className="text-center mb-12">
							<span className="font-mono text-xs text-primary uppercase tracking-[0.3em] font-bold">
								DÚVIDAS
							</span>
							<h2 className="mt-4 font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-foreground">
								Perguntas <span className="text-gradient-primary">Frequentes</span>
							</h2>
						</div>
						<div className="space-y-3">
							{HOME_FAQ.map((faq) => (
								<details
									key={faq.q}
									className="group rounded-2xl border border-white/10 bg-gradient-to-br from-card to-primary/[0.035] p-5 open:border-primary/40"
								>
									<summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
										{faq.q}
										<span className="text-primary transition-transform group-open:rotate-45" aria-hidden="true">+</span>
									</summary>
									<p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
								</details>
							))}
						</div>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
}
