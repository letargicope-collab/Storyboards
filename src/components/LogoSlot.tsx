import { useRef, useState } from "react";
import { cn } from "../utils/cn";
import { fileToDataUrl } from "../utils/image";
import { ImagePlusIcon, TrashIcon, UploadIcon } from "./Icons";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  plate: boolean;
}

export function LogoSlot({ label, value, onChange, plate }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");

  const handle = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Arquivo inválido");
      return;
    }
    try {
      setError("");
      onChange(await fileToDataUrl(file, { maxW: 600, keepAlpha: true }));
    } catch {
      setError("Falha ao carregar");
    }
  };

  return (
    <div className="w-[150px]">
      <div className="mb-1.5 text-[9.5px] font-semibold uppercase leading-tight tracking-[0.18em] text-ink-400">
        {label}
      </div>
      <div
        className={cn(
          "group relative flex h-[78px] items-center justify-center overflow-hidden rounded-lg border transition",
          value ? "border-ink-600" : "border-dashed border-ink-500 hover:border-accent",
          drag && "border-accent",
          value && plate ? "bg-white" : "bg-ink-850"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files?.[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handle(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {value ? (
          <>
            <img src={value} alt={label} className="max-h-full max-w-full object-contain p-2" />
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/60 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                title="Trocar logo"
                onClick={() => inputRef.current?.click()}
                className="grid h-7 w-7 place-items-center rounded-md bg-ink-800 text-ink-100 hover:text-accent"
              >
                <UploadIcon width={14} height={14} />
              </button>
              <button
                type="button"
                title="Remover logo"
                onClick={() => onChange("")}
                className="grid h-7 w-7 place-items-center rounded-md bg-ink-800 text-ink-100 hover:text-red-300"
              >
                <TrashIcon width={14} height={14} />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-1 text-ink-400 transition hover:text-accent"
          >
            <ImagePlusIcon width={20} height={20} />
            <span className="text-[10px] font-medium uppercase tracking-[0.14em]">Enviar logo</span>
          </button>
        )}
      </div>
      {error && <div className="mt-1 text-[10px] text-red-300">{error}</div>}
    </div>
  );
}
