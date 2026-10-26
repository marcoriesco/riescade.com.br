"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  description?: string;
}

export function CodeBlock({ code, filename, description }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        {filename ? (
          <span className="font-mono text-sm font-medium text-primary">{filename}</span>
        ) : (
          <span />
        )}
        <button
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
          aria-label="Copiar código"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <pre className="mt-3 overflow-x-auto rounded-md bg-card border border-border/50 p-4 font-mono text-sm leading-6 text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}
