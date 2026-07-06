/**
 * TreatmentTiles — 段2（エラ・毛穴・ガミースマイル）の専用ビフォーアフター図
 *
 * 写真ベースでは表現しにくい「輪郭のV字化」「歯ぐきの見え方」「毛穴」を、
 * 自作SVGのビフォー/アフターでタップ切替表示する。
 * treated=false → 施術前（悩みあり） / treated=true → 施術後（改善）
 */

const T = { transition: "opacity 0.5s ease" } as const;

/** エラ張り → 小顔（四角い輪郭 → V字） */
export function JawView({ treated }: { treated: boolean }) {
  const BEFORE =
    "M 70 20 C 100 20 118 40 120 66 C 121 88 121 106 113 120 C 108 130 100 137 90 141 C 82 144 76 145 70 145 C 64 145 58 144 50 141 C 40 137 32 130 27 120 C 19 106 19 88 20 66 C 22 40 40 20 70 20 Z";
  const AFTER =
    "M 70 22 C 96 22 111 40 113 64 C 114 82 110 99 100 115 C 92 128 82 138 70 143 C 58 138 48 128 40 115 C 30 99 26 82 27 64 C 29 40 44 22 70 22 Z";
  return (
    <svg viewBox="0 0 140 160" className="w-full h-full">
      {/* 髪（後ろ） */}
      <path d="M 26 66 C 22 32 44 12 70 12 C 96 12 118 32 114 66 C 106 46 92 34 70 34 C 48 34 34 46 26 66 Z" fill="#7c5c40" />
      {/* 輪郭（クロスフェード） */}
      <path d={BEFORE} fill="#f7ddc8" stroke="#e3b389" strokeWidth="2" opacity={treated ? 0 : 1} style={T} />
      <path d={AFTER} fill="#f7ddc8" stroke="#e3b389" strokeWidth="2" opacity={treated ? 1 : 0} style={T} />
      {/* エラの張り（施術前だけ影） */}
      <g opacity={treated ? 0 : 1} style={T}>
        <path d="M 26 106 Q 30 124 46 137" fill="none" stroke="#d99a72" strokeWidth="3.5" strokeLinecap="round" opacity="0.4" />
        <path d="M 114 106 Q 110 124 94 137" fill="none" stroke="#d99a72" strokeWidth="3.5" strokeLinecap="round" opacity="0.4" />
      </g>
      {/* Vライン（施術後だけハイライト） */}
      <g opacity={treated ? 1 : 0} style={T}>
        <path d="M 40 115 Q 55 135 70 141 Q 85 135 100 115" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      </g>
      {/* パーツ */}
      <path d="M 45 76 Q 53 72 61 76" stroke="#6b4a34" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M 79 76 Q 87 72 95 76" stroke="#6b4a34" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M 66 88 Q 64 96 70 99" stroke="#e0a074" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M 60 110 Q 70 116 80 110" stroke="#d07a86" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* 前髪 */}
      <path d="M 28 64 C 30 42 48 28 70 28 C 92 28 110 42 112 64 C 100 50 88 42 70 42 C 52 42 40 50 28 64 Z" fill="#9a765a" />
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
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* 肌 */}
      <circle cx="70" cy="72" r="56" fill="#f7ddc8" stroke="#eec6a6" strokeWidth="2" />
      {/* 毛穴（施術前） */}
      <g opacity={treated ? 0 : 1} style={T}>
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.4" fill="#c69a86" opacity="0.55" />
        ))}
      </g>
      {/* ツヤ（施術後） */}
      <circle cx="70" cy="72" r="56" fill="url(#poreGlow)" opacity={treated ? 1 : 0} style={T} />
    </svg>
  );
}

/** ガミースマイル（歯ぐきが見える → 見えない） */
export function SmileView({ treated }: { treated: boolean }) {
  return (
    <svg viewBox="0 0 170 120" className="w-full h-full">
      {/* 施術前：ガミー（歯ぐきが見える） */}
      <g opacity={treated ? 0 : 1} style={T}>
        <path d="M 28 44 Q 85 26 142 44 Q 122 100 85 102 Q 48 100 28 44 Z" fill="#7a3b42" />
        <path d="M 40 44 Q 85 36 130 44 L 127 60 Q 85 54 43 60 Z" fill="#e58a97" />
        <path d="M 44 58 Q 85 52 126 58 L 120 80 Q 85 90 50 80 Z" fill="#ffffff" />
        <path d="M 26 42 Q 85 22 144 42 Q 128 48 85 44 Q 42 48 26 42 Z" fill="#d76b78" />
        <path d="M 30 80 Q 85 108 140 80 Q 116 100 85 102 Q 54 100 30 80 Z" fill="#e07f8b" />
      </g>
      {/* 施術後：自然な笑顔（歯ぐきが見えない） */}
      <g opacity={treated ? 1 : 0} style={T}>
        <path d="M 32 54 Q 85 36 138 54 Q 120 96 85 98 Q 50 96 32 54 Z" fill="#7a3b42" />
        <path d="M 44 56 Q 85 51 126 56 L 120 78 Q 85 88 50 78 Z" fill="#ffffff" />
        <path d="M 28 52 Q 85 30 142 52 Q 126 64 85 60 Q 44 64 28 52 Z" fill="#d76b78" />
        <path d="M 32 78 Q 85 104 138 78 Q 114 98 85 100 Q 56 98 32 78 Z" fill="#e07f8b" />
      </g>
      {/* 歯の境目（うっすら） */}
      <g stroke="#e7d9d0" strokeWidth="1" opacity="0.5">
        <line x1="70" y1="58" x2="70" y2="82" />
        <line x1="85" y1="58" x2="85" y2="84" />
        <line x1="100" y1="58" x2="100" y2="82" />
      </g>
    </svg>
  );
}
