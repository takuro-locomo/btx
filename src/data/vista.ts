import type { ClinicalRegionId, VistaDoseInput, VistaDoseReference, VistaRegionId } from "../types/botox";

// PMDA Botox Vista, Aug 2026 revision 4, §§4, 6, 7, 14.1.1, 17.
// Evidence is recorded first in docs/BOTOX_KNOWLEDGE.md.
export const VISTA_DILUTIONS = [1.25, 2.5] as const;
export const VISTA_REFERENCES: Record<VistaRegionId, VistaDoseReference> = {
  glabella: {
    id: "glabella", name: "眉間", scope: "眉間全体・鼻根筋を含む", minUnits: 10, maxUnits: 20,
    points: 5, distribution: "左右の皺眉筋各2点＋鼻根筋1点", maxMlPerPoint: .1,
    trial: {
      section: "17.1.2", time: "投与4週後", population: "最大緊張時の眉間の皺が中等度以上の患者",
      endpoint: "最大緊張時の皺が「なし」または「軽度」になった人の割合",
      arms: [{ units: 10, responders: 38, evaluated: 44, rate: 86.4 }, { units: 20, responders: 39, evaluated: 44, rate: 88.6 }],
    },
  },
  eyes: {
    id: "eyes", name: "目尻", scope: "左右の合計", minUnits: 12, maxUnits: 24,
    points: 6, distribution: "左右の眼輪筋外側に各3点", maxMlPerPoint: .1,
    trial: {
      section: "17.1.4", time: "投与30日後", population: "最大緊張時の目尻の皺が中等度以上の日本人患者",
      endpoint: "最大緊張時の皺が「なし」または「軽度」になった人の割合",
      arms: [{ units: 12, responders: 56, evaluated: 99, rate: 56.6 }, { units: 24, responders: 71, evaluated: 104, rate: 68.3 }],
    },
  },
  masseter: {
    id: "masseter", name: "エラ（咬筋膨隆）", scope: "左右の合計", minUnits: 48, maxUnits: 72,
    points: 6, distribution: "左右の咬筋に各3点", maxMlPerPoint: .3,
    trial: {
      section: "17.1.6", time: "投与90日後", population: "咬筋膨隆が marked または very marked の日本人患者",
      endpoint: "5段階の医師評価で2段階以上改善した人の割合",
      arms: [{ units: 48, responders: 43, evaluated: 105, rate: 40.9 }, { units: 72, responders: 41, evaluated: 104, rate: 39.4 }],
    },
  },
};
export function getVistaReference(id: ClinicalRegionId): VistaDoseReference | undefined {
  return id === "glabella" || id === "eyes" || id === "masseter" ? VISTA_REFERENCES[id] : undefined;
}
export function initialVistaDose(id: ClinicalRegionId): VistaDoseInput {
  const reference = getVistaReference(id);
  return { vialUnits: id === "masseter" ? 100 : 50, diluentMl: id === "masseter" ? 2.5 : 1.25, totalUnits: reference?.minUnits ?? null, points: reference?.points ?? 1 };
}
