/**
 * DisclaimerBanner — 医療広告ガイドライン準拠の免責表示
 * 常時表示。非表示にする手段を提供しない（YMYL対応）。
 */

export function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center gap-2">
      <span className="text-amber-600 font-bold shrink-0">⚠️ 免責事項</span>
      <span>
        本ツールは医療スタッフ向け教育目的のシミュレーターです。
        実際の治療効果・副作用を保証するものではなく、医療行為の代替にはなりません。
        治療は必ず医師の診察・判断のもとで行ってください。
      </span>
    </div>
  );
}
