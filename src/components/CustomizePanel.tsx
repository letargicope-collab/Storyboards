import type { Settings } from "../types";
import { DEFAULT_PALETTE, PALETTES } from "../data/videoTypes";
import { isHex } from "../utils/color";
import { cn } from "../utils/cn";

interface Props {
  settings: Settings;
  onSettings: (s: Partial<Settings>) => void;
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-ink-200">{label}</span>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => {
            const v = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value;
            if (isHex(v) && v.length === 7) onChange(v);
            else onChange(v.slice(0, 7));
          }}
          spellCheck={false}
          className="w-[84px] rounded-md border border-ink-600 bg-ink-900 px-2 py-1 font-script text-xs uppercase text-ink-100 focus:border-accent focus:outline-none"
        />
        <input
          type="color"
          value={isHex(value) && value.length === 7 ? value : "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="h-8 w-10 cursor-pointer rounded-md border border-ink-600 bg-transparent p-0.5"
        />
      </div>
    </div>
  );
}

export function CustomizePanel({ settings, onSettings }: Props) {
  const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

  return (
    <div className="pop-in absolute right-0 top-full z-50 mt-2 w-[min(340px,90vw)] rounded-xl border border-ink-600 bg-ink-850 p-4 shadow-2xl">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-400">
        Paletas
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {PALETTES.map((p) => {
          const active = same(p.accent, settings.accent) && same(p.secondary, settings.secondary);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSettings({ accent: p.accent, secondary: p.secondary })}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[11px] font-medium transition",
                active
                  ? "border-accent bg-accent/10 text-ink-100"
                  : "border-ink-700 text-ink-300 hover:border-ink-500 hover:text-ink-100"
              )}
            >
              <span className="flex shrink-0">
                <span className="h-4 w-4 rounded-full ring-2 ring-ink-850" style={{ background: p.accent }} />
                <span className="-ml-1.5 h-4 w-4 rounded-full ring-2 ring-ink-850" style={{ background: p.secondary }} />
              </span>
              <span className="truncate">{p.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2.5 border-t border-ink-700 pt-4">
        <ColorRow
          label="Cor de destaque"
          value={settings.accent}
          onChange={(accent) => onSettings({ accent })}
        />
        <ColorRow
          label="Cor secundária"
          value={settings.secondary}
          onChange={(secondary) => onSettings({ secondary })}
        />
      </div>

      <div className="mt-4 space-y-3 border-t border-ink-700 pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-ink-200">Papel na impressão / PDF</span>
          <div className="flex rounded-lg border border-ink-600 bg-ink-900 p-0.5">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onSettings({ printTheme: t })}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition",
                  settings.printTheme === t
                    ? "bg-ink-600 text-ink-100 shadow"
                    : "text-ink-400 hover:text-ink-100"
                )}
              >
                {t === "light" ? "Branco" : "Escuro"}
              </button>
            ))}
          </div>
        </div>
        <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-ink-200">
          <input
            type="checkbox"
            checked={settings.logoPlate}
            onChange={(e) => onSettings({ logoPlate: e.target.checked })}
            className="h-3.5 w-3.5 accent-(--color-accent)"
          />
          Fundo branco atrás dos logos (para logos escuros)
        </label>
      </div>

      <button
        type="button"
        onClick={() =>
          onSettings({ accent: DEFAULT_PALETTE.accent, secondary: DEFAULT_PALETTE.secondary })
        }
        className="mt-4 w-full rounded-lg border border-ink-600 py-2 text-xs font-medium text-ink-300 transition hover:bg-ink-800 hover:text-ink-100"
      >
        Restaurar cores padrão
      </button>
    </div>
  );
}
