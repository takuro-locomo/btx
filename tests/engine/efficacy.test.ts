/**
 * 用量反応カーブのテスト
 *
 * `npm run test` で実行。
 */

import { describe, it, expect } from "vitest";
import { efficacyFromDose } from "../../src/engine/efficacy";

describe("efficacyFromDose", () => {
  // 眉間（glabella）の標準パラメータでテスト
  const params = {
    thresholdDose: 8,
    optimalDose: 20,
    saturationDose: 30,
  };

  it("0 用量で改善 0", () => {
    expect(efficacyFromDose(0, params)).toBe(0);
  });

  it("閾値以下では効果薄い（最大 0.15）", () => {
    expect(efficacyFromDose(4, params)).toBeCloseTo(0.075, 2);
    expect(efficacyFromDose(8, params)).toBeCloseTo(0.15, 2);
  });

  it("最適用量で約 0.90", () => {
    expect(efficacyFromDose(20, params)).toBeCloseTo(0.9, 2);
  });

  it("飽和用量で 0.97", () => {
    expect(efficacyFromDose(30, params)).toBeCloseTo(0.97, 2);
  });

  it("飽和以上は頭打ち", () => {
    expect(efficacyFromDose(50, params)).toBe(0.97);
    expect(efficacyFromDose(100, params)).toBe(0.97);
  });

  it("用量増加で単調増加", () => {
    let prev = 0;
    for (let dose = 1; dose <= 30; dose++) {
      const eff = efficacyFromDose(dose, params);
      expect(eff).toBeGreaterThanOrEqual(prev);
      prev = eff;
    }
  });
});
