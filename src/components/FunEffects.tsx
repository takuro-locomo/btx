/**
 * FunEffects — ポチポチして楽しい演出まわり
 *
 * BurstLayer   … タップ地点から✨がはじけるパーティクル
 * ConfettiRain … 全部位コンプリート時に絵文字が降る紙吹雪
 *
 * 演出は全て pointer-events: none で操作を邪魔しない。
 */

import { motion } from "framer-motion";

export interface Burst {
  id: number;
  x: number;
  y: number;
}

const BURST_EMOJI = ["✨", "💖", "⭐", "🌸"];

function BurstOnce({ b }: { b: Burst }) {
  const parts = Array.from({ length: 6 }, (_, i) => {
    const ang = (i / 6) * Math.PI * 2 + (b.id % 7) * 0.35;
    const dist = 42 + ((b.id + i) % 3) * 15;
    return {
      dx: Math.cos(ang) * dist,
      dy: Math.sin(ang) * dist - 24,
      emoji: BURST_EMOJI[(b.id + i) % BURST_EMOJI.length],
    };
  });
  return (
    <>
      {parts.map((p, i) => (
        <motion.span
          key={i}
          className="absolute text-lg select-none"
          style={{ left: b.x, top: b.y, translateX: "-50%", translateY: "-50%" }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 0, x: p.dx, y: p.dy, scale: 1.4 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </>
  );
}

export function BurstLayer({ bursts }: { bursts: Burst[] }) {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {bursts.map((b) => (
        <BurstOnce key={b.id} b={b} />
      ))}
    </div>
  );
}

const CONFETTI_EMOJI = ["🎉", "✨", "💖", "🌸", "⭐", "💎"];

export function ConfettiRain({ show }: { show: boolean }) {
  if (!show) return null;
  const pieces = Array.from({ length: 26 }, (_, i) => ({
    left: `${(i * 37 + 13) % 100}%`,
    delay: ((i * 7) % 10) / 14,
    duration: 1.7 + ((i * 3) % 5) * 0.22,
    emoji: CONFETTI_EMOJI[i % CONFETTI_EMOJI.length],
    size: i % 3 === 0 ? "text-3xl" : "text-xl",
  }));
  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className={`absolute ${p.size} select-none`}
          style={{ left: p.left, top: "-8%" }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ y: "115vh", opacity: [1, 1, 0.8], rotate: i % 2 === 0 ? 220 : -220 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}
