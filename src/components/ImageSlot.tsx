import { useRef, useState } from "react";
import { cn } from "../utils/cn";
import { ImagePlusIcon, LinkIcon, TrashIcon, UploadIcon, XIcon } from "./Icons";
import { useReadOnly } from "./ReadOnlyContext";
import { fileToDataUrl } from "../utils/image";


interface Props {
  image: string;
  onChange: (v: string) => void;
  alt: string;
}

export function ImageSlot({ image, onChange, alt }: Props) {
  const readOnly = useReadOnly();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [urlOpen, setUrlOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem.");
      return;
    }
    try {
      setError("");
      onChange(await fileToDataUrl(file));
    } catch {
      setError("Não foi possível carregar a imagem.");
    }
  };

  const applyUrl = () => {
    const v = url.trim();
    if (!v) return;
    onChange(v);
    setUrl("");
    setUrlOpen(false);
  };

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-md bg-ink-850 ring-1 ring-ink-600/70 transition",
        drag && "ring-2 ring-accent"
      )}
      onDragOver={(e) => {
        if (readOnly) return;
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        if (readOnly) return;
        e.preventDefault();
        setDrag(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {image ? (
        <img
          src={image}
          alt={alt}
          className="h-full w-full object-cover"
          draggable={false}
          onError={() => setError("Imagem não carregou (verifique a URL).")}
          onLoad={() => setError("")}
        />
      ) : (
        <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0_10px,rgba(255,255,255,0.015)_10px_20px)]" />
      )}

      {/* Empty state */}
      {!image && !readOnly && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="no-print group absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink-400 transition hover:text-accent"
        >
          <span className="grid h-11 w-11 place-items-center rounded-full border border-dashed border-ink-500 transition group-hover:border-accent">
            <ImagePlusIcon width={20} height={20} />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
            Adicionar referência
          </span>
          <span className="text-[10px] text-ink-500">clique ou arraste uma imagem</span>
        </button>
      )}

      {/* Frame guides */}
      <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-white/5" />

      {/* Hover tools */}
      {!readOnly && (
        <div className="no-print absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover/card:opacity-100 focus-within:opacity-100">
          {image && (
            <ToolBtn title="Trocar imagem" onClick={() => inputRef.current?.click()}>
              <UploadIcon width={14} height={14} />
            </ToolBtn>
          )}
          <ToolBtn title="Usar URL de imagem" onClick={() => setUrlOpen((o) => !o)}>
            <LinkIcon width={14} height={14} />
          </ToolBtn>
          {image && (
            <ToolBtn title="Remover imagem" danger onClick={() => onChange("")}>
              <TrashIcon width={14} height={14} />
            </ToolBtn>
          )}
        </div>
      )}

      {urlOpen && !readOnly && (
        <div className="no-print absolute inset-x-2 bottom-2 z-10 flex items-center gap-1.5 rounded-lg border border-ink-600 bg-ink-900/95 p-1.5 backdrop-blur">
          <LinkIcon width={14} height={14} className="ml-1 shrink-0 text-ink-400" />
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyUrl();
              if (e.key === "Escape") setUrlOpen(false);
            }}
            placeholder="https://… (cole a URL da imagem)"
            className="min-w-0 flex-1 bg-transparent text-xs text-ink-100 placeholder:text-ink-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={applyUrl}
            className="rounded bg-accent px-2 py-1 text-[11px] font-semibold text-on-accent hover:brightness-110"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => setUrlOpen(false)}
            className="rounded p-1 text-ink-400 hover:text-ink-100"
          >
            <XIcon width={14} height={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="no-print absolute inset-x-2 top-2 rounded bg-red-950/90 px-2 py-1 text-[11px] text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}

function ToolBtn({
  children,
  title,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-black/65 text-ink-100 backdrop-blur transition hover:bg-black/85",
        danger ? "hover:text-red-300" : "hover:text-accent"
      )}
    >
      {children}
    </button>
  );
}
