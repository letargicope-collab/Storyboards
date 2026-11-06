export interface Take {
  id: string;
  number: string;
  title: string;
  framing: string;
  action: string;
  dialogue: string;
  sound: string;
  image: string;
}

export interface StorySet {
  id: string;
  name: string;
  collapsed: boolean;
  takes: Take[];
}

export type Orientation = "landscape" | "portrait";
export type PrintTheme = "light" | "dark";

export interface Settings {
  columns: 2 | 3 | 4;
  orientation: Orientation;
  printTheme: PrintTheme;
  breakPerSet: boolean;
  /** Cor de destaque (hex) */
  accent: string;
  /** Cor secundária (hex) — enquadramentos, detalhes */
  secondary: string;
  /** Coloca os logos sobre uma placa branca (para logos escuros) */
  logoPlate: boolean;
}

export interface Project {
  name: string;
  director: string;
  date: string;
  client: string;
  /** id de VIDEO_TYPES ("" = não definido) */
  videoType: string;
  videoTypeCustom: string;
  logoBrand: string;
  logoClient: string;
  sets: StorySet[];
  settings: Settings;
}
