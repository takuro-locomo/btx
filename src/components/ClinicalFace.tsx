import { useId } from "react";
import { ClinicalFeatures } from "./ClinicalFeatures";
import { CLINICAL_REGIONS } from "../data/clinical";
import type { ClinicalModelResult, ClinicalRegionId, ClinicalSettings, PatientTreatmentArea } from "../types/botox";

// Projection onto the existing face illustration. Coordinates are drawing units.
// Reuses the original anatomy layer's regional structure with finer fiber paths.
const MUSCLES: { id: ClinicalRegionId; d: string; rotation: number }[] = [
  { id: "forehead", d: "M151 137 Q149 110 158 88 Q175 81 195 85 L196 143 Q175 136 151 146Z M205 85 Q227 81 243 88 Q251 111 249 146 Q226 136 204 143Z", rotation: 0 },
  { id: "glabella", d: "M195 151 Q187 149 169 139 Q181 137 195 143Z M205 151 Q214 149 231 139 Q219 137 205 143Z M195 151 L205 151 L204 181 Q200 178 196 181Z", rotation: 25 },
  { id: "eyes", d: "M143 159 C143 130 196 131 198 158 C201 189 142 189 143 159Z M155 161 C157 151 187 151 188 161 C187 171 157 174 155 161Z M203 158 C204 131 257 130 258 159 C260 189 201 189 203 158Z M213 161 C214 151 244 151 246 161 C244 174 214 171 213 161Z", rotation: 90 },
  { id: "bunny", d: "M185 195 L194 186 L198 203 L190 207Z M216 195 L207 186 L203 203 L211 207Z", rotation: 70 },
  { id: "gummy", d: "M184 174 Q188 196 181 224 L190 230 Q195 198 190 176Z M217 174 Q213 196 220 224 L211 230 Q206 198 211 176Z", rotation: 8 },
  { id: "lips", d: "M177 236 Q185 223 199 227 Q215 221 225 236 Q221 252 200 253 Q181 251 177 236Z M184 238 Q199 246 218 238 Q203 231 200 235 Q195 231 184 238Z", rotation: 90 },
  { id: "dao", d: "M178 237 Q169 241 159 257 L176 266 Q180 250 181 239Z M223 237 Q232 241 242 257 L225 266 Q221 250 220 239Z", rotation: 25 },
  { id: "chin", d: "M190 251 Q186 259 191 272 L198 271 L198 252Z M210 251 Q215 259 209 272 L202 271 L202 252Z", rotation: 0 },
  { id: "masseter", d: "M137 200 L154 203 Q158 224 164 248 L152 257 Q139 242 136 219Z M264 200 L247 203 Q243 224 237 248 L249 257 Q262 242 265 219Z", rotation: -18 },
  { id: "neck", d: "M174 276 Q181 292 164 342 L196 349 L195 282Z M227 276 Q220 292 237 342 L205 349 L206 282Z", rotation: 10 },
];
const WRINKLES: Partial<Record<ClinicalRegionId, string[]>> = {
  forehead: ["M158 104 Q200 97 242 104", "M156 115 Q200 109 244 115", "M160 126 Q200 119 240 126"],
  glabella: ["M195 138 Q192 147 194 155", "M205 138 Q208 147 206 155"],
  eyes: ["M140 159 Q133 157 128 152", "M139 165 Q132 164 125 165", "M141 171 Q134 174 129 180", "M260 159 Q267 157 272 152", "M261 165 Q268 164 275 165", "M259 171 Q266 174 271 180"],
  bunny: ["M189 184 Q185 191 187 199", "M211 184 Q215 191 213 199"],
  lips: ["M187 223 L187 228", "M194 221 L194 226", "M207 221 L207 226", "M214 223 L214 228"],
  chin: ["M191 255 Q189 261 192 267", "M200 255 L200 268", "M209 255 Q211 261 208 267"],
  neck: ["M181 293 Q180 320 175 340", "M220 293 Q221 320 226 340"],
};

interface Props {
  settings: ClinicalSettings;
  model: ClinicalModelResult;
  zoom?: boolean;
  motion?: number;
  skin: number;
  muscles: boolean;
  landmarks: boolean;
  before: boolean;
  onSelect: (id: ClinicalRegionId) => void;
  treatmentAreas?: PatientTreatmentArea[];
  showTreatmentAreas?: boolean;
  accessibleLabel?: string;
  skinAreas?: PatientTreatmentArea[];
  /** Patient illustration only: omit the selected after-image creases for clarity. */
  hideSelectedWrinkles?: boolean;
}
export function ClinicalFace({ settings, model, skin, muscles, landmarks, before, onSelect, zoom = false, motion = 1, treatmentAreas, showTreatmentAreas = true, accessibleLabel, skinAreas, hideSelectedWrinkles = false }: Props) {
  const uid = useId().replace(/:/g, "");
  const includeNeck = settings.region === "neck";
  const expression = settings.expression / 100 * motion;
  const active = (before ? 1 : 1 - model.visualRelaxation) * expression;
  const skinIntensity = before ? 1 : 1 - model.visualRelaxation;
  let skinViewBox = "138 85 124 190";
  if (skinAreas?.length) {
    const left = Math.min(...skinAreas.map(p => p.x - p.rx)) - 9;
    const top = Math.min(...skinAreas.map(p => p.y - p.ry)) - 9;
    const right = Math.max(...skinAreas.map(p => p.x + p.rx)) + 9;
    const bottom = Math.max(...skinAreas.map(p => p.y + p.ry)) + 9;
    skinViewBox = `${left} ${top} ${right - left} ${bottom - top}`;
  }
  const focus: Record<ClinicalRegionId, string> = {
    forehead: "140 82 120 88", glabella: "163 121 74 62", eyes: model.adverse === "closure" ? "123 136 154 58" : "122 136 78 58",
    bunny: "169 176 62 72", gummy: "167 205 66 53", lips: "167 215 66 45",
    dao: "153 217 94 58", chin: "167 235 66 43", masseter: "125 196 150 70", neck: "151 275 98 75",
  };
  return (
    <svg role="img" viewBox={zoom ? skinAreas ? skinViewBox : focus[settings.region] : includeNeck ? "120 58 164 296" : "120 58 164 224"} className="clinical-face-svg" data-face={before ? "before" : "after"} data-relaxation={before ? 0 : model.visualRelaxation} aria-label={accessibleLabel ?? (before ? "作用前" : "現在の条件") + "の顔面モデル。変化を強調した模式表示"}>
      <defs>
        <pattern id={uid + "-pores"} width="4.2" height="4.2" patternUnits="userSpaceOnUse">
          <ellipse cx="2" cy="2" rx={.35 + skinIntensity * .45} ry={.45 + skinIntensity * .55} fill="#a87660" fillOpacity={.15 + skinIntensity * .5} />
        </pattern>
        <clipPath id={uid + "-face"}><rect x="120" y="58" width="164" height="296" /></clipPath>
        {MUSCLES.map((m, i) => (
          <pattern key={m.id} id={uid + "-fib-" + m.id} width="2.6" height="5" patternUnits="userSpaceOnUse" patternTransform={"rotate(" + m.rotation + ")"}>
            <rect width="2.6" height="5" fill={i < 3 ? "#d98679" : "#c97967"} />
            <path d="M.5 0V5 M1.2 0V5" stroke="#f4beaa" strokeWidth=".35" />
            <path d="M2 0V5" stroke="#99584e" strokeWidth=".35" />
          </pattern>
        ))}
      </defs>
      <image href="/face-clean.png" x="0" y="0" width="398" height="400" clipPath={"url(#" + uid + "-face)"} />
      {!skinAreas && <ClinicalFeatures hideSelectedWrinkles={hideSelectedWrinkles} settings={settings} model={model} before={before} motion={motion} />}
      {skinAreas && <g data-skin-example="micro" data-intensity={skinIntensity} pointerEvents="none">
        {skinAreas.map((p, i) => <g key={i}>
          <ellipse cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill={"url(#" + uid + "-pores)"} />
          <ellipse cx={p.x - p.rx * .25} cy={p.y - p.ry * .25} rx={p.rx * .35} ry={p.ry * .6} fill="white" opacity={skinIntensity * .42} />
        </g>)}
        {!before && model.visualAdverse > 0 && skinAreas.slice(0, 1).map(p => <g key="bruising" data-feature="skin-bruising" fill="#936381" fillOpacity=".52">
          <ellipse cx={p.x - 4} cy={p.y + 4} rx="3.2" ry="2.4" /><ellipse cx={p.x + 4} cy={p.y - 3} rx="2.1" ry="2.8" />
        </g>)}
      </g>}
      {muscles && (
        <g opacity={(100 - skin) / 100} className="muscle-overlay" aria-label="筋の位置関係の模式表示">
          {/* Adjacent zygomaticus and DLI are muted context, not treatment targets. */}
          <g fill="#dbae9d" stroke="#b78978" strokeWidth=".5">
            <path d="M151 182 L146 190 L179 237 L184 234Z M250 182 L255 190 L222 237 L217 234Z" />
            <path d="M181 249 L181 267 L191 259 L191 248Z M220 249 L220 267 L210 259 L210 248Z" />
          </g>
          {MUSCLES.map(m => {
            const selected = m.id === settings.region;
            const scale = selected ? 1 - active * .1 : 1;
            return <path key={m.id} d={m.d} fill={selected && !before && model.visualRelaxation > .35 ? "#a4aaca" : "url(#" + uid + "-fib-" + m.id + ")"} fillRule="evenodd"
              stroke={selected ? "#7e3742" : "#aa7666"} strokeWidth={selected ? 1.2 : .4}
              opacity={selected ? 1 : .38}
              style={{ transform: "scaleY(" + scale + ")", transformBox: "fill-box", transformOrigin: "center", transition: "transform .4s ease, opacity .3s" }} />;
          })}
        </g>
      )}
      {/* Clinical mode retains resting lines; the patient schematic can omit selected after-image lines. */}
      {!skinAreas && Object.entries(WRINKLES).map(([id, paths]) => (
        <g key={id} data-wrinkle-region={id} fill="none" stroke="#946859" strokeWidth={id === settings.region ? .8 + active * 1.2 : .6} strokeLinecap="round"
          opacity={id === settings.region ? !before && hideSelectedWrinkles ? 0 : .08 + active * .9 : .06}
          style={{ transition: "opacity .45s" }}>
          {paths.map(d => <path key={d} d={d} />)}
        </g>
      ))}
      {muscles && expression > 0 && <g stroke="#743d56" strokeWidth=".85" fill="none" opacity=".85" pointerEvents="none">
        {(settings.region === "forehead" ? [{ x: 176, y: 122, dx: 0, dy: -13 }, { x: 226, y: 122, dx: 0, dy: -13 }]
          : settings.region === "glabella" ? [{ x: 179, y: 139, dx: 9, dy: 4 }, { x: 222, y: 139, dx: -9, dy: 4 }]
          : settings.region === "eyes" ? [{ x: 146, y: 151, dx: 4, dy: 9 }, { x: 255, y: 151, dx: -4, dy: 9 }]
          : settings.region === "dao" ? [{ x: 174, y: 241, dx: -4, dy: 13 }, { x: 227, y: 241, dx: 4, dy: 13 }]
          : settings.region === "masseter" ? [{ x: 150, y: 238, dx: -3, dy: -16 }, { x: 251, y: 238, dx: 3, dy: -16 }]
          : settings.region === "chin" ? [{ x: 192, y: 267, dx: 0, dy: -9 }, { x: 208, y: 267, dx: 0, dy: -9 }]
          : settings.region === "gummy" ? [{ x: 186, y: 220, dx: 0, dy: -12 }, { x: 215, y: 220, dx: 0, dy: -12 }]
          : settings.region === "neck" ? [{ x: 183, y: 302, dx: -4, dy: 15 }, { x: 218, y: 302, dx: 4, dy: 15 }]
          : []).map((v, i) => {
          const length = .08 + active * .92;
          const x = v.x + v.dx * length, y = v.y + v.dy * length;
          const angle = Math.atan2(v.dy, v.dx);
          return <g key={i}><path d={"M" + v.x + " " + v.y + " L" + x + " " + y} /><path d={"M" + (x - 3 * Math.cos(angle - .5)) + " " + (y - 3 * Math.sin(angle - .5)) + " L" + x + " " + y + " L" + (x - 3 * Math.cos(angle + .5)) + " " + (y - 3 * Math.sin(angle + .5))} /></g>;
        })}
      </g>}
      {landmarks && <g fill="none" stroke="#557e89" strokeWidth=".65" strokeDasharray="2 2" opacity=".9" pointerEvents="none">
        <path d="M139 158 C140 123 199 126 199 159 M202 159 C203 126 261 123 262 158" />
        <path d="M173 84 V272 M228 84 V272" />
        <text x="125" y="80" fontSize="5.4" fill="#42616c" stroke="none">瞳孔線・眼窩上縁の概念位置</text>
      </g>}
      {treatmentAreas && <g data-treatment-area={skinAreas ? "micro" : settings.region} opacity={showTreatmentAreas ? 1 : 0} aria-hidden={!showTreatmentAreas} fill="#d74278" fillOpacity=".2" stroke="#b5265c" strokeWidth=".9" strokeDasharray="2 1.4" pointerEvents="none">
        {treatmentAreas.map((p, i) => <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} />)}
      </g>}
      {!before && muscles && CLINICAL_REGIONS.filter(r => includeNeck || r.id !== "neck").map(r => r.points.map((p, i) => {
        const selected = r.id === settings.region;
        return <g key={r.id + i} role="button" tabIndex={0} aria-label={r.name + "を選択"} aria-pressed={selected}
          className="face-selector" onClick={() => onSelect(r.id)}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(r.id); } }}>
          <circle cx={p.x} cy={p.y} r="8.2" fill="transparent" />
          <circle cx={p.x} cy={p.y} r={selected ? 4.8 : 3.3} fill={selected ? "#b43e64" : "#fff"} stroke={selected ? "#fff" : "#b43e64"} strokeWidth="1" />
          {selected && <circle cx={p.x} cy={p.y} r="1.45" fill="white" />}
        </g>;
      }))}

    </svg>
  );
}
