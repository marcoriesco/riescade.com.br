"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyPathButtonProps {
  path: string;
  className?: string;
}

export function CopyPathButton({ path, className = "" }: CopyPathButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/20 hover:text-primary ${className}`}
      title="Copiar caminho da pasta"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-400" />
          <span className="text-green-400 font-medium">Copiado!</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>Copiar pasta</span>
        </>
      )}
    </button>
  );
}
