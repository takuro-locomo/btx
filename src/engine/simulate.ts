/**
 * シミュレーションエンジン
 *
 * pure functions のみ。副作用・DOM操作・乱数禁止（テストで決定論的にするため）
 *
 * 入力: ユーザーが配置した注入点 + 対象 zone
 * 出力: しわ改善度・副作用予測・スコア
 */

import type {
  InjectionPoint,
  Zone,
  SimulationResult,
  PredictedSideEffect,
  WrinkleId,
  EvidenceRefId,
  Severity,
  SideEffectId,
} from "../types/botox";
import { isInsidePolygon, distanceToPolygonCenter } from "./geometry";
import { efficacyFromDose } from "./efficacy";

// =====================================================
// メインエントリポイント
// =====================================================

/**
 * シミュレーションを実行する。
 *
 * @param points ユーザーが配置した注入点
 * @param targetZone ユーザーが治療しようとしている zone
 * @param allZones 全 zone データ（副作用判定で全 dangerZone を見るため）
 */
export function simulate(
  points: InjectionPoint[],
  targetZone: Zone,
  allZones: Zone[],
): SimulationResult {
  // 1. しわ改善計算
  const wrinkleImprovements = calculateWrinkleImprovements(points, targetZone);

  // 2. 副作用予測（全 zone の dangerZone をチェック）
  const predictedSideEffects = predictSideEffects(points, allZones);

  // 3. パターン依存の副作用判定（例: Spock brow）
  const patternSideEffects = detectPatternSideEffects(points, targetZone);
  predictedSideEffects.push(...patternSideEffects);

  // 4. スコア計算
  const overallScore = calculateOverallScore(
    wrinkleImprovements,
    predictedSideEffects,
  );

  // 5. フィードバック生成
  const feedback = generateFeedback(
    points,
    targetZone,
    wrinkleImprovements,
    predictedSideEffects,
  );

  // 6. エビデンス収集
  const evidenceCitations: EvidenceRefId[] = [...targetZone.evidenceRefs];

  return {
    wrinkleImprovements,
    predictedSideEffects,
    overallScore,
    feedback,
    evidenceCitations,
  };
}

// =====================================================
// しわ改善計算
// =====================================================

function calculateWrinkleImprovements(
  points: InjectionPoint[],
  zone: Zone,
): Record<WrinkleId, number> {
  const result: Partial<Record<WrinkleId, number>> = {};

  // この zone の safe zone 内にある点の総用量
  const effectiveDose = points
    .filter((p) => isInsidePolygon({ x: p.x, y: p.y }, zone.safeZone))
    .reduce((sum, p) => sum + p.units, 0);

  // safe zone 外でも近接する点は部分的に寄与（拡散）
  // 簡易：safe zone 中心からの距離に応じて減衰
  const partialDose = points
    .filter((p) => !isInsidePolygon({ x: p.x, y: p.y }, zone.safeZone))
    .reduce((sum, p) => {
      const dist = distanceToPolygonCenter({ x: p.x, y: p.y }, zone.safeZone);
      // 30px 以内は 50%, 60px で 0
      const weight = Math.max(0, 1 - dist / 60) * 0.5;
      return sum + p.units * weight;
    }, 0);

  const totalDose = effectiveDose + partialDose;
  const improvement = efficacyFromDose(totalDose, zone.efficacyCurve);

  for (const wrinkleId of zone.improvedWrinkles) {
    result[wrinkleId] = improvement;
  }

  return result as Record<WrinkleId, number>;
}

// =====================================================
// 副作用予測
// =====================================================

function predictSideEffects(
  points: InjectionPoint[],
  allZones: Zone[],
): PredictedSideEffect[] {
  // 副作用ごとに、寄与する点を集計
  const byEffect = new Map<
    SideEffectId,
    { risks: number[]; pointIds: string[]; cause: string }
  >();

  for (const zone of allZones) {
    for (const dangerZone of zone.dangerZones) {
      // ポリゴンが空ならスキップ（パターン依存の副作用は別途処理）
      if (dangerZone.polygon.length === 0) continue;

      for (const point of points) {
        if (!isInsidePolygon({ x: point.x, y: point.y }, dangerZone.polygon)) {
          continue;
        }

        // 用量による増幅
        const doseFactor = 1 + (point.units - 2) * dangerZone.doseAmplifier;
        // 深部注入は拡散リスク増
        const depthFactor = point.depth === "deep" ? 1.3 : 1.0;
        const risk = Math.min(
          1,
          Math.max(0, dangerZone.baseRisk * doseFactor * depthFactor),
        );

        const existing = byEffect.get(dangerZone.effect);
        if (existing) {
          existing.risks.push(risk);
          existing.pointIds.push(point.id);
        } else {
          byEffect.set(dangerZone.effect, {
            risks: [risk],
            pointIds: [point.id],
            cause: dangerZone.description,
          });
        }
      }
    }
  }

  // 独立事象として確率合算
  const result: PredictedSideEffect[] = [];
  for (const [effect, data] of byEffect.entries()) {
    const probability = combinedProbability(data.risks);
    if (probability < 0.02) continue; // 2% 未満は表示しない

    result.push({
      id: effect,
      probability,
      severity: severityFromProbability(probability),
      cause: data.cause,
      contributingPointIds: data.pointIds,
    });
  }

  return result;
}

/** 複数の独立事象の和 */
function combinedProbability(risks: number[]): number {
  return 1 - risks.reduce((acc, r) => acc * (1 - r), 1);
}

function severityFromProbability(p: number): Severity {
  if (p < 0.1) return "mild";
  if (p < 0.3) return "moderate";
  return "severe";
}

// =====================================================
// パターン依存の副作用検出（位置だけでなく配置パターン）
// =====================================================

function detectPatternSideEffects(
  points: InjectionPoint[],
  zone: Zone,
): PredictedSideEffect[] {
  const result: PredictedSideEffect[] = [];

  // 例: 眉間で procerus（中央）と corrugator（外側）の配分が偏っている → Spock brow
  if (zone.id === "glabella") {
    const spockRisk = detectSpockBrowRisk(points);
    if (spockRisk > 0.05) {
      result.push({
        id: "spock_brow",
        probability: spockRisk,
        severity: severityFromProbability(spockRisk),
        cause:
          "中央 procerus に偏った注入で、外側 frontalis が拮抗を失い眉外側のみ挙上（Spock brow）",
        contributingPointIds: points.map((p) => p.id),
      });
    }
  }

  // 例: forehead に注入したが glabella にゼロ → 重度 brow ptosis
  // （Phase 2 で実装）

  return result;
}

function detectSpockBrowRisk(points: InjectionPoint[]): number {
  if (points.length === 0) return 0;
  // 中央付近 (x: 240..260) と 外側 (x<220, x>280) の用量比
  let central = 0;
  let lateral = 0;
  for (const p of points) {
    if (p.x >= 240 && p.x <= 260) central += p.units;
    else if (p.x < 220 || p.x > 280) lateral += p.units;
  }
  if (central + lateral < 8) return 0;
  // 外側がほぼゼロなら高リスク
  const lateralRatio = lateral / (central + lateral);
  if (lateralRatio < 0.2) return 0.4;
  if (lateralRatio < 0.4) return 0.2;
  return 0;
}

// =====================================================
// 総合スコア
// =====================================================

function calculateOverallScore(
  improvements: Record<WrinkleId, number>,
  sideEffects: PredictedSideEffect[],
): number {
  const improvementScore = Object.values(improvements).reduce(
    (sum, v) => sum + v,
    0,
  );
  const wrinkleCount = Object.keys(improvements).length || 1;
  const avgImprovement = improvementScore / wrinkleCount; // 0..1

  // 副作用ペナルティ
  const sideEffectPenalty = sideEffects.reduce((sum, se) => {
    const severityFactor =
      se.severity === "severe" ? 50 : se.severity === "moderate" ? 25 : 10;
    return sum + se.probability * severityFactor;
  }, 0);

  return Math.max(0, Math.min(100, avgImprovement * 100 - sideEffectPenalty));
}

// =====================================================
// フィードバック生成
// =====================================================

function generateFeedback(
  points: InjectionPoint[],
  zone: Zone,
  improvements: Record<WrinkleId, number>,
  sideEffects: PredictedSideEffect[],
): SimulationResult["feedback"] {
  const totalUnits = points.reduce((sum, p) => sum + p.units, 0);
  const warnings: string[] = [];
  const suggestions: string[] = [];

  let summary = "";

  if (totalUnits < zone.idealDose.min) {
    summary = "用量不足の可能性";
    suggestions.push(
      `推奨総量は ${zone.idealDose.min}–${zone.idealDose.max}U（最適 ${zone.idealDose.optimal}U）です。`,
    );
  } else if (totalUnits > zone.idealDose.max) {
    summary = "過量投与の可能性";
    warnings.push(
      `総量 ${totalUnits}U は推奨上限 ${zone.idealDose.max}U を超えています。副作用リスク増加。`,
    );
  } else {
    const avgImprovement =
      Object.values(improvements).reduce((s, v) => s + v, 0) /
      (Object.keys(improvements).length || 1);
    if (avgImprovement > 0.7 && sideEffects.length === 0) {
      summary = "適切な投与";
    } else {
      summary = "投与位置の見直しを推奨";
    }
  }

  for (const se of sideEffects) {
    if (se.probability > 0.2) {
      warnings.push(
        `${se.id}: ${(se.probability * 100).toFixed(0)}% — ${se.cause}`,
      );
    }
  }

  if (points.length < zone.idealPoints.length - 1) {
    suggestions.push(
      `推奨は ${zone.idealPoints.length} ポイントです。現在 ${points.length} ポイント。`,
    );
  }

  return { summary, warnings, suggestions };
}
