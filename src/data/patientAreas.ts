/**
 * patientAreas.ts — 患者向けツールの「気になる部位」データ
 *
 * 仕様: デフォルトで全部位に悩み（シワ・たるみ等）が出ている状態。
 *       気になる部位をタップすると、その悩みが消え（＝治療）、
 *       タップした部位の合計料金と説明が表示される。
 *
 * 顔は2段構成:
 *   face1 … 表情ジワ＋フェイスラインのたるみ（正面の同じ顔）
 *   face2 … エラ・毛穴・ガミースマイル（別の顔）
 *
 * 料金は上野医院ビューティーミワ しわ治療ページに準拠。
 *   https://ueno-iin-biyou-miwa.com/siwa/
 *   表情ジワ各部位 1部位 ¥17,600（金土 ¥11,000）
 *   ネフェルティティ ＝ 3部位と同額 ¥52,800（金土 ¥33,000）
 *   両エラ ¥52,800 / マイクロ（毛穴）全顔 ¥44,000 / ガミー ¥22,000(2回)
 * ※ 最終的な費用・適応は医師の診察により決定される。
 */

export type WrinkleKey =
  | "glabellar_lines"
  | "horizontal_forehead"
  | "crows_feet"
  | "bunny_lines"
  | "lower_lid_wrinkles"
  | "chin_lines"
  | "sagging"
  | "pores"
  | "masseter"
  | "gummy_hint";

export type FaceSection = "face1" | "face2";

export interface PatientArea {
  id: string;
  label: string;
  catch: string;
  icon: string;
  /** どちらの顔に表示するか */
  section: FaceSection;
  /** 顔イラストに重ねる表現（タップで消える） */
  wrinkleKeys: WrinkleKey[];
  /** 治療後（タップ後）の説明 */
  afterMessage: string;
  duration: string;
  /** カードに表示する料金文言 */
  priceLabel: string;
  /** 合計計算に使う平日料金（円）。要相談は null */
  priceValue: number | null;
  /** 金土割引料金（円）。割引対象外は null（＝平日と同額扱い） */
  weekendValue: number | null;
}

const EXPRESSION_PRICE = "1部位 ¥17,600（金土 ¥11,000）";

export const PATIENT_AREAS: PatientArea[] = [
  // ===== 段1：表情ジワ＋フェイスライン =====
  {
    id: "forehead",
    label: "額の横ジワ",
    catch: "メイクが溝に溜まる",
    icon: "〰️",
    section: "face1",
    wrinkleKeys: ["horizontal_forehead"],
    afterMessage:
      "おでこの横ジワがなめらかに。ファンデのヨレも気にならず、ツルンとした若肌へ。",
    duration: "約3〜4ヶ月",
    priceLabel: EXPRESSION_PRICE,
    priceValue: 17600,
    weekendValue: 11000,
  },
  {
    id: "glabella",
    label: "眉間のシワ",
    catch: "怒ってないのに“怒って見える”",
    icon: "😣",
    section: "face1",
    wrinkleKeys: ["glabellar_lines"],
    afterMessage:
      "眉間の縦ジワがふっと消えて、穏やかで優しい印象に。第一印象がぐっと若返ります。",
    duration: "約3〜4ヶ月",
    priceLabel: EXPRESSION_PRICE,
    priceValue: 17600,
    weekendValue: 11000,
  },
  {
    id: "crows_feet",
    label: "目尻のシワ",
    catch: "笑うと目尻がクシャッと",
    icon: "😊",
    section: "face1",
    wrinkleKeys: ["crows_feet"],
    afterMessage:
      "笑ったときの目尻の“カラスの足あと”がやわらぎ、目もとが明るく若々しい印象に。",
    duration: "約3〜4ヶ月",
    priceLabel: EXPRESSION_PRICE,
    priceValue: 17600,
    weekendValue: 11000,
  },
  {
    id: "lower_lid",
    label: "目の下の小ジワ",
    catch: "疲れて見られがち",
    icon: "👀",
    section: "face1",
    wrinkleKeys: ["lower_lid_wrinkles"],
    afterMessage:
      "目の下のちりめんジワがふっくら。疲れ顔から、いきいきした目もとへ。",
    duration: "約3〜4ヶ月",
    priceLabel: EXPRESSION_PRICE,
    priceValue: 17600,
    weekendValue: 11000,
  },
  {
    id: "bunny",
    label: "鼻のシワ（バニーライン）",
    catch: "笑うと鼻に寄る",
    icon: "🐰",
    section: "face1",
    wrinkleKeys: ["bunny_lines"],
    afterMessage:
      "笑ったときに鼻の付け根に寄るシワをすっきり。自然な笑顔がもっと魅力的に。",
    duration: "約3〜4ヶ月",
    priceLabel: EXPRESSION_PRICE,
    priceValue: 17600,
    weekendValue: 11000,
  },
  {
    id: "chin",
    label: "アゴの梅干しジワ",
    catch: "アゴがボコボコに",
    icon: "☺️",
    section: "face1",
    wrinkleKeys: ["chin_lines"],
    afterMessage:
      "アゴに力が入るとできる“梅干しジワ”をなめらかに。あご先がすっきり整った印象へ。",
    duration: "約3〜4ヶ月",
    priceLabel: EXPRESSION_PRICE,
    priceValue: 17600,
    weekendValue: 11000,
  },
  {
    id: "nefertiti",
    label: "フェイスラインのたるみ",
    catch: "あご下・首がもたつく",
    icon: "💎",
    section: "face1",
    wrinkleKeys: ["sagging"],
    afterMessage:
      "ネフェルティティリフトで下がったフェイスラインを引き上げ。あご下〜首すじがすっきり、横顔美人に。",
    duration: "約3〜4ヶ月",
    priceLabel: "¥52,800（金土 ¥33,000）",
    priceValue: 52800,
    weekendValue: 33000,
  },

  // ===== 段2：エラ・毛穴・ガミースマイル（別の顔） =====
  {
    id: "masseter",
    label: "エラ張り（小顔）",
    catch: "顔が四角く見える",
    icon: "🦷",
    section: "face2",
    wrinkleKeys: ["masseter"],
    afterMessage:
      "発達した咬筋（エラ）をゆるめて、3〜6ヶ月かけてフェイスラインをシャープに。歯ぎしり・食いしばりの緩和にも。",
    duration: "約4〜6ヶ月",
    priceLabel: "両エラ ¥52,800",
    priceValue: 52800,
    weekendValue: null,
  },
  {
    id: "pores",
    label: "毛穴・テカリ（マイクロボトックス）",
    catch: "毛穴・皮脂・テカリが気になる",
    icon: "✨",
    section: "face2",
    wrinkleKeys: ["pores"],
    afterMessage:
      "肌表面に極少量を注射し、毛穴の開き・テカリ・皮脂をおさえてサラッと陶器肌に。ハリ感もアップ。",
    duration: "約3〜4ヶ月",
    priceLabel: "全顔 ¥44,000 / 部分 ¥27,500〜",
    priceValue: 44000,
    weekendValue: null,
  },
  {
    id: "gummy",
    label: "ガミースマイル",
    catch: "笑うと歯ぐきが見える",
    icon: "😁",
    section: "face2",
    wrinkleKeys: ["gummy_hint"],
    afterMessage:
      "上唇の筋肉をゆるめて、笑ったときの歯ぐきの見えすぎを自然に改善。当院は打ちすぎを防ぐ2ステップ法。",
    duration: "約3〜4ヶ月",
    priceLabel: "¥22,000（2回セット）",
    priceValue: 22000,
    weekendValue: null,
  },
];

/** 顔イラストで表現しないが人気の高いメニュー（CTA補助） */
export interface PopularMenu {
  icon: string;
  label: string;
  benefit: string;
  price: string;
}

export const POPULAR_MENUS: PopularMenu[] = [
  { icon: "💪", label: "肩こり・肩ボトックス", benefit: "こり固まった肩をゆるめて首をすらり", price: "¥66,000" },
  { icon: "💦", label: "多汗症・ワキ", benefit: "気になるワキの汗を大幅に抑えて快適に", price: "¥66,000" },
  { icon: "🧴", label: "多汗症・頭皮", benefit: "頭皮の汗・ベタつきをおさえてサラサラに", price: "¥66,000" },
  { icon: "🤲", label: "多汗症・手のひら", benefit: "手のひらの汗を抑えて、書類やスマホも快適に", price: "¥66,000" },
];

/** 安心して受けてもらうためのポイント */
export const REASSURE_POINTS: { icon: string; title: string; body: string }[] = [
  {
    icon: "⏱️",
    title: "施術は約10分",
    body: "細い針でチクッとするだけ。お昼休みにも受けられます。",
  },
  {
    icon: "🩹",
    title: "ダウンタイムほぼなし",
    body: "メイクもその日から。まわりに気づかれにくい自然な変化。",
  },
  {
    icon: "🔄",
    title: "効果は自然に元通り",
    body: "作用は3〜4ヶ月で薄れる可逆的な施術。まず試したい方も安心。",
  },
  {
    icon: "🌿",
    title: "はじめてでも安心",
    body: "医師が表情に合わせて量と位置を慎重に調整。自然な仕上がり。",
  },
];
