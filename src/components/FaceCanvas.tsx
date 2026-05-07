/**
 * FaceCanvas — メインの顔SVGキャンバス
 *
 * - クリックで注入点を配置
 * - 注入点をドラッグで移動（Phase 2）
 * - しわレイヤー（改善度に応じてopacity変化）
 * - ゾーンオーバーレイ（教育モード時に表示）
 */

import { useRef } from "react";
import { useSimStore } from "../store/useSimStore";

export function FaceCanvas() {
  const {
    points,
    activeZone,
    result,
    showZones,
    addPoint,
    removePoint,
  } = useSimStore();

  const svgRef = useRef<SVGSVGElement>(null);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // 注入点マーカー自体のクリックは無視（削除ボタン側で処理）
    if ((e.target as Element).closest("[data-marker]")) return;

    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = 500 / rect.width;
    const scaleY = 600 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    addPoint(x, y);
  };

  // しわの改善度
  const glabellarImprovement = result?.wrinkleImprovements.glabellar_lines ?? 0;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox="0 0 500 600"
        className="w-full rounded-xl border border-slate-200 shadow-sm cursor-crosshair bg-slate-50"
        style={{ maxHeight: 680 }}
        onClick={handleClick}
        role="img"
        aria-label="顔のイラスト。クリックして注入点を配置してください"
      >
        {/* ベース顔 SVG */}
        <image href="/face-base.svg" x="0" y="0" width="500" height="600" />

        {/* しわレイヤー — improvement に応じて fade（1=初期フル表示, 0=完全消失） */}
        <g
          fill="none"
          strokeLinecap="round"
          opacity={1 - glabellarImprovement}
          style={{ transition: "opacity 0.8s ease" }}
          aria-hidden="true"
        >
          {/* 眉間の縦じわ "11" — イラスト風ピンク */}
          <path d="M 235 210 Q 233 222 231 236" stroke="#e09090" strokeWidth="2.2" />
          <path d="M 265 210 Q 267 222 269 236" stroke="#e09090" strokeWidth="2.2" />
          <path d="M 237 212 Q 235 223 233 235" stroke="#c87070" strokeWidth="1" opacity="0.5"/>
          <path d="M 263 212 Q 265 223 267 235" stroke="#c87070" strokeWidth="1" opacity="0.5"/>
        </g>

        {/* ゾーンオーバーレイ（教育モード） */}
        {showZones && (
          <g aria-hidden="true">
            {/* 推奨ゾーン（緑） */}
            <polygon
              points={activeZone.safeZone.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="rgba(22,163,74,0.12)"
              stroke="rgba(22,163,74,0.55)"
              strokeWidth="1.2"
              strokeDasharray="4,3"
            />
            {/* 危険ゾーン（赤） */}
            {activeZone.dangerZones
              .filter((dz) => dz.polygon.length > 0)
              .map((dz, i) => (
                <polygon
                  key={i}
                  points={dz.polygon.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="rgba(220,38,38,0.12)"
                  stroke="rgba(220,38,38,0.55)"
                  strokeWidth="1.2"
                  strokeDasharray="4,3"
                />
              ))}
          </g>
        )}

        {/* 注入点マーカー */}
        {points.map((p, i) => {
          const r = Math.max(8, Math.sqrt(p.units) * 4);
          // 危険ゾーン内かチェック（赤くする）
          const inDanger = activeZone.dangerZones.some(
            (dz) =>
              dz.polygon.length > 0 &&
              isPointInPolygon(p.x, p.y, dz.polygon),
          );
          return (
            <g key={p.id} data-marker="true">
              {/* 影 */}
              <circle cx={p.x} cy={p.y} r={r + 2} fill="rgba(0,0,0,0.12)" />
              {/* 本体 */}
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={inDanger ? "rgba(220,38,38,0.7)" : "rgba(8,145,178,0.75)"}
                stroke={inDanger ? "#dc2626" : "#0891b2"}
                strokeWidth="1.5"
              />
              {/* 番号 */}
              <text
                x={p.x}
                y={p.y - r - 4}
                textAnchor="middle"
                fontSize="10"
                fill={inDanger ? "#dc2626" : "#0e7490"}
                fontWeight="600"
                fontFamily="sans-serif"
              >
                {i + 1}
              </text>
              {/* 用量ラベル */}
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize="9"
                fill="white"
                fontWeight="700"
                fontFamily="sans-serif"
              >
                {p.units}U
              </text>
              {/* 削除ボタン */}
              <g
                data-marker="true"
                onClick={(e) => {
                  e.stopPropagation();
                  removePoint(p.id);
                }}
                style={{ cursor: "pointer" }}
                role="button"
                aria-label={`注入点 ${i + 1} を削除`}
              >
                <circle cx={p.x + r} cy={p.y - r} r={7} fill="#ef4444" />
                <text
                  x={p.x + r}
                  y={p.y - r + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontWeight="700"
                  fontFamily="sans-serif"
                >
                  ×
                </text>
              </g>
            </g>
          );
        })}

        {/* 推奨点の位置ガイド（点数が推奨未満の時だけ薄く表示） */}
        {showZones && points.length < activeZone.idealPoints.length && (
          <g aria-hidden="true">
            {activeZone.idealPoints.map((ip, i) => {
              const alreadyPlaced = points.some(
                (p) => Math.abs(p.x - ip.x) < 15 && Math.abs(p.y - ip.y) < 15,
              );
              if (alreadyPlaced) return null;
              return (
                <circle
                  key={i}
                  cx={ip.x}
                  cy={ip.y}
                  r={6}
                  fill="none"
                  stroke="rgba(22,163,74,0.5)"
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                />
              );
            })}
          </g>
        )}
      </svg>

      {/* 操作ヒント */}
      <p className="mt-1.5 text-xs text-slate-400 text-center">
        顔をクリックして注入点を配置 · ×ボタンで削除
        {showZones && (
          <span> · <span className="text-green-600">緑</span>=推奨ゾーン
          　<span className="text-red-500">赤</span>=危険ゾーン</span>
        )}
      </p>
    </div>
  );
}

/** 点がポリゴン内にあるか（Ray casting） */
function isPointInPolygon(
  x: number,
  y: number,
  polygon: { x: number; y: number }[],
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i]!.x, yi = polygon[i]!.y;
    const xj = polygon[j]!.x, yj = polygon[j]!.y;
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
