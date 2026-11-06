import { cn } from "../utils/cn";
import { useReadOnly } from "./ReadOnlyContext";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  minLines?: number;
}

/**
 * Textarea que cresce com o conteúdo usando uma "div espelho" no mesmo grid.
 * Isso garante que o texto completo apareça também na impressão/PDF.
 */
export function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
  minLines = 2,
}: Props) {
  const readOnly = useReadOnly();
  return (
    <div
      className={cn("autogrow field-wrap", className)}
      style={{ minHeight: `calc(${minLines} * 1.55em + 8px)` }}
    >
      <div className="mirror" aria-hidden>
        {value + "\n"}
      </div>
      <textarea
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="field !m-0 !w-full"
        rows={1}
        spellCheck={false}
      />
    </div>
  );
}
