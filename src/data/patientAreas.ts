/**
 * patientAreas.ts — 患者向けツールの「気になる部位」データ
 *
 * 料金は上野医院ビューティーミワ しわ治療ページ（ボツリヌストキシン＝
 * ニューロノックス使用）に準拠。https://ueno-iin-biyou-miwa.com/siwa/
 *   - 表情ジワ各部位: 1部位 ¥17,600（金土割引 ¥11,000）
 *   - ガミースマイル: ¥22,000（2回セット）
 *   - マイクロボトックス（毛穴）: 全顔 ¥44,000 / 部分 ¥27,500〜
 *   - ネフェルティティリフト: 料金表に明示なし → カウンセリングにて
 * ※ 最終的な費用・適応は医師の診察により決定される。
 */

export type WrinkleKey =
  | "glabellar_lines"
  | "horizontal_forehead"
  | "crows_feet"
  | "bunny_lines"
  | "lower_lid_wrinkles"
  | "chin_lines"
  | "pores";

/** 料金カテゴリ（合計計算・注記用） */
export type PriceCategory = "expression" | "micro" | "gummy" | "nefertiti";

export interface PatientArea {
  id: string;
  label: string;
  catch: string;
  icon: string;
  /** 顔イラストに重ねる表現（空＝顔の視覚化なし） */
  wrinkleKeys: WrinkleKey[];
  afterMessage: string;
  /** 効果が続く目安 */
  duration: string;
  /** カードに表示する料金文言 */
  priceLabel: string;
  /** 合計計算に使う平日料金（円）。要相談は null */
  priceValue: number | null;
  /** 金土割引料金（円）。割引対象外は null（＝平日と同額扱い） */
  weekendValue: number | null;
  category: PriceCategory;
}

const EXPRESSION_PRICE = "1部位 ¥17,600（金土 ¥11,000）";

export const PATIENT_AREAS: PatientArea[] = [
  {
    id: "glabella",
    label: "眉間のシワ",
    catch: "怒ってないのに“怒って見える”",
    icon: "😣",
    wrinkleKeys: ["glabellar_lines"],
    afterMessage:
      "眉間の縦ジワがふっと消えて、穏やかで優しい印象に。第一印象がぐっと若返ります。",
    duration: "約3〜4ヶ月",
    priceLabel: EXPRESSION_PRICE,
    priceValue: 17600,
    weekendValue: 11000,
    category: "expression",
  },
  {
    id: "forehead",
    label: "額の横ジワ",
    catch: "メイクが溝に溜まる",
    icon: "〰️",
    wrinkleKeys: ["horizontal_forehead"],
    afterMessage:
      "おでこの横ジワがなめらかに。ファンデのヨレも気にならず、ツルンとした若肌へ。",
    duration: "約3〜4ヶ月",
    priceLabel: EXPRESSION_PRICE,
    priceValue: 17600,
    weekendValue: 11000,
    category: "expression",
  },
  {
    id: "crows_feet",
    label: "目尻のシワ",
    catch: "笑うと目尻がクシャッと",
    icon: "😊",
    wrinkleKeys: ["crows_feet"],
    afterMessage:
      "笑ったときの目尻の“カラスの足あと”がやわらぎ、目もとが明るく若々しい印象に。",
    duration: "約3〜4ヶ月",
    priceLabel: EXPRESSION_PRICE,
    priceValue: 17600,
    weekendValue: 11000,
    category: "expression",
  },
  {
    id: "lower_lid",
    label: "目の下の小ジワ",
    catch: "疲れて見られがち",
    icon: "👀",
    wrinkleKeys: ["lower_lid_wrinkles"],
    afterMessage:
      "目の下のちりめんジワがふっくら。疲れ顔から、いきいきした目もとへ。",
    duration: "約3〜4ヶ月",
    priceLabel: EXPRESSION_PRICE,
    priceValue: 17600,
    weekendValue: 11000,
    category: "expression",
  },
  {
    id: "bunny",
    label: "鼻のシワ（バニーライン）",
    catch: "笑うと鼻に寄る",
    icon: "🐰",
    wrinkleKeys: ["bunny_lines"],
    afterMessage:
      "笑ったときに鼻の付け根に寄るシワをすっきり。自然な笑顔がもっと魅力的に。",
    duration: "約3〜4ヶ月",
    priceLabel: EXPRESSION_PRICE,
    priceValue: 17600,
    weekendValue: 11000,
    category: "expression",
  },
  {
    id: "chin",
    label: "アゴの梅干しジワ",
    catch: "アゴがボコボコに",
    icon: "☺️",
    wrinkleKeys: ["chin_lines"],
    afterMessage:
      "アゴに力が入るとできる“梅干しジワ”をなめらかに。あご先がすっきり整った印象へ。",
    duration: "約3〜4ヶ月",
    priceLabel: EXPRESSION_PRICE,
    priceValue: 17600,
    weekendValue: 11000,
    category: "expression",
  },
  {
    id: "pores",
    label: "毛穴・テカリ（マイクロボトックス）",
    catch: "毛穴・皮脂・テカリが気になる",
    icon: "✨",
    wrinkleKeys: ["pores"],
    afterMessage:
      "肌表面に極少量を注射し、毛穴の開き・テカリ・皮脂をおさえてサラッと陶器肌に。ハリ感もアップ。",
    duration: "約3〜4ヶ月",
    priceLabel: "全顔 ¥44,000 / 部分 ¥27,500〜",
    priceValue: 44000,
    weekendValue: null,
    category: "micro",
  },
  {
    id: "gummy",
    label: "ガミースマイル",
    catch: "笑うと歯ぐきが見える",
    icon: "😁",
    wrinkleKeys: [],
    afterMessage:
      "上唇の筋肉をゆるめて、笑ったときの歯ぐきの見えすぎを自然に改善。バランスのよい笑顔に。当院は打ちすぎを防ぐ2ステップ法。",
    duration: "約3〜4ヶ月",
    priceLabel: "¥22,000（2回セット）",
    priceValue: 22000,
    weekendValue: null,
    category: "gummy",
  },
  {
    id: "nefertiti",
    label: "ネフェルティティリフト",
    catch: "フェイスライン・首のたるみ",
    icon: "💎",
    wrinkleKeys: [],
    afterMessage:
      "首の広頸筋にアプローチして、下がったフェイスラインを引き上げ。あご下〜首すじがすっきり、横顔美人に。",
    duration: "約3〜4ヶ月",
    priceLabel: "¥52,800（金土 ¥33,000）",
    priceValue: 52800,
    weekendValue: 33000,
    category: "nefertiti",
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
  { icon: "🦷", label: "エラ（小顔・歯ぎしり）", benefit: "エラの張りをやわらげてすっきり小顔に", price: "両エラ ¥52,800" },
  { icon: "💪", label: "肩こり・肩ボトックス", benefit: "こり固まった肩をゆるめて首をすらり", price: "カウンセリングにて" },
  { icon: "💦", label: "ワキ多汗症", benefit: "気になるワキの汗を大幅に抑えて快適に", price: "両ワキ ¥66,000" },
  { icon: "🧴", label: "頭皮ボトックス（制汗）", benefit: "頭皮の汗・ベタつきをおさえてサラサラに", price: "¥66,000" },
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
