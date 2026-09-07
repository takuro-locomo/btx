import { describe, expect, it } from "vitest";
import { calculateVistaDose, formatVistaNumber, vistaConcentration } from "../../src/engine/vista";
import { getVistaReference, initialVistaDose, VISTA_REFERENCES } from "../../src/data/vista";
import type { VistaDoseInput } from "../../src/types/botox";

const baseline: VistaDoseInput = { vialUnits: 50, diluentMl: 1.25, totalUnits: 20, points: 5 };
describe("Botox Vista unit and volume arithmetic", () => {
  it.each([
    [50, 1.25, 40, 4], [50, 2.5, 20, 2], [100, 1.25, 80, 8], [100, 2.5, 40, 4],
  ] as const)("matches the label dilution table: %s U in %s mL", (vialUnits, diluentMl, perMl, perTenth) => {
    const result = calculateVistaDose({ ...baseline, vialUnits, diluentMl }, "glabella");
    expect(result.calculable).toBe(true);
    if (!result.calculable) return;
    expect(result.concentration).toBe(perMl);
    expect(result.unitsPerTenthMl).toBe(perTenth);
  });
  it("conserves U when dilution changes and flags the increased point volume", () => {
    const a = calculateVistaDose(baseline, "glabella");
    const b = calculateVistaDose({ ...baseline, diluentMl: 2.5 }, "glabella");
    if (!a.calculable || !b.calculable) throw Error("Expected arithmetic results");
    expect(a.unitsPerPoint).toBe(4);
    expect(b.unitsPerPoint).toBe(4);
    expect(a.mlPerPoint).toBe(.1);
    expect(b.mlPerPoint).toBe(.2);
    expect(a.totalMl).toBe(.5);
    expect(b.totalMl).toBe(1);
    expect(a.issues.some(i => i.id === "volume-high")).toBe(false);
    expect(b.issues.some(i => i.id === "volume-high")).toBe(true);
  });
  it("uses bilateral masseter totals, including the exact 0.3 mL boundary", () => {
    for (const [totalUnits, mlPerPoint, totalMl] of [[48, .2, 1.2], [72, .3, 1.8]]) {
      const r = calculateVistaDose({ vialUnits: 100, diluentMl: 2.5, totalUnits: totalUnits!, points: 6 }, "masseter");
      if (!r.calculable) throw Error("Expected arithmetic results");
      expect(r.mlPerPoint).toBe(mlPerPoint);
      expect(r.totalMl).toBe(totalMl);
      expect(r.issues).toEqual([]);
    }
  });
  it("checks limits using unrounded values", () => {
    const r = calculateVistaDose({ ...baseline, totalUnits: 20.0002 }, "glabella");
    if (!r.calculable) throw Error("Expected arithmetic results");
    expect(formatVistaNumber(r.mlPerPoint)).toContain("0.1");
    expect(r.issues.map(i => i.id)).toContain("volume-high");
    expect(r.issues.map(i => i.id)).toContain("dose-high");
  });
  it("flags point count, custom dilution, unsupported vial and multiple-vial conditions", () => {
    const r = calculateVistaDose({ vialUnits: 100, diluentMl: 3, totalUnits: 110, points: 4 }, "eyes");
    if (!r.calculable) throw Error("Expected arithmetic results");
    expect(r.issues.map(i => i.id)).toEqual(expect.arrayContaining(["points", "dilution", "vial-indication", "multiple-vials", "dose-high", "volume-high"]));
  });
  it("clears outputs for missing, negative, zero-volume, fractional-point or nonfinite inputs", () => {
    for (const invalid of [
      { diluentMl: null }, { totalUnits: null }, { points: null }, { diluentMl: 0 }, { diluentMl: -1 },
      { points: 0 }, { points: 2.5 }, { points: Infinity }, { totalUnits: -1 }, { totalUnits: NaN }, { diluentMl: Infinity },
    ]) expect(calculateVistaDose({ ...baseline, ...invalid }, "glabella").calculable).toBe(false);
    expect(vistaConcentration(50, null)).toBeNull();
  });
  it("treats 0 U as no administration without declaring clinical efficacy", () => {
    const r = calculateVistaDose({ ...baseline, totalUnits: 0 }, "glabella");
    if (!r.calculable) throw Error("Expected arithmetic results");
    expect(r.mlPerPoint).toBe(0);
    expect(r.totalMl).toBe(0);
    expect(r.issues).toEqual([]);
  });
  it("leaves off-label dosing empty and performs only arithmetic when entered", () => {
    expect(initialVistaDose("forehead").totalUnits).toBeNull();
    expect(getVistaReference("forehead")).toBeUndefined();
    const r = calculateVistaDose(baseline, "forehead");
    if (!r.calculable) throw Error("Expected arithmetic results");
    expect(r.issues.map(i => i.id)).toEqual(["off-label"]);
  });
  it("keeps trials as dose-specific group outcomes with their actual denominators and times", () => {
    expect(VISTA_REFERENCES.glabella.trial.arms[0]).toEqual({ units: 10, responders: 38, evaluated: 44, rate: 86.4 });
    expect(VISTA_REFERENCES.eyes.trial.time).toBe("投与30日後");
    expect(VISTA_REFERENCES.masseter.trial.arms[1]).toEqual({ units: 72, responders: 41, evaluated: 104, rate: 39.4 });
  });
});
