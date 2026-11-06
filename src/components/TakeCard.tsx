import { memo } from "react";
import type { Take } from "../types";
import { AutoTextarea } from "./AutoTextarea";
import { ImageSlot } from "./ImageSlot";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CameraIcon,
  CopyIcon,
  TrashIcon,
} from "./Icons";
import { useReadOnly } from "./ReadOnlyContext";
import { cn } from "../utils/cn";

interface Props {
  take: Take;
  index: number;
  total: number;
  onChange: (p: Partial<Take>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMove: (dir: -1 | 1) => void;
}

export const SHOT_SUGGESTIONS = [
  "Plano Geral (PG)",
  "Plano Aberto",
  "Plano Médio (PM)",
  "Plano Americano",
  "Close-up (CU)",
  "Super Close (ECU)",
  "Plano Detalhe",
  "Plongée",
  "Contra-Plongée",
  "Plano Holandês",
  "Plano Subjetivo (POV)",
  "Over the Shoulder",
  "Plano Sequência",
  "Travelling",
  "Panorâmica",
  "Dolly In",
  "Dolly Out",
  "Steadicam",
  "Câmera na mão",
  "Drone",
  "Grua / Jib",
  "Rack Focus",
  "Time-lapse",
  "Slow Motion",
];

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mb-0.5 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-ink-400 print:text-[6.5pt]",
        className
      )}
    >
      {children}
    </div>
  );
}

function TakeCardBase({ take, index, total, onChange, onRemove, onDuplicate, onMove }: Props) {
  const readOnly = useReadOnly();
  const iconBtn =
    "grid h-7 w-7 place-items-center rounded-md text-ink-400 transition hover:bg-ink-700 hover:text-ink-100 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <article className="take-card group/card pop-in relative flex flex-col overflow-hidden rounded-xl border border-ink-600/70 bg-ink-900 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.8)] transition hover:border-ink-500 print:rounded-md print:shadow-none">
      {/* Image */}
      <div className="p-2.5 pb-0 print:p-1.5 print:pb-0">
        <div className="relative">
          <ImageSlot
            image={take.image}
            onChange={(image) => onChange({ image })}
            alt={`Take ${take.number} ${take.title}`}
          />
          <div className="pointer-events-none absolute left-2 top-2 flex items-center gap-1.5 rounded bg-black/70 px-2 py-1 font-display text-[11px] font-bold tracking-wider text-accent backdrop-blur print:text-[7pt]">
            <span className="text-white/60">TAKE</span>
            {String(index + 1).padStart(2, "0")}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3.5 pt-3 text-[13px] print:gap-1.5 print:p-2 print:text-[8pt]">
        {/* Header: Scene number + title */}
        <div className="flex items-baseline gap-2 border-b border-ink-700 pb-2 print:pb-1">
          <span className="shrink-0 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-accent print:text-[7pt]">
            Cena
          </span>
          <input
            value={take.number}
            readOnly={readOnly}
            onChange={(e) => onChange({ number: e.target.value })}
            className="field shrink-0 text-center font-display text-sm font-bold text-ink-100 print:text-[9pt]"
            style={{ width: `calc(${Math.max(2, take.number.length)}ch + 22px)` }}
            placeholder="00"
            aria-label="Número da cena"
          />
          <span className="text-ink-500">—</span>
          <input
            value={take.title}
            readOnly={readOnly}
            onChange={(e) => onChange({ title: e.target.value })}
            className="field min-w-0 flex-1 font-display text-sm font-semibold uppercase tracking-wide text-ink-100 print:text-[9pt]"
            placeholder="TÍTULO DA CENA"
            aria-label="Título da cena"
          />
        </div>

        {/* Framing */}
        <div className="flex items-center gap-2 text-ink-300">
          <CameraIcon width={14} height={14} className="shrink-0 text-cyan print:h-2.5 print:w-2.5" />
          <input
            list="shot-suggestions"
            value={take.framing}
            readOnly={readOnly}
            onChange={(e) => onChange({ framing: e.target.value })}
            className="field font-medium text-cyan"
            placeholder="Enquadramento / câmera"
            aria-label="Enquadramento"
          />
        </div>

        {/* Action */}
        <div className={cn(!take.action && "print:hidden")}>
          <Label>Ação</Label>
          <AutoTextarea
            value={take.action}
            onChange={(action) => onChange({ action })}
            placeholder="Descreva o que acontece na cena…"
            className="font-script text-[13px] leading-[1.55] text-ink-200 print:text-[8pt]"
            minLines={3}
          />
        </div>

        {/* Dialogue */}
        <div className={cn(!take.dialogue && "print:hidden")}>
          <Label>Diálogo</Label>
          <div className="border-l-2 border-accent-dim/70 pl-2.5">
            <AutoTextarea
              value={take.dialogue}
              onChange={(dialogue) => onChange({ dialogue })}
              placeholder="PERSONAGEM — fala (opcional)"
              className="font-script text-[13px] leading-[1.55] text-ink-100 print:text-[8pt]"
              minLines={2}
            />
          </div>
        </div>

        {/* Sound / VFX */}
        <div className={cn(!take.sound && "print:hidden")}>
          <Label>Áudio / VFX</Label>
          <AutoTextarea
            value={take.sound}
            onChange={(sound) => onChange({ sound })}
            placeholder="Design de som, trilha, efeitos…"
            className="text-xs leading-[1.55] text-ink-300 print:text-[7.5pt]"
            minLines={2}
          />
        </div>
      </div>

      {/* Footer toolbar */}
      {!readOnly && (
        <div className="no-print mt-auto flex items-center justify-between border-t border-ink-700 bg-ink-850 px-2 py-1.5">
          <div className="flex gap-0.5">
            <button
              type="button"
              title="Mover para trás"
              disabled={index === 0}
              onClick={() => onMove(-1)}
              className={iconBtn}
            >
              <ArrowLeftIcon width={15} height={15} />
            </button>
            <button
              type="button"
              title="Mover para frente"
              disabled={index === total - 1}
              onClick={() => onMove(1)}
              className={iconBtn}
            >
              <ArrowRightIcon width={15} height={15} />
            </button>
          </div>
          <div className="flex gap-0.5">
            <button type="button" title="Duplicar take" onClick={onDuplicate} className={iconBtn}>
              <CopyIcon width={15} height={15} />
            </button>
            <button
              type="button"
              title="Excluir take"
              onClick={onRemove}
              className={cn(iconBtn, "hover:!bg-red-950/60 hover:!text-red-300")}
            >
              <TrashIcon width={15} height={15} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export const TakeCard = memo(TakeCardBase);
