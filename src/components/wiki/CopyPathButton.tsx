"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyPathButtonProps {
  path: string;
  className?: string;
  label?: string;
}

export function CopyPathButton({ path, className = "", label = "Copiar" }: CopyPathButtonProps) {
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
      className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary ${className}`}
      title="Copiar caminho da pasta"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-medium">Copiado</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
