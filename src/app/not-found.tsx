import Link from 'next/link';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { PageIntro } from '@/components/PageIntro';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página não encontrada',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="site-page flex min-h-screen flex-col">
      <Header />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-4xl flex-1 px-6">
        <PageIntro eyebrow="404" title="Fora do mapa." description="A página que você procura não existe ou mudou de endereço. Sua próxima partida continua por aqui." />
        <Link href="/" className="inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-accent">Voltar ao início</Link>
      </main>
      <Footer />
    </div>
  );
}
