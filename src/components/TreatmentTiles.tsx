/**
 * TreatmentTiles — 段2（エラ・毛穴・ガミースマイル）の専用ビフォーアフター図
 *
 * 3つとも同じ顔ベースのイラストで、タップで施術前/後を切替。
 * treated=false → 施術前（悩みあり） / treated=true → 施術後（改善）
 *
 * 参考: wrinkle-era.webp（エラ張り→V字小顔）
 */

const T = { transition: "opacity 0.5s ease" } as const;

// 共通パーツ（jawはエラで上書きするので含めない）
const HAIR_BACK =
  "M 22 96 C 16 50 46 18 80 18 C 114 18 144 50 138 96 C 137 78 132 60 122 52 C 110 43 96 39 80 39 C 64 39 50 43 38 52 C 28 60 23 78 22 96 Z";
const HAIR_FRONT =
  "M 80 28 C 55 28 37 43 33 74 C 40 53 56 41 80 41 C 104 41 120 53 127 74 C 123 43 105 28 80 28 Z";
// 通常の輪郭（毛穴・ガミー用）
const FACE_NORMAL =
  "M 80 34 C 105 34 120 50 122 80 C 123 101 118 120 108 136 C 99 149 90 156 80 159 C 70 156 61 149 52 136 C 42 120 37 101 38 80 C 40 50 55 34 80 34 Z";

function Hair() {
  return <path d={HAIR_BACK} fill="#a98a6e" />;
}
function Bangs() {
  return <path d={HAIR_FRONT} fill="#c0a084" />;
}
function Cheeks() {
  return (
    <>
      <ellipse cx="53" cy="106" rx="11" ry="7" fill="#f6a6a6" opacity="0.35" />
      <ellipse cx="107" cy="106" rx="11" ry="7" fill="#f6a6a6" opacity="0.35" />
    </>
  );
}
function Brows() {
  return (
    <>
      <path d="M 49 71 Q 61 66 72 70" stroke="#8a6a4e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M 88 70 Q 99 66 111 71" stroke="#8a6a4e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </>
  );
}
function Nose() {
  return <path d="M 78 94 Q 76 104 81 107" stroke="#e0a074" strokeWidth="1.6" fill="none" strokeLinecap="round" />;
}

/** エラ張り → 小顔（下顎角が張った四角顔 → V字） */
export function JawView({ treated }: { treated: boolean }) {
  // 施術前：エラ（下顎角）が横に張り出した四角い輪郭
  const BEFORE =
    "M 80 30 C 108 30 126 48 129 78 C 131 98 133 114 128 128 C 124 140 113 150 98 155 C 90 158 84 159 80 159 C 76 159 70 158 62 155 C 47 150 36 140 32 128 C 27 114 29 98 31 78 C 34 48 52 30 80 30 Z";
  // 施術後：すっきりV字
  const AFTER =
    "M 80 34 C 104 34 118 50 120 78 C 121 98 116 116 107 132 C 99 145 89 154 80 158 C 71 154 61 145 53 132 C 44 116 39 98 40 78 C 42 50 56 34 80 34 Z";
  return (
    <svg viewBox="0 0 160 170" className="w-full h-full">
      <Hair />
      <path d={BEFORE} fill="#fbe4d3" stroke="#e6b591" strokeWidth="2" opacity={treated ? 0 : 1} style={T} />
      <path d={AFTER} fill="#fbe4d3" stroke="#e6b591" strokeWidth="2" opacity={treated ? 1 : 0} style={T} />
      {/* エラの張り出し強調（施術前） */}
      <g opacity={treated ? 0 : 1} style={T}>
        <path d="M 31 104 Q 30 124 48 146" fill="none" stroke="#cf8a62" strokeWidth="5" strokeLinecap="round" opacity="0.4" />
        <path d="M 129 104 Q 130 124 112 146" fill="none" stroke="#cf8a62" strokeWidth="5" strokeLinecap="round" opacity="0.4" />
        <ellipse cx="37" cy="118" rx="9" ry="13" fill="#eec2a0" opacity="0.5" />
        <ellipse cx="123" cy="118" rx="9" ry="13" fill="#eec2a0" opacity="0.5" />
      </g>
      {/* Vライン（施術後） */}
      <g opacity={treated ? 1 : 0} style={T}>
        <path d="M 53 132 Q 66 151 80 158 Q 94 151 107 132" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
      </g>
      <Cheeks />
      <Brows />
      <path d="M 52 84 Q 61 90 70 84" stroke="#5a3d28" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M 90 84 Q 99 90 108 84" stroke="#5a3d28" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <Nose />
      <path d="M 70 124 Q 80 130 90 124" stroke="#d07a86" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <Bangs />
    </svg>
  );
}

/** 毛穴・テカリ → つるん肌（顔ベース） */
export function PoreView({ treated }: { treated: boolean }) {
  const dots = [
    [50, 100], [60, 108], [54, 116], [64, 120], [46, 110],
    [110, 100], [100, 108], [106, 116], [96, 120], [114, 110],
    [74, 100], [86, 100], [80, 92], [70, 110], [90, 110],
  ] as const;
  return (
    <svg viewBox="0 0 160 170" className="w-full h-full">
      <defs>
        <radialGradient id="poreGlow" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Hair />
      <path d={FACE_NORMAL} fill="#fbe4d3" stroke="#e6b591" strokeWidth="2" />
      {/* 毛穴（施術前） */}
      <g opacity={treated ? 0 : 1} style={T}>
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.3" fill="#c69a86" opacity="0.6" />
        ))}
      </g>
      <Cheeks />
      <Brows />
      <path d="M 52 84 Q 61 90 70 84" stroke="#5a3d28" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M 90 84 Q 99 90 108 84" stroke="#5a3d28" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <Nose />
      <path d="M 71 124 Q 80 129 89 124" stroke="#d07a86" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <Bangs />
      {/* ツヤ（施術後） */}
      <path d={FACE_NORMAL} fill="url(#poreGlow)" opacity={treated ? 1 : 0} style={T} pointerEvents="none" />
    </svg>
  );
}

/** ガミースマイル（顔の中の笑顔／歯ぐきが見える → 見えない） */
export function SmileView({ treated }: { treated: boolean }) {
  return (
    <svg viewBox="0 0 160 170" className="w-full h-full">
      <Hair />
      <path d={FACE_NORMAL} fill="#fbe4d3" stroke="#e6b591" strokeWidth="2" />
      <Cheeks />
      <Brows />
      {/* 笑った目 */}
      <path d="M 52 84 Q 61 78 70 84" stroke="#5a3d28" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M 90 84 Q 99 78 108 84" stroke="#5a3d28" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <Nose />

      {/* 口（笑顔）。y112〜146 に配置 */}
      {/* 施術前：ガミー（歯ぐきが見える） */}
      <g opacity={treated ? 0 : 1} style={T}>
        <path d="M 60 118 Q 80 110 100 118 Q 92 145 80 146 Q 68 145 60 118 Z" fill="#7a333c" />
        <path d="M 65 118 Q 80 112 95 118 L 93 126 Q 80 122 67 126 Z" fill="#ef8ea0" />
        <path d="M 67 124 Q 80 120 93 124 L 90 136 Q 80 142 70 136 Z" fill="#ffffff" />
        <path d="M 58 117 Q 80 108 102 117 Q 92 121 80 119 Q 68 121 58 117 Z" fill="#d76b78" />
        <path d="M 62 136 Q 80 152 98 136 Q 90 145 80 146 Q 70 145 62 136 Z" fill="#e07f8b" />
      </g>
      {/* 施術後：自然な笑顔（歯ぐきが見えない） */}
      <g opacity={treated ? 1 : 0} style={T}>
        <path d="M 62 124 Q 80 116 98 124 Q 91 143 80 144 Q 69 143 62 124 Z" fill="#7a333c" />
        <path d="M 67 125 Q 80 121 93 125 L 90 134 Q 80 140 70 134 Z" fill="#ffffff" />
        <path d="M 60 123 Q 80 113 100 123 Q 91 130 80 127 Q 69 130 60 123 Z" fill="#d76b78" />
        <path d="M 63 134 Q 80 150 97 134 Q 90 143 80 144 Q 70 143 63 134 Z" fill="#e07f8b" />
      </g>
      {/* 歯の境目 */}
      <g stroke="#e7d9d0" strokeWidth="0.9" opacity="0.5">
        <line x1="74" y1="125" x2="74" y2="138" />
        <line x1="80" y1="125" x2="80" y2="139" />
        <line x1="86" y1="125" x2="86" y2="138" />
      </g>
      <Bangs />
    </svg>
  );
}
