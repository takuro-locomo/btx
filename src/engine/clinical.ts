import { CLINICAL_REGIONS } from "../data/clinical";
import type { ClinicalAdverse, ClinicalModelResult, ClinicalRegionId, ClinicalSettings, ClinicalTime } from "../types/botox";

// All coefficients are illustration keyframes, not fitted PK/PD or clinical thresholds.
// Specification and evidence: docs/BOTOX_KNOWLEDGE.md, 2026-09-07 addition.
const ILLUSTRATION_PHASE: Record<ClinicalTime, number> = { 0: 0, 3: .25, 14: 1, 90: .55, 120: .12 };
const clamp = (v: number, max = 1) => Math.max(0, Math.min(max, Number.isFinite(v) ? v : 0));
const ADVERSE: Record<ClinicalRegionId, ClinicalAdverse> = {
  forehead: "brow", glabella: "eyelid", eyes: "closure", bunny: "smile", gummy: "smile",
  lips: "lip", dao: "lowerLip", chin: "lowerLip", masseter: "bulge", neck: "neck",
};
const OBSERVATION: Record<ClinicalAdverse, string> = {
  none: "表情を動かして、作用前としわ・筋肉の動きを比べてください。",
  brow: "眉が下がる例：前頭筋の支える力が弱まった状態。まぶたの下垂とは別です。",
  eyelid: "まぶたが下がる例：上眼瞼挙筋へ波及した場合を、片側で強調しています。",
  closure: "閉じにくい目の例：閉瞼に関わる眼輪筋の機能が弱まった状態を強調しています。",
  smile: "上唇が上がりにくい例：笑顔での上唇の動きに、左右差を付けて示しています。",
  lip: "唇を閉じにくい例：口輪筋の働きが弱まり、隙間が残る状態。",
  lowerLip: "下唇の左右差の例：周囲の下唇を動かす筋への波及を示しています。",
  bulge: "一部だけ膨らむ例：筋内での作用が偏り、動く筋腹が残った状態。",
  neck: "動きが弱まりすぎる例：深部の機能への影響や嚥下障害は、この絵から評価できません。",
};
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
      : "図では目的筋の層に針先があります。層の一致だけで安全性・効果は判定できません。"
    : "図では目的筋と針先の層がずれています。目的筋への作用が乏しい例と、周辺への波及の例を表示します。";
  const amount = clamp(settings.amount, 200) / 100;
  const phase = settings.exposure ? ILLUSTRATION_PHASE[settings.time] : 0;
  const layerKeyframe = layerMatch ? 1 : settings.layer === "dermis" ? 0 : settings.layer === "subcutaneous" ? .12 : .2;
  const visualRelaxation = clamp(amount * .75 * phase * layerKeyframe, .96);
  const differentMusclePlane = !layerMatch && (settings.layer === "deep" || settings.layer === "superficial");
  const overKeyframe = clamp((amount - 1.25) / .65);
  const visualAdverse = clamp(Math.max(layerMatch ? overKeyframe : 0, differentMusclePlane ? amount * .6 : 0) * phase);
  const adverse: ClinicalAdverse = visualAdverse === 0 ? "none"
    : settings.region === "glabella" && settings.layer === "superficial" ? "brow" : ADVERSE[settings.region];
  const state = !settings.exposure || amount === 0 ? "off"
    : settings.time === 0 ? "immediate"
    : visualAdverse > .15 ? layerMatch ? "excess" : "spread"
    : visualRelaxation < .35 ? "under" : "relaxed";
  const title = {
    off: "まだ作用を表示していません", immediate: "直後：筋肉の動きは変わらない",
    under: "効きにくい例：動きが残る", relaxed: "作用の例：動きが弱まる",
    excess: "効きすぎ・波及が起きた例", spread: "目的筋には乏しく、周辺に波及した例",
  }[state];
  const detail = state === "off" ? amount === 0 ? "作用前と同じ顔を表示しています。" : "効き方の例と深度を選び、下のボタンで変化を表示します。"
    : state === "immediate" ? "針先の周囲に色があっても、薬理作用による筋弛緩はまだ示しません。"
    : !layerMatch ? settings.layer === "dermis"
      ? "この教材では皮内からの筋弛緩を描画しません。臨床的に無効という判定ではありません。"
      : "しわ・目的筋の動きが残るシナリオ。層外からの作用や波及の程度は実際には予測できません。"
    : state === "excess" ? "しわの減少に加え、目的筋の過度な弱まりや周囲の機能への影響を強調しています。"
    : state === "under" ? "この例では、作用前に近い動きが残ります。"
    : "表情をつくる力が弱まり、動いたときのしわや形の変化が小さくなる例です。";
  return { targetLayer, layerMatch, message, visualRelaxation, visualAdverse, adverse, state, title, detail, observation: OBSERVATION[adverse] };
}

export function getLayerMessage(settings: ClinicalSettings): string {
  const region = CLINICAL_REGIONS.find(r => r.id === settings.region);
  if (!region) throw new Error("Unknown clinical region");
  if (settings.layer === "dermis") return "針先は皮膚の中。筋内への投与とは区別します。皮内投与の皮膚効果を、このモデルは算出しません。";
  if (settings.layer === "subcutaneous") return "針先は皮下組織。筋内の分布や周辺筋への波及を、皮下という指定だけでは予測できません。";
  return settings.layer === "superficial" ? region.superficialNote : region.deepNote;
}
