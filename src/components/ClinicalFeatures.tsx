import { useId } from "react";
import type { ClinicalModelResult, ClinicalSettings } from "../types/botox";

// Native SVG expressions over the existing illustration. All distances are drawing
// units, intentionally emphasized for comparison, not estimates of clinical change.
export function ClinicalFeatures({ settings, model, before, motion = 1, hideSelectedWrinkles = false }: {
  settings: ClinicalSettings; model: ClinicalModelResult; before: boolean; motion?: number; hideSelectedWrinkles?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const e = settings.expression / 100 * motion;
  const active = e * (before ? 1 : 1 - model.visualRelaxation);
  const a = before ? 0 : model.visualAdverse;
  const region = settings.region;
  const brow = region === "forehead" || region === "glabella";
  const eyes = region === "eyes" || region === "glabella";
  const mouth = ["gummy", "lips", "dao", "chin", "bunny"].includes(region);
  const browDrop = model.adverse === "brow" ? a * 9 : 0;
  const browLift = region === "forehead" ? active * -11 : 0;
  const frown = region === "glabella" ? active : 0;
  const lipWeakness = model.adverse === "lip" ? a : 0;
  const smileWeakness = model.adverse === "smile" ? a : 0;
  const lowerWeakness = model.adverse === "lowerLip" ? a : 0;
  // Keep the effort to smile and the mouth corners comparable. Only the
  // targeted upper-lip lift varies in the gummy-smile explanation.
  const smile = region === "gummy" ? e : region === "bunny" ? e * .65 : 0;
  const upperLipLift = region === "gummy" ? active * 11 : smile * 11;
  const width = region === "lips" ? 22 - active * 8 : 23;
  const leftX = 200 - width, rightX = 200 + width;
  const corner = 238 + (region === "dao" ? active * 8 : -smile * 5);
  const topLeft = 233 - upperLipLift;
  const topRight = topLeft + smileWeakness * e * 11;
  const gap = smile * 10 + lipWeakness * 7;
  const bottomLeft = 240 + gap * .55;
  const bottomRight = bottomLeft - lowerWeakness * e * 9;
  return <g className="clinical-features" pointerEvents="none" data-before={before}>
    <defs>
      <filter id={uid + "-blend"} x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="1.2" /></filter>
    </defs>
    {brow && <g data-feature="brows" data-shift={browLift + browDrop}>
      <g fill="#fce9e1" filter={"url(#" + uid + "-blend)"}>
        <ellipse cx="164" cy="141" rx="26" ry="9" /><ellipse cx="237" cy="141" rx="26" ry="9" />
      </g>
      <g transform={`translate(0 ${browLift + browDrop})`} className="moving-feature" fill="none" stroke="#a48879" strokeWidth="3.6" strokeLinecap="round">
        <path d={`M145 143 Q161 ${137 + frown * 3} ${181 + frown * 8} ${142 + frown * 8}`} />
        <path d={`M${219 - frown * 8} ${142 + frown * 8} Q239 ${137 + frown * 3} 256 143`} />
      </g>
      {browDrop > 1 && <g fill="none" stroke="#b13d54" strokeWidth=".9" opacity=".8">
        <path d="M144 140 Q162 134 183 140 M217 140 Q238 134 258 140" strokeDasharray="2 2" />
        <path d={`M151 145 v${browDrop} l-2 -3 m2 3 l2 -3 M249 145 v${browDrop} l-2 -3 m2 3 l2 -3`} />
      </g>}
    </g>}
    {eyes && [160, 240].map((cx, index) => {
      // A gentle smile, not a forced eye closure, in the normal comparison.
      // The closure attempt belongs only to the explicitly selected risk example.
      const closureAttempt = region === "eyes" && !before && model.adverse === "closure" && a > 0;
      const closing = region === "eyes"
        ? closureAttempt ? e * (index === 0 ? .94 : .32) * a : e * .12
        : 0;
      const droop = index === 1 && model.adverse === "eyelid" ? a * 12 : 0;
      const top = 150 + closing * 15 + droop;
      const bottom = 179 - closing * 12;
      const path = `M${cx - 17} 165 Q${cx} ${top} ${cx + 17} 165 Q${cx} ${Math.max(top + 1, bottom)} ${cx - 17} 165Z`;
      return <g key={cx} data-feature={index === 1 ? "right-eye" : "left-eye"} data-droop={droop} data-closing={closing}>
        <ellipse cx={cx} cy="165" rx="22" ry="16" fill="#fbe6df" filter={"url(#" + uid + "-blend)"} />
        <clipPath id={uid + "-eye-" + index}><path d={path} /></clipPath>
        <path data-eye-opening="true" d={path} fill="#fffaf7" stroke="#b9a096" strokeWidth=".7" />
        <g clipPath={`url(#${uid}-eye-${index})`}>
          <circle cx={cx} cy="165" r="5.7" fill="#b3a49a" /><circle cx={cx} cy="165" r="3.5" fill="#6a605b" />
          <circle cx={cx - 1.5} cy="163.5" r="1.3" fill="white" />
        </g>
        <path d={`M${cx - 17} 165 Q${cx} ${top} ${cx + 17} 165`} fill="none" stroke="#947d73" strokeWidth="1.5" strokeLinecap="round" />
        {droop > 1 && <path d={`M${cx + 22} 155 v${droop} l-2 -3 m2 3 l2 -3`} stroke="#b13d54" strokeWidth="1" fill="none" />}
      </g>;
    })}
    {mouth && <g data-feature="mouth" data-asymmetry={smileWeakness + lowerWeakness} data-gap={gap} data-corner={corner} data-upper-lip-lift={upperLipLift}>
      <ellipse cx="200" cy="240" rx="30" ry="20" fill="#fce6dd" filter={"url(#" + uid + "-blend)"} />
      <path d={`M${leftX} ${corner} Q188 ${topLeft} 200 ${topLeft + 1} Q211 ${topRight} ${rightX} ${corner} Q213 ${bottomRight + 7} 200 ${bottomLeft + 8} Q187 ${bottomLeft + 7} ${leftX} ${corner}Z`} fill="#e6ac9c" opacity=".9" />
      <path d={`M${leftX + 1} ${corner} Q187 ${topLeft + 4} 200 ${topLeft + 5} Q213 ${topRight + 3} ${rightX - 1} ${corner} Q212 ${bottomRight} 200 ${bottomLeft} Q188 ${bottomLeft} ${leftX + 1} ${corner}Z`} fill={gap > .4 ? "#875e57" : "#c98d80"} />
      {smile > .08 && <path d={`M181 ${corner - 1} Q188 ${topLeft + 4} 200 ${topLeft + 5} Q212 ${topRight + 3} 219 ${corner - 1} L214 ${corner + 2} Q199 ${topLeft + 10} 185 ${corner + 2}Z`} fill="#fff8ec" />}
      {region === "gummy" && smile > .1 && <path d={`M183 ${corner - 2} Q199 ${topLeft + 2} 217 ${corner - 2}`} stroke="#d38d89" strokeWidth={active * 3} fill="none" />}
      <path d={`M${leftX} ${corner} Q185 ${topLeft - 1} 195 ${topLeft} L200 ${topLeft + 2} L205 ${topRight} Q215 ${topRight - 1} ${rightX} ${corner}`} stroke="#b78275" strokeWidth=".75" fill="none" />
      {a > .15 && <path d={`M${rightX + 4} 230 v${6 + a * 7} l-2 -3 m2 3 l2 -3`} stroke="#b13d54" strokeWidth="1" fill="none" />}
    </g>}
    {region === "chin" && <g fill="none" stroke="#ad7a6a" strokeWidth="1" opacity={!before && hideSelectedWrinkles ? 0 : .12 + active * .65} data-feature="chin-dimples">
      {[188, 196, 204, 212].map((x, i) => <path key={x} d={`M${x} ${260 + i % 2 * 4} q-2 3 1 4 M${x + 2} ${269 - i % 2 * 2} q1 2 3 1`} />)}
    </g>}
    {region === "masseter" && <g data-feature="masseter-bulge" fill="#efd0c3" stroke="#c39483" strokeWidth=".7">
      <ellipse cx="145" cy="231" rx={2 + active * 5} ry={13 + active * 3} opacity={.15 + active * .55} />
      <ellipse cx="255" cy="231" rx={2 + active * 5 + a * e * 6} ry={13 + active * 3} opacity={.15 + Math.max(active, a * e) * .55} />
      {a > .15 && e > .1 && <ellipse cx="256" cy="231" rx={7 + a * 3} ry="17" fill="none" stroke="#b13d54" strokeDasharray="2 2" />}
    </g>}
  </g>;
}
