import type { Project } from "../types";
import { VIDEO_TYPES, typeLabel, type Palette } from "../data/videoTypes";
import { LogoSlot } from "./LogoSlot";
import { cn } from "../utils/cn";

interface Props {
  project: Project;
  suggested: Palette | null;
  onChange: (p: Partial<Project>) => void;
  onApplyPalette: (p: Palette) => void;
}

export function ProjectHeader({ project, suggested, onChange, onApplyPalette }: Props) {
  const totalTakes = project.sets.reduce((a, s) => a + s.takes.length, 0);
  const { settings } = project;
  const label = typeLabel(project);

  const meta = (
    text: string,
    key: "director" | "client" | "date",
    placeholder: string,
    type = "text"
  ) => (
    <div className="min-w-0">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-400">
        {text}
      </div>
      <input
        type={type}
        value={project[key]}
        onChange={(e) => onChange({ [key]: e.target.value })}
        placeholder={placeholder}
        className="field text-sm font-medium text-ink-100 [color-scheme:dark]"
      />
    </div>
  );

  const paletteIsActive =
    suggested &&
    suggested.accent.toLowerCase() === settings.accent.toLowerCase() &&
    suggested.secondary.toLowerCase() === settings.secondary.toLowerCase();

  return (
    <header className="relative overflow-hidden rounded-2xl border border-ink-600/60 bg-gradient-to-br from-ink-800 via-ink-850 to-ink-900 p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute inset-y-0 left-0 w-1.5 bg-accent" />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.35em] text-accent">
            Storyboard{label ? ` · ${label}` : ""}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-400">
            {project.sets.length} {project.sets.length === 1 ? "set" : "sets"} · {totalTakes}{" "}
            {totalTakes === 1 ? "take" : "takes"}
          </span>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <label className="sr-only" htmlFor="project-name">
              Nome do Projeto
            </label>
            <input
              id="project-name"
              value={project.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="NOME DO PROJETO"
              className="field font-display text-3xl font-extrabold uppercase tracking-tight text-ink-100 sm:text-5xl"
            />
          </div>
          <div className="flex shrink-0 gap-3">
            <LogoSlot
              label="Logo da marca / empresa"
              value={project.logoBrand}
              onChange={(logoBrand) => onChange({ logoBrand })}
              plate={settings.logoPlate}
            />
            <LogoSlot
              label="Logo do cliente"
              value={project.logoClient}
              onChange={(logoClient) => onChange({ logoClient })}
              plate={settings.logoPlate}
            />
          </div>
        </div>

        {/* Video type */}
        <div className="mt-6">
          <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-400">
              Tipo de vídeo
            </span>
            {suggested && !paletteIsActive && (
              <button
                type="button"
                onClick={() => onApplyPalette(suggested)}
                className="flex items-center gap-1.5 text-[11px] font-medium text-ink-300 transition hover:text-accent"
              >
                <span className="flex">
                  <span className="h-3 w-3 rounded-full ring-1 ring-ink-900" style={{ background: suggested.accent }} />
                  <span className="-ml-1 h-3 w-3 rounded-full ring-1 ring-ink-900" style={{ background: suggested.secondary }} />
                </span>
                Aplicar paleta sugerida ({suggested.name})
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {VIDEO_TYPES.map((t) => {
              const active = project.videoType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ videoType: active ? "" : t.id })}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                    active
                      ? "border-accent bg-accent text-on-accent"
                      : "border-ink-600 text-ink-300 hover:border-ink-400 hover:text-ink-100"
                  )}
                >
                  {t.label}
                </button>
              );
            })}
            {project.videoType === "outro" && (
              <input
                value={project.videoTypeCustom}
                onChange={(e) => onChange({ videoTypeCustom: e.target.value })}
                placeholder="Qual tipo?"
                className="w-44 rounded-full border border-ink-600 bg-ink-900 px-3.5 py-1.5 text-xs text-ink-100 placeholder:text-ink-500 focus:border-accent focus:outline-none"
              />
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 border-t border-ink-600/70 pt-5 sm:grid-cols-3">
          {meta("Diretor", "director", "Nome do diretor")}
          {meta("Cliente / Agência", "client", "Cliente ou agência")}
          {meta("Data", "date", "", "date")}
        </div>
      </div>
    </header>
  );
}
