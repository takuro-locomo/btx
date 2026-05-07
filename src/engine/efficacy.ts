/**
 * 用量反応曲線（Dose-Response Curve）
 *
 * ボトックスの効果は対数的飽和。閾値以下では効果薄、最適用量で 90%、飽和以降は頭打ち。
 * 簡易的な区分線形＋飽和モデルを採用（複雑なシグモイドは over-engineering）。
 */

import type { EfficacyCurveParams } from "../types/botox";

/**
 * 総用量から改善度（0..1）を計算
 *
 * 0..threshold:        効果ほぼなし（0..0.15）
 * threshold..optimal:  ほぼ線形に上昇（0.15..0.90）
 * optimal..saturation: 緩やかに上昇（0.90..0.97）
 * saturation 以降:     0.97 で頭打ち
 */
export function efficacyFromDose(
  totalDose: number,
  params: EfficacyCurveParams,
): number {
  const { thresholdDose, optimalDose, saturationDose } = params;

  if (totalDose <= 0) return 0;
  if (totalDose < thresholdDose) {
    // 線形に 0..0.15
    return (totalDose / thresholdDose) * 0.15;
  }
  if (totalDose < optimalDose) {
    // 線形に 0.15..0.90
    const ratio = (totalDose - thresholdDose) / (optimalDose - thresholdDose);
    return 0.15 + ratio * 0.75;
  }
  if (totalDose < saturationDose) {
    // 緩やかに 0.90..0.97
    const ratio = (totalDose - optimalDose) / (saturationDose - optimalDose);
    return 0.9 + ratio * 0.07;
  }
  return 0.97;
}
