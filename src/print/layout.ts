import type { CSSProperties } from "react";
import type { Orientation, Project, Settings, StorySet, Take } from "../types";
import { onColor, readableOn } from "../utils/color";

/** 1mm em pixels CSS (96dpi) */
export const MM = 96 / 25.4;
export const PAGE_MARGIN_MM = 9;
export const FOOTER_MM = 7;
export const BLOCK_GAP = 12;
/** A folha é 0,5mm menor que o A4 para nunca gerar página em branco extra */
export const SHEET_TRIM_MM = 0.5;

export function pageMm(o: Orientation) {
  return o === "landscape" ? { w: 297, h: 210 } : { w: 210, h: 297 };
}

export function sheetPx(o: Orientation) {
  const p = pageMm(o);
  return { w: p.w * MM, h: (p.h - SHEET_TRIM_MM) * MM };
}

export function contentPx(o: Orientation) {
  const p = pageMm(o);
  return {
    w: (p.w - 2 * PAGE_MARGIN_MM) * MM,
    h: (p.h - SHEET_TRIM_MM - 2 * PAGE_MARGIN_MM - FOOTER_MM) * MM,
  };
}

export type Block =
  | { kind: "header" }
  | { kind: "set"; set: StorySet; index: number }
  | { kind: "row"; set: StorySet; start: number; takes: Take[] };

export function buildBlocks(project: Project): Block[] {
  const cols = project.settings.columns;
  const blocks: Block[] = [{ kind: "header" }];
  project.sets.forEach((set, index) => {
    blocks.push({ kind: "set", set, index });
    for (let i = 0; i < set.takes.length; i += cols) {
      blocks.push({ kind: "row", set, start: i, takes: set.takes.slice(i, i + cols) });
    }
  });
  return blocks;
}

/**
 * Distribui os blocos (já medidos) em páginas.
 * - Nunca quebra um card no meio (a unidade mínima é a linha de takes).
 * - O cabeçalho de um Set nunca fica sozinho no fim da página.
 */
export function paginate(
  blocks: Block[],
  heights: number[],
  contentH: number,
  breakPerSet: boolean
): number[][] {
  const pages: number[][] = [[]];
  let y = 0;

  blocks.forEach((b, i) => {
    const cur = pages[pages.length - 1];
    let need = heights[i];
    if (b.kind === "set") {
      const next = blocks[i + 1];
      if (next && next.kind === "row") need += BLOCK_GAP + heights[i + 1];
    }
    const forceBreak = b.kind === "set" && breakPerSet && cur.length > 0;
    const add = cur.length ? BLOCK_GAP + need : need;

    if (cur.length > 0 && (forceBreak || y + add > contentH + 0.5)) {
      pages.push([i]);
      y = heights[i];
    } else {
      y += cur.length ? BLOCK_GAP + heights[i] : heights[i];
      cur.push(i);
    }
  });

  return pages;
}

/** Variáveis CSS de cor usadas pelas folhas (papel claro/escuro + cores do projeto) */
export function sheetTheme(settings: Settings): CSSProperties {
  const light = settings.printTheme === "light";
  const paper = light ? "#ffffff" : "#0d0f12";
  return {
    ["--paper" as string]: paper,
    ["--ink" as string]: light ? "#0b0c0e" : "#eceef3",
    ["--muted" as string]: light ? "#5d6471" : "#a1a9b8",
    ["--line" as string]: light ? "#d5d8de" : "#2e343d",
    ["--card" as string]: light ? "#f5f6f8" : "#15181d",
    ["--shotbg" as string]: light ? "#e8eaee" : "#090a0c",
    ["--accent" as string]: settings.accent,
    ["--accent-text" as string]: readableOn(settings.accent, paper),
    ["--accent2-text" as string]: readableOn(settings.secondary, paper),
    ["--on-accent" as string]: onColor(settings.accent),
  } as CSSProperties;
}
