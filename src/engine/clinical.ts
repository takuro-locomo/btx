import { CLINICAL_REGIONS } from "../data/clinical";
import type { ClinicalModelResult, ClinicalSettings, ClinicalTime } from "../types/botox";

// Explicit illustration keyframes, NOT fitted PK/PD data or clinical effect estimates.
const ILLUSTRATION_PHASE: Record<ClinicalTime, number> = { 0: 0, 3: 0.25, 14: 0.72, 90: 0.4, 120: 0.08 };

export function evaluateClinicalModel(settings: ClinicalSettings): ClinicalModelResult {
  const region = CLINICAL_REGIONS.find(r => r.id === settings.region);
  if (!region) throw new Error("Unknown clinical region");
  const targetLayer = settings.region === "glabella"
    ? settings.corrugatorPart === "medial" ? "deep" : "superficial"
    : region.layer;
  const layerMatch = settings.region === "masseter"
    ? settings.layer === "superficial" || settings.layer === "deep"
    : settings.layer === targetLayer;
  const message = layerMatch
    ? settings.region === "masseter"
      ? "図では咬筋の一部の層に針先があります。深浅の筋腹への分布は一様ではありません。"
      : "図では選択した筋の層に針先があります。臨床での安全性・効果を判定する表示ではありません。"
    : "図では目的筋とは異なる層に針先があります。層外でも波及は起こり得るため、効果は予測できません。";
  return {
    targetLayer, layerMatch, message,
    visualRelaxation: settings.exposure && layerMatch ? ILLUSTRATION_PHASE[settings.time] : 0,
  };
}

export function getLayerMessage(settings: ClinicalSettings): string {
  const region = CLINICAL_REGIONS.find(r => r.id === settings.region);
  if (!region) throw new Error("Unknown clinical region");
  if (settings.layer === "dermis") return "針先は皮膚の中。筋内への投与とは区別します。皮内投与の皮膚効果を、このモデルは算出しません。";
  if (settings.layer === "subcutaneous") return "針先は皮下組織。筋内の分布や周辺筋への波及を、皮下という指定だけでは予測できません。";
  return settings.layer === "superficial" ? region.superficialNote : region.deepNote;
}
