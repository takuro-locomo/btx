import type {
  PatientConcern,
  PatientTreatmentArea,
  PatientTreatmentVariant,
} from "../types/botox";

// Verified sources and scope: docs/BOTOX_KNOWLEDGE.md, 2026-09-07.
export const CLINIC_PRICE_URL = "https://ueno-iin-biyou-miwa.com/price/";
const expressionPrice = {
  yen: 17600,
  scope: "1部位",
  discount: 11000,
  source: CLINIC_PRICE_URL,
};
const expressionTiming =
  "数日〜約2週間で変化が現れ、通常3〜4か月ほどで徐々に戻ります。個人差があります。";
const wrinkleLimit =
  "表情を動かさなくても残る深いしわは、十分に改善しない場合があります。";
const microSource = "https://ueno-iin-biyou-miwa.com/micro-btx/";
const cheeks: PatientTreatmentArea[] = [
  { x: 162, y: 204, rx: 17, ry: 17 },
  { x: 238, y: 204, rx: 17, ry: 17 },
];
const forehead: PatientTreatmentArea[] = [{ x: 200, y: 113, rx: 36, ry: 21 }];
const nose: PatientTreatmentArea[] = [{ x: 200, y: 190, rx: 10, ry: 19 }];
const microVariants: [PatientTreatmentVariant, ...PatientTreatmentVariant[]] = [
  {
    id: "cheeks",
    label: "両ほほ",
    price: { yen: 27500, scope: "両ほほ", source: microSource },
    areas: cheeks,
  },
  {
    id: "cheeks-nose",
    label: "両ほほ＋鼻",
    price: { yen: 33000, scope: "両ほほ＋鼻", source: microSource },
    areas: [...cheeks, ...nose],
  },
  {
    id: "forehead",
    label: "額",
    price: { yen: 27500, scope: "額", source: microSource },
    areas: forehead,
  },
  {
    id: "forehead-nose",
    label: "額＋鼻",
    price: { yen: 33000, scope: "額＋鼻", source: microSource },
    areas: [...forehead, ...nose],
  },
  {
    id: "full-face",
    label: "全顔",
    price: { yen: 44000, scope: "全顔", source: microSource },
    areas: [
      ...cheeks,
      ...forehead,
      ...nose,
      { x: 200, y: 263, rx: 15, ry: 10 },
    ],
  },
];

export const PATIENT_CONCERNS: [PatientConcern, ...PatientConcern[]] = [
  {
    id: "glabella",
    label: "眉間にしわが寄る",
    shortName: "眉間",
    treatment: "眉間の表情じわ治療",
    location: "眉と眉の間で、しわを寄せる筋肉の周辺。",
    expected:
      "眉を寄せる動きを和らげ、眉間の縦じわを目立ちにくくすることを目指します。",
    comparisonFocus: "眉間の縦じわの濃さと、眉の寄り方",
    beforeCaption: "眉を寄せると、縦じわが出る",
    afterCaption: "眉間のしわが寄りにくくなる例",
    limitation: wrinkleLimit,
    timing: expressionTiming,
    price: expressionPrice,
    risks: ["まぶたが下がる・重く感じる", "眉や表情に左右差が出る"],
    adverse: "eyelid",
    adverseCaption: "片方のまぶたが下がる例",
    areas: [
      { x: 190, y: 145, rx: 12, ry: 8 },
      { x: 210, y: 145, rx: 12, ry: 8 },
      { x: 200, y: 162, rx: 6, ry: 10 },
    ],
  },
  {
    id: "forehead",
    label: "おでこの横じわ",
    shortName: "おでこ",
    treatment: "額の表情じわ治療",
    location: "おでこで、眉を持ち上げる筋肉の周辺。",
    expected:
      "眉を上げたときのおでこの横じわを、目立ちにくくすることを目指します。",
    comparisonFocus: "おでこの横じわの濃さと、眉の上がり方",
    beforeCaption: "眉を上げると、横じわが出る",
    afterCaption: "おでこの横じわが和らぐ例",
    limitation:
      "眉を上げて目を開ける癖がある方では、重さが出やすいことがあります。" +
      wrinkleLimit,
    timing: expressionTiming,
    price: expressionPrice,
    risks: ["眉が下がる・目元が重くなる", "眉の形や上がり方が変わる"],
    adverse: "brow",
    adverseCaption: "眉が下がり、目元が重くなる例",
    areas: [
      { x: 177, y: 114, rx: 18, ry: 24 },
      { x: 223, y: 114, rx: 18, ry: 24 },
    ],
  },
  {
    id: "eyes",
    label: "笑うと目尻にしわ",
    shortName: "目尻",
    treatment: "目尻の表情じわ治療",
    location: "左右の目尻の外側で、笑いじわが寄る範囲。",
    expected: "笑ったときに目尻へ広がるしわを、和らげることを目指します。",
    comparisonFocus: "目の開きをそろえたときの、目尻の笑いじわ",
    beforeCaption: "目元を動かすと、しわが寄る",
    afterCaption: "目尻のしわが目立ちにくくなる例",
    limitation:
      "目の下のたるみや、皮膚の乾燥が原因の小じわには、別の治療が必要な場合があります。",
    timing: expressionTiming,
    price: expressionPrice,
    risks: ["目を閉じにくくなる・目が乾く", "笑顔や目元に左右差が出る"],
    adverse: "closure",
    adverseCaption: "片方の目を閉じにくくなる例",
    areas: [
      { x: 142, y: 165, rx: 9, ry: 16 },
      { x: 258, y: 165, rx: 9, ry: 16 },
    ],
  },
  {
    id: "chin",
    label: "あごの梅干しじわ",
    shortName: "あご",
    treatment: "あごの凹凸を和らげる治療",
    location: "あご先で、力を入れたときに凹凸が出る範囲。",
    expected:
      "あごに力を入れたときの梅干しのような凹凸を、和らげることを目指します。",
    comparisonFocus: "あご先の小さな凹凸と、しわの濃さ",
    beforeCaption: "あごに力を入れると、凹凸が出る",
    afterCaption: "あご先の凹凸が和らぐ例",
    limitation:
      "あごの骨格を変えたり、あご先を長くしたりする治療ではありません。",
    timing: expressionTiming,
    price: expressionPrice,
    risks: ["下唇の動きに左右差が出る", "口を閉じにくい・話しにくい"],
    adverse: "lowerLip",
    adverseCaption: "下唇の動きに左右差が出る例",
    areas: [{ x: 200, y: 263, rx: 14, ry: 11 }],
  },
  {
    id: "masseter",
    label: "エラ張り・食いしばり",
    shortName: "エラ",
    treatment: "両エラの筋肉を和らげる治療",
    location: "左右のエラで、噛みしめると硬くなる筋肉の範囲。",
    expected:
      "噛む筋肉の強い緊張を和らげ、筋肉が原因のエラの張りや食いしばりの負担を軽くすることを目指します。",
    comparisonFocus: "噛みしめたときの、エラの筋肉の張り",
    beforeCaption: "噛みしめると、筋肉が張る",
    afterCaption: "噛んだときの筋肉の張りが和らぐ例",
    limitation:
      "骨や脂肪が原因のエラ張りには効果が限られます。図は筋肉の張りの例で、直後に輪郭が細くなることを示すものではありません。",
    timing:
      "筋肉の張りと輪郭の変化は同時ではありません。輪郭は数週〜数か月かけて変化することがあり、個人差があります。",
    price: { yen: 52800, scope: "両エラ", source: CLINIC_PRICE_URL },
    risks: [
      "硬いものを噛みにくい・噛むと疲れる",
      "笑顔の左右差、頬のこけやたるみ",
      "噛んだときに一部が膨らむ",
    ],
    adverse: "bulge",
    adverseCaption: "噛んだときに一部の筋肉が膨らむ例",
    areas: [
      { x: 145, y: 231, rx: 10, ry: 22 },
      { x: 255, y: 231, rx: 10, ry: 22 },
    ],
  },
  {
    id: "gummy",
    label: "笑うと歯ぐきが見える",
    shortName: "ガミースマイル",
    treatment: "ガミースマイルの治療",
    location: "小鼻の横から上唇にかけて、上唇を引き上げる筋肉の周辺。",
    expected:
      "上唇の上がり方を穏やかにして、笑ったときに見える歯ぐきの範囲を小さくすることを目指します。",
    comparisonFocus: "笑ったときの上唇の位置と、歯ぐきの見え方",
    beforeCaption: "上唇が上がり、歯ぐきが見える",
    afterCaption: "上唇の上がり方が穏やかになる例",
    limitation:
      "上唇の動きが強いタイプが対象です。歯や骨格などが原因の場合は、別の対応が必要です。",
    timing:
      "初回の施術後、約2週間で変化を確認し、必要に応じて調整する2回セットです。",
    price: {
      yen: 22000,
      scope: "2回セット",
      source: "https://ueno-iin-biyou-miwa.com/gammy/",
    },
    risks: [
      "上唇が上がりにくい・笑顔が不自然になる",
      "笑顔の左右差、口元の動かしにくさ",
    ],
    adverse: "smile",
    adverseCaption: "上唇の上がり方に左右差が出る例",
    areas: [
      { x: 184, y: 217, rx: 7, ry: 10 },
      { x: 216, y: 217, rx: 7, ry: 10 },
    ],
  },
  {
    id: "bunny",
    label: "鼻に寄るしわ",
    shortName: "鼻",
    treatment: "バニーライン（鼻のしわ）治療",
    location: "鼻の両側で、笑ったときなどにしわが寄る範囲。",
    expected: "鼻に力を入れたときのしわを、和らげることを目指します。",
    comparisonFocus: "鼻の両側に寄る、しわの濃さ",
    beforeCaption: "鼻に力を入れると、しわが寄る",
    afterCaption: "鼻のしわが和らぐ例",
    limitation: wrinkleLimit,
    timing: expressionTiming,
    price: expressionPrice,
    risks: ["笑顔や上唇の動きに左右差が出る", "口元を動かしにくくなる"],
    adverse: "smile",
    adverseCaption: "上唇の動きに左右差が出る例",
    areas: [
      { x: 188, y: 193, rx: 6, ry: 10 },
      { x: 212, y: 193, rx: 6, ry: 10 },
    ],
  },
  {
    id: "dao",
    label: "口角が下がって見える",
    shortName: "口角",
    treatment: "DAO（口角下制筋）ボトックス",
    location: "左右の口角の下で、口角を引き下げる筋肉の周辺。",
    expected:
      "口角を下げる筋肉の働きを和らげ、下がった印象を軽くすることを目指します。",
    comparisonFocus: "口角が下へ引かれる動き",
    beforeCaption: "口角が下へ引かれている",
    afterCaption: "口角が下へ引かれにくくなる例",
    limitation:
      "皮膚のたるみや深い溝をなくす治療ではありません。適応と対応可否は診察で確認します。",
    timing: expressionTiming,
    // Price provided explicitly by the clinic owner in this conversation.
    price: { yen: 33000, scope: "口角（DAO）" },
    risks: ["下唇や笑顔に左右差が出る", "飲む・話す動作に違和感が出る"],
    adverse: "lowerLip",
    adverseCaption: "下唇の動きに左右差が出る例",
    areas: [
      { x: 174, y: 248, rx: 7, ry: 12 },
      { x: 226, y: 248, rx: 7, ry: 12 },
    ],
  },
  {
    id: "lips",
    label: "唇のまわりの縦じわ",
    shortName: "唇のまわり",
    treatment: "口唇まわりの表情じわ治療",
    location: "唇のまわりで、口をすぼめる動きに関わる筋肉の周辺。",
    expected: "口をすぼめたときの縦じわを、目立ちにくくすることを目指します。",
    comparisonFocus: "唇のまわりの縦じわと、すぼめる動き",
    beforeCaption: "口をすぼめると、しわが出る",
    afterCaption: "唇まわりのしわが和らぐ例",
    limitation:
      "唇のボリュームを増やす治療ではありません。口の機能に影響しやすく、適応と対応可否は診察で確認します。",
    timing: expressionTiming,
    price: null,
    risks: [
      "唇を閉じにくい・飲み物がこぼれる",
      "ストローを使いにくい・話しにくい",
    ],
    adverse: "lip",
    adverseCaption: "唇を閉じにくくなる例",
    areas: [{ x: 200, y: 230, rx: 23, ry: 7 }],
  },
  {
    id: "neck",
    label: "首の縦すじ・輪郭",
    shortName: "首",
    treatment: "ネフェルティティリフト（首・フェイスライン）",
    location: "首から下あごにかけて、力を入れると縦すじが出る筋肉の範囲。",
    expected:
      "首に力を入れたときの縦すじや、輪郭を下へ引く動きを和らげることを目指します。",
    comparisonFocus: "首に力を入れたときの、縦すじの目立ち方",
    beforeCaption: "首に力を入れると、すじが出る",
    afterCaption: "首の縦すじが目立ちにくくなる例",
    limitation:
      "皮膚のたるみ全体を引き上げる治療ではありません。適応と対応可否は診察で確認します。",
    timing: expressionTiming,
    price: null,
    risks: ["首に力が入りにくくなる", "飲み込みにくい・声を出しにくい"],
    adverse: "neck",
    adverseCaption: "見た目に出ない副作用もあります",
    areas: [
      { x: 170, y: 276, rx: 14, ry: 7 },
      { x: 230, y: 276, rx: 14, ry: 7 },
      { x: 182, y: 317, rx: 10, ry: 26 },
      { x: 218, y: 317, rx: 10, ry: 26 },
    ],
  },
  {
    id: "micro",
    label: "毛穴・テカリが気になる",
    shortName: "毛穴・テカリ",
    treatment: "マイクロボトックス（肌の浅い部分への施術）",
    location: "選んだ範囲の肌の浅い部分へ、広く分散して注射します。",
    expected:
      "皮脂や汗によるテカリ、毛穴の目立ちを和らげ、肌の質感を整えることを目指します。",
    comparisonFocus: "同じ範囲の毛穴の目立ち方と、テカリ",
    beforeCaption: "毛穴の目立ち・テカリが気になる",
    afterCaption: "毛穴の目立ち・テカリが和らぐ例",
    limitation:
      "毛穴がなくなる治療ではありません。乾燥の改善や、ニキビ跡の深い凹みには別の対応が必要です。",
    timing:
      "約1週間から変化を感じ始めることがあり、約1か月で状態を確認します。持続は通常3〜4か月が目安で、個人差があります。",
    price: microVariants[0].price,
    variants: microVariants,
    availability: "金・土に対応するメニューです。",
    risks: [
      "注射した範囲の赤み・腫れ・内出血",
      "周辺の筋肉への影響で、表情の違和感や左右差が出る",
    ],
    adverse: "none",
    adverseCaption: "注射した範囲に内出血が出る例",
    areas: cheeks,
  },
];
