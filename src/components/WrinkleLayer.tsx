/**
 * WrinkleLayer — しわを部位ごとに表示/非表示、シミュレーション結果で改善
 *
 * 座標系: 500x600（face-base.svg と同一）
 * 各しわは wrinkleVisibility で個別 ON/OFF 可能。
 * シミュレーション結果がある場合、改善度に応じて opacity が下がる。
 */

import { useSimStore } from "../store/useSimStore";
import type { WrinkleToggleId } from "../store/useSimStore";

const WRINKLE_COLOR = "#d08080";
const WRINKLE_SHADOW = "#c07070";

interface WrinkleProps {
  id: WrinkleToggleId;
  improvement?: number; // 0-1
  children: React.ReactNode;
}

function Wrinkle({ id, improvement = 0, children }: WrinkleProps) {
  const { wrinkleVisibility } = useSimStore();
  if (!wrinkleVisibility[id]) return null;
  const opacity = 1 - improvement;
  return (
    <g
      fill="none"
      strokeLinecap="round"
      opacity={opacity}
      style={{ transition: "opacity 0.8s ease" }}
      aria-hidden="true"
    >
      {children}
    </g>
  );
}

export function WrinkleLayer() {
  const { result } = useSimStore();
  const imp = (result?.wrinkleImprovements ?? {}) as Partial<Record<string, number>>;

  return (
    <g>
      {/* ── 眉間の縦じわ "11" ── */}
      <Wrinkle id="glabellar_lines" improvement={imp.glabellar_lines}>
        <path d="M 235 210 Q 233 222 231 236" stroke={WRINKLE_COLOR} strokeWidth="2.2"/>
        <path d="M 265 210 Q 267 222 269 236" stroke={WRINKLE_COLOR} strokeWidth="2.2"/>
        <path d="M 237 212 Q 235 223 233 235" stroke={WRINKLE_SHADOW} strokeWidth="1" opacity="0.5"/>
        <path d="M 263 212 Q 265 223 267 235" stroke={WRINKLE_SHADOW} strokeWidth="1" opacity="0.5"/>
      </Wrinkle>

      {/* ── 額の横じわ ── */}
      <Wrinkle id="horizontal_forehead" improvement={imp.horizontal_forehead}>
        <path d="M 178 158 Q 250 151 322 158" stroke={WRINKLE_COLOR} strokeWidth="1.8"/>
        <path d="M 172 173 Q 250 166 328 173" stroke={WRINKLE_COLOR} strokeWidth="1.8"/>
        <path d="M 168 188 Q 250 181 332 188" stroke={WRINKLE_COLOR} strokeWidth="1.5"/>
        <path d="M 180 159 Q 250 152 320 159" stroke={WRINKLE_SHADOW} strokeWidth="0.8" opacity="0.4"/>
        <path d="M 174 174 Q 250 167 326 174" stroke={WRINKLE_SHADOW} strokeWidth="0.8" opacity="0.4"/>
      </Wrinkle>

      {/* ── 目尻のしわ（カラスの足跡） ── */}
      <Wrinkle id="crows_feet" improvement={imp.crows_feet}>
        {/* 左目尻 */}
        <path d="M 172 220 L 146 206" stroke={WRINKLE_COLOR} strokeWidth="1.5"/>
        <path d="M 172 228 L 143 225" stroke={WRINKLE_COLOR} strokeWidth="1.8"/>
        <path d="M 172 236 L 146 248" stroke={WRINKLE_COLOR} strokeWidth="1.5"/>
        <path d="M 170 222 L 148 212" stroke={WRINKLE_SHADOW} strokeWidth="0.8" opacity="0.4"/>
        {/* 右目尻 */}
        <path d="M 328 220 L 354 206" stroke={WRINKLE_COLOR} strokeWidth="1.5"/>
        <path d="M 328 228 L 357 225" stroke={WRINKLE_COLOR} strokeWidth="1.8"/>
        <path d="M 328 236 L 354 248" stroke={WRINKLE_COLOR} strokeWidth="1.5"/>
        <path d="M 330 222 L 352 212" stroke={WRINKLE_SHADOW} strokeWidth="0.8" opacity="0.4"/>
      </Wrinkle>

      {/* ── バニーライン（鼻側方） ── */}
      <Wrinkle id="bunny_lines" improvement={imp.bunny_lines}>
        {/* 左 */}
        <path d="M 232 252 Q 220 262 218 275" stroke={WRINKLE_COLOR} strokeWidth="1.6"/>
        <path d="M 234 254 Q 222 264 220 275" stroke={WRINKLE_SHADOW} strokeWidth="0.8" opacity="0.4"/>
        {/* 右 */}
        <path d="M 268 252 Q 280 262 282 275" stroke={WRINKLE_COLOR} strokeWidth="1.6"/>
        <path d="M 266 254 Q 278 264 280 275" stroke={WRINKLE_SHADOW} strokeWidth="0.8" opacity="0.4"/>
      </Wrinkle>

      {/* ── 口周りの縦じわ（バーティカルリップライン） ── */}
      <Wrinkle id="perioral_lines" improvement={imp.perioral_lines}>
        {/* 上唇上 - 左 */}
        <path d="M 230 408 Q 228 400 229 393" stroke={WRINKLE_COLOR} strokeWidth="1.3"/>
        <path d="M 238 406 Q 237 398 238 391" stroke={WRINKLE_COLOR} strokeWidth="1.3"/>
        {/* 上唇上 - 右 */}
        <path d="M 270 408 Q 272 400 271 393" stroke={WRINKLE_COLOR} strokeWidth="1.3"/>
        <path d="M 262 406 Q 263 398 262 391" stroke={WRINKLE_COLOR} strokeWidth="1.3"/>
        {/* 下唇下 */}
        <path d="M 232 435 Q 230 442 231 448" stroke={WRINKLE_COLOR} strokeWidth="1.2"/>
        <path d="M 268 435 Q 270 442 269 448" stroke={WRINKLE_COLOR} strokeWidth="1.2"/>
      </Wrinkle>

      {/* ── マリオネットライン ── */}
      <Wrinkle id="marionette_lines" improvement={imp.marionette_lines}>
        {/* 左 */}
        <path d="M 220 422 Q 205 448 200 468" stroke={WRINKLE_COLOR} strokeWidth="1.8"/>
        <path d="M 222 424 Q 207 450 202 470" stroke={WRINKLE_SHADOW} strokeWidth="0.8" opacity="0.4"/>
        {/* 右 */}
        <path d="M 280 422 Q 295 448 300 468" stroke={WRINKLE_COLOR} strokeWidth="1.8"/>
        <path d="M 278 424 Q 293 450 298 470" stroke={WRINKLE_SHADOW} strokeWidth="0.8" opacity="0.4"/>
      </Wrinkle>

      {/* ── 顎の梅干しじわ ── */}
      <Wrinkle id="chin_dimpling" improvement={imp.chin_dimpling}>
        <path d="M 232 472 Q 236 465 240 470" stroke={WRINKLE_COLOR} strokeWidth="1.4"/>
        <path d="M 246 469 Q 250 461 254 469" stroke={WRINKLE_COLOR} strokeWidth="1.4"/>
        <path d="M 260 470 Q 264 465 268 472" stroke={WRINKLE_COLOR} strokeWidth="1.4"/>
      </Wrinkle>

      {/* ── 下眼瞼のしわ ── */}
      <Wrinkle id="lower_lid_wrinkles" improvement={imp.lower_lid_wrinkles}>
        {/* 左 */}
        <path d="M 178 240 Q 197 237 216 240" stroke={WRINKLE_COLOR} strokeWidth="1.2"/>
        <path d="M 180 245 Q 197 242 214 245" stroke={WRINKLE_COLOR} strokeWidth="1"/>
        {/* 右 */}
        <path d="M 284 240 Q 303 237 322 240" stroke={WRINKLE_COLOR} strokeWidth="1.2"/>
        <path d="M 286 245 Q 303 242 320 245" stroke={WRINKLE_COLOR} strokeWidth="1"/>
      </Wrinkle>
    </g>
  );
}
