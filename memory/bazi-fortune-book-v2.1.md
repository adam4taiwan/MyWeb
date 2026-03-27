---
name: 八字命書 v2.1 功能說明
description: 天干地支喜忌表格 + 大運宮位論斷 兩項優化的實作細節與改版記錄
type: project
---

# 八字命書 v2.1 功能說明

## 上線日期
2026-03-17

## 改版項目

### 1. 天干地支喜忌對照表格化

**問題：** 原本第四章的天干地支喜忌用純文字空格對齊，在不同字寬下排版歪斜。

**解法：** 後端改用 pipe table 格式輸出，前端 `renderReport()` 轉為 HTML 表格渲染。

**表格格式（兩個獨立表格，各4列）：**
```
【天干喜忌對照】
| 天干 | 甲 | 乙 | 丙 | 丁 | 戊 | 己 | 庚 | 辛 | 壬 | 癸 |
|:---:|:---:|...|
| 五行 | 木 | 木 | 火 | 火 | 土 | 土 | 金 | 金 | 水 | 水 |
| 十神 | 正財 | 偏財 | ... |
| 喜忌 | △忌 | △忌 | X | X | ○ | ○ | ... |

【地支喜忌對照】（*=命局已有）
| 地支 | 子 | 丑* | 寅 | ... |
|:---:|...|
| 五行 | 水 | 土 | 木 | ... |
| 十神 | 食神 | 偏印 | ... |
| 喜忌 | ○ | ○ | △忌 | ... |
說明：○=喜用  △忌=次忌（克用神）  △=中性  X=大忌（克身）
```

**喜忌判定邏輯（`Cls()` 函式）：**
- `X`（大忌）：五行 == jiShenElem
- `○`（喜用）：五行 == yongShenElem 或 fuYiElem 或 tuneElem（調候）
- `△忌`（次忌）：五行 == jiYongElem（克用神，非大忌）
- `△`（中性）：其餘

**雙重呈現：**
- 嵌入第四章報告紙張內（文字報告的一部分）
- 下方獨立卡片（`yongJiTable` 結構化資料，含顏色標示：X=紅、○=綠、△忌=橙）

**涉及檔案：**
- `Ecanapi/Controllers/ConsultationController.cs` - `LfBuildYongJiTable()`
- `MyWeb/app/disk/page.tsx` - `renderReport()` pipe table 邏輯、`yongJiTable` state

---

### 2. 大運地支事項改為宮位論斷

**問題：** 原本大運地支刑沖會合破都輸出通用文字「宜留意相關人事變動」，無實質意義。

**解法：** 新增 `LfBranchEventsPalace()` 函式，指定每個互動的六神與受影響宮位。

**宮位對照：**
| 命柱 | 對應宮位 |
|------|---------|
| 年支 | 父母宮 |
| 月支 | 兄弟宮 |
| 日支 | 夫妻宮 |
| 時支 | 子女宮 |

**輸出格式範例：**
```
【地支事項】大運地支午（七殺）：
與父母宮（正印·辰）六沖，留意父母長輩健康或緣分波動。
與夫妻宮（比肩·子）三刑，配偶、感情易有波動，婚姻宜多溝通。
```

**互動類型處理：**
- 六沖、六合、相刑（三刑）、六害、六破（逐支對照）
- 三會局、三合局（需命局兩支配合，列出兩個受影響宮位）

**`LfPalaceImpact()` 結果文字：**
- 父母宮 + 凶（沖刑害破）→「留意父母長輩健康或緣分波動。」
- 父母宮 + 吉（合）→「父母長輩緣分加深，有長輩提攜。」
- 兄弟宮 + 凶 →「兄弟、友人、同事易有摩擦或分離。」
- 夫妻宮 + 凶 →「配偶、感情易有波動，婚姻宜多溝通。」
- 子女宮 + 凶 →「子女或晚輩易有狀況，晚運宜謹慎。」

**大運標題也新增地支十神：**
```
舊：20-30 歲 大運：甲午（比肩）  評分：65 分（中吉運）
新：20-30 歲 大運：甲午（天干比肩·地支七殺）  評分：65 分（中吉運）
```

**涉及檔案：**
- `Ecanapi/Controllers/ConsultationController.cs`
  - `LfBranchEventsPalace()` - 新函式
  - `LfPalaceImpact()` - 新函式
  - Ch.10 大運論斷區塊

---

### 3. DOC 匯出支援 pipe table

**問題：** `generateDOC()` 原本不處理 `|...|` 格式，第四章表格在 DOC 內顯示為原始文字。

**解法：** 在 `generateDOC()` 加入 pipe table 收集與轉換邏輯。

**涉及檔案：**
- `MyWeb/app/disk/page.tsx` - `generateDOC()` 函式加入 `tableBuffer` + `flushDocTable()`

---

### 4. renderReport() bug 修正

**問題：** 原 `renderReport()` 在 `isTableRow` 時也呼叫 `flushTable()`，導致每一列獨立渲染為一個小表格。

**修正：** 移除 `isTableRow` 分支內的 `flushTable()` 呼叫，只在遇到非 table 列時才 flush。

```typescript
// 修正前（錯誤）
if (isTableRow) {
  flushTable();  // BUG: 每列都獨立渲染
  tableRows.push(...);
}

// 修正後（正確）
if (isTableRow) {
  tableRows.push(...);  // 只累積，不 flush
}
```

---

## API 回傳資料結構新增

`GET /api/Consultation/analyze-lifelong` 回傳新增 `yongJiTable`：

```json
{
  "yongJiTable": {
    "stems": [
      { "stem": "甲", "elem": "木", "shiShen": "正財", "cls": "△忌" },
      ...10 items
    ],
    "branches": [
      { "branch": "子", "elem": "水", "shiShen": "食神", "cls": "○", "inChart": true },
      ...12 items
    ]
  }
}
```

## 注意事項

- `cleanReport()` 會移除 `*` 字元，地支的命局標記 `子*` 在頁面報告中的 `*` 會被清除（但表頭說明仍保留），下方獨立卡片使用 `inChart` 欄位判斷，不受影響
- `LfBranchEventsPalace()` 的三刑判定用 `xg.Contains(lcBranch) && xg.Contains(cb)`，lcBranch == cb 時也可能觸發（同一地支不應自刑，但命局四柱不會有完全相同兩支除非重複）
