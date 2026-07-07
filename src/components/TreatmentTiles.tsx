/**
 * TreatmentTiles — 段2（エラ・毛穴・ガミースマイル）の専用ビフォーアフター図
 *
 * ユーザー提供のイラスト素材（public/tiles/）を使用。
 * 各素材は「施術前｜施術後」が横並びになっているので、
 * SVG の viewBox で片側だけを切り出して表示し、タップで前後をクロスフェード。
 *
 *   jaw-ba.webp  (519×370) … 左=エラ張り＋注射 / 右=すっきり小顔
 *   pore-ba.jpg  (1000×600)… 左=毛穴悩み / 右=つや肌
 *   gummy-ba.jpg (481×340) … 左=自然な笑顔(後) / 右=歯ぐきが見える(前)
 */

interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface BAImageProps {
  src: string;
  /** 素材画像の実寸 */
  imgW: number;
  imgH: number;
  before: Crop;
  after: Crop;
  treated: boolean;
  alt: string;
}

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
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease" }}
      aria-hidden={!visible}
    >
      <image href={src} x="0" y="0" width={imgW} height={imgH} />
    </svg>
  );
}

function BeforeAfterImage({ src, imgW, imgH, before, after, treated, alt }: BAImageProps) {
  return (
    <div className="relative w-full h-full" role="img" aria-label={alt}>
      <CropView src={src} imgW={imgW} imgH={imgH} crop={before} visible={!treated} />
      <CropView src={src} imgW={imgW} imgH={imgH} crop={after} visible={treated} />
    </div>
  );
}

/** エラ張り → 小顔 */
export function JawView({ treated }: { treated: boolean }) {
  return (
    <BeforeAfterImage
      src="/tiles/jaw-ba.webp"
      imgW={519}
      imgH={370}
      before={{ x: 5, y: 0, w: 225, h: 370 }}
      after={{ x: 288, y: 0, w: 225, h: 370 }}
      treated={treated}
      alt="エラボトックスの施術前後イメージ"
    />
  );
}

/** 毛穴・テカリ → つるん肌 */
export function PoreView({ treated }: { treated: boolean }) {
  return (
    <BeforeAfterImage
      src="/tiles/pore-ba.jpg"
      imgW={1000}
      imgH={600}
      before={{ x: 30, y: 0, w: 470, h: 600 }}
      after={{ x: 505, y: 0, w: 470, h: 600 }}
      treated={treated}
      alt="マイクロボトックス（毛穴）の施術前後イメージ"
    />
  );
}

/** ガミースマイル（素材は 左=施術後 / 右=施術前） */
export function SmileView({ treated }: { treated: boolean }) {
  return (
    <BeforeAfterImage
      src="/tiles/gummy-ba.jpg"
      imgW={481}
      imgH={340}
      before={{ x: 243, y: 75, w: 235, h: 200 }}
      after={{ x: 5, y: 90, w: 235, h: 200 }}
      treated={treated}
      alt="ガミースマイルの施術前後イメージ"
    />
  );
}
