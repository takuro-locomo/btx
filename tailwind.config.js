/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 医療系の落ち着いた配色
        clinical: {
          safe: "#16a34a",      // 緑（推奨ゾーン）
          warn: "#f59e0b",      // オレンジ（注意）
          danger: "#dc2626",    // 赤（危険ゾーン・副作用）
          neutral: "#475569",   // スレート
          accent: "#0891b2",    // シアン（情報）
        },
      },
    },
  },
  plugins: [],
};
