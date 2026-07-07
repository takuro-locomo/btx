/**
 * App.tsx — 患者向けボトックス体感ツール
 *
 * 仕様: デフォルトで全部位に悩み（シワ・たるみ等）が出ている状態。
 *       気になる部位をタップすると、その悩みが消え（＝治療）、
 *       タップした部位の合計料金と説明が表示される。
 *       段1＝表情ジワ＋たるみ（写真）／段2＝エラ・毛穴・ガミー（専用図）。
 *
 * ※ 料金は上野医院の掲載価格に準拠した目安。最終判断は必ず医師の診察による。
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { PatientFaceView } from "./components/PatientFaceView";
import { JawView, PoreView, SmileView } from "./components/TreatmentTiles";
import { BurstLayer, ConfettiRain, type Burst } from "./components/FunEffects";
import {
  PATIENT_AREAS,
  POPULAR_MENUS,
  REASSURE_POINTS,
  type PatientArea,
  type WrinkleKey,
} from "./data/patientAreas";

const FACE1_AREAS = PATIENT_AREAS.filter((a) => a.section === "face1");
const FACE2_AREAS = PATIENT_AREAS.filter((a) => a.section === "face2");
const FACE1_KEYS = FACE1_AREAS.flatMap((a) => a.wrinkleKeys);

// 段2タイルの短いラベル
const TILE_LABEL: Record<string, string> = {
  masseter: "エラ（小顔）",
  pores: "毛穴・テカリ",
  gummy: "ガミースマイル",
};

const yen = (n: number) => "¥" + n.toLocaleString("ja-JP");

function priceOf(areas: PatientArea[]) {
  let weekday = 0;
  let weekend = 0;
  for (const a of areas) {
    if (a.priceValue == null) continue;
    weekday += a.priceValue;
    weekend += a.weekendValue ?? a.priceValue;
  }
  return { weekday, weekend };
}

/** キレイ度に応じた顔絵文字と応援メッセージ */
function kireiStage(pct: number): { emoji: string; message: string } {
  if (pct === 0) return { emoji: "😣", message: "気になるところをポチッと押してみて👇" };
  if (pct < 30) return { emoji: "🙂", message: "いい感じ！どんどん消しちゃおう" };
  if (pct < 60) return { emoji: "😊", message: "半分くらいきた！その調子✨" };
  if (pct < 100) return { emoji: "😍", message: "あとすこしでコンプリート…！" };
  return { emoji: "👑", message: "ぜんぶキレイ！おつかれさま🎉" };
}

export default function App() {
  // タップ済み（＝治療する）部位のID
  const [treated, setTreated] = useState<string[]>([]);
  // タップ演出
  const [bursts, setBursts] = useState<Burst[]>([]);
  const burstId = useRef(0);
  const [celebrate, setCelebrate] = useState(false);
  // 打ちすぎ（連打）演出：眼瞼下垂＋キレイ度ダウン
  const [overdose, setOverdose] = useState(false);
  const tapTimes = useRef<number[]>([]);
  const overdoseUntil = useRef(0);

  const treatedAreas: PatientArea[] = useMemo(
    () => PATIENT_AREAS.filter((a) => treated.includes(a.id)),
    [treated],
  );
  const treatedKeys: WrinkleKey[] = useMemo(
    () => treatedAreas.flatMap((a) => a.wrinkleKeys),
    [treatedAreas],
  );
  const grand = useMemo(() => priceOf(treatedAreas), [treatedAreas]);

  const face2Treated = FACE2_AREAS.filter((a) => treated.includes(a.id));

  const pct = Math.round((treated.length / PATIENT_AREAS.length) * 100);
  const allDone = treated.length === PATIENT_AREAS.length;
  // 打ちすぎ中はキレイ度が一時的にダウン
  const shownPct = overdose ? Math.max(0, pct - 30) : pct;
  const stage = overdose
    ? { emoji: "😵", message: "⚠ 打ちすぎ！まぶたが重くなっちゃった…ボトックスは適量が大事" }
    : kireiStage(pct);

  // コンプリートの瞬間だけ紙吹雪
  useEffect(() => {
    if (!allDone) return;
    setCelebrate(true);
    const t = setTimeout(() => setCelebrate(false), 3200);
    return () => clearTimeout(t);
  }, [allDone]);

  const spawnBurst = (x: number, y: number) => {
    const id = ++burstId.current;
    setBursts((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setBursts((prev) => prev.filter((b) => b.id !== id)), 900);
  };

  const toggle = (id: string, e?: MouseEvent) => {
    // 短時間に連打しすぎると「打ちすぎ」＝眼瞼下垂でキレイ度ダウン（ボトックスは適量が大事）
    const now = Date.now();
    tapTimes.current = [...tapTimes.current.filter((t) => now - t < 2200), now];
    if (tapTimes.current.length >= 6 && now > overdoseUntil.current) {
      overdoseUntil.current = now + 7000; // 連続発動を防ぐクールダウン
      tapTimes.current = [];
      setOverdose(true);
      navigator.vibrate?.([70, 50, 70]);
      setTimeout(() => setOverdose(false), 3400);
    }

    const turningOn = !treated.includes(id);
    if (turningOn) {
      if (e) spawnBurst(e.clientX, e.clientY);
      navigator.vibrate?.(12);
    }
    setTreated((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50 text-slate-800">
      <BurstLayer bursts={bursts} />
      <ConfettiRain show={celebrate} />

      {/* ヘッダー */}
      <header className="px-5 pt-6 pb-3 text-center">
        <p className="text-slate-400 text-[11px] font-bold tracking-wide">
          長野市三輪 美容クリニック 上野医院
        </p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold leading-snug">
          <span className="bg-gradient-to-r from-rose-500 to-pink-400 bg-clip-text text-transparent">
            ぽちっとしわとり
          </span>
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          気になるトコを<span className="text-rose-500 font-bold">タップ</span>
          すると消えて、料金がわかります
        </p>
      </header>

      {/* キレイ度メーター（スクロールしても見える） */}
      <div className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-rose-100">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-500">
              キレイ度 <span className="text-base align-middle">{stage.emoji}</span>
            </span>
            <span className={overdose ? "text-violet-500" : "text-rose-500"}>
              {shownPct}%（{treated.length}/{PATIENT_AREAS.length}）
            </span>
          </div>
          <div className="mt-1 h-2.5 rounded-full bg-rose-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                overdose
                  ? "bg-gradient-to-r from-violet-400 to-slate-400"
                  : "bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300"
              }`}
              style={{ width: `${shownPct}%` }}
            />
          </div>
          <div
            className={`mt-1 text-[11px] text-center font-bold ${
              overdose ? "text-violet-600" : "text-slate-500 font-normal"
            }`}
          >
            {stage.message}
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 pb-28 pt-3">
        {/* ===== 段1：表情ジワ＋フェイスライン（写真） ===== */}
        <section>
          <div className="text-center text-xs font-bold text-rose-400 mb-2">シワ・たるみ</div>

          {/* はじめての行動喚起（最初のタップまで表示） */}
          {treated.length === 0 && (
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
              className="relative z-10 -mb-4 mx-auto w-fit px-5 py-2.5 rounded-full bg-rose-500 text-white text-base font-extrabold shadow-lg shadow-rose-300"
            >
              👇 赤い<span className="mx-0.5">●</span>をぽちっと押してみて！
            </motion.div>
          )}

          <div className="rounded-3xl bg-white shadow-xl shadow-rose-100/70 border border-rose-100 overflow-hidden">
            <PatientFaceView
              renderKeys={FACE1_KEYS}
              treatedKeys={treatedKeys}
              hitAreas={FACE1_AREAS.map((a) => ({ id: a.id, keys: a.wrinkleKeys }))}
              treatedIds={treated}
              onToggleArea={toggle}
              overdose={overdose}
            />
          </div>
          <p className="mt-1 text-center text-[11px] text-slate-400">
            気になる部分（<span className="text-rose-400 font-bold">●</span>）を直接タップしてもOK
          </p>
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            {FACE1_AREAS.map((a) => (
              <Pill
                key={a.id}
                area={a}
                on={treated.includes(a.id)}
                onClick={(e) => toggle(a.id, e)}
              />
            ))}
          </div>
          <SubtotalBar title="シワ・たるみ" areas={FACE1_AREAS.filter((a) => treated.includes(a.id))} />
        </section>

        {/* ===== 段2：エラ・毛穴・ガミースマイル（同じ大きさの顔イラスト） ===== */}
        <section className="mt-8">
          <div className="text-center text-xs font-bold text-rose-400 mb-2">小顔・毛穴・口もと</div>
          <div className="grid grid-cols-2 gap-3">
            {FACE2_AREAS.map((a, idx) => {
              const on = treated.includes(a.id);
              const tile = (
                <button
                  key={a.id}
                  onClick={(e) => toggle(a.id, e)}
                  className={`w-full rounded-2xl border p-3 flex flex-col items-center transition-all ${
                    on ? "bg-rose-50 border-rose-300 shadow-md shadow-rose-100" : "bg-white border-rose-100"
                  }`}
                >
                  <div className="relative w-full aspect-square flex items-center justify-center">
                    <span
                      className={`absolute top-1 left-1 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        on ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {on ? "✨施術後" : "施術前"}
                    </span>
                    {a.tileView === "jaw" && <JawView treated={on} />}
                    {a.tileView === "pore" && <PoreView treated={on} />}
                    {a.tileView === "smile" && <SmileView treated={on} />}
                  </div>
                  <div className="mt-2 text-sm font-bold text-slate-800 text-center leading-tight">
                    {TILE_LABEL[a.id] ?? a.label}
                  </div>
                  <div className="mt-0.5 text-[11px] font-extrabold text-rose-500">{a.priceLabel}</div>
                </button>
              );
              // 3枚目（毛穴）は中央寄せで同じ大きさに
              return idx === 2 ? (
                <div key={a.id} className="col-span-2 flex justify-center">
                  <div className="w-[calc(50%-0.375rem)]">{tile}</div>
                </div>
              ) : (
                tile
              );
            })}
          </div>
          <SubtotalBar title="小顔・毛穴・口もと" areas={face2Treated} />
        </section>

        {/* コンプリート祝い */}
        {allDone && (
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-amber-100 via-rose-100 to-pink-100 border border-amber-200 p-4 text-center shadow-sm">
            <div className="text-2xl">👑✨🎉</div>
            <div className="mt-1 font-extrabold text-slate-800">
              コンプリート！ぜんぶキレイになりました
            </div>
            <div className="mt-1 text-xs text-slate-500 leading-relaxed">
              全部やる必要はありません。気になる1ヶ所だけでもOK。
              <br />
              下の合計から「ここだけ」を選び直してみて👇
            </div>
          </div>
        )}

        {/* ===== 全体の合計＋説明 ===== */}
        {treatedAreas.length > 0 ? (
          <section className="mt-6 space-y-3">
            <div className="rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-200 p-4">
              <div className="text-xs font-bold text-rose-100">
                全体の合計（{treatedAreas.length}部位・税込）
              </div>
              <div className="mt-1 flex items-end gap-2 flex-wrap">
                <span className="text-3xl font-extrabold">{yen(grand.weekday)}</span>
                <span className="text-sm font-bold text-rose-100 mb-1">
                  金土なら {yen(grand.weekend)}
                </span>
              </div>
              <div className="mt-1.5 text-[11px] text-rose-100 leading-relaxed">
                ニューロノックス使用・自由診療。金土は表情ジワが割引（1部位 ¥11,000）。
              </div>
            </div>

            {treatedAreas.map((a) => (
              <div key={a.id} className="rounded-2xl bg-white border border-rose-100 shadow-sm p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{a.icon}</span>
                  <h3 className="font-extrabold text-slate-800">{a.label}</h3>
                </div>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{a.afterMessage}</p>
                <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-rose-400 font-bold shrink-0">料金</span>
                  <span className="text-sm font-extrabold text-rose-600 text-right">{a.priceLabel}</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-400 text-right">効果 {a.duration}持続</div>
              </div>
            ))}
          </section>
        ) : (
          <p className="mt-6 text-center text-sm text-slate-400">
            👆 気になるところをタップすると、消えて料金が出ます
          </p>
        )}

        {/* 安心ポイント */}
        <section className="mt-8">
          <h2 className="text-center text-sm font-bold text-slate-500 mb-3">はじめての方も安心の理由</h2>
          <div className="grid grid-cols-2 gap-3">
            {REASSURE_POINTS.map((r) => (
              <div key={r.title} className="rounded-2xl bg-white/80 border border-rose-100 p-3.5">
                <div className="text-xl">{r.icon}</div>
                <div className="mt-1 font-bold text-sm text-slate-800">{r.title}</div>
                <div className="mt-0.5 text-xs text-slate-500 leading-relaxed">{r.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 人気メニュー */}
        <section className="mt-8">
          <h2 className="text-center text-sm font-bold text-slate-500 mb-3">そのほかの人気メニュー</h2>
          <div className="space-y-2">
            {POPULAR_MENUS.map((m) => (
              <div key={m.label} className="flex items-center gap-3 rounded-xl bg-white border border-rose-100 px-4 py-3">
                <span className="text-lg shrink-0">{m.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-slate-800">{m.label}</div>
                  <div className="text-xs text-slate-500">{m.benefit}</div>
                </div>
                <div className="text-xs font-extrabold text-rose-500 text-right shrink-0">{m.price}</div>
              </div>
            ))}
          </div>
        </section>

        {/* クリニック情報 */}
        <section className="mt-8 rounded-2xl bg-white border border-rose-100 p-4 text-center">
          <p className="text-[11px] font-bold text-rose-400 tracking-widest">
            ぽちっとしわとり 提供
          </p>
          <p className="mt-1 text-xs text-slate-500">長野市三輪の美容クリニック</p>
          <p className="text-lg font-extrabold text-slate-800">上野医院</p>
          <a
            href="https://ueno-iin-biyou-miwa.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs font-bold text-rose-500 underline underline-offset-2"
          >
            公式ホームページを見る
          </a>
        </section>

        {/* 免責 */}
        <p className="mt-8 text-[11px] leading-relaxed text-slate-400 text-center">
          ※ 表示している変化はイメージであり、効果には個人差があります。
          料金はすべて税込の目安です。使用する『ニューロノックス』は国内未承認の
          ボツリヌストキシン製剤で、医師の判断により個人輸入したものです（重篤な副作用の
          際も医薬品副作用被害救済制度の対象外）。同成分の国内承認品にアラガン社
          ボトックスビスタがあります。実際の施術内容・費用・リスク・副作用は、必ず医師の
          診察・カウンセリングにてご説明します。自由診療（保険適用外）です。
        </p>
      </main>

      {/* 固定CTA */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-white/90 backdrop-blur border-t border-rose-100 px-4 py-3">
        <div className="max-w-md mx-auto flex gap-2">
          <a
            href="https://lin.ee/zNl8pfQ"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-3.5 rounded-2xl bg-[#06C755] text-white font-extrabold shadow-lg shadow-emerald-100 active:scale-95 transition-transform"
          >
            💬 無料LINE相談
          </a>
          <a
            href="https://ueno-iin-biyou-miwa.com/siwa/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-3.5 rounded-2xl bg-white border-2 border-rose-400 text-rose-500 font-extrabold active:scale-95 transition-transform"
          >
            HPで詳細を見る
          </a>
        </div>
      </div>
    </div>
  );
}

function Pill({
  area,
  on,
  onClick,
}: {
  area: PatientArea;
  on: boolean;
  onClick: (e: MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full text-sm font-bold border transition-all ${
        on
          ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-200"
          : "bg-white border-rose-200 text-rose-500"
      }`}
    >
      <span className="mr-1">{on ? "✓" : area.icon}</span>
      {area.label}
    </button>
  );
}

function SubtotalBar({ title, areas }: { title: string; areas: PatientArea[] }) {
  if (areas.length === 0) return null;
  const { weekday, weekend } = priceOf(areas);
  return (
    <div className="mt-3 rounded-2xl bg-rose-500 text-white px-4 py-2.5 flex items-center justify-between gap-2 shadow-md shadow-rose-200">
      <span className="text-xs font-bold text-rose-100 shrink-0">
        {title}の合計（{areas.length}部位）
      </span>
      <span className="text-right leading-tight">
        <span className="text-lg font-extrabold">{yen(weekday)}</span>
        <span className="text-[11px] text-rose-100 ml-1">金土 {yen(weekend)}</span>
      </span>
    </div>
  );
}
