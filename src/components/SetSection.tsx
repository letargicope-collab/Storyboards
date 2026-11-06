import type { Store } from "../store";
import type { StorySet } from "../types";
import { TakeCard } from "./TakeCard";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  TrashIcon,
  FilmIcon,
} from "./Icons";
import { useReadOnly } from "./ReadOnlyContext";
import { cn } from "../utils/cn";

interface Props {
  set: StorySet;
  index: number;
  totalSets: number;
  store: Store;
  breakBefore: boolean;
  onAskRemove: (set: StorySet) => void;
}

export function SetSection({ set, index, totalSets, store, breakBefore, onAskRemove }: Props) {
  const readOnly = useReadOnly();
  const { updateSet, moveSet, addTake, updateTake, removeTake, duplicateTake, moveTake } = store;
  const cols = store.project.settings.columns;

  const iconBtn =
    "grid h-8 w-8 place-items-center rounded-md text-ink-400 transition hover:bg-ink-700 hover:text-ink-100 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <section
      className={cn("pop-in", breakBefore && index > 0 && "print:break-before-page")}
      style={{ ["--cols" as string]: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {/* Set header */}
      <div className="set-head mb-4 flex items-center gap-3 rounded-xl border border-ink-600/60 bg-gradient-to-r from-ink-800 to-ink-900 px-4 py-3 print:mb-2 print:rounded-md print:px-3 print:py-2">
        {!readOnly && (
          <button
            type="button"
            title={set.collapsed ? "Expandir set" : "Recolher set"}
            onClick={() => updateSet(set.id, { collapsed: !set.collapsed })}
            className={cn(iconBtn, "no-print")}
          >
            {set.collapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
          </button>
        )}
        <div className="flex shrink-0 items-center gap-2 rounded-md bg-accent px-2.5 py-1 font-display text-xs font-extrabold tracking-[0.14em] text-on-accent print:text-[8pt]">
          <FilmIcon width={14} height={14} className="print:h-3 print:w-3" />
          SET {String(index + 1).padStart(2, "0")}
        </div>
        <span className="text-ink-500">—</span>
        <input
          value={set.name}
          readOnly={readOnly}
          onChange={(e) => updateSet(set.id, { name: e.target.value })}
          placeholder="NOME DA LOCAÇÃO (ex: EXTERIOR DA SEDE)"
          aria-label="Nome do set"
          className="field min-w-0 flex-1 font-display text-base font-bold uppercase tracking-wide text-ink-100 print:text-[11pt]"
        />
        <span className="shrink-0 rounded-full border border-ink-600 px-2.5 py-0.5 text-[11px] font-medium text-ink-300 print:text-[7pt]">
          {set.takes.length} {set.takes.length === 1 ? "take" : "takes"}
        </span>
        {!readOnly && (
          <div className="no-print flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              title="Subir set"
              disabled={index === 0}
              onClick={() => moveSet(set.id, -1)}
              className={iconBtn}
            >
              <ChevronUpIcon />
            </button>
            <button
              type="button"
              title="Descer set"
              disabled={index === totalSets - 1}
              onClick={() => moveSet(set.id, 1)}
              className={iconBtn}
            >
              <ChevronDownIcon />
            </button>
            <button
              type="button"
              title="Excluir set"
              onClick={() => onAskRemove(set)}
              className={cn(iconBtn, "hover:!bg-red-950/60 hover:!text-red-300")}
            >
              <TrashIcon />
            </button>
          </div>
        )}
      </div>

      {/* Takes grid */}
      <div
        className={cn(
          "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-(--cols) print:grid-cols-(--cols) print:gap-3",
          set.collapsed && !readOnly && "hidden print:grid"
        )}
      >
        {set.takes.map((take, i) => (
          <TakeCard
            key={take.id}
            take={take}
            index={i}
            total={set.takes.length}
            onChange={(p) => updateTake(set.id, take.id, p)}
            onRemove={() => removeTake(set.id, take.id)}
            onDuplicate={() => duplicateTake(set.id, take.id)}
            onMove={(dir) => moveTake(set.id, take.id, dir)}
          />
        ))}

        {!readOnly && (
          <button
            type="button"
            onClick={() => addTake(set.id)}
            className="no-print group flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink-600 text-ink-400 transition hover:border-accent hover:bg-accent/[0.04] hover:text-accent"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full border border-ink-600 transition group-hover:border-accent">
              <PlusIcon />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Adicionar take</span>
          </button>
        )}

        {readOnly && set.takes.length === 0 && (
          <p className="col-span-full py-6 text-center text-sm text-ink-500">Set sem takes.</p>
        )}
      </div>
    </section>
  );
}
