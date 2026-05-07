/**
 * 部位（Zone）データ
 *
 * 全数値・座標は docs/BOTOX_KNOWLEDGE.md のエビデンスに基づく。
 * 数値変更時は必ず evidenceRefs と整合させ、ナレッジ集も更新すること。
 *
 * SVG 座標系: 500x600 想定（face-base.svg と一致させる）
 *   - 顔は中央 (250, 300) 付近
 *   - 鼻先 (250, 350) 付近
 *   - 眉毛中央 (200, 200) / (300, 200) 付近
 *   - 外眼角 (175, 220) / (325, 220) 付近
 *
 * 座標は最終的な face-base.svg を作成後に微調整必須。
 * 現状は「設計上の仮座標」。
 */

import type { Zone, EvidenceRef, Wrinkle } from "../types/botox";

// =====================================================
// エビデンス出典マスタ
// =====================================================
export const EVIDENCE_REFS: Record<string, EvidenceRef> = {
  "FDA-PI": {
    id: "FDA-PI",
    shortName: "FDA Prescribing Information",
    fullCitation: "BOTOX Cosmetic Prescribing Information. Allergan/AbbVie.",
    url: "https://www.rxabbvie.com/pdf/botox-cosmetic_pi.pdf",
    type: "fda",
  },
  "CARR2004": {
    id: "CARR2004",
    shortName: "Carruthers Consensus 2004",
    fullCitation:
      "Carruthers JA, Carruthers JD et al. Consensus recommendations on the use of botulinum toxin type A in facial aesthetics. Plast Reconstr Surg. 2004;114(6 Suppl):1S-22S.",
    url: "https://pubmed.ncbi.nlm.nih.gov/15507786/",
    type: "consensus",
  },
  "NEWLUX2024": {
    id: "NEWLUX2024",
    shortName: "Korean Consensus 2024",
    fullCitation:
      "Korean Expert Consensus on the Cosmetic Use of BoNT-A (NEWLUX). 2024.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11861028/",
    type: "consensus",
  },
  "ALLU2024": {
    id: "ALLU2024",
    shortName: "International Alluzience Consensus 2024",
    fullCitation:
      "International Consensus Recommendations on Aesthetic Usage of Alluzience. Aesthet Surg J. 2024;44(2):192.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10790960/",
    type: "consensus",
  },
  "PTOSIS-REV": {
    id: "PTOSIS-REV",
    shortName: "Botulinum-induced Blepharoptosis Review",
    fullCitation:
      "Botulinum toxin–induced blepharoptosis: Anatomy, etiology, prevention, and therapeutic options.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9290925/",
    type: "review",
  },
  "MGT-PTOSIS": {
    id: "MGT-PTOSIS",
    shortName: "Management of Ptosis",
    fullCitation: "Management of Ptosis. JCAD.",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5300727/",
    type: "review",
  },
};

// =====================================================
// しわ（Wrinkle）マスタ
// =====================================================
export const WRINKLES: Wrinkle[] = [
  {
    id: "glabellar_lines",
    nameJa: "眉間の縦じわ",
    nameEn: "Glabellar Lines",
    paths: [
      // 左の縦じわ "1"
      "M 235 195 Q 232 215 230 235",
      // 右の縦じわ "1"
      "M 265 195 Q 268 215 270 235",
    ],
    treatedByZones: ["glabella"],
  },
  {
    id: "horizontal_forehead",
    nameJa: "額の横じわ",
    nameEn: "Horizontal Forehead Lines",
    paths: [
      "M 160 130 Q 250 122 340 130",
      "M 165 150 Q 250 142 335 150",
      "M 170 170 Q 250 162 330 170",
    ],
    treatedByZones: ["forehead"],
  },
  {
    id: "crows_feet",
    nameJa: "目尻のしわ",
    nameEn: "Crow's Feet",
    paths: [
      // 左
      "M 165 215 L 145 200",
      "M 165 225 L 142 222",
      "M 167 235 L 145 240",
      // 右
      "M 335 215 L 355 200",
      "M 335 225 L 358 222",
      "M 333 235 L 355 240",
    ],
    treatedByZones: ["crows_feet_left", "crows_feet_right"],
  },
  // 他のしわも同様に追加（Phase 2 以降）
];

// =====================================================
// Zone: 眉間（Glabella）— リファレンス実装
// =====================================================

export const GLABELLA_ZONE: Zone = {
  id: "glabella",
  nameJa: "眉間",
  nameEn: "Glabella",
  targetMuscle: "皺眉筋（corrugator supercilii）+ 鼻根筋（procerus）",
  description:
    "眉間の縦じわ（しかめっ面じわ、'11' サイン）の標準治療部位。FDA 適応。5点注入が標準。",

  // FDA-PI: 合計 20 U（5 ポイント × 4 U）
  // CARR2004: 軽症 15U〜男性 40U
  idealDose: { min: 15, optimal: 20, max: 30 },

  // FDA-PI 5-point injection 推奨
  // 座標は仮値、SVG 完成後に微調整
  idealPoints: [
    {
      x: 230,
      y: 220,
      recommendedUnits: 4,
      depth: "intramuscular",
      description: "左 corrugator 内側",
    },
    {
      x: 215,
      y: 215,
      recommendedUnits: 4,
      depth: "intramuscular",
      description: "左 corrugator 外側（眼窩上縁から1cm以上上）",
    },
    {
      x: 250,
      y: 240,
      recommendedUnits: 4,
      depth: "intramuscular",
      description: "鼻根筋（procerus）中央",
    },
    {
      x: 270,
      y: 220,
      recommendedUnits: 4,
      depth: "intramuscular",
      description: "右 corrugator 内側",
    },
    {
      x: 285,
      y: 215,
      recommendedUnits: 4,
      depth: "intramuscular",
      description: "右 corrugator 外側（眼窩上縁から1cm以上上）",
    },
  ],

  // 推奨注入範囲：眉間〜眉中央上 1.5cm
  // SVG 1cm ≒ 約 18px（顔幅 200px ≒ 11cm の想定）
  safeZone: [
    { x: 200, y: 200 },
    { x: 300, y: 200 },
    { x: 300, y: 245 },
    { x: 250, y: 255 },
    { x: 200, y: 245 },
  ],

  dangerZones: [
    {
      // 危険ゾーン1: 眉毛中央直上 1cm 以内 → 眼瞼下垂（LPS拡散）
      // FDA-PI: "Do not inject toxin closer than 1 cm above the central eyebrow"
      polygon: [
        { x: 220, y: 245 },
        { x: 280, y: 245 },
        { x: 280, y: 265 },
        { x: 220, y: 265 },
      ],
      effect: "eyelid_ptosis",
      baseRisk: 0.25, // 25% — 文献上 1-5%（経験豊富）、5.4%（未熟）だが「ここに打つ」前提なので高め
      doseAmplifier: 0.05, // 1U 増えるごとにリスク 5% 増
      description:
        "眉毛中央上1cm以内への注入は上眼瞼挙筋への拡散リスク。FDA-PI 警告ゾーン。",
    },
    {
      // 危険ゾーン2: 外側 corrugator の眼窩上縁付近 → 眼瞼下垂
      // FDA-PI: "Place lateral corrugator injections at least 1 cm above the bony supraorbital ridge"
      polygon: [
        { x: 195, y: 240 },
        { x: 220, y: 240 },
        { x: 220, y: 265 },
        { x: 175, y: 265 },
      ],
      effect: "eyelid_ptosis",
      baseRisk: 0.18,
      doseAmplifier: 0.05,
      description:
        "外側 corrugator を眼窩上縁から1cm未満で打つと LPS への拡散リスク。",
    },
    {
      polygon: [
        { x: 280, y: 240 },
        { x: 305, y: 240 },
        { x: 325, y: 265 },
        { x: 280, y: 265 },
      ],
      effect: "eyelid_ptosis",
      baseRisk: 0.18,
      doseAmplifier: 0.05,
      description:
        "外側 corrugator を眼窩上縁から1cm未満で打つと LPS への拡散リスク。",
    },
    {
      // 危険ゾーン3: 中央のみ偏った注入 → Spock brow（外側挙筋優位）
      // これは「位置」ではなく「パターン」依存なので、別ロジック必要
      // ここでは省略、engine 側で点配置パターンから推定
      polygon: [],
      effect: "spock_brow",
      baseRisk: 0,
      doseAmplifier: 0,
      description: "中央のみ偏った注入で外側挙筋優位 → Spock brow。",
    },
  ],

  improvedWrinkles: ["glabellar_lines"],

  efficacyCurve: {
    thresholdDose: 8, // これ以下では効果薄い
    optimalDose: 20, // 90% 効果
    saturationDose: 30, // 飽和
  },

  evidenceRefs: ["FDA-PI", "CARR2004", "NEWLUX2024", "PTOSIS-REV"],

  difficulty: "beginner",

  companionZones: ["forehead"], // 額と一緒に治療されることが多い
};

// =====================================================
// 全 Zone のレジストリ（Phase 2 以降で他部位を追加）
// =====================================================

export const ZONES: Record<string, Zone> = {
  glabella: GLABELLA_ZONE,
  // forehead: FOREHEAD_ZONE,         // TODO Phase 2
  // crows_feet_left: ...,           // TODO Phase 2
  // crows_feet_right: ...,          // TODO Phase 2
  // bunny_lines: ...,               // TODO Phase 2
  // gummy_smile: ...,               // TODO Phase 3
  // lip_flip: ...,                  // TODO Phase 3
  // mentalis: ...,                  // TODO Phase 3
  // dao_left / dao_right: ...,      // TODO Phase 3
  // masseter_left / masseter_right: ..., // TODO Phase 3（横顔ビュー必要）
  // platysma: ...,                  // TODO Phase 4（医師モード）
};

export function getZone(id: string): Zone | undefined {
  return ZONES[id];
}

export function getAllZones(): Zone[] {
  return Object.values(ZONES);
}
