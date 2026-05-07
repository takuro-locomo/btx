/**
 * DosePanel — 配置済み注入点の用量・深度コントロール
 */

import { useSimStore } from "../store/useSimStore";
import type { InjectionPoint } from "../types/botox";

const DEPTH_LABELS: Record<InjectionPoint["depth"], string> = {
  intradermal: "皮内",
  superficial: "浅筋膜",
  intramuscular: "筋肉内",
  deep: "深部",
};

export function DosePanel() {
  const { points, activeZone, updatePointUnits, updatePointDepth, removePoint, runSimulation, reset } =
    useSimStore();

  const totalUnits = points.reduce((s, p) => s + p.units, 0);
  const { min, optimal, max } = activeZone.idealDose;

  const doseColor =
    totalUnits < min
      ? "text-blue-600"
      : totalUnits > max
        ? "text-red-600"
        : "text-green-600";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
        <h2 className="font-semibold text-slate-800 text-sm">{activeZone.nameJa}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{activeZone.targetMuscle}</p>
      </div>

      {/* 推奨量 */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
          <span>推奨合計量</span>
          <span className="text-slate-400 font-mono">{min}–{max}U（最適 {optimal}U）</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">
            配置: <strong>{points.length}</strong> 点
          </span>
          <span className={`text-sm font-bold ${doseColor}`}>
            合計 {totalUnits}U
          </span>
        </div>
        {/* 用量バー */}
        <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              totalUnits > max ? "bg-red-400" : totalUnits >= min ? "bg-green-400" : "bg-blue-400"
            }`}
            style={{ width: `${Math.min(100, (totalUnits / max) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-0.5">
          <span>{min}U</span>
          <span>{optimal}U</span>
          <span>{max}U</span>
        </div>
      </div>

      {/* 注入点リスト */}
      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
        {points.length === 0 ? (
          <p className="px-4 py-6 text-xs text-slate-400 text-center">
            顔をクリックして注入点を配置してください
          </p>
        ) : (
          points.map((p, i) => (
            <div key={p.id} className="px-4 py-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-slate-600">
                  点 {i + 1}
                  <span className="ml-1.5 text-slate-400 font-mono text-xs">
                    ({Math.round(p.x)}, {Math.round(p.y)})
                  </span>
                </span>
                <button
                  onClick={() => removePoint(p.id)}
                  className="text-slate-300 hover:text-red-400 transition-colors text-xs"
                  aria-label="削除"
                >
                  ✕
                </button>
              </div>
              {/* 用量スライダー */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-4 text-right">1</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={p.units}
                  onChange={(e) => updatePointUnits(p.id, Number(e.target.value))}
                  className="flex-1 accent-cyan-500"
                />
                <span className="text-xs text-slate-400 w-4">10</span>
                <span className="text-xs font-bold text-slate-700 w-10 text-right">
                  {p.units}U
                </span>
              </div>
              {/* 深度 */}
              <div className="flex gap-1 mt-1.5">
                {(["superficial", "intramuscular", "deep"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => updatePointDepth(p.id, d)}
                    className={`text-xs px-1.5 py-0.5 rounded border transition-colors ${
                      p.depth === d
                        ? "bg-cyan-50 border-cyan-400 text-cyan-700"
                        : "border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {DEPTH_LABELS[d]}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* アクション */}
      <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
        <button
          onClick={() => { console.log("[DosePanel] 実行ボタンクリック, points:", points.length); runSimulation(); }}
          disabled={points.length === 0}
          className="flex-1 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium
            hover:bg-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          シミュレーション実行
        </button>
        <button
          onClick={reset}
          className="px-3 py-2 rounded-lg border border-slate-200 text-slate-500 text-sm
            hover:bg-slate-50 transition-colors"
        >
          リセット
        </button>
      </div>

      {/* エビデンス出典 */}
      <div className="px-4 pb-3 text-xs text-slate-400">
        出典: {activeZone.evidenceRefs.join(" · ")}
      </div>
    </div>
  );
}
