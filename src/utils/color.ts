export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.padEnd(6, "0").slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]: RGB) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Mistura a com b; t = quanto de b (0..1) */
export function mix(a: string, b: string, t: number) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex([
    A[0] + (B[0] - A[0]) * t,
    A[1] + (B[1] - A[1]) * t,
    A[2] + (B[2] - A[2]) * t,
  ]);
}

export function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Cor de texto (preto/branco) legível sobre um fundo colorido */
export function onColor(bg: string) {
  return luminance(bg) > 0.42 ? "#0b0c0e" : "#ffffff";
}

/** Ajusta `color` para ter contraste mínimo sobre `paper` (para textos) */
export function readableOn(color: string, paper: string, min = 3.4) {
  const paperIsLight = luminance(paper) > 0.5;
  const target = paperIsLight ? "#000000" : "#ffffff";
  let c = color;
  for (let i = 0; i < 12 && contrast(c, paper) < min; i++) {
    c = mix(c, target, 0.12);
  }
  return c;
}

export function isHex(v: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());
}
