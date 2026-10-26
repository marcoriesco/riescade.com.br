import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { HOME_FAQ } from '@/data/home-faq';

const SITE_URL = 'https://www.riescade.com.br';

export const metadata: Metadata = {
	alternates: { canonical: '/' },
};

const jsonLd = [
	{
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'RIESCADE',
		url: SITE_URL,
		logo: `${SITE_URL}/images/logo.webp`,
		sameAs: [
			'https://instagram.com/riescade',
			'https://facebook.com/riescade',
			'https://youtube.com/@riescade',
			'https://t.me/riescade',
		],
	},
	{
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'RIESCADE',
		url: SITE_URL,
		inLanguage: 'pt-BR',
		potentialAction: {
			'@type': 'SearchAction',
			target: `${SITE_URL}/blog?search={search_term_string}`,
			'query-input': 'required name=search_term_string',
		},
	},
	{
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'RIESCADE',
		applicationCategory: 'GameApplication',
		operatingSystem: 'Windows 10, Windows 11',
		description:
			'Central de jogos para Windows com mais de 250 consoles, arcades e computadores clássicos, emuladores configurados e downloads integrados.',
		url: SITE_URL,
		image: `${SITE_URL}/images/og-image.webp`,
		offers: [
			{ '@type': 'Offer', name: 'RIESCADE', price: '0', priceCurrency: 'BRL' },
			{
				'@type': 'Offer',
				name: 'RIESCADE Membro',
				price: '30.00',
				priceCurrency: 'BRL',
				category: 'subscription',
			},
		],
	},
	{
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: HOME_FAQ.map((faq) => ({
			'@type': 'Question',
			name: faq.q,
			acceptedAnswer: { '@type': 'Answer', text: faq.a },
		})),
	},
];

export default function Home() {
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
			/>
			<HomeClient />
		</>
	);
}
