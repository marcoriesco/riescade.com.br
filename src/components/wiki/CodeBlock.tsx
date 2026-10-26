"use client";

import { useState } from "react";
import { Copy, Check, Terminal, FileCode } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  description?: string;
}

export function CodeBlock({ code, language = "text", filename, description }: CodeBlockProps) {
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
    <div className="my-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] shadow-lg">
      {(filename || language) && (
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-foreground/80">
            {filename ? (
              <>
                <FileCode className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold text-foreground">{filename}</span>
              </>
            ) : (
              <>
                <Terminal className="h-3.5 w-3.5 text-primary" />
                <span className="uppercase text-muted-foreground">{language}</span>
              </>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            aria-label="Copiar código"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-muted-foreground" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      )}

      {description && (
        <div className="border-b border-white/5 bg-black/20 px-4 py-2 text-xs text-muted-foreground leading-relaxed">
          {description}
        </div>
      )}

      <div className="relative">
        <pre className="overflow-x-auto p-4 font-mono text-xs md:text-sm text-foreground/90 leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
