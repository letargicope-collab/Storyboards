import { useEffect, useRef, useState } from "react";
import type { Settings } from "../types";
import type { SaveState } from "../store";
import { CustomizePanel } from "./CustomizePanel";
import {
  CheckIcon,
  ClapperIcon,
  DownloadIcon,
  EyeIcon,
  PencilIcon,
  PrinterIcon,
  RefreshIcon,
  TrashIcon,
  UploadIcon,
} from "./Icons";
import { cn } from "../utils/cn";

interface Props {
  settings: Settings;
  saveState: SaveState;
  preview: boolean;
  busy: boolean;
  onSettings: (s: Partial<Settings>) => void;
  onTogglePreview: () => void;
  onPrint: () => void;
  onPdf: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onClear: () => void;
  onSample: () => void;
}

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400 xl:inline">
        {label}
      </span>
      <div className="flex rounded-lg border border-ink-600 bg-ink-900 p-0.5">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition",
              o.value === value
                ? "bg-ink-600 text-ink-100 shadow"
                : "text-ink-400 hover:text-ink-100"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, [open]);
  return { open, setOpen, ref };
}

export function Toolbar({
  settings,
  saveState,
  preview,
  busy,
  onSettings,
  onTogglePreview,
  onPrint,
  onPdf,
  onExport,
  onImport,
  onClear,
  onSample,
}: Props) {
  const project = usePopover();
  const custom = usePopover();
  const fileRef = useRef<HTMLInputElement>(null);

  const menuItem =
    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-ink-200 transition hover:bg-ink-700 hover:text-ink-100";
  const ghostBtn =
    "flex items-center gap-2 rounded-lg border border-ink-600 px-3 py-2 text-xs font-semibold text-ink-200 transition hover:bg-ink-800 disabled:opacity-50";

  return (
    <div className="sticky top-0 z-40 border-b border-ink-700 bg-ink-950/85 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-on-accent">
            <ClapperIcon width={18} height={18} />
          </span>
          <div className="leading-tight">
            <div className="font-display text-sm font-extrabold tracking-wide text-ink-100">
              STORYBOARD<span className="text-accent">.</span>STUDIO
            </div>
            <div
              className={cn(
                "flex items-center gap-1 text-[10px] font-medium",
                saveState === "error" ? "text-red-400" : "text-ink-400"
              )}
            >
              {saveState === "saved" && (
                <>
                  <CheckIcon width={10} height={10} className="text-emerald-400" /> Salvo automaticamente
                </>
              )}
              {saveState === "saving" && "Salvando…"}
              {saveState === "error" && "Espaço cheio! Exporte o JSON e use URLs nas imagens."}
            </div>
          </div>
        </div>

        <div className="mx-auto flex flex-wrap items-center gap-x-4 gap-y-2">
          <Segmented
            label="Colunas"
            value={settings.columns}
            options={[
              { value: 2, label: "2" },
              { value: 3, label: "3" },
              { value: 4, label: "4" },
            ]}
            onChange={(columns) => onSettings({ columns: columns as 2 | 3 | 4 })}
          />
          <Segmented
            label="Folha A4"
            value={settings.orientation}
            options={[
              { value: "landscape", label: "Paisagem" },
              { value: "portrait", label: "Retrato" },
            ]}
            onChange={(orientation) => onSettings({ orientation })}
          />
          <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-ink-300">
            <input
              type="checkbox"
              checked={settings.breakPerSet}
              onChange={(e) => onSettings({ breakPerSet: e.target.checked })}
              className="h-3.5 w-3.5 accent-(--color-accent)"
            />
            Set por página
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onTogglePreview}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition",
              preview
                ? "border-cyan/60 bg-cyan/10 text-cyan"
                : "border-ink-600 text-ink-200 hover:bg-ink-800"
            )}
          >
            {preview ? <PencilIcon width={15} height={15} /> : <EyeIcon width={15} height={15} />}
            <span className="hidden sm:inline">{preview ? "Voltar a editar" : "Pré-visualizar"}</span>
          </button>

          <div className="relative" ref={custom.ref}>
            <button type="button" onClick={() => custom.setOpen((o) => !o)} className={ghostBtn}>
              <span className="flex">
                <span className="h-3.5 w-3.5 rounded-full bg-accent ring-2 ring-ink-950" />
                <span className="-ml-1 h-3.5 w-3.5 rounded-full bg-cyan ring-2 ring-ink-950" />
              </span>
              <span className="hidden sm:inline">Cores</span>
            </button>
            {custom.open && <CustomizePanel settings={settings} onSettings={onSettings} />}
          </div>

          <div className="relative" ref={project.ref}>
            <button type="button" onClick={() => project.setOpen((m) => !m)} className={ghostBtn}>
              Projeto ▾
            </button>
            {project.open && (
              <div className="pop-in absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-ink-600 bg-ink-850 p-1.5 shadow-2xl">
                <button
                  className={menuItem}
                  onClick={() => {
                    project.setOpen(false);
                    onExport();
                  }}
                >
                  <DownloadIcon width={16} height={16} /> Exportar projeto (.json)
                </button>
                <button
                  className={menuItem}
                  onClick={() => {
                    project.setOpen(false);
                    fileRef.current?.click();
                  }}
                >
                  <UploadIcon width={16} height={16} /> Importar projeto (.json)
                </button>
                <button
                  className={menuItem}
                  onClick={() => {
                    project.setOpen(false);
                    onSample();
                  }}
                >
                  <RefreshIcon width={16} height={16} /> Carregar exemplo
                </button>
                <div className="my-1 h-px bg-ink-700" />
                <button
                  className={cn(menuItem, "text-red-300 hover:!bg-red-950/60 hover:!text-red-200")}
                  onClick={() => {
                    project.setOpen(false);
                    onClear();
                  }}
                >
                  <TrashIcon width={16} height={16} /> Limpar projeto
                </button>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImport(f);
                e.target.value = "";
              }}
            />
          </div>

          <button type="button" onClick={onPrint} disabled={busy} className={ghostBtn}>
            <PrinterIcon width={15} height={15} />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          <button
            type="button"
            onClick={onPdf}
            disabled={busy}
            className="flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-xs font-bold text-on-accent shadow-[0_6px_20px_-8px_var(--color-accent)] transition hover:brightness-110 disabled:opacity-60"
          >
            <DownloadIcon width={15} height={15} />
            <span className="hidden sm:inline">Baixar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
