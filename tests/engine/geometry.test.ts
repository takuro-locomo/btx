import { describe, it, expect } from "vitest";
import {
  isInsidePolygon,
  polygonCenter,
  distance,
} from "../../src/engine/geometry";

describe("isInsidePolygon", () => {
  const square = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ];

  it("中心は内側", () => {
    expect(isInsidePolygon({ x: 5, y: 5 }, square)).toBe(true);
  });

  it("外側は外側", () => {
    expect(isInsidePolygon({ x: 11, y: 5 }, square)).toBe(false);
    expect(isInsidePolygon({ x: -1, y: 5 }, square)).toBe(false);
  });

  it("空のポリゴンは false", () => {
    expect(isInsidePolygon({ x: 0, y: 0 }, [])).toBe(false);
  });
});

describe("polygonCenter", () => {
  it("正方形の中心", () => {
    const square = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    expect(polygonCenter(square)).toEqual({ x: 5, y: 5 });
  });
});

describe("distance", () => {
  it("ピタゴラス", () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});
