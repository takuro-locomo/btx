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
import type { MouseEvent } from "react";
import type { WrinkleKey } from "../data/patientAreas";

const W = "#a9776b";
const WS = "#8f5f54";

const VB_X = 120, VB_Y = 56, VB_W = 164, VB_H = 300;

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
  // 首の縦すじ（プラティスマバンド）
  platysmal_bands: [
    { d: "M 183 298 Q 180 320 177 342", w: 2.4, shadow: true, opacity: 0.3 },
    { d: "M 200 300 Q 200 322 200 346", w: 2.2, shadow: true, opacity: 0.26 },
    { d: "M 217 298 Q 220 320 223 342", w: 2.4, shadow: true, opacity: 0.3 },
  ],
};

interface Rect { x: number; y: number; w: number; h: number; }

/** 顔上のタップ領域（実際のしわの位置） */
const HIT_BY_KEY: Record<WrinkleKey, Rect[]> = {
  horizontal_forehead: [{ x: 152, y: 88, w: 96, h: 42 }],
  glabellar_lines: [{ x: 184, y: 130, w: 32, h: 34 }],
  crows_feet: [
    { x: 128, y: 146, w: 32, h: 42 },
    { x: 240, y: 146, w: 32, h: 42 },
  ],
  lower_lid_wrinkles: [
    { x: 150, y: 170, w: 46, h: 22 },
    { x: 210, y: 170, w: 46, h: 22 },
  ],
  bunny_lines: [{ x: 184, y: 174, w: 32, h: 28 }],
  chin_lines: [{ x: 180, y: 246, w: 40, h: 30 }],
  sagging: [
    { x: 138, y: 214, w: 42, h: 54 },
    { x: 220, y: 214, w: 42, h: 54 },
  ],
  platysmal_bands: [{ x: 168, y: 292, w: 64, h: 58 }],
};

interface HitArea {
  id: string;
  keys: WrinkleKey[];
}

interface Props {
  renderKeys: WrinkleKey[];
  treatedKeys: WrinkleKey[];
  /** 顔を直接タップして治療できるようにする（段1） */
  hitAreas?: HitArea[];
  treatedIds?: string[];
  onToggleArea?: (id: string, e?: MouseEvent) => void;
  /** 打ちすぎ状態（眼瞼下垂＝まぶたが下がる） */
  overdose?: boolean;
}

export function PatientFaceView({
  renderKeys,
  treatedKeys,
  hitAreas,
  treatedIds = [],
  onToggleArea,
  overdose = false,
}: Props) {
  const gid = useId();
  const treated = new Set(treatedKeys);
  const treatedIdSet = new Set(treatedIds);
  const treatedCount = renderKeys.filter((k) => treated.has(k)).length;
  const glow = renderKeys.length ? treatedCount / renderKeys.length : 0;

  return (
    <svg
      viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
      className="block w-full mx-auto"
      style={{ touchAction: "manipulation" }}
      role="img"
      aria-label="お顔のイラスト（気になる部位をタップで改善）"
    >
      <defs>
        <radialGradient id={gid} cx="50%" cy="44%" r="52%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={glow * 0.4} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        {/* svg要素の縦横比がviewBoxとずれても、元画像のラベル円等が見えないようクリップ */}
        <clipPath id={`${gid}-clip`}>
          <rect x={VB_X} y={VB_Y} width={VB_W} height={VB_H} />
        </clipPath>
      </defs>

      <image
        href="/face-clean.png"
        x="0"
        y="0"
        width="398"
        height="400"
        clipPath={`url(#${gid}-clip)`}
      />

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

      {/* 打ちすぎ演出：眼瞼下垂でまぶたが下がる */}
      <g
        opacity={overdose ? 1 : 0}
        style={{ transition: "opacity 0.35s ease" }}
        pointerEvents="none"
      >
        {/* 左まぶた */}
        <ellipse cx="163" cy="165" rx="19" ry="10" fill="#f6ddcc" />
        <path
          d="M 146 167 Q 163 176 180 167"
          stroke="#8a6a52"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        {/* 右まぶた */}
        <ellipse cx="236" cy="165" rx="19" ry="10" fill="#f6ddcc" />
        <path
          d="M 219 167 Q 236 176 253 167"
          stroke="#8a6a52"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        {/* 困りマーク */}
        <text x="262" y="130" fontSize="20" pointerEvents="none">
          💦
        </text>
      </g>

      {/* 顔の各しわ位置をタップして治療 */}
      {hitAreas?.map((area) => {
        const done = treatedIdSet.has(area.id);
        const rects = area.keys.flatMap((k) => HIT_BY_KEY[k]);
        return (
          <g key={area.id} onClick={(e) => onToggleArea?.(area.id, e)} style={{ cursor: "pointer" }}>
            {rects.map((r, i) => (
              <g key={i}>
                {/* タップ領域（透明） */}
                <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="transparent" />
                {/* 未治療の目印（ふわっと点滅＋広がる波紋） */}
                {!done && (
                  <g pointerEvents="none">
                    <circle
                      className="animate-pulse"
                      cx={r.x + r.w / 2}
                      cy={r.y + r.h / 2}
                      r="7"
                      fill="#f43f5e"
                      opacity="0.35"
                    />
                    <circle
                      cx={r.x + r.w / 2}
                      cy={r.y + r.h / 2}
                      r="7"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="1.6"
                    >
                      <animate attributeName="r" values="7;14" dur="1.5s" repeatCount="indefinite" />
                      <animate
                        attributeName="opacity"
                        values="0.55;0"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                )}
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
