/**
 * App.tsx
 *
 * このファイルは Phase 1 の出発点。
 * Claude Code が DESIGN.md のレイアウト設計に従って完成させる。
 */

import { useState } from "react";
import { GLABELLA_ZONE, getAllZones } from "./data/zones";
import { simulate } from "./engine/simulate";
import type { InjectionPoint, Zone, SimulationResult } from "./types/botox";

export default function App() {
  const [points, setPoints] = useState<InjectionPoint[]>([]);
  const [activeZone] = useState<Zone>(GLABELLA_ZONE);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 500;
    const y = ((e.clientY - rect.top) / rect.height) * 600;
    const newPoint: InjectionPoint = {
      id: `p-${Date.now()}`,
      x,
      y,
      units: 4,
      depth: "intramuscular",
    };
    setPoints((prev) => [...prev, newPoint]);
  };

  const runSimulation = () => {
    const r = simulate(points, activeZone, getAllZones());
    setResult(r);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          ボトックスシミュレーター（プロトタイプ）
        </h1>
        <p className="text-sm text-slate-600">
          現在の対象部位: <strong>{activeZone.nameJa}</strong> （{activeZone.targetMuscle}）
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 顔キャンバス */}
        <div className="lg:col-span-2">
          <svg
            viewBox="0 0 500 600"
            className="bg-white border border-slate-200 rounded-lg cursor-crosshair w-full"
            onClick={handleSvgClick}
            style={{ maxHeight: 700 }}
          >
            {/* TODO: face-base.svg の内容をインポート / インライン化 */}
            <ellipse cx="250" cy="320" rx="135" ry="195" fill="#fef3c7" stroke="#475569" />
            <path d="M 165 200 Q 200 188 235 200" stroke="#1f2937" strokeWidth="3" fill="none" />
            <path d="M 265 200 Q 300 188 335 200" stroke="#1f2937" strokeWidth="3" fill="none" />
            <ellipse cx="200" cy="225" rx="22" ry="9" fill="white" stroke="#1f2937" />
            <circle cx="200" cy="225" r="5" fill="#1f2937" />
            <ellipse cx="300" cy="225" rx="22" ry="9" fill="white" stroke="#1f2937" />
            <circle cx="300" cy="225" r="5" fill="#1f2937" />

            {/* しわ（眉間）— improvement に応じて opacity を変える */}
            <g
              stroke="#7c3aed"
              strokeWidth="2"
              fill="none"
              opacity={
                result
                  ? 1 - (result.wrinkleImprovements.glabellar_lines ?? 0)
                  : 1
              }
            >
              <path d="M 235 195 Q 232 215 230 235" />
              <path d="M 265 195 Q 268 215 270 235" />
            </g>

            {/* 推奨ゾーン（緑、教育モード） */}
            <polygon
              points={activeZone.safeZone.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="rgba(22,163,74,0.15)"
              stroke="rgba(22,163,74,0.6)"
              strokeDasharray="4,2"
            />

            {/* 危険ゾーン（赤） */}
            {activeZone.dangerZones
              .filter((dz) => dz.polygon.length > 0)
              .map((dz, i) => (
                <polygon
                  key={i}
                  points={dz.polygon.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="rgba(220,38,38,0.15)"
                  stroke="rgba(220,38,38,0.6)"
                  strokeDasharray="4,2"
                />
              ))}

            {/* 注入点マーカー */}
            {points.map((p) => (
              <g key={p.id}>
                <circle cx={p.x} cy={p.y} r={Math.sqrt(p.units) * 3} fill="rgba(8,145,178,0.5)" stroke="#0891b2" strokeWidth="2" />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
                  {p.units}U
                </text>
              </g>
            ))}
          </svg>
          <div className="mt-2 text-xs text-slate-500">
            顔をクリックで注入点を配置（仮: 4U固定）。Claude Code がスライダー UI を実装。
          </div>
        </div>

        {/* サイドパネル */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h2 className="font-bold text-slate-800 mb-2">推奨投与</h2>
            <p className="text-sm">
              総量: {activeZone.idealDose.min}–{activeZone.idealDose.max}U
              （最適 {activeZone.idealDose.optimal}U）
            </p>
            <p className="text-sm">推奨: {activeZone.idealPoints.length}ポイント</p>
            <p className="text-xs text-slate-500 mt-2">
              出典: {activeZone.evidenceRefs.join(", ")}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h2 className="font-bold text-slate-800 mb-2">配置済み</h2>
            <p className="text-sm">{points.length} 点 / 合計 {points.reduce((s, p) => s + p.units, 0)}U</p>
            <button
              className="mt-2 px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
              onClick={runSimulation}
              disabled={points.length === 0}
            >
              シミュレーション実行
            </button>
            <button
              className="mt-2 ml-2 px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300"
              onClick={() => {
                setPoints([]);
                setResult(null);
              }}
            >
              リセット
            </button>
          </div>

          {result && (
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <h2 className="font-bold text-slate-800 mb-2">結果</h2>
              <p className="text-sm font-semibold">
                総合スコア: {result.overallScore.toFixed(0)} / 100
              </p>
              <p className="text-sm text-slate-600 mt-1">{result.feedback.summary}</p>

              {Object.entries(result.wrinkleImprovements).map(([id, v]) => (
                <p key={id} className="text-sm mt-1">
                  {id}: <strong>{(v * 100).toFixed(0)}% 改善</strong>
                </p>
              ))}

              {result.predictedSideEffects.length > 0 && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-xs font-bold text-red-800 mb-1">⚠️ 予測される副作用</p>
                  {result.predictedSideEffects.map((se) => (
                    <p key={se.id} className="text-xs text-red-700">
                      {se.id}: {(se.probability * 100).toFixed(0)}% — {se.cause}
                    </p>
                  ))}
                </div>
              )}

              {result.feedback.warnings.length > 0 && (
                <ul className="mt-2 text-xs text-amber-700 list-disc pl-4">
                  {result.feedback.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="mt-8 text-xs text-slate-500 border-t border-slate-200 pt-4">
        ⚠️ 本シミュレーターは教育目的のツールであり、医療行為の代替ではありません。
        実際の治療判断は必ず医師の診察を受けてください。
      </footer>
    </div>
  );
}
