"use client";
import { useState } from "react";
import Image from "next/image";
import { Download, Lock, Palette } from "lucide-react";
import { formatSize } from "../format";
import { Card, Label, SectionTitle, Spinner, primaryButton, secondaryButton } from "../ui";

export interface RetroBatTheme {
  id: string;
  name: string;
  description: string;
  previewUrl: string | null;
  fileName: string | null;
  size: number | null;
  version: string | null;
}

function ThemePreview({ previewUrl, name }: { previewUrl: string | null; name: string }) {
  const [error, setError] = useState(false);
  if (!previewUrl || error) {
    return (
      <div className="flex h-full items-center justify-center bg-card">
        <Palette className="h-8 w-8 text-primary/50" />
      </div>
    );
  }
  return (
    <Image
      src={previewUrl}
      alt={`Tema ${name}`}
      fill
      unoptimized
      onError={() => setError(true)}
      sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
      className="object-cover"
    />
  );
}

export function ThemesTab({ themes, hasAccess, pending, onDownload, onCheckout }: {
  themes: RetroBatTheme[] | null;
  hasAccess: boolean;
  pending: string | null;
  onDownload: (theme: RetroBatTheme) => void;
  onCheckout: () => void;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle
        title="Temas exclusivos"
        description="O RIESCADE já vem com o tema Origins. Estes são exclusivos para membros e também podem ser instalados pelo próprio app, em Baixar temas → RIESCADE."
      />

      {!themes ? (
        <Spinner label="Carregando temas..." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => {
            const busy = pending === `theme:${theme.id}`;
            return (
              <article key={theme.id} className="flex flex-col overflow-hidden rounded-lg border border-border bg-card/40">
                <div className="relative aspect-video border-b border-border">
                  <ThemePreview previewUrl={theme.previewUrl} name={theme.name} />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-foreground">{theme.name}</h3>
                    {!hasAccess && <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-label="Exclusivo para membros" />}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{theme.description}</p>
                  <p className="mt-3 font-mono text-[11px] text-muted-foreground">
                    {[theme.version ? `v${theme.version}` : "", formatSize(theme.size) ?? ""].filter(Boolean).join(" · ")}
                  </p>
                  <div className="mt-auto pt-4">
                    {!theme.fileName ? (
                      <button disabled className={`${secondaryButton} w-full`}>Em breve</button>
                    ) : hasAccess ? (
                      <button onClick={() => onDownload(theme)} disabled={busy} className={`${primaryButton} w-full`}>
                        <Download className="h-3.5 w-3.5" />
                        {busy ? "Liberando..." : "Baixar tema"}
                      </button>
                    ) : (
                      <button onClick={onCheckout} disabled={pending === "checkout"} className={`${secondaryButton} w-full`}>
                        <Lock className="h-3.5 w-3.5" />
                        Assinar para liberar
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Card>
        <Label>Instalar manualmente</Label>
        <p className="mt-2 text-xs leading-relaxed text-foreground/80">
          Extraia o .zip em <code className="font-mono text-foreground">emulationstation\.emulationstation\themes</code> e escolha o tema em
          Configurações da interface → Conjunto de temas.
        </p>
      </Card>
    </div>
  );
}
