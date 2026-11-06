import type { Project, Take } from "../types";
import { typeLabel } from "../data/videoTypes";
import {
  PAGE_MARGIN_MM,
  FOOTER_MM,
  SHEET_TRIM_MM,
  pageMm,
  sheetTheme,
  type Block,
} from "./layout";

export type ImgResolver = (src: string) => string;

function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

function PrintTake({
  take,
  index,
  img,
}: {
  take: Take;
  index: number;
  img: ImgResolver;
}) {
  return (
    <article className="sb-take">
      <div className="sb-shot">
        {take.image ? (
          <img src={img(take.image)} alt="" />
        ) : (
          <div className="sb-shot-empty" />
        )}
        <div className="sb-badge">
          <span>TAKE</span> <b>{String(index + 1).padStart(2, "0")}</b>
        </div>
      </div>
      <div className="sb-take-body">
        <div className="sb-take-head">
          <span className="sb-scene">Cena {take.number}</span>
          {take.title && <span className="sb-take-title">{take.title}</span>}
        </div>
        {take.framing && (
          <div className="sb-frame">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            <span>{take.framing}</span>
          </div>
        )}
        {take.action.trim() && (
          <div>
            <div className="sb-label">Ação</div>
            <div className="sb-text">{take.action}</div>
          </div>
        )}
        {take.dialogue.trim() && (
          <div>
            <div className="sb-label">Diálogo</div>
            <div className="sb-text sb-dialogue">{take.dialogue}</div>
          </div>
        )}
        {take.sound.trim() && (
          <div>
            <div className="sb-label">Áudio / VFX</div>
            <div className="sb-sound">{take.sound}</div>
          </div>
        )}
      </div>
    </article>
  );
}

export function BlockView({
  block,
  project,
  img,
}: {
  block: Block;
  project: Project;
  img: ImgResolver;
}) {
  const { settings } = project;

  if (block.kind === "header") {
    const totalTakes = project.sets.reduce((a, s) => a + s.takes.length, 0);
    const label = typeLabel(project);
    const logoCls = "sb-logo" + (settings.logoPlate ? " plate" : "");
    const metas: [string, string][] = [
      ["Diretor", project.director],
      ["Cliente / Agência", project.client],
      ["Data", formatDate(project.date)],
      ["Sets · Takes", `${project.sets.length} · ${totalTakes}`],
    ];
    return (
      <div className="sb-head">
        <div className="sb-head-top">
          <div className="sb-head-main">
            <div className="sb-eyebrow">
              <span>Storyboard</span>
              {label && <span className="sb-type">{label}</span>}
            </div>
            <h1 className="sb-title">{project.name || "Projeto sem nome"}</h1>
          </div>
          {(project.logoBrand || project.logoClient) && (
            <div className="sb-logos">
              {project.logoBrand && (
                <div className="sb-logo-wrap">
                  <div className={logoCls}>
                    <img src={img(project.logoBrand)} alt="Logo da marca" />
                  </div>
                </div>
              )}
              {project.logoClient && (
                <div className="sb-logo-wrap">
                  <div className={logoCls}>
                    <img src={img(project.logoClient)} alt="Logo do cliente" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="sb-meta">
          {metas.map(([k, v]) => (
            <div key={k} className="sb-meta-item">
              <div className="sb-meta-label">{k}</div>
              <div className="sb-meta-value">{v || "—"}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.kind === "set") {
    return (
      <div className="sb-set">
        <span className="sb-set-badge">SET {String(block.index + 1).padStart(2, "0")}</span>
        <span className="sb-set-name">{block.set.name || "Sem nome"}</span>
        <span className="sb-set-count">
          {block.set.takes.length} {block.set.takes.length === 1 ? "take" : "takes"}
        </span>
      </div>
    );
  }

  return (
    <div
      className="sb-row"
      style={{ gridTemplateColumns: `repeat(${settings.columns}, minmax(0, 1fr))` }}
    >
      {block.takes.map((t, i) => (
        <PrintTake key={t.id} take={t} index={block.start + i} img={img} />
      ))}
    </div>
  );
}

export function Sheet({
  project,
  blocks,
  page,
  total,
  img,
}: {
  project: Project;
  blocks: Block[];
  page: number;
  total: number;
  img: ImgResolver;
}) {
  const { settings } = project;
  const p = pageMm(settings.orientation);
  const label = typeLabel(project);

  return (
    <section
      className="sheet sb-root"
      style={{
        ...sheetTheme(settings),
        width: `${p.w}mm`,
        height: `${p.h - SHEET_TRIM_MM}mm`,
        padding: `${PAGE_MARGIN_MM}mm`,
      }}
    >
      <div className="sb-body">
        {blocks.map((b, i) => (
          <BlockView key={i} block={b} project={project} img={img} />
        ))}
      </div>
      <footer
        className="sb-footer"
        style={{
          left: `${PAGE_MARGIN_MM}mm`,
          right: `${PAGE_MARGIN_MM}mm`,
          bottom: `${PAGE_MARGIN_MM - 2}mm`,
          height: `${FOOTER_MM - 2}mm`,
        }}
      >
        <span>
          {project.name || "Storyboard"}
          {label ? ` · ${label}` : ""}
        </span>
        <span>
          Página {page} / {total}
        </span>
      </footer>
    </section>
  );
}
