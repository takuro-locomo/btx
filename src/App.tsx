/**
 * App.tsx — ボトックスシミュレーター メインレイアウト
 *
 * DESIGN.md § 6-1 のレイアウトに準拠:
 *   ヘッダー / 顔キャンバス（左2/3） + サイドパネル（右1/3） / 結果パネル（下）
 */

import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { FaceCanvas } from "./components/FaceCanvas";
import { DosePanel } from "./components/DosePanel";
import { ResultPanel } from "./components/ResultPanel";
import { LayerPanel } from "./components/LayerPanel";
import { useSimStore } from "./store/useSimStore";
import { getAllZones } from "./data/zones";

const ALL_ZONES = getAllZones();

export default function App() {
  const { activeZone, showZones, toggleShowZones, appMode, setAppMode, setActiveZone } = useSimStore();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* 免責バナー（常時表示） */}
      <DisclaimerBanner />

      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">
            ボトックスシミュレーター
          </h1>
          <p className="text-xs text-slate-500">
            {activeZone.nameJa} — {activeZone.targetMuscle}
          </p>
        </div>

        {/* 部位選択 + モード切替 */}
        <div className="flex items-center gap-3">
          <select
            value={activeZone.id}
            onChange={(e) => setActiveZone(e.target.value)}
            className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-700 bg-white font-medium"
          >
            {ALL_ZONES.map((z) => (
              <option key={z.id} value={z.id}>{z.nameJa}</option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showZones}
              onChange={toggleShowZones}
              className="accent-cyan-600"
            />
            教育モード
          </label>
          <select
            value={appMode}
            onChange={(e) => setAppMode(e.target.value as typeof appMode)}
            className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-600 bg-white"
          >
            <option value="free_play">自由配置</option>
            <option value="education">教育モード</option>
          </select>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 p-4 lg:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">

            {/* 顔キャンバス（左2列） */}
            <div className="lg:col-span-2">
              <FaceCanvas />
            </div>

            {/* サイドパネル（右1列） */}
            <div className="space-y-4">
              <LayerPanel />
              <DosePanel />
            </div>
          </div>

          {/* 結果パネル（下段） */}
          <div className="mt-4 lg:mt-6">
            <ResultPanel />
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-slate-200 px-6 py-2 text-xs text-slate-400 text-center">
        データ出典: FDA Prescribing Information · Carruthers Consensus 2004 ·
        Korean Consensus 2024 (NEWLUX) · Alluzience Consensus 2024 (ALLU)
      </footer>
    </div>
  );
}
