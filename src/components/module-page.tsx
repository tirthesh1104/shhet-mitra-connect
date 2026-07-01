import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";

/** Shared page shell for Phase 2 modules — consistent title/subtitle with mobile-first padding. */
export function ModulePage({
  title, subtitle, right, children,
}: {
  title: string; subtitle?: string; right?: ReactNode; children: ReactNode;
}) {
  return (
    <AppShell>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="deva mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </AppShell>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] ${className}`}>{children}</div>;
}

export function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warn" | "danger" | "info" }) {
  const map = {
    neutral: "bg-secondary text-secondary-foreground",
    success: "bg-success/15 text-success-foreground border-success/30",
    warn: "bg-warning/15 text-warning-foreground border-warning/30",
    danger: "bg-destructive/15 text-destructive border-destructive/30",
    info: "bg-primary/10 text-primary border-primary/30",
  }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium ${map}`}>{children}</span>;
}
