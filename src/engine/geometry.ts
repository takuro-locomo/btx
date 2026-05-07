/**
 * ジオメトリユーティリティ
 *
 * 点が多角形の内側か、点から多角形中心までの距離など。
 * 純粋関数のみ。
 */

import type { Point2D, Polygon } from "../types/botox";

/**
 * 点が閉じた多角形の内側にあるか（Ray casting）
 */
export function isInsidePolygon(point: Point2D, polygon: Polygon): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  const { x, y } = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i]!.x;
    const yi = polygon[i]!.y;
    const xj = polygon[j]!.x;
    const yj = polygon[j]!.y;

    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * 多角形の重心
 */
export function polygonCenter(polygon: Polygon): Point2D {
  if (polygon.length === 0) return { x: 0, y: 0 };
  let sx = 0;
  let sy = 0;
  for (const p of polygon) {
    sx += p.x;
    sy += p.y;
  }
  return { x: sx / polygon.length, y: sy / polygon.length };
}

/**
 * 点から多角形中心までの距離
 */
export function distanceToPolygonCenter(
  point: Point2D,
  polygon: Polygon,
): number {
  const center = polygonCenter(polygon);
  return distance(point, center);
}

/**
 * 2点間距離
 */
export function distance(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
