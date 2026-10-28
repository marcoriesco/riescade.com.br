import type { ReactNode } from "react";
import { AlertCircle, type LucideIcon } from "lucide-react";

// Same quiet language as the wiki: hairline borders, mono labels, flat cards.
export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60";
export const quietButton =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-mono text-xs text-muted-foreground transition-colors hover:text-red-300 disabled:opacity-60";

export function Label({ children, icon: Icon }: { children: ReactNode; icon?: LucideIcon }) {
  return (
    <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
      {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
      {children}
    </p>
  );
}

export function SectionTitle({ title, description, children }: { title: ReactNode; description?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h2>
        {description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

/** Hairline grid of facts, like the wiki's step overview. */
export function FactGrid({ items, columns = 4 }: { items: { label: string; value: ReactNode; detail?: ReactNode; icon?: LucideIcon }[]; columns?: 2 | 3 | 4 }) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columns];
  return (
    <div className={`grid gap-px overflow-hidden rounded-lg border border-border bg-border text-sm ${cols} [&>div]:bg-card [&>div]:px-5 [&>div]:py-4`}>
      {items.map((item) => (
        <div key={item.label}>
          <Label icon={item.icon}>{item.label}</Label>
          <p className="mt-2 font-display text-lg font-bold text-foreground">{item.value}</p>
          {item.detail && <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>}
        </div>
      ))}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-border bg-card/40 p-5 ${className}`}>{children}</div>;
}

/** The wiki's border-left callout. */
export function Callout({ icon: Icon, title, children, action, tone = "primary" }: {
  icon: LucideIcon;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  tone?: "primary" | "warning" | "success" | "danger";
}) {
  const colors = {
    primary: ["border-primary", "text-primary"],
    warning: ["border-amber-400", "text-amber-400"],
    success: ["border-[#14d52a]", "text-[#14d52a]"],
    danger: ["border-red-400", "text-red-400"],
  }[tone];
  return (
    <section className={`rounded-r-lg border-l-2 bg-card/50 p-5 ${colors[0]}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Icon className={`h-4 w-4 shrink-0 ${colors[1]}`} />
            {title}
          </div>
          {children && <div className="text-xs leading-relaxed text-muted-foreground">{children}</div>}
        </div>
        {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
      </div>
    </section>
  );
}

export function ErrorLine({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-2 text-xs text-amber-300">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {children}
    </p>
  );
}

export function EmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <Icon className="mx-auto h-8 w-8 text-primary/60" />
      <p className="mt-4 font-semibold text-foreground">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-12 text-sm text-muted-foreground">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      {label}
    </div>
  );
}
