/**
 * ResultPanel — シミュレーション結果の表示
 */

import { useSimStore } from "../store/useSimStore";

const WRINKLE_NAMES: Record<string, string> = {
  glabellar_lines: "眉間の縦じわ",
  horizontal_forehead: "額の横じわ",
  crows_feet: "目尻のしわ",
  bunny_lines: "バニーライン",
  perioral_lines: "口周りのしわ",
  marionette_lines: "マリオネットライン",
  chin_dimpling: "顎の梅干しじわ",
  platysma_bands: "首の縦じわ",
  lower_lid_wrinkles: "下眼瞼のしわ",
};

const SIDE_EFFECT_NAMES: Record<string, string> = {
  eyelid_ptosis: "眼瞼下垂",
  brow_ptosis: "眉毛下垂",
  spock_brow: "Spock 眉",
  asymmetric_smile: "笑顔の非対称",
  frozen_forehead: "額の固まり感",
  lower_lid_drop: "下眼瞼下垂",
  cheek_droop: "頬部下垂",
  lip_incompetence: "口唇閉鎖不全",
  speech_difficulty: "発音障害",
  joker_smile: "Joker smile",
  masseter_hourglass: "頬陥没",
  paradoxical_bulge: "逆説的膨隆",
  dysphagia: "嚥下困難",
  diplopia: "複視",
};

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 70 ? "text-green-600" : score >= 40 ? "text-amber-500" : "text-red-500";
  return (
    <div className={`text-3xl font-bold ${color}`}>
      {Math.round(score)}
      <span className="text-sm font-normal text-slate-400"> / 100</span>
    </div>
  );
}

function ImprovementBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-800">{pct}% 改善</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ResultPanel() {
  const { result } = useSimStore();

  if (!result) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-6 text-center text-sm text-slate-400">
        注入点を配置して「シミュレーション実行」を押してください
      </div>
    );
  }

  const { wrinkleImprovements, predictedSideEffects, overallScore, feedback } = result;
  const hasWarnings = feedback.warnings.length > 0;
  const hasSideEffects = predictedSideEffects.length > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* スコアヘッダー */}
      <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">総合スコア</p>
          <ScoreRing score={overallScore} />
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">判定</p>
          <span className={`text-sm font-semibold ${
            feedback.summary.includes("適切") ? "text-green-700" : "text-amber-700"
          }`}>
            {feedback.summary}
          </span>
        </div>
      </div>

      {/* しわ改善 */}
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-500 mb-2">しわ改善効果</p>
        <div className="space-y-2">
          {Object.entries(wrinkleImprovements).map(([id, v]) => (
            <ImprovementBar key={id} value={v} label={WRINKLE_NAMES[id] ?? id} />
          ))}
        </div>
      </div>

      {/* 副作用予測 */}
      {hasSideEffects && (
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-xs font-semibold text-red-600 mb-2">⚠️ 予測される副作用</p>
          <div className="space-y-2">
            {predictedSideEffects.map((se) => (
              <div key={se.id} className="text-xs">
                <div className="flex justify-between items-center mb-0.5">
                  <span className={`font-medium ${
                    se.severity === "severe"
                      ? "text-red-700"
                      : se.severity === "moderate"
                        ? "text-amber-700"
                        : "text-slate-600"
                  }`}>
                    {SIDE_EFFECT_NAMES[se.id] ?? se.id}
                  </span>
                  <span className="font-bold text-red-600">
                    {Math.round(se.probability * 100)}%
                  </span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full ${
                      se.severity === "severe"
                        ? "bg-red-500"
                        : se.severity === "moderate"
                          ? "bg-amber-400"
                          : "bg-yellow-300"
                    }`}
                    style={{ width: `${se.probability * 100}%` }}
                  />
                </div>
                <p className="text-slate-500 leading-tight">{se.cause}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* フィードバック */}
      {(hasWarnings || feedback.suggestions.length > 0) && (
        <div className="px-4 py-3">
          {feedback.warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-700 mb-1">⚠ {w}</p>
          ))}
          {feedback.suggestions.map((s, i) => (
            <p key={i} className="text-xs text-blue-600 mb-1">💡 {s}</p>
          ))}
        </div>
      )}
    </div>
  );
}
