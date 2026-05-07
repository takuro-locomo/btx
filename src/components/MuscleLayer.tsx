/**
 * MuscleLayer — 表情筋の SVG レイヤー
 *
 * 座標系: 500x600（face-base.svg と同一）
 * 参照: docs/MUSCLES_AND_WRINKLES.md
 * 各筋肉を個別に ON/OFF 可能。
 *
 * 色ガイド:
 *   上部顔面 → 暖かい赤   (#d47060)
 *   中部顔面 → オレンジ赤 (#c87848)
 *   下部顔面 → ピンク赤   (#c86070)
 *   咀嚼・首 → 茶赤       (#b86858)
 */

import { useSimStore } from "../store/useSimStore";
import type { MuscleId } from "../store/useSimStore";

const C = {
  upper: { fill: "rgba(212,112,96,VAL)", stroke: "rgba(170,70,58,0.85)", strokeW: 0.8 },
  middle: { fill: "rgba(200,120,72,VAL)", stroke: "rgba(160,80,40,0.85)", strokeW: 0.8 },
  lower: { fill: "rgba(200,96,112,VAL)", stroke: "rgba(160,60,75,0.85)", strokeW: 0.8 },
  jaw: { fill: "rgba(184,104,88,VAL)", stroke: "rgba(145,65,55,0.85)", strokeW: 0.8 },
} as const;

function fillColor(template: string, alpha: number) {
  return template.replace("VAL", String(alpha));
}

interface MusclePathProps {
  id: MuscleId;
  color: typeof C[keyof typeof C];
  children: React.ReactNode;
}

function MuscleGroup({ id, color, children }: MusclePathProps) {
  const { muscleVisibility, muscleOpacity } = useSimStore();
  if (!muscleVisibility[id]) return null;
  const alpha = Math.min(1, muscleOpacity + 0.1);
  return (
    <g
      fill={fillColor(color.fill, alpha)}
      stroke={color.stroke}
      strokeWidth={color.strokeW}
    >
      {children}
    </g>
  );
}

export function MuscleLayer() {
  const { showMuscles, muscleOpacity } = useSimStore();
  if (!showMuscles) return null;

  const fib = `rgba(140,60,48,${(muscleOpacity * 0.35).toFixed(2)})`;

  return (
    <g aria-label="表情筋レイヤー">

      {/* ================================================
          側頭筋 Temporalis — 扇形、こめかみ
      ================================================ */}
      <MuscleGroup id="temporalis" color={C.jaw}>
        {/* 左 */}
        <path d="M 118 190 C 108 220, 104 265, 118 310 C 130 295, 138 272, 140 250 C 142 228, 138 205, 130 190 Z"/>
        <line x1="112" y1="205" x2="130" y2="280" stroke={fib} strokeWidth="0.7"/>
        <line x1="118" y1="200" x2="134" y2="272" stroke={fib} strokeWidth="0.7"/>
        {/* 右 */}
        <path d="M 382 190 C 392 220, 396 265, 382 310 C 370 295, 362 272, 360 250 C 358 228, 362 205, 370 190 Z"/>
        <line x1="388" y1="205" x2="370" y2="280" stroke={fib} strokeWidth="0.7"/>
        <line x1="382" y1="200" x2="366" y2="272" stroke={fib} strokeWidth="0.7"/>
      </MuscleGroup>

      {/* ================================================
          前頭筋 Frontalis — 額全体、縦走線維
      ================================================ */}
      <MuscleGroup id="frontalis" color={C.upper}>
        {/* 左半 */}
        <path d="M 158 162 C 175 150, 215 146, 248 148 L 248 200 C 215 198, 182 202, 160 207 Z"/>
        {/* 右半 */}
        <path d="M 342 162 C 325 150, 285 146, 252 148 L 252 200 C 285 198, 318 202, 340 207 Z"/>
        {/* 縦走線維 */}
        {[182,198,214,228,242].map(x => (
          <line key={x} x1={x} y1={150} x2={x} y2={200} stroke={fib} strokeWidth="0.7"/>
        ))}
        {[318,302,286,272,258].map(x => (
          <line key={x} x1={x} y1={150} x2={x} y2={200} stroke={fib} strokeWidth="0.7"/>
        ))}
      </MuscleGroup>

      {/* ================================================
          皺眉筋 Corrugator supercilii — 眉間、水平線維
      ================================================ */}
      <MuscleGroup id="corrugator" color={C.upper}>
        {/* 左（鼻根→眉外側、斜め） */}
        <path d="M 226 215 C 218 210, 200 202, 175 200 C 178 208, 195 210, 222 218 Z"/>
        {/* 右 */}
        <path d="M 274 215 C 282 210, 300 202, 325 200 C 322 208, 305 210, 278 218 Z"/>
        <line x1="226" y1="216" x2="175" y2="202" stroke={fib} strokeWidth="0.7"/>
        <line x1="274" y1="216" x2="325" y2="202" stroke={fib} strokeWidth="0.7"/>
      </MuscleGroup>

      {/* ================================================
          鼻根筋 Procerus — 鼻背上部、縦走
      ================================================ */}
      <MuscleGroup id="procerus" color={C.upper}>
        <path d="M 237 218 C 240 215, 250 213, 260 215 C 262 215, 264 222, 264 232 C 260 228, 250 226, 240 228 C 238 232, 236 225, 237 218 Z"/>
        <line x1="244" y1="215" x2="244" y2="230" stroke={fib} strokeWidth="0.7"/>
        <line x1="256" y1="215" x2="256" y2="230" stroke={fib} strokeWidth="0.7"/>
      </MuscleGroup>

      {/* ================================================
          眼輪筋 Orbicularis oculi — 目を囲むリング
      ================================================ */}
      <MuscleGroup id="orbicularis_oculi" color={C.upper}>
        {/* 左眼 外側リング */}
        <ellipse cx="197" cy="228" rx="40" ry="27" fill="none"
          stroke={fillColor(C.upper.fill, muscleOpacity)} strokeWidth="10"/>
        {/* 右眼 外側リング */}
        <ellipse cx="303" cy="228" rx="40" ry="27" fill="none"
          stroke={fillColor(C.upper.fill, muscleOpacity)} strokeWidth="10"/>
        {/* 内側の白目部分を抜く（視覚的に） */}
        <ellipse cx="197" cy="228" rx="27" ry="14" fill="rgba(253,220,200,0.9)" stroke="none"/>
        <ellipse cx="303" cy="228" rx="27" ry="14" fill="rgba(253,220,200,0.9)" stroke="none"/>
      </MuscleGroup>

      {/* ================================================
          咬筋 Masseter — 下顎、咀嚼筋
      ================================================ */}
      <MuscleGroup id="masseter" color={C.jaw}>
        {/* 左 */}
        <path d="M 120 312 C 116 338, 118 378, 126 420 C 130 438, 140 452, 152 456 C 148 432, 144 400, 142 365 C 140 340, 132 322, 120 312 Z"/>
        {[124,130,136].map((x,i)=>(
          <line key={i} x1={x} y1={320+i*5} x2={x+10} y2={440+i*5} stroke={fib} strokeWidth="0.7"/>
        ))}
        {/* 右 */}
        <path d="M 380 312 C 384 338, 382 378, 374 420 C 370 438, 360 452, 348 456 C 352 432, 356 400, 358 365 C 360 340, 368 322, 380 312 Z"/>
        {[376,370,364].map((x,i)=>(
          <line key={i} x1={x} y1={320+i*5} x2={x-10} y2={440+i*5} stroke={fib} strokeWidth="0.7"/>
        ))}
      </MuscleGroup>

      {/* ================================================
          鼻筋 Nasalis — 鼻側壁
      ================================================ */}
      <MuscleGroup id="nasalis" color={C.middle}>
        {/* 左 */}
        <path d="M 228 250 C 220 260, 218 280, 220 300 C 224 298, 228 290, 230 275 C 232 264, 232 255, 228 250 Z"/>
        {/* 右 */}
        <path d="M 272 250 C 280 260, 282 280, 280 300 C 276 298, 272 290, 270 275 C 268 264, 268 255, 272 250 Z"/>
      </MuscleGroup>

      {/* ================================================
          上唇鼻翼挙筋 LLSAN — 鼻翼外側から上唇
      ================================================ */}
      <MuscleGroup id="llsan" color={C.middle}>
        {/* 左 */}
        <path d="M 220 258 C 215 280, 212 318, 215 360 C 218 362, 222 365, 224 368 C 224 340, 224 300, 226 268 Z"/>
        {/* 右 */}
        <path d="M 280 258 C 285 280, 288 318, 285 360 C 282 362, 278 365, 276 368 C 276 340, 276 300, 274 268 Z"/>
      </MuscleGroup>

      {/* ================================================
          大頬骨筋 Zygomaticus major — 頬骨→口角、斜め
      ================================================ */}
      <MuscleGroup id="zygomaticus_major" color={C.middle}>
        {/* 左 */}
        <path d="M 152 282 C 158 288, 170 300, 195 360 C 202 380, 212 400, 220 416 C 216 416, 210 412, 204 408 C 195 388, 182 362, 168 330 C 155 302, 148 288, 148 280 Z"/>
        <line x1="150" y1="284" x2="218" y2="414" stroke={fib} strokeWidth="0.7"/>
        {/* 右 */}
        <path d="M 348 282 C 342 288, 330 300, 305 360 C 298 380, 288 400, 280 416 C 284 416, 290 412, 296 408 C 305 388, 318 362, 332 330 C 345 302, 352 288, 352 280 Z"/>
        <line x1="350" y1="284" x2="282" y2="414" stroke={fib} strokeWidth="0.7"/>
      </MuscleGroup>

      {/* ================================================
          小頬骨筋 Zygomaticus minor — 大頬骨筋の内側
      ================================================ */}
      <MuscleGroup id="zygomaticus_minor" color={C.middle}>
        {/* 左 */}
        <path d="M 168 292 C 175 308, 188 335, 205 375 C 208 383, 214 395, 220 410 C 216 410, 212 407, 210 402 C 202 384, 188 350, 175 320 C 165 302, 162 294, 164 288 Z"/>
        {/* 右 */}
        <path d="M 332 292 C 325 308, 312 335, 295 375 C 292 383, 286 395, 280 410 C 284 410, 288 407, 290 402 C 298 384, 312 350, 325 320 C 335 302, 338 294, 336 288 Z"/>
      </MuscleGroup>

      {/* ================================================
          笑筋 Risorius — 水平方向、口角外側
      ================================================ */}
      <MuscleGroup id="risorius" color={C.middle}>
        {/* 左 */}
        <path d="M 145 415 C 162 412, 188 414, 220 418 C 188 422, 162 422, 145 420 Z"/>
        <line x1="148" y1="417" x2="218" y2="418" stroke={fib} strokeWidth="0.7"/>
        {/* 右 */}
        <path d="M 355 415 C 338 412, 312 414, 280 418 C 312 422, 338 422, 355 420 Z"/>
        <line x1="352" y1="417" x2="282" y2="418" stroke={fib} strokeWidth="0.7"/>
      </MuscleGroup>

      {/* ================================================
          口輪筋 Orbicularis oris — 口を囲むリング
      ================================================ */}
      <MuscleGroup id="orbicularis_oris" color={C.lower}>
        <ellipse cx="250" cy="422" rx="40" ry="20" fill="none"
          stroke={fillColor(C.lower.fill, muscleOpacity)} strokeWidth="10"/>
        {/* 内側を肌色で抜く */}
        <ellipse cx="250" cy="422" rx="28" ry="11" fill="rgba(232,160,144,0.85)" stroke="none"/>
      </MuscleGroup>

      {/* ================================================
          口角下制筋 DAO — 口角→顎縁
      ================================================ */}
      <MuscleGroup id="dao" color={C.lower}>
        {/* 左 */}
        <path d="M 218 422 C 210 432, 200 445, 192 458 C 196 460, 202 460, 206 458 C 212 446, 218 434, 222 422 Z"/>
        <line x1="220" y1="424" x2="196" y2="456" stroke={fib} strokeWidth="0.7"/>
        {/* 右 */}
        <path d="M 282 422 C 290 432, 300 445, 308 458 C 304 460, 298 460, 294 458 C 288 446, 282 434, 278 422 Z"/>
        <line x1="280" y1="424" x2="304" y2="456" stroke={fib} strokeWidth="0.7"/>
      </MuscleGroup>

      {/* ================================================
          下唇下制筋 DLI — DAO の内側
      ================================================ */}
      <MuscleGroup id="dli" color={C.lower}>
        {/* 左 */}
        <path d="M 234 434 C 228 444, 224 455, 222 466 C 228 466, 232 464, 234 462 C 235 452, 236 442, 238 434 Z"/>
        {/* 右 */}
        <path d="M 266 434 C 272 444, 276 455, 278 466 C 272 466, 268 464, 266 462 C 265 452, 264 442, 262 434 Z"/>
      </MuscleGroup>

      {/* ================================================
          オトガイ筋 Mentalis — 顎中央
      ================================================ */}
      <MuscleGroup id="mentalis" color={C.lower}>
        {/* 左 */}
        <path d="M 235 455 C 232 462, 230 472, 232 484 C 236 484, 240 482, 242 478 C 242 468, 240 458, 235 455 Z"/>
        <line x1="237" y1="458" x2="238" y2="480" stroke={fib} strokeWidth="0.7"/>
        {/* 右 */}
        <path d="M 265 455 C 268 462, 270 472, 268 484 C 264 484, 260 482, 258 478 C 258 468, 260 458, 265 455 Z"/>
        <line x1="263" y1="458" x2="262" y2="480" stroke={fib} strokeWidth="0.7"/>
      </MuscleGroup>

      {/* ================================================
          広頸筋 Platysma — 首、広い薄い筋
      ================================================ */}
      <MuscleGroup id="platysma" color={C.jaw}>
        {/* 左半 */}
        <path d="M 175 490 C 168 510, 165 535, 172 558 C 185 552, 200 545, 215 540 C 208 520, 200 505, 190 492 Z"/>
        {/* 右半 */}
        <path d="M 325 490 C 332 510, 335 535, 328 558 C 315 552, 300 545, 285 540 C 292 520, 300 505, 310 492 Z"/>
        {/* 縦走線維 */}
        {[180,195,210].map(x=>(
          <line key={x} x1={x} y1={494} x2={x-3} y2={550} stroke={fib} strokeWidth="0.7"/>
        ))}
        {[320,305,290].map(x=>(
          <line key={x} x1={x} y1={494} x2={x+3} y2={550} stroke={fib} strokeWidth="0.7"/>
        ))}
      </MuscleGroup>

    </g>
  );
}
