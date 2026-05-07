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

// 顔が画面いっぱいに表示されるよう座標空間をトリミング
// 500×600 の座標系のうち、顔部分（目尻ゾーン含む）だけを表示
const VB_X = 92, VB_Y = 80, VB_W = 316, VB_H = 445;

export function FaceCanvas() {
  const {
    points, activeZone, faceOpacity,
    showZones, showSafeZone, showDangerZones,
    addPoint, removePoint,
  } = useSimStore();

  const svgRef = useRef<SVGSVGElement>(null);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest("[data-marker]")) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    // viewBox のオフセット・スケールを反映してSVG座標に変換
    const svgX = (e.clientX - rect.left) / rect.width  * VB_W + VB_X;
    const svgY = (e.clientY - rect.top)  / rect.height * VB_H + VB_Y;
    addPoint(svgX, svgY);
  };

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
        className="w-full rounded-xl border border-slate-200 shadow-sm cursor-crosshair bg-white"
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
            {/* 推奨ゾーン（緑） */}
            {showSafeZone && (
              <polygon
                points={activeZone.safeZone.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="rgba(22,163,74,0.10)"
                stroke="rgba(22,163,74,0.55)"
                strokeWidth="1.5"
                strokeDasharray="5,3"
              />
            )}
            {/* 危険ゾーン（赤） */}
            {showDangerZones && activeZone.dangerZones
              .filter((dz) => dz.polygon.length > 0)
              .map((dz, i) => (
                <polygon
                  key={i}
                  points={dz.polygon.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="rgba(220,38,38,0.10)"
                  stroke="rgba(220,38,38,0.55)"
                  strokeWidth="1.5"
                  strokeDasharray="5,3"
                />
              ))}
          </g>
        )}

        {/* ── Layer 4: 注入点マーカー ── */}
        {points.map((p, i) => {
          const r = Math.max(11, Math.sqrt(p.units) * 5);
          const inDanger = activeZone.dangerZones.some(
            (dz) => dz.polygon.length > 0 && isPointInPolygon(p.x, p.y, dz.polygon),
          );
          const color = inDanger ? { fill: "rgba(220,38,38,0.75)", stroke: "#dc2626", text: "#dc2626" }
                                 : { fill: "rgba(8,145,178,0.80)", stroke: "#0891b2", text: "#0e7490" };
          return (
            <g key={p.id} data-marker="true">
              {/* 影 */}
              <circle cx={p.x} cy={p.y} r={r + 3} fill="rgba(0,0,0,0.14)" />
              {/* 本体 */}
              <circle cx={p.x} cy={p.y} r={r}
                fill={color.fill} stroke={color.stroke} strokeWidth="2"/>
              {/* 番号 */}
              <text x={p.x} y={p.y - r - 5} textAnchor="middle" fontSize="12"
                fill={color.text} fontWeight="700" fontFamily="sans-serif">
                {i + 1}
              </text>
              {/* 用量 */}
              <text x={p.x} y={p.y + 4.5} textAnchor="middle" fontSize="11"
                fill="white" fontWeight="700" fontFamily="sans-serif">
                {p.units}U
              </text>
              {/* 削除ボタン */}
              <g data-marker="true" onClick={(e) => { e.stopPropagation(); removePoint(p.id); }}
                style={{ cursor: "pointer" }}>
                <circle cx={p.x + r - 1} cy={p.y - r + 1} r={9} fill="#ef4444" stroke="white" strokeWidth="1.5"/>
                <text x={p.x + r - 1} y={p.y - r + 5} textAnchor="middle" fontSize="12"
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
                <circle key={i} cx={ip.x} cy={ip.y} r={9}
                  fill="rgba(22,163,74,0.10)" stroke="rgba(22,163,74,0.6)"
                  strokeWidth="1.8" strokeDasharray="2,2" />
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
