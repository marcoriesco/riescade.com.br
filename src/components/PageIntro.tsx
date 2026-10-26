import Link from 'next/link';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

export function PageIntro({ eyebrow, title, description, children }: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="page-intro">
      <nav aria-label="Navegação estrutural" className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">Início</Link>
        <ChevronRight aria-hidden="true" className="size-3" />
        <span>{eyebrow}</span>
      </nav>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow} · RIESCADE</p>
          <h1 className="font-display text-4xl font-bold uppercase leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">{title}</h1>
          {description && <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

export function ExploreLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20">{children}<ArrowUpRight aria-hidden="true" className="size-4" /></Link>;
}
