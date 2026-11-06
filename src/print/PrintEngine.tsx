import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Project } from "../types";
import { BlockView, Sheet, type ImgResolver } from "./Sheet";
import { buildBlocks, contentPx, paginate, sheetPx, sheetTheme } from "./layout";

export interface ReadyInfo {
  /** imagens externas que o servidor bloqueou (não entram no PDF) */
  failedImages: number;
  pages: number;
}

interface Props {
  project: Project;
  variant: "preview" | "export";
  onReady?: (root: HTMLElement, info: ReadyInfo) => void;
}

const isData = (s: string) => s.startsWith("data:") || s.startsWith("blob:");

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/** Converte imagens externas em data URL (necessário para o PDF; evita bloqueio de CORS) */
function useResolvedImages(project: Project, enabled: boolean) {
  const [state, setState] = useState({
    map: {} as Record<string, string>,
    done: !enabled,
    failed: 0,
  });

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const urls = new Set<string>();
    [project.logoBrand, project.logoClient].forEach((u) => u && urls.add(u));
    project.sets.forEach((s) => s.takes.forEach((t) => t.image && urls.add(t.image)));
    const external = [...urls].filter((u) => !isData(u));

    Promise.all(
      external.map(async (u) => {
        try {
          const res = await fetch(u, { mode: "cors" });
          if (!res.ok) throw new Error("http");
          return [u, await blobToDataUrl(await res.blob())] as const;
        } catch {
          return [u, null] as const;
        }
      })
    ).then((entries) => {
      if (!alive) return;
      const map: Record<string, string> = {};
      let failed = 0;
      entries.forEach(([u, d]) => {
        if (d) map[u] = d;
        else failed++;
      });
      setState({ map, done: true, failed });
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return state;
}

function waitImage(img: HTMLImageElement) {
  if (img.complete) return Promise.resolve();
  return new Promise<void>((res) => {
    img.addEventListener("load", () => res(), { once: true });
    img.addEventListener("error", () => res(), { once: true });
  });
}

async function loadFonts() {
  try {
    await Promise.all(
      [
        '800 12px "Montserrat"',
        '700 12px "Montserrat"',
        '600 12px "Montserrat"',
        '400 12px "Courier Prime"',
        '700 12px "Courier Prime"',
        '400 12px "Inter"',
        '600 12px "Inter"',
      ].map((f) => document.fonts.load(f))
    );
    await document.fonts.ready;
  } catch {
    /* segue com as fontes disponíveis */
  }
}

function PreviewPages({
  project,
  pages,
  blocks,
  img,
}: {
  project: Project;
  pages: number[][];
  blocks: ReturnType<typeof buildBlocks>;
  img: ImgResolver;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const { w: pw, h: ph } = sheetPx(project.settings.orientation);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = w ? Math.min(1.2, w / pw) : 1;

  return (
    <div ref={wrapRef} className="preview-pages flex w-full flex-col items-center gap-6">
      {pages.map((idxs, p) => (
        <div
          key={p}
          className="preview-frame shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
          style={{ width: pw * scale, height: ph * scale }}
        >
          <div
            className="preview-scale"
            style={{ width: pw, height: ph, transform: `scale(${scale})`, transformOrigin: "top left" }}
          >
            <Sheet
              project={project}
              blocks={idxs.map((i) => blocks[i])}
              page={p + 1}
              total={pages.length}
              img={img}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PrintEngine({ project, variant, onReady }: Props) {
  const { settings } = project;
  const blocks = useMemo(() => buildBlocks(project), [project]);
  const content = contentPx(settings.orientation);

  const [fontsOk, setFontsOk] = useState(false);
  const [pages, setPages] = useState<number[][] | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const fired = useRef(false);
  const readyCb = useRef(onReady);
  readyCb.current = onReady;

  const resolved = useResolvedImages(project, variant === "export");
  const img: ImgResolver = (src) => resolved.map[src] ?? src;

  useEffect(() => {
    let alive = true;
    loadFonts().then(() => alive && setFontsOk(true));
    return () => {
      alive = false;
    };
  }, []);

  // Mede cada bloco no tamanho real e distribui nas páginas
  useLayoutEffect(() => {
    if (!fontsOk || !measureRef.current) return;
    const heights = Array.from(measureRef.current.children).map(
      (el) => (el as HTMLElement).getBoundingClientRect().height
    );
    setPages(paginate(blocks, heights, content.h, settings.breakPerSet));
  }, [fontsOk, blocks, content.h, settings.breakPerSet]);

  // Export: avisa quando páginas + imagens estão prontas
  useEffect(() => {
    if (variant !== "export" || !pages || !resolved.done || fired.current) return;
    const root = rootRef.current;
    if (!root) return;
    fired.current = true;
    const imgs = Array.from(root.querySelectorAll("img"));
    Promise.all(imgs.map(waitImage)).then(() =>
      requestAnimationFrame(() =>
        readyCb.current?.(root, { failedImages: resolved.failed, pages: pages.length })
      )
    );
  }, [variant, pages, resolved.done, resolved.failed]);

  return (
    <>
      {/* Área de medição (invisível) */}
      <div
        ref={measureRef}
        className="sb-root sb-measure"
        style={{ ...sheetTheme(settings), width: content.w }}
        aria-hidden
      >
        {blocks.map((b, i) => (
          <BlockView key={i} block={b} project={project} img={img} />
        ))}
      </div>

      {pages === null ? (
        variant === "preview" ? (
          <div className="py-24 text-center text-sm text-ink-400">Montando páginas…</div>
        ) : null
      ) : variant === "preview" ? (
        <PreviewPages project={project} pages={pages} blocks={blocks} img={img} />
      ) : (
        <div ref={rootRef} className="export-root">
          {pages.map((idxs, p) => (
            <Sheet
              key={p}
              project={project}
              blocks={idxs.map((i) => blocks[i])}
              page={p + 1}
              total={pages.length}
              img={img}
            />
          ))}
        </div>
      )}
    </>
  );
}
