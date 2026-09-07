import { describe, it, expect } from "vitest";
import { evaluateClinicalModel, getLayerMessage } from "../../src/engine/clinical";
import { CLINICAL_REGIONS, LAYERS, TIMES } from "../../src/data/clinical";
import type { ClinicalSettings } from "../../src/types/botox";

const medial: ClinicalSettings = { region: "glabella", layer: "deep", corrugatorPart: "medial", time: 14, expression: 80, exposure: true, amount: 100 };
describe("Clinical teaching model", () => {
  it("never shows immediate relaxation or adverse motion, even with high amount", () => {
    for (const values of [{ time: 0 as const }, { exposure: false }, { amount: 0 }]) {
      const result = evaluateClinicalModel({ ...medial, amount: 200, ...values });
      expect(result.visualRelaxation).toBe(0);
      expect(result.visualAdverse).toBe(0);
      expect(result.adverse).toBe("none");
    }
  });
  it("distinguishes weak, stronger and excessive teaching scenarios as amount rises", () => {
    const low = evaluateClinicalModel({ ...medial, amount: 25 });
    const medium = evaluateClinicalModel(medial);
    const high = evaluateClinicalModel({ ...medial, amount: 190 });
    expect(low.state).toBe("under");
    expect(medium.state).toBe("relaxed");
    expect(high.state).toBe("excess");
    expect(low.visualRelaxation).toBeLessThan(medium.visualRelaxation);
    expect(medium.visualRelaxation).toBeLessThan(high.visualRelaxation);
    expect(high.visualAdverse).toBeGreaterThan(medium.visualAdverse);
  });
  it("keeps the needle fixed while the corrugator target moves and depicts a separate spread example", () => {
    const before = evaluateClinicalModel(medial);
    const after = evaluateClinicalModel({ ...medial, corrugatorPart: "lateral" });
    expect(before.layerMatch).toBe(true);
    expect(after.targetLayer).toBe("superficial");
    expect(after.layerMatch).toBe(false);
    expect(after.visualRelaxation).toBeLessThan(before.visualRelaxation);
    expect(after.state).toBe("spread");
    expect(after.adverse).toBe("eyelid");
    expect(after.message).toContain("波及");
    expect(evaluateClinicalModel({ ...medial, corrugatorPart: "lateral", layer: "superficial" }).layerMatch).toBe(true);
  });
  it("distinguishes brow lowering from upper eyelid ptosis", () => {
    expect(evaluateClinicalModel({ ...medial, layer: "superficial" }).adverse).toBe("brow");
    expect(evaluateClinicalModel({ ...medial, amount: 190 }).adverse).toBe("eyelid");
    expect(evaluateClinicalModel({ ...medial, region: "forehead", layer: "superficial", amount: 190 }).adverse).toBe("brow");
  });
  it("does not treat no displayed dermal effect as clinical ineffectiveness", () => {
    const result = evaluateClinicalModel({ ...medial, layer: "dermis" });
    expect(result.visualRelaxation).toBe(0);
    expect(result.detail).toContain("無効という判定ではありません");
    expect(evaluateClinicalModel({ ...medial, layer: "subcutaneous" }).visualRelaxation).toBeLessThan(.2);
  });
  it("recognizes both masseter muscle planes and explains non-uniform distribution", () => {
    for (const layer of ["superficial", "deep"] as const) {
      const result = evaluateClinicalModel({ ...medial, region: "masseter", layer, amount: 190 });
      expect(result.layerMatch).toBe(true);
      expect(result.message).toContain("一様ではありません");
      expect(result.adverse).toBe("bulge");
    }
  });
  it("lets both effect and excessive-effect illustrations diminish over time", () => {
    const peak = evaluateClinicalModel({ ...medial, amount: 190 });
    const later = evaluateClinicalModel({ ...medial, amount: 190, time: 120 });
    expect(later.visualRelaxation).toBeLessThan(peak.visualRelaxation);
    expect(later.visualAdverse).toBeLessThan(peak.visualAdverse);
  });
  it("keeps the illustration bounded for all regions, planes, times and invalid amount inputs", () => {
    for (const region of CLINICAL_REGIONS) for (const layer of LAYERS) for (const phase of TIMES) for (const amount of [-100, 0, 25, 100, 190, 1000, NaN]) {
      const settings = { ...medial, region: region.id, layer: layer.id, time: phase.day, amount };
      const result = evaluateClinicalModel(settings);
      for (const value of [result.visualRelaxation, result.visualAdverse]) {
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
      expect(getLayerMessage(settings).length).toBeGreaterThan(10);
    }
  });
  it("uses current Japanese indications without treating all anatomy as approved", () => {
    expect(CLINICAL_REGIONS.filter(r => r.approved).map(r => r.id).sort()).toEqual(["eyes", "glabella", "masseter"]);
  });
});
