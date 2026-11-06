import type { Project } from "../types";

export interface Palette {
  id: string;
  name: string;
  accent: string;
  secondary: string;
}

export const PALETTES: Palette[] = [
  { id: "gold", name: "Cinema Gold", accent: "#d6b25e", secondary: "#5fd0e0" },
  { id: "teal-orange", name: "Teal & Orange", accent: "#ff8a3d", secondary: "#2ec4b6" },
  { id: "stage", name: "Palco Vermelho", accent: "#ef4444", secondary: "#fbbf24" },
  { id: "neon", name: "Neon Festival", accent: "#d946ef", secondary: "#22d3ee" },
  { id: "earth", name: "Terra & Couro", accent: "#d08a3c", secondary: "#8fb36a" },
  { id: "corporate", name: "Azul Institucional", accent: "#3b82f6", secondary: "#94a3b8" },
  { id: "forest", name: "Verde Natural", accent: "#34d399", secondary: "#fbbf24" },
  { id: "mono", name: "Monocromático", accent: "#e5e7eb", secondary: "#9ca3af" },
];

export const DEFAULT_PALETTE = PALETTES[0];

export interface VideoType {
  id: string;
  label: string;
  palette: string;
  shots: string[];
}

export const VIDEO_TYPES: VideoType[] = [
  {
    id: "aftermovie",
    label: "Aftermovie",
    palette: "neon",
    shots: [
      "Drone — Vista aérea do evento",
      "Time-lapse — Entrada do público",
      "Câmera lenta — Reação da plateia",
      "Gimbal — Travelling entre o público",
      "Plano Detalhe — Pulseiras / mãos para o alto",
      "Close — Sorrisos e emoção",
    ],
  },
  {
    id: "vaquejada",
    label: "Vaquejada",
    palette: "earth",
    shots: [
      "Drone — Vista aérea da pista",
      "Câmera lenta — Queda do boi",
      "Plano Detalhe — Esporas, rédeas e chapéu",
      "Close — Vaqueiro concentrado",
      "Travelling — Corrida dos cavalos",
      "Plano Aberto — Arquibancada lotada",
      "Contra-Plongée — Vaqueiro a cavalo",
    ],
  },
  {
    id: "show",
    label: "Show",
    palette: "stage",
    shots: [
      "Plano Geral — Palco completo",
      "Close — Artista no microfone",
      "Grua / Jib — Panorâmica sobre o público",
      "Câmera lenta — Plateia cantando",
      "Plano Detalhe — Instrumentos",
      "Contra-Plongée — Artista em destaque",
      "Over the Shoulder — Banda para a plateia",
    ],
  },
  {
    id: "institucional",
    label: "Institucional",
    palette: "corporate",
    shots: [
      "Plano Médio — Entrevista",
      "Time-lapse — Fachada da empresa",
      "Slider — Ambiente de trabalho",
      "Plano Detalhe — Produto / equipe",
      "Plano Aberto — Sede",
      "Over the Shoulder — Colaborador",
    ],
  },
  {
    id: "cinematografico",
    label: "Cinematográfico",
    palette: "gold",
    shots: [
      "Plano Sequência",
      "Plano Holandês",
      "Rack Focus — Revelação",
      "Dolly In — Tensão",
      "Silhueta em contraluz",
      "Plano Subjetivo (POV)",
    ],
  },
  {
    id: "comercial",
    label: "Comercial",
    palette: "teal-orange",
    shots: [
      "Plano Detalhe — Hero shot do produto",
      "Macro — Textura",
      "Câmera lenta — Ação do produto",
      "Plano Médio — Testemunhal",
      "Packshot final",
    ],
  },
  {
    id: "videoclipe",
    label: "Videoclipe",
    palette: "neon",
    shots: [
      "Plano Médio — Performance",
      "Close — Lip sync",
      "Whip Pan",
      "Câmera na mão",
      "Plano Aberto — Locação",
    ],
  },
  {
    id: "documentario",
    label: "Documentário",
    palette: "mono",
    shots: [
      "Plano Médio — Entrevista",
      "B-roll — Ambiente",
      "Plano Detalhe — Mãos",
      "Câmera na mão — Observacional",
    ],
  },
  { id: "outro", label: "Outro", palette: "gold", shots: [] },
];

export const getType = (id: string) => VIDEO_TYPES.find((t) => t.id === id);

export function typeLabel(p: Pick<Project, "videoType" | "videoTypeCustom">) {
  if (!p.videoType) return "";
  if (p.videoType === "outro") return p.videoTypeCustom.trim();
  return getType(p.videoType)?.label ?? "";
}

export const getPalette = (id: string) => PALETTES.find((p) => p.id === id);
