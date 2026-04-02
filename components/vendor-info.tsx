"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MaterialId = string;

export type VendorInfo = {
  id: string;
  createdAtISO: string;

  vendorName: string;
  vendorWebsiteUrl: string;
  materialId: MaterialId;
};

const STORAGE_KEY = "vendorInfo.v2";

function normalizeUrl(raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

function readStored(): VendorInfo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => x as Partial<VendorInfo>)
      .filter((x) => typeof x?.vendorName === "string" && typeof x?.vendorWebsiteUrl === "string" && typeof x?.materialId === "string")
      .map((x) => ({
        id: String(x.id ?? crypto.randomUUID()),
        createdAtISO: String(x.createdAtISO ?? new Date().toISOString()),
        vendorName: x.vendorName ?? "",
        vendorWebsiteUrl: x.vendorWebsiteUrl ?? "",
        materialId: x.materialId ?? "",
      }));
  } catch {
    return [];
  }
}

function writeStored(items: VendorInfo[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[length:var(--text-label)] font-semibold uppercase tracking-[0.5px] text-[var(--color-text-muted)]"
      style={{ letterSpacing: "0.5px" }}
    >
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 w-full rounded-[var(--radius-md)] border border-border bg-[var(--color-surface-raised)] px-3 py-1 text-[length:var(--text-base)] text-[var(--color-text)]",
        "transition-all duration-200 ease-out outline-none focus-visible:border-primary focus-visible:shadow-[var(--shadow-focus)]"
      )}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function VendorInfoFeature({
  materialOptions,
  className,
}: {
  materialOptions: Array<{ id: MaterialId; label: string; symbol?: string }>;
  className?: string;
}) {
  const [items, setItems] = React.useState<VendorInfo[]>([]);
  const [open, setOpen] = React.useState(false);

  const [form, setForm] = React.useState(() => ({
    vendorName: "",
    vendorWebsiteUrl: "",
    materialId: materialOptions[0]?.id ?? "",
  }));

  React.useEffect(() => {
    setItems(readStored());
  }, []);

  React.useEffect(() => {
    writeStored(items);
  }, [items]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next: VendorInfo = {
      id: crypto.randomUUID(),
      createdAtISO: new Date().toISOString(),

      vendorName: form.vendorName.trim(),
      vendorWebsiteUrl: normalizeUrl(form.vendorWebsiteUrl),
      materialId: form.materialId,
    };

    setItems((prev) => [next, ...prev]);
    setOpen(false);
    setForm((prev) => ({
      ...prev,
      vendorName: "",
      vendorWebsiteUrl: "",
      materialId: materialOptions[0]?.id ?? "",
    }));
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));

  const materialLabel = React.useCallback(
    (id: MaterialId) => materialOptions.find((m) => m.id === id)?.label ?? id,
    [materialOptions]
  );

  return (
    <section className={cn("dashboard-fade dashboard-fade2", className)}>
      <div
        className="rounded-[var(--radius-xl)] border border-border bg-[var(--color-surface-raised)] p-[var(--space-20)]"
        style={{ boxShadow: "0 12px 34px rgba(0,0,0,0.22)" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-[var(--space-12)]">
          <div className="min-w-[220px]">
            <div className="text-[length:var(--text-label)] font-semibold text-[var(--color-text-strong)]">
              Vendor Info
            </div>
            <div className="mt-1 text-[length:var(--text-sm)] text-[var(--color-text-muted)]">
              Capture supplier terms for the materials you track (e.g., Copper, Aluminium, Nickel, Zinc).
            </div>
          </div>

          <Button onClick={() => setOpen(true)} className="shrink-0">
            <Plus className="h-4 w-4" />
            Add Vendor Info
          </Button>
        </div>

        <div className="mt-[var(--space-16)] grid gap-[var(--space-12)]">
          {items.length === 0 ? (
            <div className="rounded-[var(--radius-md)] border border-border bg-[var(--color-bg)] p-[var(--space-16)] text-[length:var(--text-base)] text-[var(--color-text-muted)]">
              No vendor entries yet. Add your first vendor.
            </div>
          ) : (
            items.map((v) => (
              <div
                key={v.id}
                className="rounded-[var(--radius-xl)] border border-border bg-[var(--color-bg)] p-[var(--space-16)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-[var(--space-12)]">
                  <div className="min-w-[220px]">
                    <div className="text-[length:var(--text-lead)] font-semibold text-[var(--color-text-strong)]">
                      {v.vendorName || "Unnamed vendor"}
                    </div>
                    <div className="mt-2 text-[length:var(--text-base)] text-[var(--color-text-muted)]">
                      Material:{" "}
                      <span className="font-semibold text-[var(--color-text)]">
                        {materialLabel(v.materialId)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {v.vendorWebsiteUrl ? (
                      <a
                        href={v.vendorWebsiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-border bg-[var(--color-surface-raised)] px-3 py-2 text-[length:var(--text-base)] text-[var(--color-text)] transition-all duration-200 hover:bg-[var(--color-surface-border)]"
                      >
                        <ExternalLink className="h-4 w-4 text-primary" />
                        Website
                      </a>
                    ) : null}
                    <Button variant="secondary" onClick={() => removeItem(v.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimateModal open={open} onClose={() => setOpen(false)}>
        <div className="flex min-h-0 flex-col">
          {/* Header (fixed) */}
          <div className="shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[length:var(--text-lead)] font-semibold text-[var(--color-text-strong)]">
                  Add Vendor Info
                </div>
                <div className="mt-1 text-[length:var(--text-base)] text-[var(--color-text-muted)]">
                  Save vendor quote details and procurement terms for the materials on this dashboard.
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius-md)] p-2 text-[var(--color-text-muted)] transition-all duration-200 hover:bg-[var(--color-surface-border)] hover:text-[var(--color-text-strong)]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-[var(--space-16)] flex min-h-0 flex-col">
            {/* Body (scrollable) */}
            <div className="chat-scrollable min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid gap-[var(--space-16)] pb-[var(--space-16)]">
                <div className="grid gap-[var(--space-12)] md:grid-cols-2">
                  <div className="grid gap-2">
                    <FieldLabel>Vendor name</FieldLabel>
                    <Input
                      value={form.vendorName}
                      onChange={(e) => setForm((p) => ({ ...p, vendorName: e.target.value }))}
                      placeholder="e.g., Karachi Metals Trading Co."
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <FieldLabel>Vendor URL</FieldLabel>
                    <Input
                      value={form.vendorWebsiteUrl}
                      onChange={(e) => setForm((p) => ({ ...p, vendorWebsiteUrl: e.target.value }))}
                      placeholder="vendor.com or https://vendor.com"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <FieldLabel>Material</FieldLabel>
                  <Select
                    value={form.materialId}
                    onChange={(v) => setForm((p) => ({ ...p, materialId: v }))}
                    options={materialOptions.map((m) => ({ value: m.id, label: m.label }))}
                  />
                </div>
              </div>
            </div>

            {/* Footer (fixed) */}
            <div className="shrink-0 border-t border-border pt-[var(--space-12)]">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Vendor Info</Button>
              </div>
            </div>
          </form>
        </div>
      </AnimateModal>
    </section>
  );
}

function AnimateModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: 9999 }}>
      <button
        className="absolute inset-0 h-full w-full bg-black/60"
        onClick={onClose}
        aria-label="Close overlay"
      />
      <div className="absolute inset-0 flex items-end justify-center p-4 sm:items-center">
        <div
          role="dialog"
          aria-modal="true"
          className="flex w-full max-w-[860px] max-h-[90vh] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border bg-[var(--color-surface-raised)] p-[var(--space-20)] shadow-[0_18px_55px_rgba(0,0,0,0.65)]"
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

