/**
 * ボトックスシミュレーター 全型定義
 *
 * 医学エビデンスは docs/BOTOX_KNOWLEDGE.md を参照。
 * 単位は onabotulinumtoxinA (BOTOX®) の Unit (U) を基準とする。
 */

// =====================================================
// 基本ジオメトリ
// =====================================================

export interface Point2D {
  x: number;
  y: number;
}

export type Polygon = Point2D[]; // 閉じた多角形（最初の点と最後の点は同じでなくてよい）

// =====================================================
// しわ（Wrinkle）
// =====================================================

export type WrinkleId =
  | "glabellar_lines"        // 眉間の縦じわ "11"
  | "horizontal_forehead"    // 額の横じわ
  | "crows_feet"             // 目尻
  | "bunny_lines"            // 鼻根の斜めじわ
  | "perioral_lines"         // 口周り縦じわ
  | "marionette_lines"       // マリオネットライン
  | "chin_dimpling"          // 顎の梅干しじわ
  | "platysma_bands"         // 首の縦じわ
  | "lower_lid_wrinkles";    // 下眼瞼じわ

export interface Wrinkle {
  id: WrinkleId;
  nameJa: string;
  nameEn: string;
  /** SVG パス（顔キャンバス座標系 500x600）。複数本のしわを1本ずつ。 */
  paths: string[];
  /** どの zone を治療すると改善するか */
  treatedByZones: ZoneId[];
}

// =====================================================
// 解剖学的部位（Zone）
// =====================================================

export type ZoneId =
  | "glabella"
  | "forehead"
  | "crows_feet_left"
  | "crows_feet_right"
  | "bunny_lines"
  | "gummy_smile"
  | "lip_flip"
  | "mentalis"
  | "dao_left"
  | "dao_right"
  | "masseter_left"
  | "masseter_right"
  | "platysma";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface DoseRange {
  min: number;
  optimal: number;
  max: number;
}

export interface RecommendedInjectionPoint {
  /** SVG 座標 */
  x: number;
  y: number;
  /** 推奨単位 */
  recommendedUnits: number;
  /** 推奨深度 */
  depth: InjectionDepth;
  /** 解剖学的説明（教育用） */
  description?: string;
}

export type InjectionDepth = "intradermal" | "superficial" | "intramuscular" | "deep";

export interface Zone {
  id: ZoneId;
  nameJa: string;
  nameEn: string;
  targetMuscle: string;
  description: string;

  /** エビデンスベースの推奨投与量範囲（合計 U） */
  idealDose: DoseRange;

  /** 推奨注入点 */
  idealPoints: RecommendedInjectionPoint[];

  /** 推奨注入範囲（緑ゾーン） */
  safeZone: Polygon;

  /** 危険ゾーン（赤ゾーン）— このゾーンへの注入で副作用 */
  dangerZones: DangerZone[];

  /** この zone を治療すると改善するしわ */
  improvedWrinkles: WrinkleId[];

  /** 用量反応カーブのパラメータ */
  efficacyCurve: EfficacyCurveParams;

  /** エビデンス出典 */
  evidenceRefs: EvidenceRefId[];

  /** 難易度 */
  difficulty: DifficultyLevel;

  /** 一緒に治療すべき zone（例: forehead は glabella と必ずペア） */
  companionZones?: ZoneId[];
}

// =====================================================
// 副作用（Side Effects）
// =====================================================

export type SideEffectId =
  | "eyelid_ptosis"           // 眼瞼下垂（瞼が下がる）
  | "brow_ptosis"             // 眉毛下垂
  | "spock_brow"              // Spock 眉（外側のみ上がる）
  | "asymmetric_smile"        // 笑顔の非対称
  | "frozen_forehead"         // 額が動かない違和感
  | "lower_lid_drop"          // 下眼瞼下垂
  | "cheek_droop"             // 頬部下垂
  | "lip_incompetence"        // 口唇閉鎖不全
  | "speech_difficulty"       // 発音障害
  | "joker_smile"             // Joker smile（上唇歪み）
  | "masseter_hourglass"      // 頬陥没（咬筋ボトックス過量）
  | "paradoxical_bulge"       // 逆説的膨隆
  | "dysphagia"               // 嚥下困難（platysma 重大）
  | "diplopia";               // 複視（極稀）

export type Severity = "mild" | "moderate" | "severe";

export interface SideEffect {
  id: SideEffectId;
  nameJa: string;
  nameEn: string;
  description: string;
  severity: Severity;
  /** 通常回復期間（週） */
  recoveryWeeks: { min: number; max: number };
  /** 視覚化レイヤー名 */
  visualLayer: SideEffectVisualLayerId;
  evidenceRefs: EvidenceRefId[];
}

export interface DangerZone {
  /** ゾーン形状 */
  polygon: Polygon;
  /** ここに打ったら起きる副作用 */
  effect: SideEffectId;
  /** 0..1 — このゾーン内に最小用量で打った場合の基底リスク */
  baseRisk: number;
  /** 用量増加時の倍率（1U あたり） */
  doseAmplifier: number;
  /** 説明（ユーザー向け） */
  description: string;
}

// =====================================================
// 副作用ビジュアル層
// =====================================================

export type SideEffectVisualLayerId =
  | "eyelid_droop_overlay"
  | "brow_drop_overlay"
  | "spock_brow_overlay"
  | "smile_asymmetry_left"
  | "smile_asymmetry_right"
  | "frozen_forehead_label"
  | "lower_lid_drop_overlay"
  | "cheek_droop_overlay"
  | "lip_drop_overlay"
  | "joker_smile_overlay"
  | "hourglass_cheek_overlay"
  | "paradoxical_bulge_overlay";

// =====================================================
// 用量反応カーブ
// =====================================================

export interface EfficacyCurveParams {
  /** 効果が出始める閾値（U） */
  thresholdDose: number;
  /** 最適用量（最大効果の 90%） */
  optimalDose: number;
  /** 飽和用量（これ以上増やしても効果頭打ち） */
  saturationDose: number;
}

// =====================================================
// ユーザー入力（注入点）
// =====================================================

export interface InjectionPoint {
  /** クライアント側ID（UUID等） */
  id: string;
  x: number;
  y: number;
  units: number;
  depth: InjectionDepth;
  /** ユーザーが選択した zone（任意：自動判定可能） */
  intendedZone?: ZoneId;
}

// =====================================================
// シミュレーション結果
// =====================================================

export interface SimulationResult {
  /** 各しわの改善度（0..1, 1=完全消失） */
  wrinkleImprovements: Record<WrinkleId, number>;

  /** 発生する可能性がある副作用 */
  predictedSideEffects: PredictedSideEffect[];

  /** 0..100 総合スコア */
  overallScore: number;

  /** ユーザーへのフィードバック */
  feedback: SimulationFeedback;

  /** 引用すべきエビデンス */
  evidenceCitations: EvidenceRefId[];
}

export interface PredictedSideEffect {
  id: SideEffectId;
  /** 0..1 */
  probability: number;
  severity: Severity;
  cause: string;
  contributingPointIds: string[];
}

export interface SimulationFeedback {
  /** "適切" | "用量不足" | "過量" | "位置不適切" 等 */
  summary: string;
  warnings: string[];
  suggestions: string[];
}

// =====================================================
// エビデンス参照
// =====================================================

export type EvidenceRefId =
  | "FDA-PI"
  | "CARR2004"
  | "NEWLUX2024"
  | "ALLU2024"
  | "PTOSIS-REV"
  | "MGT-PTOSIS"
  | "SOUTH-JERSEY-2024"
  | "IAPAM-2026";

export interface EvidenceRef {
  id: EvidenceRefId;
  shortName: string;
  fullCitation: string;
  url?: string;
  type: "fda" | "consensus" | "review" | "rct" | "case-series" | "expert-opinion";
}

// =====================================================
// プリセット（教育シナリオ）
// =====================================================

export interface Preset {
  id: string;
  nameJa: string;
  nameEn: string;
  description: string;
  category: "good_example" | "bad_example" | "comparison";
  injectionPoints: Omit<InjectionPoint, "id">[];
  /** ナレーション・解説（各ステップで何を学ぶか） */
  narration: string[];
  /** 期待される結果（教育用） */
  expectedOutcome: string;
}

// =====================================================
// アプリ全体のモード
// =====================================================

export type AppMode =
  | "free_play"          // 自由配置
  | "education"          // 推奨/危険ゾーン表示 ON、解説 ON
  | "preset_demo"        // プリセット再生
  | "patient_counseling"; // 患者向け簡易表示

export interface UserProfile {
  /** 専門レベル */
  expertise: "patient" | "staff" | "physician";
  /** 用語表示モード */
  terminologyLevel: "simple" | "medical";
  language: "ja" | "en";
}
