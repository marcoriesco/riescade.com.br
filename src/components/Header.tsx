"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, User, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import Image from "next/image";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setIsMenuOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);

      // Configurar listener para mudanças de autenticação
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
      });

      return () => subscription.unsubscribe();
    };

    checkUser();
  }, []);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });

      if (error) {
        console.error("Erro ao iniciar login:", error);
        setIsLoggingIn(false);
      } else if (data) {
        console.log("Login iniciado com sucesso, URL:", data.url);
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error signing in:", error);
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Fecha o menu quando um link é clicado
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5">
      <div className="header-backdrop mx-auto flex max-w-[1480px] items-center justify-between rounded-2xl border border-white/10 px-5 py-3.5 sm:px-7">
        <Link href="/" className="group flex items-center" aria-label="RIESCADE — Início">
          <div className="relative flex items-center">
            <Image
              src="/images/riescade-logo-horizontal.webp"
              alt="RIESCADE"
              width={160}
              height={53}
              priority
              unoptimized
              className="h-9 sm:h-10 w-auto object-contain drop-shadow-[0_0_14px_hsl(var(--primary)/0.35)] transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>

        {/* Botão de menu para mobile */}
        <button
          className="lg:hidden p-2 text-foreground"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-primary" />
          ) : (
            <Menu className="h-6 w-6 text-primary" />
          )}
        </button>

        {/* Menu para desktop */}
        <div className="hidden lg:flex items-center gap-9">
          <nav aria-label="Navegação principal" className="flex items-center gap-6 lg:gap-9">
            <Link
              href="/#features"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Recursos
              <ChevronDown className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/blog"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Blog
            </Link>
            <Link
              href="/tutorial"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Tutorial
            </Link>
            <Link
              href="/wiki"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Wiki
            </Link>
            <Link
              href="/#about"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Assinatura
            </Link>
          </nav>

          <div className="flex items-center gap-3 border-l border-white/10 pl-6 lg:pl-9">
            {!loading &&
              (user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center mr-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground text-sm max-w-32 truncate">
                      {user.email}
                    </span>
                  </div>
                  <Link
                    href="/dashboard"
                    className="rounded-xl border border-primary/70 bg-primary/10 px-7 py-2.5 text-sm font-semibold text-primary transition-all duration-300 hover:bg-primary/20 hover:shadow-[0_0_22px_hsl(var(--primary)/0.18)]"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="rounded-xl border border-white/30 px-7 py-2.5 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary/50 hover:bg-primary/10"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={isLoggingIn}
                  className={`inline-flex items-center gap-2 rounded-xl border border-primary bg-primary/15 px-6 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all duration-300 hover:bg-primary/30 hover:shadow-[0_0_15px_hsl(var(--primary)/0.35)] focus:outline-none focus:ring-2 focus:ring-primary ${
                    isLoggingIn ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoggingIn ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-primary border-opacity-50"></div>
                      <span>Carregando...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={faGoogle}
                        size="xl"
                        className="h-4 w-4"
                      />
                      Login com Google
                    </>
                  )}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div id="mobile-navigation" className="max-h-[calc(100svh-110px)] overflow-y-auto header-backdrop mx-auto mt-2 max-w-7xl rounded-2xl border border-white/10 lg:hidden">
          <div className="px-4 pt-2 pb-6 space-y-4">
            <nav aria-label="Navegação mobile" className="flex flex-col space-y-4 mb-6">
              {/* O Dashboard só aparece quando o usuário está logado */}
              {user && (
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border"
                  onClick={handleLinkClick}
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/#features"
                className="text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border"
                onClick={handleLinkClick}
              >
                Recursos
              </Link>
              <Link
                href="/blog"
                className="text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border"
                onClick={handleLinkClick}
              >
                Blog
              </Link>
              <Link
                href="/tutorial"
                className="text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border"
                onClick={handleLinkClick}
              >
                Tutorial
              </Link>
              <Link
                href="/wiki"
                className="text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border"
                onClick={handleLinkClick}
              >
                Wiki
              </Link>
              <Link
                href="/#about"
                className="text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border"
                onClick={handleLinkClick}
              >
                Assinatura
              </Link>
            </nav>

            {!loading && user && (
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center mr-2">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-muted-foreground text-sm">
                  {user.email}
                </span>
              </div>
            )}

            <div className="flex justify-center">
              {!loading &&
                (user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-medium border border-primary/50 text-foreground hover:bg-primary/10 transition-all duration-300"
                  >
                    Sair
                  </button>
                ) : (
                  <button
                    onClick={handleSignIn}
                    disabled={isLoggingIn}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 border border-primary text-sm font-medium shadow-sm text-foreground bg-primary/20 hover:bg-primary/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--primary)/0.6)] ${
                      isLoggingIn ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoggingIn ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-primary border-opacity-50"></div>
                        <span>Carregando...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={faGoogle}
                          size="xl"
                          className="h-4 w-4"
                        />
                        Login com Google
                      </>
                    )}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
