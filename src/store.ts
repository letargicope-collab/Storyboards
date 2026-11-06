import { useCallback, useEffect, useRef, useState } from "react";
import type { Project, StorySet, Take } from "./types";
import { DEFAULT_PALETTE } from "./data/videoTypes";

const STORAGE_KEY = "storyboard-studio:v1";

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const today = () => new Date().toISOString().slice(0, 10);

export const pad = (n: number) => String(n).padStart(2, "0");

export const newTake = (number: string): Take => ({
  id: uid(),
  number,
  title: "",
  framing: "",
  action: "",
  dialogue: "",
  sound: "",
  image: "",
});

export const newSet = (name = ""): StorySet => ({
  id: uid(),
  name,
  collapsed: false,
  takes: [],
});

const img = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200`;

export const blankProject = (): Project => ({
  name: "",
  director: "",
  date: today(),
  client: "",
  videoType: "",
  videoTypeCustom: "",
  logoBrand: "",
  logoClient: "",
  sets: [],
  settings: {
    columns: 3,
    orientation: "landscape",
    printTheme: "light",
    breakPerSet: false,
    accent: DEFAULT_PALETTE.accent,
    secondary: DEFAULT_PALETTE.secondary,
    logoPlate: false,
  },
});

export const sampleProject = (): Project => ({
  ...blankProject(),
  name: "Neon Rain — Comercial 60”",
  director: "Alex Moreira",
  client: "Lumen Motors / Agência Atlas",
  videoType: "comercial",
  sets: [
    {
      id: uid(),
      name: "Exterior — Avenida Noturna",
      collapsed: false,
      takes: [
        {
          id: uid(),
          number: "01",
          title: "A Chegada",
          framing: "Plano Geral (PG)",
          action:
            "Chuva fina. A avenida deserta reflete os neons. Ao fundo, faróis surgem lentamente na neblina.",
          dialogue: "",
          sound: "Chuva constante, sub-grave crescente. Trilha: pad ambiente.",
          image: img("16158304"),
        },
        {
          id: uid(),
          number: "02",
          title: "O Encontro",
          framing: "Contra-Plongée",
          action:
            "A câmera sobe do asfalto molhado até a silhueta da protagonista parada sob o letreiro vermelho.",
          dialogue: "MARA (V.O.)\nTodo caminho começa em silêncio.",
          sound: "Lens flare anamórfico (VFX). Hit de trilha no corte.",
          image: img("36806859"),
        },
        {
          id: uid(),
          number: "03",
          title: "Travelling Urbano",
          framing: "Drone — Travelling lateral",
          action:
            "O carro cruza a cidade; rastros de luz alongam-se pela exposição. Ritmo acelera.",
          dialogue: "",
          sound: "Whoosh de passagem. Light trails em pós (VFX).",
          image: img("32800260"),
        },
      ],
    },
    {
      id: uid(),
      name: "Interior — Estação Central",
      collapsed: false,
      takes: [
        {
          id: uid(),
          number: "04",
          title: "A Espera",
          framing: "Plano Médio (PM)",
          action:
            "Mara aguarda no saguão vazio. Luzes frias e reflexos no piso polido.",
          dialogue: "MARA\nVocê demorou.",
          sound: "Eco de passos, anúncio distante da estação.",
          image: img("35171253"),
        },
        {
          id: uid(),
          number: "05",
          title: "Close da Revelação",
          framing: "Close-up (CU) — Rack focus",
          action:
            "Rack focus do banco vazio para as chaves do carro na mão de Mara.",
          dialogue: "",
          sound: "Silêncio súbito, depois batida de coração.",
          image: "",
        },
      ],
    },
  ],
});

function load(): Project {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Project;
      if (parsed && Array.isArray(parsed.sets)) {
        return {
          ...blankProject(),
          ...parsed,
          settings: { ...blankProject().settings, ...(parsed.settings || {}) },
        };
      }
    }
  } catch {
    /* ignore */
  }
  return sampleProject();
}

export type SaveState = "saved" | "saving" | "error";

export function useProject() {
  const [project, setProject] = useState<Project>(load);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSaveState("saving");
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 350);
    return () => clearTimeout(t);
  }, [project]);

  const patch = useCallback(
    (p: Partial<Omit<Project, "sets" | "settings">>) =>
      setProject((prev) => ({ ...prev, ...p })),
    []
  );

  const setSettings = useCallback(
    (s: Partial<Project["settings"]>) =>
      setProject((prev) => ({ ...prev, settings: { ...prev.settings, ...s } })),
    []
  );

  const updateSet = useCallback(
    (setId: string, p: Partial<StorySet>) =>
      setProject((prev) => ({
        ...prev,
        sets: prev.sets.map((s) => (s.id === setId ? { ...s, ...p } : s)),
      })),
    []
  );

  const addSet = useCallback(() => {
    setProject((prev) => ({ ...prev, sets: [...prev.sets, newSet()] }));
  }, []);

  const removeSet = useCallback(
    (setId: string) =>
      setProject((prev) => ({
        ...prev,
        sets: prev.sets.filter((s) => s.id !== setId),
      })),
    []
  );

  const moveSet = useCallback(
    (setId: string, dir: -1 | 1) =>
      setProject((prev) => {
        const i = prev.sets.findIndex((s) => s.id === setId);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= prev.sets.length) return prev;
        const sets = [...prev.sets];
        [sets[i], sets[j]] = [sets[j], sets[i]];
        return { ...prev, sets };
      }),
    []
  );

  const addTake = useCallback(
    (setId: string) =>
      setProject((prev) => {
        const total = prev.sets.reduce((a, s) => a + s.takes.length, 0);
        return {
          ...prev,
          sets: prev.sets.map((s) =>
            s.id === setId
              ? { ...s, takes: [...s.takes, newTake(pad(total + 1))] }
              : s
          ),
        };
      }),
    []
  );

  const updateTake = useCallback(
    (setId: string, takeId: string, p: Partial<Take>) =>
      setProject((prev) => ({
        ...prev,
        sets: prev.sets.map((s) =>
          s.id === setId
            ? {
                ...s,
                takes: s.takes.map((t) => (t.id === takeId ? { ...t, ...p } : t)),
              }
            : s
        ),
      })),
    []
  );

  const removeTake = useCallback(
    (setId: string, takeId: string) =>
      setProject((prev) => ({
        ...prev,
        sets: prev.sets.map((s) =>
          s.id === setId
            ? { ...s, takes: s.takes.filter((t) => t.id !== takeId) }
            : s
        ),
      })),
    []
  );

  const duplicateTake = useCallback(
    (setId: string, takeId: string) =>
      setProject((prev) => ({
        ...prev,
        sets: prev.sets.map((s) => {
          if (s.id !== setId) return s;
          const i = s.takes.findIndex((t) => t.id === takeId);
          if (i < 0) return s;
          const takes = [...s.takes];
          takes.splice(i + 1, 0, { ...s.takes[i], id: uid() });
          return { ...s, takes };
        }),
      })),
    []
  );

  const moveTake = useCallback(
    (setId: string, takeId: string, dir: -1 | 1) =>
      setProject((prev) => ({
        ...prev,
        sets: prev.sets.map((s) => {
          if (s.id !== setId) return s;
          const i = s.takes.findIndex((t) => t.id === takeId);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= s.takes.length) return s;
          const takes = [...s.takes];
          [takes[i], takes[j]] = [takes[j], takes[i]];
          return { ...s, takes };
        }),
      })),
    []
  );

  const replaceProject = useCallback((p: Project) => {
    setProject({
      ...blankProject(),
      ...p,
      settings: { ...blankProject().settings, ...(p.settings || {}) },
    });
  }, []);

  const clearProject = useCallback(() => {
    setProject((prev) => ({ ...blankProject(), settings: prev.settings }));
  }, []);

  return {
    project,
    saveState,
    patch,
    setSettings,
    addSet,
    updateSet,
    removeSet,
    moveSet,
    addTake,
    updateTake,
    removeTake,
    duplicateTake,
    moveTake,
    replaceProject,
    clearProject,
  };
}

export type Store = ReturnType<typeof useProject>;
