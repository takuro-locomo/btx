/**
 * PatientFaceView — 患者向けビフォー/アフター顔ビュー（実写風イラストベース）
 *
 * ベース画像 face-clean.png（プロのボツリヌス施術イラストを加工した
 * クリーンな素顔）に、選択部位のしわを重ねて表示する。
 * effect: 0=施術前（しわあり）→ 1=施術後（しわ消失＋ツヤ）。
 *
 * 座標系は元画像 398×400。顔だけを大きく見せるよう viewBox でトリミング。
 */

import type { WrinkleKey } from "../data/patientAreas";

const W = "#a9776b";        // しわ本体
const WS = "#8f5f54";       // しわの陰
const PORE = "#b48b7a";     // 毛穴

// 顔だけを見せるトリミング（クリーン画像のランドマークに整合）
const VB_X = 120, VB_Y = 56, VB_W = 164, VB_H = 240;

interface Props {
  activeKeys: WrinkleKey[];
  effect: number; // 0..1
}

// 毛穴のドット（頬・鼻に散らす）。極短パス＋丸キャップで点として描画
const PORE_DOTS = [
  [146, 196], [154, 204], [149, 213], [160, 210], [156, 222], [165, 218],
  [143, 205], [162, 199], [151, 228], [168, 226],
  [252, 196], [244, 204], [249, 213], [238, 210], [242, 222], [233, 218],
  [255, 205], [236, 199], [247, 228], [230, 226],
  [196, 202], [204, 205], [200, 212], [193, 210], [207, 211],
] as const;

const WRINKLE_PATHS: Record<WrinkleKey, { d: string; w: number; shadow?: boolean; pore?: boolean }[]> = {
  // 額の横じわ
  horizontal_forehead: [
    { d: "M 158 100 Q 200 96 242 100", w: 1.8 },
    { d: "M 156 110 Q 200 105 244 110", w: 1.8 },
    { d: "M 160 120 Q 200 116 240 120", w: 1.5 },
    { d: "M 159 101 Q 200 97 241 101", w: 0.8, shadow: true },
  ],
  // 眉間の縦じわ（"11"）
  glabellar_lines: [
    { d: "M 195 138 Q 194 146 194 154", w: 2 },
    { d: "M 205 138 Q 206 146 206 154", w: 2 },
    { d: "M 196 139 Q 195 146 195 153", w: 0.9, shadow: true },
  ],
  // 目尻のカラスの足あと
  crows_feet: [
    { d: "M 151 158 L 137 149", w: 1.4 },
    { d: "M 151 165 L 134 165", w: 1.6 },
    { d: "M 151 172 L 137 181", w: 1.4 },
    { d: "M 253 158 L 267 149", w: 1.4 },
    { d: "M 253 165 L 270 165", w: 1.6 },
    { d: "M 253 172 L 267 181", w: 1.4 },
  ],
  // 目の下の小じわ
  lower_lid_wrinkles: [
    { d: "M 156 179 Q 172 176 189 179", w: 1.2 },
    { d: "M 158 185 Q 172 182 187 185", w: 1 },
    { d: "M 215 179 Q 232 176 248 179", w: 1.2 },
    { d: "M 217 185 Q 232 182 246 185", w: 1 },
  ],
  // バニーライン（鼻根の側方）
  bunny_lines: [
    { d: "M 194 180 Q 189 188 189 197", w: 1.5 },
    { d: "M 206 180 Q 211 188 211 197", w: 1.5 },
  ],
  // アゴの梅干しじわ
  chin_lines: [
    { d: "M 191 254 Q 190 261 191 268", w: 1.4 },
    { d: "M 200 253 Q 200 261 200 269", w: 1.4 },
    { d: "M 209 254 Q 210 261 209 268", w: 1.4 },
  ],
  // 毛穴（マイクロボトックス）
  pores: PORE_DOTS.map(([x, y]) => ({ d: `M ${x} ${y} l 0.1 0`, w: 1.8, pore: true })),
};

export function PatientFaceView({ activeKeys, effect }: Props) {
  const wrinkleOpacity = Math.max(0, 1 - effect);

  return (
    <svg
      viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
      className="w-full"
      role="img"
      aria-label="お顔のイラスト（施術前後の変化）"
    >
      <defs>
        <radialGradient id="afterGlow" cx="50%" cy="44%" r="52%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={effect * 0.4} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ベースの素顔 */}
      <image href="/face-clean.png" x="0" y="0" width="398" height="400" />

      {/* しわ（施術前で表示 → 施術後で消える） */}
      <g
        fill="none"
        strokeLinecap="round"
        opacity={wrinkleOpacity}
        style={{ transition: "opacity 0.6s ease" }}
      >
        {activeKeys.flatMap((key) =>
          WRINKLE_PATHS[key].map((p, i) => (
            <path
              key={`${key}-${i}`}
              d={p.d}
              stroke={p.pore ? PORE : p.shadow ? WS : W}
              strokeWidth={p.w}
              opacity={p.pore ? 0.5 : p.shadow ? 0.5 : 0.75}
            />
          )),
        )}
      </g>

      {/* 施術後のツヤ */}
      <rect x="0" y="0" width="398" height="400" fill="url(#afterGlow)" pointerEvents="none" />
    </svg>
  );
}
