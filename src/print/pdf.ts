import type { Orientation } from "../types";

/**
 * Gera um PDF A4 a partir das folhas (.sheet) já montadas.
 * Cada folha vira uma página — idêntico ao que aparece na pré-visualização/impressão.
 */
export async function exportPdf(
  root: HTMLElement,
  orientation: Orientation,
  filename: string,
  onProgress?: (done: number, total: number) => void
) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const sheets = Array.from(root.querySelectorAll<HTMLElement>(".sheet"));
  if (!sheets.length) throw new Error("Nenhuma página para exportar");

  const pw = orientation === "landscape" ? 297 : 210;
  const ph = orientation === "landscape" ? 210 : 297;
  const pdf = new jsPDF({ orientation, unit: "mm", format: "a4", compress: true });

  for (let i = 0; i < sheets.length; i++) {
    onProgress?.(i, sheets.length);
    const canvas = await html2canvas(sheets[i], {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: null,
      onclone: (doc) => {
        const r = doc.querySelector<HTMLElement>(".export-root");
        if (r) {
          r.style.position = "absolute";
          r.style.left = "0";
          r.style.top = "0";
        }
      },
    });
    const data = canvas.toDataURL("image/jpeg", 0.93);
    if (i > 0) pdf.addPage("a4", orientation);
    pdf.addImage(data, "JPEG", 0, 0, pw, ph, undefined, "FAST");
    // libera memória
    canvas.width = 0;
    canvas.height = 0;
  }
  onProgress?.(sheets.length, sheets.length);
  pdf.save(filename);
}
