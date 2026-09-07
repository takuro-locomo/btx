import { describe, it, expect } from "vitest";
import { evaluateClinicalModel, getLayerMessage } from "../../src/engine/clinical";
import { CLINICAL_REGIONS, LAYERS, TIMES } from "../../src/data/clinical";
import type { ClinicalSettings } from "../../src/types/botox";

const medial: ClinicalSettings = { region: "glabella", layer: "deep", corrugatorPart: "medial", time: 14, expression: 80, exposure: true };
describe("Clinical teaching model", () => {
  it("never shows immediate relaxation, including when the selected layer matches", () => {
    expect(evaluateClinicalModel({ ...medial, time: 0 }).visualRelaxation).toBe(0);
    expect(evaluateClinicalModel({ ...medial, exposure: false }).visualRelaxation).toBe(0);
  });
  it("moves the corrugator target plane without moving the user's needle", () => {
    const before = evaluateClinicalModel(medial);
    const after = evaluateClinicalModel({ ...medial, corrugatorPart: "lateral" });
    expect(before.layerMatch).toBe(true);
    expect(after.targetLayer).toBe("superficial");
    expect(after.layerMatch).toBe(false);
    expect(after.visualRelaxation).toBe(0);
    expect(after.message).toContain("波及");
    expect(evaluateClinicalModel({ ...medial, corrugatorPart: "lateral", layer: "superficial" }).layerMatch).toBe(true);
  });
  it("does not infer intramuscular action from dermal or subcutaneous placement", () => {
    for (const layer of ["dermis", "subcutaneous"] as const) {
      expect(evaluateClinicalModel({ ...medial, layer }).visualRelaxation).toBe(0);
      expect(getLayerMessage({ ...medial, layer })).not.toContain("安全");
    }
  });
  it("recognizes both masseter muscle planes and explains non-uniform distribution", () => {
    for (const layer of ["superficial", "deep"] as const) {
      const result = evaluateClinicalModel({ ...medial, region: "masseter", layer });
      expect(result.layerMatch).toBe(true);
      expect(result.message).toContain("一様ではありません");
    }
  });
  it("has finite illustration output and explanations for every region/layer/time", () => {
    for (const region of CLINICAL_REGIONS) for (const layer of LAYERS) for (const phase of TIMES) {
      const settings = { ...medial, region: region.id, layer: layer.id, time: phase.day };
      const result = evaluateClinicalModel(settings);
      expect(Number.isFinite(result.visualRelaxation)).toBe(true);
      expect(result.visualRelaxation).toBeGreaterThanOrEqual(0);
      expect(result.visualRelaxation).toBeLessThan(1);
      expect(getLayerMessage(settings).length).toBeGreaterThan(10);
    }
  });
  it("uses current Japanese indications without treating all anatomy as approved", () => {
    expect(CLINICAL_REGIONS.filter(r => r.approved).map(r => r.id).sort()).toEqual(["eyes", "glabella", "masseter"]);
  });
});
