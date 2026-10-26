import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import parse from "html-react-parser";
import { CalendarDays, ChevronRight, Clock3, Eye, Gamepad2, Download } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faTelegram, faWhatsapp, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { getBlogPostBySlug, getRelatedPosts } from "@/lib/blog-service";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { PostCard, formatPostDate } from "@/components/blog/PostCard";
import { PostViewTracker } from "@/components/blog/PostViewTracker";
import styles from "@/styles/markdown.module.css";
import { PLATFORMS } from "@/lib/platforms";
import { insertReadAlso, linkPlatformMentions } from "@/lib/blog-links";

const LINKABLE_PLATFORMS = new Set(PLATFORMS.filter((p) => p.indexable).map((p) => p.slug));

export const revalidate = 3600;

// Posts are rendered on first request and then cached (ISR) instead of on every visit.
export function generateStaticParams() {
  return [];
}

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://www.riescade.com.br"
).replace(/\/$/, "");

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const [readAlso, ...relatedPosts] = await getRelatedPosts(post, 4);
  const content = insertReadAlso(linkPlatformMentions(post.content, LINKABLE_PLATFORMS), readAlso);
  const url = `${SITE_URL}/blog/${post.slug}`;
  const shareLinks = [
    { label: "WhatsApp", icon: faWhatsapp, href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} - ${url}`)}` },
    { label: "Telegram", icon: faTelegram, href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}` },
    { label: "X", icon: faXTwitter, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}` },
    { label: "Facebook", icon: faFacebookF, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: { "@type": "Organization", name: "RIESCADE" },
    publisher: { "@type": "Organization", name: "RIESCADE", logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.webp` } },
    mainEntityOfPage: url,
    keywords: post.tags?.join(", "),
  };

  return (
    <div className="site-page relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12)_0%,transparent_60%)]" />
      <Header />
      <PostViewTracker postId={post.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <main id="main-content" tabIndex={-1} className="relative z-10 w-full flex-grow pb-24 pt-32">
        {/* CABEÇALHO */}
        <header className="mx-auto max-w-4xl px-6 md:px-12">
          <nav aria-label="Navegação estrutural" className="mb-8 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary">Início</Link>
            <ChevronRight aria-hidden="true" className="size-3" />
            <Link href="/blog" className="hover:text-primary">Blog</Link>
            <ChevronRight aria-hidden="true" className="size-3" />
            <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="hover:text-primary">
              {post.category}
            </Link>
          </nav>

          <Link
            href={`/blog?category=${encodeURIComponent(post.category)}`}
            className="inline-flex rounded-lg border border-primary/25 bg-primary/[0.08] px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/15"
          >
            {post.category}
          </Link>

          <h1 className="mt-6 font-display text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">{post.excerpt}</p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-border py-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {post.published_at && (
              <time dateTime={post.published_at} className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" />
                {formatPostDate(post.published_at, "long")}
              </time>
            )}
            <span className="flex items-center gap-2">
              <Clock3 className="size-4 text-primary" />
              {post.reading_time || 5} min de leitura
            </span>
            <span className="flex items-center gap-2">
              <Eye className="size-4 text-primary" />
              {(post.views || 0).toLocaleString("pt-BR")} leituras
            </span>
          </div>
        </header>

        {post.cover_image && (
          <figure className="mx-auto mt-10 max-w-5xl px-6 md:px-12">
            <div className="relative aspect-[1200/630] overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_hsl(var(--primary)/0.12)]">
              <Image
                src={post.cover_image}
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
              />
            </div>
          </figure>
        )}

        {/* CONTEÚDO */}
        <article className={`mx-auto mt-12 max-w-[720px] px-6 ${styles.markdown}`}>
          {parse(content)}
        </article>

        <div className="mx-auto mt-14 max-w-[720px] space-y-10 px-6">
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="rounded-xl border border-white/10 bg-card/60 px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/30 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">Compartilhe</p>
            <div className="flex gap-2">
              {shareLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Compartilhar no ${link.label}`}
                  className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-foreground transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 hover:text-primary"
                >
                  <FontAwesomeIcon icon={link.icon} className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* CTA */}
          <aside className="relative overflow-hidden rounded-2xl border-2 border-primary/50 bg-gradient-to-b from-primary/[0.07] to-background/90 p-8">
            <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-primary" />
            <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-primary" />
            <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-primary" />
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-primary">
              <Gamepad2 className="size-4" />
              RIESCADE
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold uppercase text-foreground">
              Jogue os clássicos <span className="text-gradient-primary">no seu PC</span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Mais de 250 plataformas em uma central de jogos para Windows, com downloads direto pelo aplicativo.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-6 font-display text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_12px_45px_hsl(var(--primary)/0.3)] transition-all hover:-translate-y-0.5 hover:bg-accent"
            >
              <Download className="size-4" />
              Baixar RIESCADE
            </Link>
          </aside>
        </div>

        {/* RELACIONADOS */}
        {relatedPosts.length > 0 && (
          <section aria-labelledby="related-title" className="mx-auto mt-24 max-w-7xl px-6 md:px-12">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-primary">Continue lendo</span>
            <h2 id="related-title" className="mb-8 mt-3 font-display text-3xl font-bold uppercase tracking-tight text-foreground">
              Mais sobre <span className="text-gradient-primary">{post.category}</span>
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => (
                <PostCard key={related.id} post={related} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
