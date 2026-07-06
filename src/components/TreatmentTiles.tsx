/**
 * TreatmentTiles — 段2（エラ・毛穴・ガミースマイル）の専用ビフォーアフター図
 *
 * 写真では表現しにくい変化を、自作SVGのビフォー/アフターでタップ切替表示する。
 * treated=false → 施術前（悩みあり） / treated=true → 施術後（改善）
 *
 * 参考: wrinkle-era.webp（エラ張り四角顔→V字小顔）
 */

const T = { transition: "opacity 0.5s ease" } as const;

/** エラ張り → 小顔（四角い輪郭 → V字）。参考画像に寄せた全顔イラスト */
export function JawView({ treated }: { treated: boolean }) {
  // 施術前：エラが張った四角い輪郭
  const BEFORE =
    "M 80 32 C 108 32 126 50 128 82 C 129 104 129 122 120 138 C 112 150 99 157 80 160 C 61 157 48 150 40 138 C 31 122 31 104 32 82 C 34 50 52 32 80 32 Z";
  // 施術後：すっきりしたV字
  const AFTER =
    "M 80 34 C 106 34 121 50 123 80 C 124 100 119 118 109 134 C 100 147 90 155 80 159 C 70 155 60 147 51 134 C 41 118 36 100 37 80 C 39 50 54 34 80 34 Z";
  return (
    <svg viewBox="0 0 160 170" className="w-full h-full">
      {/* 髪（後ろ・ボブ） */}
      <path
        d="M 20 98 C 14 50 46 20 80 20 C 114 20 146 50 140 98 C 138 130 130 158 122 172 C 125 132 126 96 124 80 C 122 52 106 40 80 40 C 54 40 38 52 36 80 C 34 96 35 132 38 172 C 30 158 22 130 20 98 Z"
        fill="#a98a6e"
      />
      {/* 輪郭（クロスフェード） */}
      <path d={BEFORE} fill="#fbe4d3" stroke="#e6b591" strokeWidth="2" opacity={treated ? 0 : 1} style={T} />
      <path d={AFTER} fill="#fbe4d3" stroke="#e6b591" strokeWidth="2" opacity={treated ? 1 : 0} style={T} />
      {/* エラの張り（施術前だけ影） */}
      <g opacity={treated ? 0 : 1} style={T}>
        <path d="M 34 116 Q 40 138 55 150" fill="none" stroke="#d99a72" strokeWidth="4.5" strokeLinecap="round" opacity="0.35" />
        <path d="M 126 116 Q 120 138 105 150" fill="none" stroke="#d99a72" strokeWidth="4.5" strokeLinecap="round" opacity="0.35" />
      </g>
      {/* Vライン（施術後だけハイライト） */}
      <g opacity={treated ? 1 : 0} style={T}>
        <path d="M 51 134 Q 65 152 80 159 Q 95 152 109 134" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
      </g>
      {/* チーク */}
      <ellipse cx="53" cy="104" rx="11" ry="7" fill="#f6a6a6" opacity="0.35" />
      <ellipse cx="107" cy="104" rx="11" ry="7" fill="#f6a6a6" opacity="0.35" />
      {/* 眉 */}
      <path d="M 49 71 Q 61 66 72 70" stroke="#8a6a4e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M 88 70 Q 99 66 111 71" stroke="#8a6a4e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* 目（やさしい） */}
      <path d="M 52 84 Q 61 90 70 84" stroke="#5a3d28" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M 90 84 Q 99 90 108 84" stroke="#5a3d28" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {/* 鼻・口 */}
      <path d="M 78 96 Q 76 105 81 108" stroke="#e0a074" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M 70 124 Q 80 130 90 124" stroke="#d07a86" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {/* 前髪 */}
      <path d="M 80 28 C 55 28 37 43 33 74 C 40 53 56 41 80 41 C 104 41 120 53 127 74 C 123 43 105 28 80 28 Z" fill="#c0a084" />
    </svg>
  );
}

/** 毛穴・テカリ → つるん肌 */
export function PoreView({ treated }: { treated: boolean }) {
  const dots = [
    [52, 54], [66, 48], [80, 54], [94, 50], [60, 66], [74, 62], [88, 66],
    [50, 76], [66, 80], [82, 78], [96, 76], [58, 92], [74, 90], [90, 92],
    [44, 64], [100, 64], [70, 104], [56, 104],
  ] as const;
  return (
    <svg viewBox="0 0 140 140" className="w-full h-full">
      <defs>
        <radialGradient id="poreGlow" cx="45%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="70" cy="72" r="56" fill="#fbe4d3" stroke="#eec6a6" strokeWidth="2" />
      <g opacity={treated ? 0 : 1} style={T}>
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.6" fill="#c69a86" opacity="0.6" />
        ))}
      </g>
      <circle cx="70" cy="72" r="56" fill="url(#poreGlow)" opacity={treated ? 1 : 0} style={T} />
    </svg>
  );
}

/** ガミースマイル（歯ぐきが見える → 見えない） */
export function SmileView({ treated }: { treated: boolean }) {
  return (
    <svg viewBox="0 0 170 130" className="w-full h-full">
      {/* 施術前：ガミー（歯ぐきが大きく見える） */}
      <g opacity={treated ? 0 : 1} style={T}>
        {/* 口内 */}
        <path d="M 26 46 Q 85 26 144 46 Q 122 108 85 110 Q 48 108 26 46 Z" fill="#7a333c" />
        {/* 歯ぐき（大きめ） */}
        <path d="M 38 46 Q 85 37 132 46 L 129 66 Q 85 59 41 66 Z" fill="#ef8ea0" />
        {/* 歯 */}
        <path d="M 44 63 Q 85 56 126 63 L 120 88 Q 85 100 50 88 Z" fill="#ffffff" />
        {/* 上唇（細く高い） */}
        <path d="M 24 44 Q 85 22 146 44 Q 128 51 85 47 Q 42 51 24 44 Z" fill="#d76b78" />
        {/* 下唇 */}
        <path d="M 28 88 Q 85 118 142 88 Q 116 108 85 110 Q 54 108 28 88 Z" fill="#e07f8b" />
      </g>
      {/* 施術後：自然な笑顔（歯ぐきが見えない） */}
      <g opacity={treated ? 1 : 0} style={T}>
        <path d="M 30 56 Q 85 38 140 56 Q 120 102 85 104 Q 50 102 30 56 Z" fill="#7a333c" />
        <path d="M 44 58 Q 85 52 126 58 L 120 84 Q 85 96 50 84 Z" fill="#ffffff" />
        {/* 上唇（ふっくら・下げて歯ぐきを隠す） */}
        <path d="M 26 54 Q 85 30 144 54 Q 126 68 85 63 Q 44 68 26 54 Z" fill="#d76b78" />
        <path d="M 30 84 Q 85 114 140 84 Q 114 104 85 106 Q 56 104 30 84 Z" fill="#e07f8b" />
      </g>
      {/* 歯の境目 */}
      <g stroke="#e7d9d0" strokeWidth="1.1" opacity="0.5">
        <line x1="70" y1="64" x2="70" y2="90" />
        <line x1="85" y1="64" x2="85" y2="92" />
        <line x1="100" y1="64" x2="100" y2="90" />
      </g>
    </svg>
  );
}
