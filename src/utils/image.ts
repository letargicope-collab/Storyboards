interface Opts {
  maxW?: number;
  quality?: number;
  /** Mantém transparência (PNG) — usado em logos */
  keepAlpha?: boolean;
}

/** Lê e redimensiona/comprime uma imagem para economizar espaço no localStorage. */
export function fileToDataUrl(file: File, opts: Opts = {}): Promise<string> {
  const { maxW = 1280, quality = 0.82, keepAlpha = false } = opts;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.onload = () => {
      const src = String(reader.result);
      if (file.type === "image/gif" || file.type === "image/svg+xml") {
        resolve(src);
        return;
      }
      const img = new Image();
      img.onerror = () => reject(new Error("Imagem inválida"));
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(src);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(
          keepAlpha
            ? canvas.toDataURL("image/png")
            : canvas.toDataURL("image/jpeg", quality)
        );
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
