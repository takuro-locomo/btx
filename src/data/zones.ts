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
// Zone: 額（Forehead）
// =====================================================

export const FOREHEAD_ZONE: Zone = {
  id: "forehead",
  nameJa: "額（横じわ）",
  nameEn: "Forehead",
  targetMuscle: "前頭筋（frontalis）",
  description:
    "額の横じわの標準治療部位。前頭筋は眉毛挙上の唯一の筋であり、必ず眉間（glabella）とセットで治療すること。単独治療は眉毛下垂リスク大。",

  // ALLU2024: 10–20U / 4–8ポイント。軽症女性8–12U。
  idealDose: { min: 10, optimal: 16, max: 22 },

  // 6点M字パターン: 眉毛から2.5–3cm上（SVG上は眉線y≈205から45–54px上）
  idealPoints: [
    { x: 185, y: 160, recommendedUnits: 3, depth: "intramuscular", description: "左外側前頭筋（眉上約3cm）" },
    { x: 218, y: 148, recommendedUnits: 3, depth: "intramuscular", description: "左中外側前頭筋" },
    { x: 248, y: 154, recommendedUnits: 2, depth: "intramuscular", description: "正中左寄り（中央は控えめに）" },
    { x: 252, y: 154, recommendedUnits: 2, depth: "intramuscular", description: "正中右寄り（中央は控えめに）" },
    { x: 282, y: 148, recommendedUnits: 3, depth: "intramuscular", description: "右中外側前頭筋" },
    { x: 315, y: 160, recommendedUnits: 3, depth: "intramuscular", description: "右外側前頭筋（眉上約3cm）" },
  ],

  // 推奨範囲: 眉毛2.5cm以上上、生え際より下
  safeZone: [
    { x: 162, y: 108 },
    { x: 338, y: 108 },
    { x: 338, y: 175 },
    { x: 162, y: 175 },
  ],

  dangerZones: [
    {
      // 眉毛から1.5cm以内 → 眉毛下垂（前頭筋下部の過抑制）
      // CARR2004: 眉間と必ずセット治療。ALLU2024: 低位置注入で brow ptosis
      polygon: [
        { x: 155, y: 175 },
        { x: 345, y: 175 },
        { x: 345, y: 210 },
        { x: 155, y: 210 },
      ],
      effect: "brow_ptosis",
      baseRisk: 0.22,
      doseAmplifier: 0.03,
      description: "眉毛から1.5cm未満への注入。前頭筋下部の過抑制による眉毛下垂リスク。",
    },
  ],

  improvedWrinkles: ["horizontal_forehead"],

  efficacyCurve: {
    thresholdDose: 6,
    optimalDose: 16,
    saturationDose: 22,
  },

  evidenceRefs: ["FDA-PI", "CARR2004", "ALLU2024"],

  difficulty: "intermediate",

  companionZones: ["glabella"],
};

// =====================================================
// Zone: 目尻・左（Crow's Feet Left）
// =====================================================

export const CROWS_FEET_LEFT_ZONE: Zone = {
  id: "crows_feet_left",
  nameJa: "目尻（左）",
  nameEn: "Crow's Feet Left",
  targetMuscle: "眼輪筋外側部（orbicularis oculi, lateral portion）",
  description:
    "左目尻のカラスの足跡じわ。外眼角から1–1.5cm外側にC字状に3点注入が標準。眼窩骨縁の外側に厳守。",

  // NEWLUX2024: 片側7.5–15U / 2–3ポイント
  idealDose: { min: 7, optimal: 12, max: 15 },

  // C字状3点パターン: 外眼角(x≈172, y≈226)から1–1.5cm(≈18–27px)外側
  idealPoints: [
    { x: 148, y: 210, recommendedUnits: 4, depth: "superficial", description: "左上方点（外眼角上1cm外側）" },
    { x: 140, y: 226, recommendedUnits: 5, depth: "superficial", description: "左中央点（外眼角と同高さ、最外側）" },
    { x: 148, y: 243, recommendedUnits: 3, depth: "superficial", description: "左下方点（外眼角下1cm外側）" },
  ],

  // 推奨範囲: 眼窩骨縁の外側
  safeZone: [
    { x: 112, y: 193 },
    { x: 163, y: 193 },
    { x: 163, y: 260 },
    { x: 112, y: 260 },
  ],

  dangerZones: [
    {
      // 眼窩骨縁の内側 → 眼内・眼瞼部位へのリスク
      // NEWLUX2024: 外眼角 1cm 以内は lower lid ptosis リスク
      polygon: [
        { x: 163, y: 193 },
        { x: 200, y: 193 },
        { x: 200, y: 260 },
        { x: 163, y: 260 },
      ],
      effect: "lower_lid_drop",
      baseRisk: 0.20,
      doseAmplifier: 0.04,
      description: "眼窩骨縁より内側への注入。下眼瞼下垂リスク（眼輪筋眼瞼部への拡散）。",
    },
    {
      // 外眼角下1cm以内（頬骨付近）→ 頬部下垂・笑顔非対称
      polygon: [
        { x: 130, y: 245 },
        { x: 175, y: 245 },
        { x: 175, y: 278 },
        { x: 130, y: 278 },
      ],
      effect: "cheek_droop",
      baseRisk: 0.18,
      doseAmplifier: 0.04,
      description: "外眼角下1cm以内（大頬骨筋に近すぎる）。頬部下垂・笑顔の非対称リスク。",
    },
  ],

  improvedWrinkles: ["crows_feet"],

  efficacyCurve: {
    thresholdDose: 4,
    optimalDose: 12,
    saturationDose: 16,
  },

  evidenceRefs: ["NEWLUX2024", "ALLU2024"],

  difficulty: "intermediate",
};

// =====================================================
// Zone: 目尻・右（Crow's Feet Right）
// =====================================================

export const CROWS_FEET_RIGHT_ZONE: Zone = {
  id: "crows_feet_right",
  nameJa: "目尻（右）",
  nameEn: "Crow's Feet Right",
  targetMuscle: "眼輪筋外側部（orbicularis oculi, lateral portion）",
  description:
    "右目尻のカラスの足跡じわ。外眼角から1–1.5cm外側にC字状に3点注入が標準。眼窩骨縁の外側に厳守。",

  idealDose: { min: 7, optimal: 12, max: 15 },

  // 右側: 外眼角(x≈328, y≈226)から1–1.5cm外側 (x+18〜27)
  idealPoints: [
    { x: 352, y: 210, recommendedUnits: 4, depth: "superficial", description: "右上方点（外眼角上1cm外側）" },
    { x: 360, y: 226, recommendedUnits: 5, depth: "superficial", description: "右中央点（外眼角と同高さ、最外側）" },
    { x: 352, y: 243, recommendedUnits: 3, depth: "superficial", description: "右下方点（外眼角下1cm外側）" },
  ],

  safeZone: [
    { x: 337, y: 193 },
    { x: 388, y: 193 },
    { x: 388, y: 260 },
    { x: 337, y: 260 },
  ],

  dangerZones: [
    {
      polygon: [
        { x: 300, y: 193 },
        { x: 337, y: 193 },
        { x: 337, y: 260 },
        { x: 300, y: 260 },
      ],
      effect: "lower_lid_drop",
      baseRisk: 0.20,
      doseAmplifier: 0.04,
      description: "眼窩骨縁より内側への注入。下眼瞼下垂リスク。",
    },
    {
      polygon: [
        { x: 325, y: 245 },
        { x: 370, y: 245 },
        { x: 370, y: 278 },
        { x: 325, y: 278 },
      ],
      effect: "cheek_droop",
      baseRisk: 0.18,
      doseAmplifier: 0.04,
      description: "外眼角下1cm以内（大頬骨筋に近すぎる）。頬部下垂・笑顔の非対称リスク。",
    },
  ],

  improvedWrinkles: ["crows_feet"],

  efficacyCurve: {
    thresholdDose: 4,
    optimalDose: 12,
    saturationDose: 16,
  },

  evidenceRefs: ["NEWLUX2024", "ALLU2024"],

  difficulty: "intermediate",
};

// =====================================================
// Zone: バニーライン（Bunny Lines）
// =====================================================

export const BUNNY_LINES_ZONE: Zone = {
  id: "bunny_lines",
  nameJa: "バニーライン",
  nameEn: "Bunny Lines",
  targetMuscle: "鼻筋横部（nasalis, transverse part）",
  description:
    "笑ったときに鼻根側方に現れる斜めじわ。左右各1点、鼻骨側方上2/3に注入。LLSANへの拡散に注意（Joker smile）。",

  // ALLU2024: 左右各2–4U（合計4–8U）/ 1点/側
  idealDose: { min: 4, optimal: 6, max: 8 },

  idealPoints: [
    { x: 222, y: 260, recommendedUnits: 3, depth: "superficial", description: "左鼻骨側方（nasalis横部）" },
    { x: 278, y: 260, recommendedUnits: 3, depth: "superficial", description: "右鼻骨側方（nasalis横部）" },
  ],

  // 推奨範囲: 鼻骨側方の上2/3
  safeZone: [
    { x: 212, y: 243 },
    { x: 288, y: 243 },
    { x: 288, y: 283 },
    { x: 212, y: 283 },
  ],

  dangerZones: [
    {
      // 鼻翼基部より下 → LLSAN（上唇鼻翼挙筋）への拡散 → Joker smile
      // ALLU2024: 鼻翼基部下への拡散警告
      polygon: [
        { x: 208, y: 283 },
        { x: 292, y: 283 },
        { x: 292, y: 312 },
        { x: 208, y: 312 },
      ],
      effect: "joker_smile",
      baseRisk: 0.20,
      doseAmplifier: 0.05,
      description: "鼻翼基部より下への注入。LLSAN（上唇鼻翼挙筋）への拡散で上唇下垂・Joker smile リスク。",
    },
  ],

  improvedWrinkles: ["bunny_lines"],

  efficacyCurve: {
    thresholdDose: 2,
    optimalDose: 6,
    saturationDose: 8,
  },

  evidenceRefs: ["ALLU2024", "NEWLUX2024"],

  difficulty: "intermediate",
};

// =====================================================
// 全 Zone のレジストリ（Phase 2 以降で他部位を追加）
// =====================================================

export const ZONES: Record<string, Zone> = {
  glabella: GLABELLA_ZONE,
  forehead: FOREHEAD_ZONE,
  crows_feet_left: CROWS_FEET_LEFT_ZONE,
  crows_feet_right: CROWS_FEET_RIGHT_ZONE,
  bunny_lines: BUNNY_LINES_ZONE,
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
