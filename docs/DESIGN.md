# ボトックスシミュレーター 設計書

## 1. プロジェクト概要

### 目的
ボトックス注入における **投与量・投与部位・しわのタイプ・副作用** の関係を、インタラクティブに学べる Web シミュレーター。

### ターゲット
- **Tier 1**: 美容皮膚科スタッフ（看護師・カウンセラー）の研修ツール
- **Tier 2**: 医師（特に若手）の症例検討・トレーニング
- **Tier 3**: 患者カウンセリング補助（同意説明の質を上げる）
- **Tier 4**: 一般教育（適切な情報の啓発）

### コアバリュー
- **エビデンスベース**（FDA-PI、Carruthers コンセンサス、2024 国際/韓国コンセンサスを引用）
- **失敗事例も学べる**（過量・誤位置で「変な顔になる」を可視化）
- **すぐ理解できる視覚化**（数値ではなく、SVG イラストの変化で）

---

## 2. ユースケース

### UC-1: 「正しく打つとどうなる？」
1. ユーザーが「眉間のしわ」を選択
2. アプリが推奨注入点（5箇所、各 4U）を表示
3. ユーザーが用量スライダーで調整
4. リアルタイムでしわが薄くなる動画的変化

### UC-2: 「間違えるとどうなる？」
1. ユーザーが眉毛のすぐ上（1cm 未満）に注入点を置く
2. 用量を 6U で配置
3. 結果プレビュー → 眼瞼下垂のオーバーレイ（瞼が重く下がる）
4. 副作用パネルで「LPS への拡散リスク高（推定 15–30%）」と理由を表示

### UC-3: 「比較したい」
1. シナリオ A：適切（20U、5点）
2. シナリオ B：偏った位置に同じ 20U
3. 並べて結果表示

### UC-4: 「教育プリセット」
1. メニューから「Spock brow を作ってみる」
2. デモが自動再生され、解説が流れる

---

## 3. アーキテクチャ

### 3-1. 技術スタック

| 層 | 採用 | 理由 |
|---|---|---|
| 言語 | TypeScript | 型安全（医療データの誤りを防ぐ） |
| フレームワーク | React 18 + Vite | Claude Code が扱いやすい、軽量 |
| スタイリング | Tailwind CSS | 実装速度、Claude Code が得意 |
| 状態管理 | Zustand | Redux より軽い、医療系単一ストアに向く |
| グラフィック | SVG（pure） | テキスト編集可能、解剖学的精度を担保しやすい |
| アニメーション | Framer Motion | しわフェード、副作用オーバーレイの遷移 |
| デプロイ | Vercel または静的 | サーバーレス、コスト最小 |

> **重要**: 画像生成系 AI は使わない。SVG パスでしわ・解剖を手動定義することで、医学的正確性を担保。

### 3-2. ディレクトリ構成

```
botox-simulator/
├── CLAUDE.md                    # Claude Code への指示書
├── README.md
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── index.html
├── docs/
│   ├── DESIGN.md                # 本書
│   ├── BOTOX_KNOWLEDGE.md       # ナレッジ集（医学エビデンス）
│   ├── DISCLAIMER.md            # 免責・医療広告ガイドライン対応
│   └── TODO.md                  # ロードマップ
├── public/
│   └── face-base.svg            # ベース顔イラスト（編集可能 SVG）
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types/
│   │   └── botox.ts             # 全型定義
│   ├── data/
│   │   ├── zones.ts             # 全解剖学的部位の定義
│   │   ├── wrinkles.ts          # しわパスの SVG データ
│   │   └── presets.ts           # 教育プリセット
│   ├── engine/
│   │   ├── simulate.ts          # メインシミュレーションロジック
│   │   ├── efficacy.ts          # 用量反応曲線
│   │   ├── sideEffects.ts       # 副作用確率計算
│   │   └── geometry.ts          # 距離・点in多角形計算
│   ├── store/
│   │   └── useSimStore.ts       # Zustand store
│   ├── components/
│   │   ├── FaceCanvas.tsx       # メインの顔キャンバス
│   │   ├── FaceSvg.tsx          # ベース顔
│   │   ├── WrinkleLayer.tsx     # しわレイヤー
│   │   ├── SideEffectLayer.tsx  # 副作用オーバーレイ
│   │   ├── InjectionMarker.tsx  # 注入点マーカー
│   │   ├── ZoneOverlay.tsx      # 推奨/危険ゾーン表示
│   │   ├── DosePanel.tsx        # 用量入力
│   │   ├── ResultPanel.tsx      # 結果サマリー
│   │   ├── EvidencePanel.tsx    # 引用文献
│   │   ├── PresetSelector.tsx   # シナリオ選択
│   │   └── DisclaimerBanner.tsx # 免責表示
│   └── styles/
│       └── globals.css
└── tests/
    └── engine/
        ├── simulate.test.ts
        ├── sideEffects.test.ts
        └── geometry.test.ts
```

---

## 4. データモデル（型定義のサマリー）

### 4-1. Zone（解剖学的部位）

```typescript
interface Zone {
  id: string;                    // "glabella" | "forehead" | ...
  nameJa: string;
  nameEn: string;
  targetMuscle: string;
  description: string;
  
  // 推奨投与
  idealDose: { min: number; optimal: number; max: number; }; // Units
  idealPoints: InjectionPoint[];
  
  // ジオメトリ（SVG座標系、500x600想定）
  safeZone: Polygon;             // 注入推奨範囲
  dangerZones: DangerZone[];     // 副作用を引き起こすゾーン
  
  // 効果
  improvedWrinkles: WrinkleId[]; // ここを打つと改善するしわ
  efficacyCurve: DoseResponseCurve;
  
  // メタ
  evidenceRefs: string[];        // ["FDA-PI", "CARR2004"]
  difficulty: "beginner" | "intermediate" | "advanced";
}
```

### 4-2. DangerZone（危険ゾーン）

```typescript
interface DangerZone {
  polygon: Polygon;
  effect: SideEffectId;          // "eyelid_ptosis" | "brow_ptosis" | ...
  baseRisk: number;              // 0..1 そのゾーンに打った場合の基底リスク
  doseAmplifier: number;         // 用量で副作用が増える係数
  description: string;
}
```

### 4-3. InjectionPoint（ユーザーが配置する注入点）

```typescript
interface InjectionPoint {
  id: string;
  x: number; y: number;          // SVG座標
  units: number;                 // 投与量
  depth?: "superficial" | "intramuscular" | "deep";
}
```

### 4-4. SimulationResult（シミュレーション結果）

```typescript
interface SimulationResult {
  // しわ改善
  wrinkleImprovements: Map<WrinkleId, number>; // 0..1（1=完全消失）
  
  // 副作用（確率的）
  sideEffects: Array<{
    id: SideEffectId;
    probability: number;         // 0..1
    severity: "mild" | "moderate" | "severe";
    cause: string;               // 原因説明
    visual: SideEffectVisualOverlay;
  }>;
  
  // 総評
  overallScore: number;          // 0..100
  feedback: string;              // 「適切」「過量」「位置不適切」等
  
  // 教育情報
  evidenceCitations: string[];
}
```

### 4-5. SideEffect（副作用ID）

```typescript
type SideEffectId =
  | "eyelid_ptosis"          // 眼瞼下垂
  | "brow_ptosis"            // 眉毛下垂
  | "spock_brow"             // Spock眉
  | "asymmetric_smile"       // 笑顔非対称
  | "frozen_forehead"        // 額が動かない違和感
  | "lower_lid_drop"         // 下眼瞼下垂
  | "cheek_droop"            // 頬部下垂
  | "lip_incompetence"       // 口唇閉鎖不全
  | "speech_difficulty"      // 発音障害
  | "joker_smile"            // Joker smile（上唇歪み）
  | "masseter_hourglass"     // 頬陥没
  | "paradoxical_bulge";     // 逆説的膨隆
```

---

## 5. シミュレーションエンジン

### 5-1. アルゴリズム概要

```
入力:
  - selectedZone: ユーザーが「これを治療したい」と選んだ部位
  - injectionPoints: [{x, y, units, depth}, ...]

処理:
  1. 各しわについて、改善度を計算
     improvement[wrinkle] = doseResponseCurve(effectiveDose近傍point総和)
  
  2. 各危険ゾーンについて、副作用リスクを計算
     risk[sideEffect] = f(point in dangerZone, units, distance, depth)
  
  3. 確率的にイベント発生判定（または確率値そのまま視覚化）
  
  4. 視覚化レイヤーを構築
     - WrinkleLayer: しわのopacityをimprovementで更新
     - SideEffectLayer: 副作用に応じてオーバーレイON/OFF

出力: SimulationResult
```

### 5-2. しわ改善計算

各しわ（wrinkle）は対応する `targetZone` を持つ。
`zone` に注入された総有効用量 → improvement% にマップ。

```typescript
// シグモイド型用量反応
function efficacyFromDose(totalDose: number, optimal: number): number {
  // 0..1
  const ratio = totalDose / optimal;
  if (ratio < 0.3) return ratio * 0.5;      // 不十分
  if (ratio < 1.0) return 0.15 + ratio * 0.75; // 線形帯
  if (ratio < 1.5) return 0.85 + (ratio - 1) * 0.2; // 飽和
  return 0.95; // ほぼ最大
}
```

### 5-3. 副作用計算（重要）

各 `dangerZone` について：

```typescript
function sideEffectRisk(
  point: InjectionPoint,
  zone: DangerZone
): number {
  if (!isInside(point, zone.polygon)) return 0;
  
  // 用量の影響：基底リスク × 用量係数
  const doseFactor = 1 + (point.units - 2) * zone.doseAmplifier;
  
  // 深部注入は拡散リスク増
  const depthFactor = point.depth === "deep" ? 1.3 : 1.0;
  
  return Math.min(1, zone.baseRisk * doseFactor * depthFactor);
}

// 複数pointの合算（独立事象として）
function combinedRisk(risks: number[]): number {
  return 1 - risks.reduce((acc, r) => acc * (1 - r), 1);
}
```

### 5-4. 視覚化マッピング

| 副作用 | SVG変化 |
|---|---|
| `eyelid_ptosis` | 上瞼パスを下方 8–15px シフト、瞼面積拡大 |
| `brow_ptosis` | 眉毛全体を下方 5–10px シフト |
| `spock_brow` | 眉外側のみ上方シフト |
| `asymmetric_smile` | 口角の左右で y座標 を変える |
| `frozen_forehead` | 額のしわパスを完全に消すが、ラベルで「不自然」と表示 |
| `lower_lid_drop` | 下瞼を下方シフト、白目部分を露出 |
| `joker_smile` | 上唇の片側を異常に持ち上げる |
| `masseter_hourglass` | 頬の輪郭を内側に 8px 凹ませる |

---

## 6. UI / UX 設計

### 6-1. レイアウト（デスクトップ）

```
┌────────────────────────────────────────────────────────────┐
│ ヘッダー: タイトル / プリセット選択 / 教育モード切替         │
├──────────────────────┬─────────────────────────────────────┤
│                      │  サイドパネル                        │
│                      │  ・選択中の部位                       │
│   顔キャンバス        │  ・推奨用量レンジ                     │
│   （SVG）            │  ・配置済み注入点リスト              │
│                      │   - 用量スライダー                   │
│   ・クリックで        │   - 削除ボタン                      │
│     注入点配置        │  ・推奨/危険ゾーンの可視化トグル      │
│   ・ホバーで          │                                     │
│     ゾーン情報        │                                     │
│                      │                                     │
├──────────────────────┴─────────────────────────────────────┤
│ 結果パネル                                                  │
│ ・しわ改善: ●●● 80% / □ Spock brow リスク: 15%            │
│ ・副作用警告（ある場合）+ 原因解説                            │
│ ・引用エビデンス（タップで展開）                              │
└────────────────────────────────────────────────────────────┘
```

### 6-2. モバイル

タブ式：[顔]・[操作]・[結果]・[エビデンス]

### 6-3. インタラクション

- **顔のクリック/タップ**: 注入点を配置
- **注入点のドラッグ**: 位置を調整
- **スライダー**: 各点の用量
- **ホバー（PC）/ ロングタップ（モバイル）**: ゾーン解説ポップアップ
- **「結果を見る」ボタン**: シミュレーション計算 → 結果アニメーション再生

### 6-4. 教育モード

トグル ON で：
- 推奨ゾーン（緑半透明）と危険ゾーン（赤半透明）を表示
- 注入点配置時にリアルタイムで警告
- 各操作にツールチップ解説

---

## 7. 開発ロードマップ

### Phase 1: MVP（〜2週間）
- [x] ナレッジ集
- [x] 設計書
- [ ] 型定義
- [ ] 1部位（眉間）の完全実装
- [ ] シミュレーションエンジン v0
- [ ] UI 基本フレーム

### Phase 2: 主要部位拡張（〜4週間）
- [ ] 額・目尻・バニーライン追加
- [ ] 副作用オーバーレイ完全実装
- [ ] エビデンスパネル

### Phase 3: 完成度向上（〜6週間）
- [ ] 残り全部位
- [ ] プリセットシナリオ集
- [ ] モバイル最適化
- [ ] 多言語（EN）対応

### Phase 4: 拡張機能（将来）
- [ ] 患者カウンセリングモード（簡易版）
- [ ] 医師研修モード（詳細解剖図）
- [ ] PDF レポート出力（カウンセリング記録用）
- [ ] 症例DB連携

---

## 8. 品質基準

### 医学的正確性
- すべての投与量・部位記述に出典を併記
- 医師レビュー必須
- 添付文書（FDA-PI / 国内：アラガン・GSK）と矛盾しないこと

### コード品質
- TypeScript strict mode
- 副作用計算は単体テスト100%カバー
- ESLint + Prettier
- engine層は副作用フリー（pure functions）

### アクセシビリティ
- WCAG AA 準拠目標
- キーボード操作可能
- 色だけに頼らない情報提示

### 法的
- 「医療行為の代替ではない」ディスクレーマー常時表示
- 医療広告ガイドライン準拠（症例的演出は教育目的明示）
- ユーザー入力データのローカル保持（個人情報を扱わない）

---

## 9. 成功指標（KPI）

### 教育効果
- 主要 5 部位の合併症を視覚的に再現できる
- スタッフ研修で「副作用の理解度」向上をアンケートで確認

### 技術
- ページ初期表示 <2秒
- インタラクション応答 <100ms
- モバイル / デスクトップ両対応

### ビジネス（クリニック視点）
- カウンセリング時の同意取得時間短縮
- 患者からの「副作用への理解」フィードバック向上
- クリニックブランディングへの貢献（医学的真摯さの表現）
