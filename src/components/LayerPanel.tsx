/**
 * LayerPanel — レイヤー表示コントロール
 *
 * 着せ替え人形スタイル：
 *   - 顔/肌レイヤー（透明度調整）
 *   - 筋肉レイヤー（ON/OFF + 透明度 + 筋肉個別トグル）
 *   - しわレイヤー（部位ごとON/OFF）
 */

import { useSimStore } from "../store/useSimStore";
import type { MuscleId, WrinkleToggleId } from "../store/useSimStore";

const MUSCLE_LABELS: Record<MuscleId, string> = {
  frontalis: "前頭筋",
  corrugator: "皺眉筋",
  procerus: "鼻根筋",
  orbicularis_oculi: "眼輪筋",
  nasalis: "鼻筋",
  llsan: "上唇鼻翼挙筋",
  zygomaticus_major: "大頬骨筋",
  zygomaticus_minor: "小頬骨筋",
  risorius: "笑筋",
  orbicularis_oris: "口輪筋",
  dao: "口角下制筋",
  dli: "下唇下制筋",
  mentalis: "オトガイ筋",
  masseter: "咬筋",
  temporalis: "側頭筋",
  platysma: "広頸筋",
};

const WRINKLE_LABELS: Record<WrinkleToggleId, string> = {
  glabellar_lines: "眉間のじわ",
  horizontal_forehead: "額の横じわ",
  crows_feet: "目尻（カラス足）",
  bunny_lines: "バニーライン",
  perioral_lines: "口周りのじわ",
  marionette_lines: "マリオネットライン",
  chin_dimpling: "顎の梅干しじわ",
  lower_lid_wrinkles: "下眼瞼のじわ",
};

const MUSCLE_GROUPS: { label: string; ids: MuscleId[] }[] = [
  { label: "上部顔面", ids: ["frontalis", "corrugator", "procerus", "orbicularis_oculi", "temporalis"] },
  { label: "中部顔面", ids: ["nasalis", "llsan", "zygomaticus_major", "zygomaticus_minor", "risorius"] },
  { label: "下部顔面", ids: ["orbicularis_oris", "dao", "dli", "mentalis"] },
  { label: "咀嚼・首", ids: ["masseter", "platysma"] },
];

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {children}
    </div>
  );
}

function LayerToggle({
  label, checked, onChange, color = "cyan",
}: {
  label: string; checked: boolean; onChange: () => void; color?: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none py-0.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`accent-${color}-500 w-3.5 h-3.5`}
      />
      <span className="text-xs text-slate-700">{label}</span>
    </label>
  );
}

function OpacitySlider({
  label, value, onChange,
}: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <span className="text-xs text-slate-500 w-16 shrink-0">{label}</span>
      <input
        type="range" min={0} max={1} step={0.05} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-slate-400 h-1"
      />
      <span className="text-xs text-slate-400 w-8 text-right">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

export function LayerPanel() {
  const {
    faceOpacity, setFaceOpacity,
    showMuscles, setShowMuscles, muscleOpacity, setMuscleOpacity,
    muscleVisibility, toggleMuscle,
    wrinkleVisibility, toggleWrinkle,
  } = useSimStore();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-800 text-white text-sm font-semibold">
        レイヤー
      </div>

      {/* ── 顔/肌レイヤー ── */}
      <SectionHeader>顔・肌</SectionHeader>
      <div className="px-3 py-1.5">
        <LayerToggle
          label="顔レイヤー表示"
          checked={faceOpacity > 0}
          onChange={() => setFaceOpacity(faceOpacity > 0 ? 0 : 1)}
        />
      </div>
      <OpacitySlider label="透明度" value={faceOpacity} onChange={setFaceOpacity} />

      {/* ── 筋肉レイヤー ── */}
      <SectionHeader>表情筋</SectionHeader>
      <div className="px-3 py-1.5">
        <LayerToggle
          label="筋肉レイヤー表示"
          checked={showMuscles}
          onChange={() => setShowMuscles(!showMuscles)}
          color="red"
        />
      </div>
      {showMuscles && (
        <>
          <OpacitySlider label="筋肉濃度" value={muscleOpacity} onChange={setMuscleOpacity} />
          <div className="px-3 pb-2">
            {MUSCLE_GROUPS.map((group) => (
              <div key={group.label} className="mb-2">
                <p className="text-xs text-slate-400 mb-1">{group.label}</p>
                <div className="grid grid-cols-2 gap-x-2">
                  {group.ids.map((id) => (
                    <LayerToggle
                      key={id}
                      label={MUSCLE_LABELS[id]}
                      checked={muscleVisibility[id]}
                      onChange={() => toggleMuscle(id)}
                      color="red"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── しわレイヤー ── */}
      <SectionHeader>しわ</SectionHeader>
      <div className="px-3 py-2">
        <div className="space-y-0.5">
          {(Object.keys(WRINKLE_LABELS) as WrinkleToggleId[]).map((id) => (
            <LayerToggle
              key={id}
              label={WRINKLE_LABELS[id]}
              checked={wrinkleVisibility[id]}
              onChange={() => toggleWrinkle(id)}
              color="purple"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
