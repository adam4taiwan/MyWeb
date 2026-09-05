# 八字科學計量分析頁（/disk/jiliang）實作記錄

## 建立日期：2026-08-28

## 頁面位置
- 前端：`app/[locale]/disk/jiliang/page.tsx`
- 計算引擎：`app/[locale]/disk/jiliang/calculator.ts`
- 入口：disk/page.tsx 管理員限定「八字科學計量分析」靛藍色按鈕
- 後端端點：`GET /api/Consultation/jiliang-bazi-data`（管理員限定）

## 頁面架構

### 三個 Tab
1. **計量引擎**：四柱排盤 + 四階梯計量 + Step5 刑沖合害 + 五行雷達圖
2. **財官格局**：財富/官貴格局評估卡 + 互動模擬器
3. **動態歲運**：80年時間軸表格 + 年份詳細卡

### 客戶選擇流程
搜尋客戶 → 選擇 → 自動執行：
1. PUT `/Auth/profile`（儲存生辰至 admin 帳號）
2. POST `/Astrology/calculate`
3. POST `/Astrology/save-chart`
4. GET `/Consultation/jiliang-bazi-data`（返回計量資料）

## 重要 Bug 修正記錄（避免重複犯）

### Bug 1：API URL 錯誤（2026-08-28）
- **原因**：jiliang/page.tsx 用 `NEXT_PUBLIC_API_BASE_URL`（= `https://ecanapi.fly.dev`），但 Ecanapi 所有路由掛在 `/api/` 下
- **正確**：應用 `NEXT_PUBLIC_API_URL`（fly secret，生產環境含 `/api` 路徑），與 disk/page.tsx 一致
- **關鍵**：`NEXT_PUBLIC_API_BASE_URL` ≠ `NEXT_PUBLIC_API_URL`，兩個 env var 完全不同

### Bug 2：CustomerItem 介面欄位錯誤（2026-08-28）
- **原因**：自訂 `CustomerItem` 有 `birthYear/birthMonth/...` 分開欄位，但 API 的 `CustomerDto` 回傳 `birthDateTime`（UTC ISO 字串）和 `gender`
- **正確**：`{ birthDateTime: string; gender: number }` + 用 `.replace('Z','').split(/[-T:]/)` 拆解
- **參考**：`disk/page.tsx` 的 `loadCustomer()` 寫法

### Bug 3：地支藏干索引偏移（最重要，2026-08-28）
- **EARTHLY_BRANCH_DATA 結構**：
  - `hiddenStems[0]` = 本氣干（mainElement 對應的干，如 戌→戊）
  - `hiddenStems[1+]` = 餘氣干（如 戌→辛、丁）
  - `hiddenElements[0..n-1]` = 餘氣元素（Metal、Fire）
- **錯誤代碼**：`br.hiddenStems[hIdx]`（索引對應本氣干，不是餘氣干）
- **正確代碼**：`br.hiddenStems[hIdx + 1]`（跳過 index 0，從 1 開始取餘氣干）
- **位置**：`getCalculationBreakdown` → `tier2Branches` → `hiddenList.push`
- **連帶錯誤**：由於干字錯，十神計算也全部錯誤

### Bug 4：純支（子卯酉）餘氣顯示重複（2026-08-28）
- **原因**：子/卯/酉 的 hiddenStems 只有 1 個（本氣干），hiddenElements=[mainEl]，索引修正後 `hiddenStems[1]` = undefined = ''
- **修正**：PillarCard 過濾空字串：`branchBreakdown.hidden.filter(h => h.stem)`

### Bug 5：getStemTenGodLabel 藏干顯示「日元(自身)」（2026-08-28）
- **原因**：當藏干干字剛好等於日主（如 辛在戌中，日主也是辛），函數返回「日元(自身)」
- **正確**：藏干語境應返回「比肩」
- **修正**：加 `isHidden = false` 參數；藏干呼叫時傳 `true`，跳過 `stem===dayStem` 判斷
- **呼叫方式**：`getStemTenGodLabel(stem, dayMaster, true)` for hidden stems

## calculator.ts 主要匯出

### 新增（2026-08-28）
- `STEM_YIN_YANG`: Record<string, '陽'|'陰'>（十天干陰陽）
- `BRANCH_YIN_YANG`: Record<string, '陽'|'陰'>（十二地支陰陽）
- `getStemTenGodLabel(stem, dayStem, isHidden?)`: 返回中文十神名稱
  - 比肩/劫財/食神/傷官/偏財/正財/七殺/正官/偏印/正印/日元(自身)
  - 相生順序：木→火→土→金→水→木
  - 相克順序：木克土、土克水、水克火、火克金、金克木
- `applyXingChongHeHai(chart, scores)`: 刑沖合害修正模組
  - 返回 `{ scores: Record<Element, number>; entries: XCHHEntry[] }`

### 原有重要函數
- `buildChartFromApi(apiData)`: JiLiangApiData → BaziChart
- `calculateScores(chart)`: 四階梯基礎計分
- `getCalculationBreakdown(chart)`: 詳細階梯分解（附 tier1~4）
- `getTenGodsElements(dayMaster)`: 返回五行對應角色 {self/output/wealth/officer/resource}
- `generateDynamicTimeline(chart, birthYear, luckCycles, yong, fuyi, ji)`: 80年動態歲運

## 四柱排盤設計

### 順序：時→日→月→年（年在右、時在左）
- grid 渲染順序：`[3, 2, 1, 0].map(i => <PillarCard pillarIndex={i} ... />)`

### PillarCard 特殊樣式
- 日柱（pillarIndex=2）：`border-2 border-stone-400` + 「本命元神」深灰標頭
- 月柱（pillarIndex=1）：`border-2 border-red-600` + 「提綱月令（×1.3）」紅色標頭

### PillarCard 柱副標題
- 年柱：祖上 / 根基 / 早年
- 月柱：父母 / 格局 / 青年
- 日柱：日主自身 / 夫妻 / 中年
- 時柱：子息 / 歸宿 / 晚年

## Step 5 刑沖合害修正

### 規則
- 六沖：強方 -30%、弱方 -60%（同質沖各 -35%）
- 三刑（寅巳申/丑戌未）：各 -35%，需 2+ 個地支在命局中
- 子卯刑：各 -30%
- 六合絆住（無月令支持）：雙方 ×0.8
- 六合化（月令支持化神）：雙方 -80% 貢獻，注入化神 ×1.35
- 六害：藏干各 -5×0.25

### 前端整合
- EngineTab 接受 `xchhResult` prop（從主頁 useMemo 計算）
- 五行總分條顯示「原 XX → 修正後 XX（±XX）」
- FortuneTab 和 DynamicTab 使用修正後分數
- 頁首標示「刑沖合害 N組」

## 後端 jiliang-bazi-data 端點

返回欄位：
- `pillars.year/month/day/hour.stem/branch`
- `yongShenElem`（用神五行中文，如「土」）
- `fuYiElem`（喜神）
- `jiShenElem`（忌神）
- `pattern`（格局名稱）
- `bodyPct`（身強弱百分比）
- `gender`（1=男 2=女）
- `birthYear`
- `name`
- `luckCycles`（大運列表，startAge/endAge/stem/branch）
