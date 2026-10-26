import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';



export const metadata: Metadata = {
	metadataBase: new URL('https://www.riescade.com.br'),
	title: {
		default: 'RIESCADE — Central de jogos retrô e emuladores para PC',
		template: '%s | RIESCADE',
	},
	description:
		'Transforme seu PC em uma central de jogos: mais de 250 consoles, arcades e computadores clássicos com emuladores, BIOS e downloads integrados. Para Windows.',
	applicationName: 'RIESCADE',
	authors: [{ name: 'RIESCADE', url: 'https://www.riescade.com.br' }],
	creator: 'RIESCADE',
	publisher: 'RIESCADE',
	robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
	openGraph: {
		type: 'website',
		locale: 'pt_BR',
		url: 'https://www.riescade.com.br',
		siteName: 'RIESCADE',
		title: 'RIESCADE — Central de jogos retrô e emuladores para PC',
		description:
			'Mais de 250 consoles, arcades e computadores clássicos em uma única central de jogos para Windows.',
		images: [
			{
				url: '/images/og-image.webp',
				width: 1200,
				height: 630,
				alt: 'RIESCADE',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'RIESCADE — Central de jogos retrô e emuladores para PC',
		description: 'Mais de 250 consoles, arcades e computadores clássicos em uma única central de jogos para Windows.',
		images: ['/images/og-image.webp'],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR">
			<head>
				<meta
					name="google-adsense-account"
					content="ca-pub-9318454482729602"
				/>
			</head>
			<body>
                <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
				<Analytics />
				<Providers>{children}</Providers>
				<SpeedInsights />
			</body>
		</html>
	);
}
