/**
 * シミュレーションエンジンの代表シナリオテスト
 *
 * 眉間（glabella）について、4つの代表的な配置パターンで結果を検証。
 */

import { describe, it, expect } from "vitest";
import { simulate } from "../../src/engine/simulate";
import { GLABELLA_ZONE } from "../../src/data/zones";
import type { InjectionPoint } from "../../src/types/botox";

const allZones = [GLABELLA_ZONE];

function makePoint(
  x: number,
  y: number,
  units: number,
  id = `p-${x}-${y}`,
): InjectionPoint {
  return { id, x, y, units, depth: "intramuscular" };
}

describe("simulate — 眉間の代表シナリオ", () => {
  it("シナリオ1: 推奨配置（5点 × 4U = 20U）→ 高改善・低副作用", () => {
    const points = GLABELLA_ZONE.idealPoints.map((ip, i) =>
      makePoint(ip.x, ip.y, ip.recommendedUnits, `ideal-${i}`),
    );
    const result = simulate(points, GLABELLA_ZONE, allZones);

    expect(result.wrinkleImprovements.glabellar_lines).toBeGreaterThan(0.7);
    expect(result.overallScore).toBeGreaterThan(60);
    // 重大な副作用は無いはず
    const severeSE = result.predictedSideEffects.filter(
      (se) => se.severity === "severe",
    );
    expect(severeSE.length).toBe(0);
  });

  it("シナリオ2: 用量不足（5点 × 1U = 5U）→ 改善低い", () => {
    const points = GLABELLA_ZONE.idealPoints.map((ip, i) =>
      makePoint(ip.x, ip.y, 1, `low-${i}`),
    );
    const result = simulate(points, GLABELLA_ZONE, allZones);

    expect(result.wrinkleImprovements.glabellar_lines).toBeLessThan(0.2);
    expect(result.feedback.summary).toContain("不足");
  });

  it("シナリオ3: 過量（5点 × 10U = 50U）→ 改善頭打ち", () => {
    const points = GLABELLA_ZONE.idealPoints.map((ip, i) =>
      makePoint(ip.x, ip.y, 10, `high-${i}`),
    );
    const result = simulate(points, GLABELLA_ZONE, allZones);

    // 飽和域にあるので >0.95
    expect(result.wrinkleImprovements.glabellar_lines).toBeGreaterThan(0.9);
    expect(result.feedback.summary).toContain("過量");
  });

  it("シナリオ4: 眉毛中央上1cm未満に注入（危険ゾーン）→ 眼瞼下垂高確率", () => {
    // 危険ゾーン (220-280, 245-265) 内に配置
    const points = [
      makePoint(250, 255, 4, "danger-1"),
      makePoint(240, 250, 4, "danger-2"),
    ];
    const result = simulate(points, GLABELLA_ZONE, allZones);

    const eyelidPtosis = result.predictedSideEffects.find(
      (se) => se.id === "eyelid_ptosis",
    );
    expect(eyelidPtosis).toBeDefined();
    expect(eyelidPtosis!.probability).toBeGreaterThan(0.2);
  });

  it("シナリオ5: 中央のみ偏重（procerus に集中）→ Spock brow 検出", () => {
    const points = [
      makePoint(250, 240, 8, "p1"), // procerus 中央
      makePoint(248, 235, 6, "p2"),
      makePoint(252, 245, 6, "p3"),
    ];
    const result = simulate(points, GLABELLA_ZONE, allZones);

    const spockBrow = result.predictedSideEffects.find(
      (se) => se.id === "spock_brow",
    );
    expect(spockBrow).toBeDefined();
    expect(spockBrow!.probability).toBeGreaterThan(0.1);
  });
});
