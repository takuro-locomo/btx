/**
 * PatientFaceView — 悩み → タップで改善 を可視化する顔ビュー
 *
 * ベース画像 face-clean.png（素顔）に、各部位の悩み（シワ・たるみ・毛穴等）を
 * デフォルトで重ねて表示する。治療済み（タップ済み）の部位は opacity 0 でフェード。
 *
 * renderKeys … この顔に描く全キー
 * treatedKeys … 消す（治療済み）キー
 *
 * 座標系は元画像 398×400。viewBox で顔だけをトリミング。
 */

import { useId } from "react";
import type { WrinkleKey } from "../data/patientAreas";

const W = "#a9776b";
const WS = "#8f5f54";

const VB_X = 120, VB_Y = 56, VB_W = 164, VB_H = 240;

interface PathDef {
  d: string;
  w?: number;
  shadow?: boolean;
  fill?: string;
  opacity?: number;
}

const WRINKLE_PATHS: Record<WrinkleKey, PathDef[]> = {
  horizontal_forehead: [
    { d: "M 158 100 Q 200 96 242 100", w: 1.8 },
    { d: "M 156 110 Q 200 105 244 110", w: 1.8 },
    { d: "M 160 120 Q 200 116 240 120", w: 1.5 },
    { d: "M 159 101 Q 200 97 241 101", w: 0.8, shadow: true },
  ],
  glabellar_lines: [
    { d: "M 195 138 Q 194 146 194 154", w: 2 },
    { d: "M 205 138 Q 206 146 206 154", w: 2 },
    { d: "M 196 139 Q 195 146 195 153", w: 0.9, shadow: true },
  ],
  crows_feet: [
    { d: "M 151 158 L 137 149", w: 1.4 },
    { d: "M 151 165 L 134 165", w: 1.6 },
    { d: "M 151 172 L 137 181", w: 1.4 },
    { d: "M 253 158 L 267 149", w: 1.4 },
    { d: "M 253 165 L 270 165", w: 1.6 },
    { d: "M 253 172 L 267 181", w: 1.4 },
  ],
  lower_lid_wrinkles: [
    { d: "M 156 179 Q 172 176 189 179", w: 1.2 },
    { d: "M 158 185 Q 172 182 187 185", w: 1 },
    { d: "M 215 179 Q 232 176 248 179", w: 1.2 },
    { d: "M 217 185 Q 232 182 246 185", w: 1 },
  ],
  bunny_lines: [
    { d: "M 194 180 Q 189 188 189 197", w: 1.5 },
    { d: "M 206 180 Q 211 188 211 197", w: 1.5 },
  ],
  chin_lines: [
    { d: "M 191 254 Q 190 261 191 268", w: 1.4 },
    { d: "M 200 253 Q 200 261 200 269", w: 1.4 },
    { d: "M 209 254 Q 210 261 209 268", w: 1.4 },
  ],
  // フェイスラインのたるみ（ジョウル＋二重あご）
  sagging: [
    { d: "M 149 224 Q 155 248 178 262", w: 3.4, shadow: true, opacity: 0.35 },
    { d: "M 251 224 Q 245 248 222 262", w: 3.4, shadow: true, opacity: 0.35 },
    { d: "M 176 266 Q 200 278 224 266", w: 2.6, shadow: true, opacity: 0.28 },
  ],
};

interface Props {
  renderKeys: WrinkleKey[];
  treatedKeys: WrinkleKey[];
}

export function PatientFaceView({ renderKeys, treatedKeys }: Props) {
  const gid = useId();
  const treated = new Set(treatedKeys);
  const treatedCount = renderKeys.filter((k) => treated.has(k)).length;
  const glow = renderKeys.length ? treatedCount / renderKeys.length : 0;

  return (
    <svg
      viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
      className="w-full"
      role="img"
      aria-label="お顔のイラスト（気になる部位をタップで改善）"
    >
      <defs>
        <radialGradient id={gid} cx="50%" cy="44%" r="52%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={glow * 0.4} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <image href="/face-clean.png" x="0" y="0" width="398" height="400" />

      {renderKeys.map((key) => (
        <g
          key={key}
          fill="none"
          strokeLinecap="round"
          opacity={treated.has(key) ? 0 : 1}
          style={{ transition: "opacity 0.6s ease" }}
        >
          {WRINKLE_PATHS[key].map((p, i) =>
            p.fill ? (
              <path key={i} d={p.d} fill={p.fill} stroke="none" opacity={p.opacity ?? 0.5} />
            ) : (
              <path
                key={i}
                d={p.d}
                stroke={p.shadow ? WS : W}
                strokeWidth={p.w}
                opacity={p.opacity ?? (p.shadow ? 0.5 : 0.75)}
              />
            ),
          )}
        </g>
      ))}

      <rect x="0" y="0" width="398" height="400" fill={`url(#${gid})`} pointerEvents="none" />
    </svg>
  );
}
