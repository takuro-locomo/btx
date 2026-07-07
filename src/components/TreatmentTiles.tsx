/**
 * TreatmentTiles — 段2（エラ・毛穴・ガミースマイル）の専用ビフォーアフター図
 *
 * ユーザー提供のイラスト素材（public/tiles/）を使用。タップで施術前/後をクロスフェード。
 *
 *   jaw-before/after.jpg  (720×900) … エラ張り → V字小顔（前後別ファイル）
 *   pore-before/after.jpg (720×900) … 毛穴悩み → つや肌（前後別ファイル）
 *   gummy-ba.jpg (481×340) … 左=施術後 / 右=施術前 が横並びの1枚もの
 */

const FADE = { transition: "opacity 0.5s ease" } as const;

/** 前後別ファイルをクロスフェード */
function FadeImagePair({
  beforeSrc,
  afterSrc,
  treated,
  alt,
}: {
  beforeSrc: string;
  afterSrc: string;
  treated: boolean;
  alt: string;
}) {
  return (
    <div className="relative w-full h-full" role="img" aria-label={alt}>
      <img
        src={beforeSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-contain"
        style={{ ...FADE, opacity: treated ? 0 : 1 }}
        loading="lazy"
      />
      <img
        src={afterSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-contain"
        style={{ ...FADE, opacity: treated ? 1 : 0 }}
        loading="lazy"
      />
    </div>
  );
}

interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 1枚ものの素材から指定範囲だけを表示 */
function CropView({
  src,
  imgW,
  imgH,
  crop,
  visible,
}: {
  src: string;
  imgW: number;
  imgH: number;
  crop: Crop;
  visible: boolean;
}) {
  return (
    <svg
      viewBox={`${crop.x} ${crop.y} ${crop.w} ${crop.h}`}
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 w-full h-full"
      style={{ ...FADE, opacity: visible ? 1 : 0 }}
      aria-hidden={!visible}
    >
      <image href={src} x="0" y="0" width={imgW} height={imgH} />
    </svg>
  );
}

/** エラ張り → 小顔 */
export function JawView({ treated }: { treated: boolean }) {
  return (
    <FadeImagePair
      beforeSrc="/tiles/jaw-before.jpg"
      afterSrc="/tiles/jaw-after.jpg"
      treated={treated}
      alt="エラボトックスの施術前後イメージ"
    />
  );
}

/** 毛穴・テカリ → つるん肌 */
export function PoreView({ treated }: { treated: boolean }) {
  return (
    <FadeImagePair
      beforeSrc="/tiles/pore-before.jpg"
      afterSrc="/tiles/pore-after.jpg"
      treated={treated}
      alt="マイクロボトックス（毛穴）の施術前後イメージ"
    />
  );
}

/** ガミースマイル（素材は 左=施術後 / 右=施術前） */
export function SmileView({ treated }: { treated: boolean }) {
  return (
    <div
      className="relative w-full h-full"
      role="img"
      aria-label="ガミースマイルの施術前後イメージ"
    >
      <CropView
        src="/tiles/gummy-ba.jpg"
        imgW={481}
        imgH={340}
        crop={{ x: 243, y: 75, w: 235, h: 200 }}
        visible={!treated}
      />
      <CropView
        src="/tiles/gummy-ba.jpg"
        imgW={481}
        imgH={340}
        crop={{ x: 5, y: 90, w: 235, h: 200 }}
        visible={treated}
      />
    </div>
  );
}
