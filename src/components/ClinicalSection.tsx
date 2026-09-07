import { useId } from "react";
import { LAYERS } from "../data/clinical";
import type { ClinicalLayer, ClinicalModelResult, ClinicalRegion, ClinicalSettings } from "../types/botox";

interface Props { settings: ClinicalSettings; region: ClinicalRegion; model: ClinicalModelResult; }
const Y: Record<ClinicalLayer, number> = { dermis: 71, subcutaneous: 112, superficial: 153, deep: 204 };

export function ClinicalSection({ settings, region, model }: Props) {
  const { targetLayer: target, layerMatch: match } = model;
  const halo = Math.max(0, Math.min(200, settings.amount)) / 200;
  const id = useId().replace(/:/g, "");
  const corrugator = region.id === "glabella";
  const masseter = region.id === "masseter";
  const tipX = corrugator ? settings.corrugatorPart === "medial" ? 88 : 224 : 172;
  const tipY = Y[settings.layer];
  const musclePath = corrugator ? "M43 189 Q124 173 254 127 L254 145 Q133 195 43 218Z"
    : masseter ? "M30 135 H267 V223 H30Z"
    : target === "deep" ? "M30 183 Q148 169 267 183 V221 Q148 233 30 221Z"
    : "M30 136 Q148 130 267 136 V163 Q148 173 30 163Z";
  return (
    <svg viewBox="0 0 420 270" className="section-svg" role="img" aria-label={region.muscles + "の模式断面。針先は" + LAYERS.find(l => l.id === settings.layer)?.name}>
      <defs>
        <linearGradient id={id + "-skin"} x2="0" y2="1"><stop stopColor="#f5d7c4" /><stop offset="1" stopColor="#eec0ac" /></linearGradient>
        <pattern id={id + "-fat"} width="22" height="18" patternUnits="userSpaceOnUse"><rect width="22" height="18" fill="#f9e5bc" /><path d="M0 9 Q11 -3 22 9 Q11 21 0 9Z" fill="none" stroke="#e2c389" strokeWidth=".6" /></pattern>
        <pattern id={id + "-fiber"} width="6" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)"><rect width="6" height="8" fill="#cb756b" /><path d="M1 0V8 M3 0V8" stroke="#ecad99" strokeWidth=".8" /></pattern>
        <clipPath id={id + "-muscle"}><path d={musclePath} /></clipPath>
      </defs>
      <text x="23" y="23" fontSize="13" fill="#737381">{corrugator ? "内側（起始） → 外側（皮膚へ）" : "選択部位の層構造"}</text>
      <path d="M20 53 Q153 44 280 53 V84 H20Z" fill={"url(#" + id + "-skin)"} stroke="#deb39e" />
      <path d="M20 84 H280 V129 H20Z" fill={"url(#" + id + "-fat)"} />
      <path d="M20 129 H280 V234 H20Z" fill="#f4e6de" />
      {corrugator && <path d="M28 130 Q107 121 188 133 L158 148 Q86 142 28 156Z" fill="#cfa493" opacity=".72" />}
      <path d={musclePath} fill={"url(#" + id + "-fiber)"} stroke="#aa5c54" strokeWidth="1.2" />
      {masseter && <path d="M30 177 Q160 169 267 182" fill="none" stroke="#faf3e1" strokeWidth="5" />}
      <path d="M20 234 H280 V252 H20Z" fill="#dfd5c7" stroke="#c2b6a4" />
      {LAYERS.map(l => <g key={l.id} opacity={l.id === settings.layer ? 1 : .72}>
        <path d={"M281 " + Y[l.id] + " H296"} stroke={l.id === settings.layer ? "#a83c60" : "#aa9993"} />
        <text x="303" y={Y[l.id] + 4} fontSize="14" fontWeight={l.id === settings.layer ? 700 : 400} fill={l.id === settings.layer ? "#9e3356" : "#665953"}>{l.name}</text>
      </g>)}
      <text x="303" y="247" fontSize="12" fill="#8b7e70">深部の支持組織</text>
      {masseter && <text x="42" y="190" fontSize="11" fill="#5e3734">筋内腱の模式位置</text>}
      {corrugator && <text x="39" y="145" fontSize="10" fill="#704b41">表層の筋</text>}
      {settings.exposure && settings.amount > 0 && <g opacity=".65" data-dose-halo={settings.amount}>
        <ellipse cx={tipX} cy={tipY} rx={13 + halo * 36} ry={9 + halo * 28} fill="none" stroke={model.visualAdverse > .15 ? "#c84c66" : "#7b6593"} strokeWidth="1.5" strokeDasharray="4 3" />
        {match && model.visualRelaxation > 0 && <ellipse cx={tipX} cy={tipY} rx={18 + halo * 60} ry={12 + halo * 38} fill="#7b6593" opacity={model.visualRelaxation * .7} clipPath={"url(#" + id + "-muscle)"} />}
      </g>}
      {settings.exposure && settings.amount > 0 && <text x="23" y="42" fontSize="10" fill="#84556b">相対量 {settings.amount} · 輪郭は分布の例（拡散距離ではありません）</text>}
      <path d={"M" + (tipX - 22) + " 30 L" + tipX + " " + tipY} stroke="#647480" strokeWidth="3.5" strokeLinecap="round" />
      <path d={"M" + (tipX - 21) + " 30 L" + (tipX + 1) + " " + (tipY - 3)} stroke="white" strokeWidth="1" />
      <circle cx={tipX} cy={tipY} r="5" fill="#a43e5e" stroke="#fff" strokeWidth="1.5" />
      <text x="23" y="267" fontSize="11" fill="#82736d">層の厚さ・針の角度・分布は概念表示（実寸・推奨位置ではありません）</text>
    </svg>
  );
}
