import { useEffect, useMemo, useRef, useState } from "react";
import { useProject, sampleProject } from "./store";
import type { Project, StorySet } from "./types";
import { Toolbar } from "./components/Toolbar";
import { ProjectHeader } from "./components/ProjectHeader";
import { SetSection } from "./components/SetSection";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { SHOT_SUGGESTIONS } from "./components/TakeCard";
import { PlusIcon, ClapperIcon } from "./components/Icons";
import { PrintEngine, type ReadyInfo } from "./print/PrintEngine";
import { exportPdf } from "./print/pdf";
import { getPalette, getType, type Palette } from "./data/videoTypes";
import { mix, onColor } from "./utils/color";
import { cn } from "./utils/cn";

type Confirm =
  | { kind: "clear" }
  | { kind: "set"; set: StorySet }
  | { kind: "sample" }
  | null;

interface Job {
  kind: "print" | "pdf";
  id: number;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function App() {
  const store = useProject();
  const { project, patch, setSettings, addSet, removeSet, replaceProject, clearProject } = store;
  const { settings } = project;

  const [preview, setPreview] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [toast, setToast] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [progress, setProgress] = useState("");
  const jobSeq = useRef(0);

  // Aplica as cores escolhidas em toda a interface
  useEffect(() => {
    const s = document.documentElement.style;
    s.setProperty("--color-accent", settings.accent);
    s.setProperty("--color-accent-dim", mix(settings.accent, "#07080a", 0.45));
    s.setProperty("--color-cyan", settings.secondary);
    s.setProperty("--color-on-accent", onColor(settings.accent));
  }, [settings.accent, settings.secondary]);

  // Título do documento = nome do projeto (vira o nome sugerido do PDF)
  useEffect(() => {
    document.title = project.name
      ? `${project.name} — Storyboard`
      : "Storyboard Studio — Gerador de Storyboards";
  }, [project.name]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  const typeDef = getType(project.videoType);
  const suggested: Palette | null = typeDef ? getPalette(typeDef.palette) ?? null : null;

  const shotOptions = useMemo(
    () => [...(typeDef?.shots ?? []), ...SHOT_SUGGESTIONS],
    [typeDef]
  );

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slugify(project.name) || "storyboard"}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setToast("Projeto exportado em JSON.");
  };

  const importJson = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as Project;
      if (!data || !Array.isArray(data.sets)) throw new Error("invalid");
      replaceProject(data);
      setToast("Projeto importado com sucesso.");
    } catch {
      setToast("Arquivo inválido. Use um .json exportado por este app.");
    }
  };

  const startJob = (kind: Job["kind"]) => {
    if (job) return;
    setProgress(kind === "pdf" ? "Preparando páginas…" : "Preparando impressão…");
    setJob({ kind, id: ++jobSeq.current });
  };

  const runJob = async (kind: Job["kind"], root: HTMLElement, info: ReadyInfo) => {
    if (kind === "print") {
      const done = () => {
        window.removeEventListener("afterprint", done);
        setJob(null);
      };
      window.addEventListener("afterprint", done);
      setToast('Se a janela de impressão não abrir, use "Baixar PDF".');
      try {
        window.print();
      } catch {
        done();
      }
      return;
    }
    try {
      await exportPdf(
        root,
        settings.orientation,
        `${slugify(project.name) || "storyboard"}-storyboard.pdf`,
        (d, t) => setProgress(`Gerando PDF… página ${Math.min(d + 1, t)} de ${t}`)
      );
      setToast(
        info.failedImages
          ? `PDF salvo, mas ${info.failedImages} imagem(ns) por URL foram bloqueadas pelo site de origem. Envie o arquivo da imagem para incluí-la.`
          : `PDF salvo com ${info.pages} página(s).`
      );
    } catch {
      setToast("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setJob(null);
    }
  };

  const pageCss = `@page { size: A4 ${settings.orientation}; margin: 0; }`;

  return (
    <>
      <style>{pageCss}</style>
      <datalist id="shot-suggestions">
        {shotOptions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <div className="backdrop-film min-h-screen">
        <Toolbar
          settings={settings}
          saveState={store.saveState}
          preview={preview}
          busy={!!job}
          onSettings={setSettings}
          onTogglePreview={() => setPreview((p) => !p)}
          onPrint={() => startJob("print")}
          onPdf={() => startJob("pdf")}
          onExport={exportJson}
          onImport={importJson}
          onClear={() => setConfirm({ kind: "clear" })}
          onSample={() => setConfirm({ kind: "sample" })}
        />

        {preview ? (
          <div className={cn(job && "print:hidden")}>
            <div className="print:hidden border-b border-cyan/20 bg-cyan/[0.06] py-1.5 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-cyan">
              Pré-visualização — páginas A4 exatamente como serão impressas / salvas em PDF
            </div>
            <div className="preview-area mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
              <PrintEngine project={project} variant="preview" />
            </div>
          </div>
        ) : (
          <div className="print:hidden">
            <main className="mx-auto max-w-[1500px] space-y-10 px-4 py-8 sm:px-6">
              <ProjectHeader
                project={project}
                suggested={suggested}
                onChange={patch}
                onApplyPalette={(p) => setSettings({ accent: p.accent, secondary: p.secondary })}
              />

              {project.sets.map((set, i) => (
                <SetSection
                  key={set.id}
                  set={set}
                  index={i}
                  totalSets={project.sets.length}
                  store={store}
                  breakBefore={false}
                  onAskRemove={(s) => setConfirm({ kind: "set", set: s })}
                />
              ))}

              {project.sets.length === 0 && (
                <div className="rounded-2xl border border-dashed border-ink-600 px-6 py-20 text-center">
                  <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-ink-800 text-accent">
                    <ClapperIcon width={26} height={26} />
                  </span>
                  <h2 className="font-display text-xl font-bold text-ink-100">Seu storyboard está vazio</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
                    Comece criando o primeiro Set (locação) e adicione os takes com imagem,
                    enquadramento, ação, diálogo e áudio/VFX.
                  </p>
                </div>
              )}

              <div className="flex justify-center pb-16">
                <button
                  type="button"
                  onClick={addSet}
                  className="group flex items-center gap-3 rounded-xl border border-ink-600 bg-ink-850 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-ink-100 transition hover:border-accent hover:text-accent"
                >
                  <PlusIcon />
                  Adicionar Set / Locação
                </button>
              </div>
            </main>

            <footer className="border-t border-ink-800 py-6 text-center text-[11px] uppercase tracking-[0.25em] text-ink-500">
              Storyboard Studio · dados salvos localmente no seu navegador
            </footer>
          </div>
        )}
      </div>

      {/* Páginas em tamanho real para imprimir / gerar PDF */}
      {job && (
        <PrintEngine
          key={job.id}
          project={project}
          variant="export"
          onReady={(root, info) => runJob(job.kind, root, info)}
        />
      )}

      {job && (
        <div className="no-print fixed inset-0 z-[60] grid place-items-center bg-black/60 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-xl border border-ink-600 bg-ink-850 px-5 py-4 text-sm text-ink-100 shadow-2xl">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-500 border-t-accent" />
            {progress}
          </div>
        </div>
      )}

      {confirm?.kind === "clear" && (
        <ConfirmDialog
          title="Limpar projeto?"
          message="Todos os sets, takes, logos e imagens serão apagados para começar um projeto novo. Exporte o JSON antes se quiser guardar uma cópia."
          confirmLabel="Limpar tudo"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            clearProject();
            setConfirm(null);
            setToast("Projeto limpo. Pronto para um novo storyboard.");
          }}
        />
      )}
      {confirm?.kind === "set" && (
        <ConfirmDialog
          title="Excluir set?"
          message={`O set "${confirm.set.name || "sem nome"}" e seus ${confirm.set.takes.length} take(s) serão removidos.`}
          confirmLabel="Excluir set"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            removeSet(confirm.set.id);
            setConfirm(null);
          }}
        />
      )}
      {confirm?.kind === "sample" && (
        <ConfirmDialog
          title="Carregar projeto de exemplo?"
          message="O projeto atual será substituído por um exemplo demonstrativo."
          confirmLabel="Carregar exemplo"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            replaceProject(sampleProject());
            setConfirm(null);
          }}
        />
      )}

      {toast && (
        <div className="pop-in no-print fixed bottom-5 left-1/2 z-[70] max-w-[92vw] -translate-x-1/2 rounded-full border border-ink-600 bg-ink-850 px-5 py-2.5 text-center text-sm text-ink-100 shadow-2xl">
          {toast}
        </div>
      )}
    </>
  );
}
