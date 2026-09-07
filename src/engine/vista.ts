import { getVistaReference, VISTA_DILUTIONS } from "../data/vista";
import type { ClinicalRegionId, VistaDoseInput, VistaDoseIssue, VistaDoseResult } from "../types/botox";

export function vistaConcentration(vialUnits: 50 | 100, diluentMl: number | null): number | null {
  if (diluentMl === null || !Number.isFinite(diluentMl) || diluentMl <= 0) return null;
  const concentration = vialUnits / diluentMl;
  return Number.isFinite(concentration) && concentration > 0 ? concentration : null;
}

export function calculateVistaDose(input: VistaDoseInput, region: ClinicalRegionId): VistaDoseResult {
  const { vialUnits, diluentMl, totalUnits, points } = input;
  const errors: string[] = [];
  if (vialUnits !== 50 && vialUnits !== 100) errors.push("規格は50 Uまたは100 Uを選んでください。");
  if (diluentMl === null || !Number.isFinite(diluentMl) || diluentMl <= 0) errors.push("生理食塩液の量を0より大きいmLで入力してください。");
  if (totalUnits === null || !Number.isFinite(totalUnits) || totalUnits < 0) errors.push("この部位の総量を0以上のUで入力してください。");
  if (points === null || !Number.isInteger(points) || points <= 0) errors.push("分割点数を1以上の整数で入力してください。");
  if (errors.length || diluentMl === null || totalUnits === null || points === null) return { calculable: false, errors };
  const concentration = vistaConcentration(vialUnits, diluentMl);
  if (concentration === null) return { calculable: false, errors: ["入力された条件では濃度を計算できません。"] };
  const unitsPerTenthMl = concentration / 10;
  const unitsPerPoint = totalUnits / points;
  const mlPerPoint = unitsPerPoint / concentration;
  const totalMl = totalUnits / concentration;
  if (![concentration, unitsPerTenthMl, unitsPerPoint, mlPerPoint, totalMl].every(Number.isFinite) || concentration <= 0 || unitsPerTenthMl <= 0) {
    return { calculable: false, errors: ["数値が計算範囲を超えています。入力値を確認してください。"] };
  }
  const issues: VistaDoseIssue[] = [];
  const reference = getVistaReference(region);
  if (!reference) issues.push({ id: "off-label", level: "note", message: "この部位は国内適応外です。国内添付文書の用量・液量上限との照合はできません。手入力値の換算のみを表示します。" });
  if (vialUnits === 100 && region !== "masseter") issues.push({ id: "vial-indication", level: "warning", message: "100 U規格の国内適応は咬筋膨隆です。眉間・目尻の承認規格は50 Uです。" });
  if (!VISTA_DILUTIONS.some(ml => ml === diluentMl)) issues.push({ id: "dilution", level: "note", message: "添付文書の溶解表にない条件です。濃度と液量の換算値として表示しています。" });
  if (reference && totalUnits > 0) {
    if (totalUnits < reference.minUnits) issues.push({ id: "dose-low", level: "note", message: `総量が添付文書の通常用量（${reference.minUnits}–${reference.maxUnits} U）より少ない入力です。無効という判定ではありません。` });
    if (totalUnits > reference.maxUnits) issues.push({ id: "dose-high", level: "warning", message: `この部位の1回上限 ${reference.maxUnits} Uを超えています。` });
    if (points !== reference.points) issues.push({ id: "points", level: "warning", message: `添付文書は${reference.points}点への均等分割です。現在は${points}点の計算になっています。` });
    // Compare original values, never rounded display values. Tolerance handles
    // binary floating-point representation at the exact label boundary only.
    if (mlPerPoint - reference.maxMlPerPoint > 1e-12) issues.push({ id: "volume-high", level: "warning", message: `1点の液量が添付文書の上限 ${reference.maxMlPerPoint} mLを超えています。液量が多いと目的筋以外へ拡散するおそれがあります。` });
  }
  if (totalUnits > vialUnits) issues.push({ id: "multiple-vials", level: "note", message: "この総量には同じ濃度で調製した複数バイアルが必要です。1バイアル内にある量を超えています。" });
  return { calculable: true, concentration, unitsPerTenthMl, unitsPerPoint, mlPerPoint, totalMl, issues };
}

/** Formatting only; never feed this rounded value into a dose/volume check. */
export function formatVistaNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value * 10000) / 10000;
  if (value > 0 && rounded === 0) return "0.0001未満";
  return (Math.abs(value - rounded) > 1e-10 ? "約 " : "") + rounded.toLocaleString("ja-JP", { maximumFractionDigits: 4 });
}
