/**
 * FaceCanvas — メインの顔SVGキャンバス
 *
 * レイヤー構造（下から）:
 *   0: MuscleLayer（表情筋）
 *   1: 顔/肌 <image>（faceOpacity で透明度制御）
 *   2: WrinkleLayer（しわ、部位ごと制御）
 *   3: ゾーンオーバーレイ
 *   4: 注入点マーカー
 */

import { useRef } from "react";
import { useSimStore } from "../store/useSimStore";
import { MuscleLayer } from "./MuscleLayer";
import { WrinkleLayer } from "./WrinkleLayer";

export function FaceCanvas() {
  const {
    points, activeZone, faceOpacity,
    showZones, addPoint, removePoint,
  } = useSimStore();

  const svgRef = useRef<SVGSVGElement>(null);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest("[data-marker]")) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = 500 / rect.width;
    const scaleY = 600 / rect.height;
    addPoint((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  };

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox="0 0 500 600"
        className="w-full rounded-xl border border-slate-200 shadow-sm cursor-crosshair bg-slate-50"
        style={{ maxHeight: 680 }}
        onClick={handleClick}
        role="img"
        aria-label="顔のイラスト。クリックして注入点を配置"
      >
        {/* ── Layer 0: 表情筋 ── */}
        <MuscleLayer />

        {/* ── Layer 1: 顔/肌（opacity可変 → 下の筋肉が透けて見える） ── */}
        <image
          href="/face-base.svg"
          x="0" y="0" width="500" height="600"
          opacity={faceOpacity}
          style={{ transition: "opacity 0.3s ease" }}
        />

        {/* ── Layer 2: しわ（部位ごと個別制御） ── */}
        <WrinkleLayer />

        {/* ── Layer 3: ゾーンオーバーレイ ── */}
        {showZones && (
          <g aria-hidden="true">
            <polygon
              points={activeZone.safeZone.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="rgba(22,163,74,0.08)"
              stroke="rgba(22,163,74,0.4)"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
            {activeZone.dangerZones
              .filter((dz) => dz.polygon.length > 0)
              .map((dz, i) => (
                <polygon
                  key={i}
                  points={dz.polygon.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="rgba(220,38,38,0.08)"
                  stroke="rgba(220,38,38,0.4)"
                  strokeWidth="1"
                  strokeDasharray="4,3"
                />
              ))}
          </g>
        )}

        {/* ── Layer 4: 注入点マーカー ── */}
        {points.map((p, i) => {
          const r = Math.max(8, Math.sqrt(p.units) * 4);
          const inDanger = activeZone.dangerZones.some(
            (dz) => dz.polygon.length > 0 && isPointInPolygon(p.x, p.y, dz.polygon),
          );
          return (
            <g key={p.id} data-marker="true">
              <circle cx={p.x} cy={p.y} r={r + 2} fill="rgba(0,0,0,0.12)" />
              <circle
                cx={p.x} cy={p.y} r={r}
                fill={inDanger ? "rgba(220,38,38,0.7)" : "rgba(8,145,178,0.75)"}
                stroke={inDanger ? "#dc2626" : "#0891b2"}
                strokeWidth="1.5"
              />
              <text x={p.x} y={p.y - r - 4} textAnchor="middle" fontSize="10"
                fill={inDanger ? "#dc2626" : "#0e7490"} fontWeight="600" fontFamily="sans-serif">
                {i + 1}
              </text>
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="9"
                fill="white" fontWeight="700" fontFamily="sans-serif">
                {p.units}U
              </text>
              <g data-marker="true" onClick={(e) => { e.stopPropagation(); removePoint(p.id); }}
                style={{ cursor: "pointer" }}>
                <circle cx={p.x + r} cy={p.y - r} r={7} fill="#ef4444" />
                <text x={p.x + r} y={p.y - r + 4} textAnchor="middle" fontSize="10"
                  fill="white" fontWeight="700" fontFamily="sans-serif">×</text>
              </g>
            </g>
          );
        })}

        {/* 推奨点ガイド */}
        {showZones && points.length < activeZone.idealPoints.length && (
          <g aria-hidden="true">
            {activeZone.idealPoints.map((ip, i) => {
              const near = points.some(
                (p) => Math.abs(p.x - ip.x) < 15 && Math.abs(p.y - ip.y) < 15,
              );
              if (near) return null;
              return (
                <circle key={i} cx={ip.x} cy={ip.y} r={6}
                  fill="none" stroke="rgba(22,163,74,0.5)"
                  strokeWidth="1.5" strokeDasharray="2,2" />
              );
            })}
          </g>
        )}
      </svg>

      <p className="mt-1.5 text-xs text-slate-400 text-center">
        顔をクリックして注入点を配置 · ×ボタンで削除
        {showZones && (
          <span>　<span className="text-green-600">緑</span>=推奨
          　<span className="text-red-500">赤</span>=危険ゾーン</span>
        )}
      </p>
    </div>
  );
}

function isPointInPolygon(x: number, y: number, polygon: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i]!.x, yi = polygon[i]!.y;
    const xj = polygon[j]!.x, yj = polygon[j]!.y;
    const intersect = yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
