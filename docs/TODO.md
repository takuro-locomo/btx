# 開発 TODO / ロードマップ

## Phase 1: MVP（1-2週間目標）

### 環境構築
- [ ] `npm install` で依存解決
- [ ] vite.config.ts 作成
- [ ] tailwind.config.js 作成
- [ ] index.html / src/main.tsx / src/App.tsx の最小実装
- [ ] ESLint / Prettier 設定

### 顔ベース SVG
- [ ] `public/face-base.svg` 作成（500x600、解剖学的に正しい正面顔）
  - 顔輪郭、眉毛、目、鼻、口、耳の位置決め
  - 眼窩骨縁・鼻骨・下顎角の参考線
- [ ] `src/data/zones.ts` の座標を SVG に合わせて微調整

### コア実装
- [ ] `src/store/useSimStore.ts` — Zustand ストア
- [ ] `src/components/FaceCanvas.tsx` — クリックで注入点配置
- [ ] `src/components/InjectionMarker.tsx` — 注入点 UI
- [ ] `src/components/WrinkleLayer.tsx` — しわ表示・改善アニメ
- [ ] `src/components/SideEffectLayer.tsx` — 副作用オーバーレイ
- [ ] `src/components/DosePanel.tsx` — 用量スライダー
- [ ] `src/components/ResultPanel.tsx` — 結果表示
- [ ] `src/components/EvidencePanel.tsx` — 出典表示
- [ ] `src/components/DisclaimerBanner.tsx`

### テスト
- [ ] `tests/engine/geometry.test.ts` — isInsidePolygon 等
- [ ] `tests/engine/efficacy.test.ts`
- [ ] `tests/engine/simulate.test.ts` — 眉間の代表シナリオ
  - 適切（5点20U）→ 高改善・低副作用
  - 過量（5点40U）→ 改善は飽和、副作用増
  - 眉毛直上（危険ゾーン内）→ 眼瞼下垂高確率
  - 中央偏重 → Spock brow 検出

## Phase 2: 主要部位拡張（3-4週間目標）

### Zone 追加（ナレッジ集の数値で）
- [ ] `forehead`（額）— glabella とのコンビ運用ロジックも
- [ ] `crows_feet_left` / `crows_feet_right`
- [ ] `bunny_lines`

### 副作用視覚化
- [ ] 眼瞼下垂レイヤー（瞼を下げる）
- [ ] 眉毛下垂レイヤー（眉を下げる）
- [ ] Spock brow レイヤー
- [ ] 笑顔非対称レイヤー

### UI 改善
- [ ] プリセットセレクター（教育シナリオ）
- [ ] エビデンスパネル展開 UI
- [ ] モバイルレイアウト調整

## Phase 3: 完成度（5-6週間目標）

### 残り Zone
- [ ] gummy_smile
- [ ] lip_flip
- [ ] mentalis
- [ ] dao_left / dao_right
- [ ] masseter_left / masseter_right（横顔ビュー必要）

### プリセット
- [ ] 「適切な眉間注入」
- [ ] 「眉毛直上に打ちすぎ → 眼瞼下垂」
- [ ] 「外側のみ → Spock brow」
- [ ] 「Crow's feet 低位置 → 頬部下垂」
- [ ] 「リップフリップ過量 → 発音障害」
- [ ] 「Masseter 表在注入 → 笑顔非対称」

### 多言語化
- [ ] i18n セットアップ
- [ ] 英語版

### アクセシビリティ
- [ ] キーボード操作
- [ ] ARIA ラベル
- [ ] 色覚多様性対応

## Phase 4: 拡張機能（将来）

- [ ] 患者カウンセリングモード
- [ ] 医師研修モード（詳細解剖図）
- [ ] PDF レポート出力
- [ ] platysma（広頸筋）対応・横顔ビュー
- [ ] 男女別最適化
- [ ] 年齢別最適化
- [ ] BoNT 製剤間換算（onabot / abobot / incobot 等）

## ナレッジ更新タスク（継続）

- [ ] アジア人 vs 白人の解剖学的差異
- [ ] 直近 RCT・SR 取り込み
- [ ] 日本国内承認薬の添付文書情報追加
- [ ] 抗体保有患者対応の追記

## 技術的負債管理

- [ ] engine 層のテストカバレッジ 100%
- [ ] パフォーマンス：初期表示 <2 秒、操作応答 <100ms
- [ ] モバイル Safari でのタッチイベント検証
- [ ] PWA 化検討（オフライン研修用）
