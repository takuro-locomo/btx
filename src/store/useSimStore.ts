/**
 * useSimStore — Zustand ストア
 *
 * シミュレーターの状態を一元管理する。
 * UI コンポーネントはここから状態を読み、アクションを呼ぶ。
 */

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  InjectionPoint,
  Zone,
  SimulationResult,
  AppMode,
} from "../types/botox";
import { GLABELLA_ZONE, getAllZones, ZONES } from "../data/zones";
import { simulate } from "../engine/simulate";

export type MuscleId =
  | "frontalis"
  | "corrugator"
  | "procerus"
  | "orbicularis_oculi"
  | "nasalis"
  | "llsan"
  | "zygomaticus_major"
  | "zygomaticus_minor"
  | "risorius"
  | "orbicularis_oris"
  | "dao"
  | "dli"
  | "mentalis"
  | "masseter"
  | "temporalis"
  | "platysma";

export type WrinkleToggleId =
  | "glabellar_lines"
  | "horizontal_forehead"
  | "crows_feet"
  | "bunny_lines"
  | "perioral_lines"
  | "marionette_lines"
  | "chin_dimpling"
  | "lower_lid_wrinkles";

interface SimStore {
  // ---- 状態 ----
  activeZone: Zone;
  points: InjectionPoint[];
  result: SimulationResult | null;
  appMode: AppMode;
  showZones: boolean;

  // ---- レイヤー設定 ----
  showMuscles: boolean;
  muscleOpacity: number;           // 0-1
  faceOpacity: number;             // 0-1
  muscleVisibility: Record<MuscleId, boolean>;
  wrinkleVisibility: Record<WrinkleToggleId, boolean>;

  // ---- アクション ----
  setActiveZone: (id: string) => void;
  addPoint: (x: number, y: number) => void;
  removePoint: (id: string) => void;
  updatePointUnits: (id: string, units: number) => void;
  updatePointDepth: (id: string, depth: InjectionPoint["depth"]) => void;
  runSimulation: () => void;
  reset: () => void;
  setAppMode: (mode: AppMode) => void;
  toggleShowZones: () => void;
  setShowMuscles: (v: boolean) => void;
  setMuscleOpacity: (v: number) => void;
  setFaceOpacity: (v: number) => void;
  toggleMuscle: (id: MuscleId) => void;
  toggleWrinkle: (id: WrinkleToggleId) => void;
}

const ALL_MUSCLES: MuscleId[] = [
  "frontalis","corrugator","procerus","orbicularis_oculi","nasalis",
  "llsan","zygomaticus_major","zygomaticus_minor","risorius",
  "orbicularis_oris","dao","dli","mentalis","masseter","temporalis","platysma",
];
const ALL_WRINKLES: WrinkleToggleId[] = [
  "glabellar_lines","horizontal_forehead","crows_feet","bunny_lines",
  "perioral_lines","marionette_lines","chin_dimpling","lower_lid_wrinkles",
];

const defaultMuscleVisibility = Object.fromEntries(
  ALL_MUSCLES.map((id) => [id, true])
) as Record<MuscleId, boolean>;

const defaultWrinkleVisibility = Object.fromEntries(
  ALL_WRINKLES.map((id) => [id, true])
) as Record<WrinkleToggleId, boolean>;

export const useSimStore = create<SimStore>((set, get) => ({
  activeZone: GLABELLA_ZONE,
  points: [],
  result: null,
  appMode: "education",
  showZones: true,
  showMuscles: false,
  muscleOpacity: 0.65,
  faceOpacity: 1.0,
  muscleVisibility: defaultMuscleVisibility,
  wrinkleVisibility: defaultWrinkleVisibility,

  setActiveZone: (id) => {
    const zone = ZONES[id];
    if (zone) set({ activeZone: zone, points: [], result: null });
  },

  addPoint: (x, y) => {
    const newPoint: InjectionPoint = {
      id: uuidv4(),
      x,
      y,
      units: 4,
      depth: "intramuscular",
    };
    set((s) => ({ points: [...s.points, newPoint], result: null }));
  },

  removePoint: (id) => {
    set((s) => ({ points: s.points.filter((p) => p.id !== id), result: null }));
  },

  updatePointUnits: (id, units) => {
    set((s) => ({
      points: s.points.map((p) => (p.id === id ? { ...p, units } : p)),
      result: null,
    }));
  },

  updatePointDepth: (id, depth) => {
    set((s) => ({
      points: s.points.map((p) => (p.id === id ? { ...p, depth } : p)),
      result: null,
    }));
  },

  runSimulation: () => {
    const { points, activeZone } = get();
    if (points.length === 0) return;
    try {
      const result = simulate(points, activeZone, getAllZones());
      set({ result });
    } catch (err) {
      console.error("[SimStore] simulate() threw:", err);
      set({
        result: {
          wrinkleImprovements: {} as never,
          predictedSideEffects: [],
          overallScore: 0,
          feedback: { summary: `エラー: ${String(err)}`, warnings: [], suggestions: [] },
          evidenceCitations: [],
        },
      });
    }
  },

  reset: () => {
    set({ points: [], result: null });
  },

  setAppMode: (mode) => set({ appMode: mode }),
  toggleShowZones: () => set((s) => ({ showZones: !s.showZones })),
  setShowMuscles: (v) => set({ showMuscles: v }),
  setMuscleOpacity: (v) => set({ muscleOpacity: v }),
  setFaceOpacity: (v) => set({ faceOpacity: v }),
  toggleMuscle: (id) =>
    set((s) => ({
      muscleVisibility: { ...s.muscleVisibility, [id]: !s.muscleVisibility[id] },
    })),
  toggleWrinkle: (id) =>
    set((s) => ({
      wrinkleVisibility: { ...s.wrinkleVisibility, [id]: !s.wrinkleVisibility[id] },
    })),
}));
