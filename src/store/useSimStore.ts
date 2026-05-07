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
import { GLABELLA_ZONE, getAllZones } from "../data/zones";
import { simulate } from "../engine/simulate";

interface SimStore {
  // ---- 状態 ----
  activeZone: Zone;
  points: InjectionPoint[];
  result: SimulationResult | null;
  appMode: AppMode;
  showZones: boolean;

  // ---- アクション ----
  addPoint: (x: number, y: number) => void;
  removePoint: (id: string) => void;
  updatePointUnits: (id: string, units: number) => void;
  updatePointDepth: (id: string, depth: InjectionPoint["depth"]) => void;
  runSimulation: () => void;
  reset: () => void;
  setAppMode: (mode: AppMode) => void;
  toggleShowZones: () => void;
}

export const useSimStore = create<SimStore>((set, get) => ({
  activeZone: GLABELLA_ZONE,
  points: [],
  result: null,
  appMode: "education",
  showZones: true,

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
    const result = simulate(points, activeZone, getAllZones());
    set({ result });
  },

  reset: () => {
    set({ points: [], result: null });
  },

  setAppMode: (mode) => set({ appMode: mode }),

  toggleShowZones: () => set((s) => ({ showZones: !s.showZones })),
}));
