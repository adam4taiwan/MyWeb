---
name: 大運命書規格文件
description: 大運命書新功能的完整規格，包含 API 設計、章節結構、交叉驗證矩陣、Helper 方法清單
type: project
---

# 大運命書（analyze-daiyun）規格文件

## 上線日期
2026-03-20 完成上線

## 功能概述

以**今日起算**，選擇 5/10/20/30/終身 年份，逐年產出大運流年分析報告。
每年以 **八字喜忌 + 紫微十二宮** 交叉驗證，得出吉凶等級與詳細描述。

---

## API 規格

**端點**：`GET /api/Consultation/analyze-daiyun?years={years}`

- `years` = 5 / 10 / 20 / 30 / 0（0 = 終身，算到 80 歲止）
- 需 JWT 認證
- 不修改任何現有方法，完全獨立實作

**點數消耗**（重用 FORTUNE_DURATIONS）：
| years | 點數 |
|-------|------|
| 5     | 150  |
| 10    | 200  |
| 20    | 250  |
| 30    | 300  |
| 0     | 500  |

**回傳結構**：
```json
{
  "result": "完整報告文字（同八字命書格式）",
  "annualForecasts": [
    {
      "year": 2026,
      "age": 35,
      "stemBranch": "丙午",
      "daiyunStem": "甲",
      "daiyunBranch": "子",
      "baziScore": 75,
      "ziweiScore": 70,
      "crossClass": "吉",
      "summary": "流年一句話摘要"
    }
  ],
  "remainingPoints": 350
}
```

---

## 報告五章結構

### 第一章：命主資料 + 大運概況
- 姓名、性別、出生日期、八字四柱
- 今日起點大運（大運天干地支、年齡段）
- 分析年份範圍（例：2026-2030）

### 第二章：大運干支論斷
- 大運天干：喜忌評分
- 大運地支：喜忌評分 + 宮位互動（同八字命書 v2.1 的 LfBranchEventsPalace）
- 大運整體評分

### 第三章：流年逐年分析（核心章節）
每年一段，格式：

```
【西元年】20XX 年（流年天干地支）
年齡：XX 歲    大運：甲子（天干X·地支Y）
八字評分：XX 分    紫微評分：XX 分    綜合：【大吉/吉/平/小凶/大凶】

▍ 八字面向
流年天干（五行·十神）喜忌：○/X/△
流年地支（五行·十神）喜忌：○/X/△
歲君沖剋命局...

▍ 紫微面向
命宮：[主星] [廟旺/陷弱] [大運星曜] [四化飛入]
財帛宮：...
事業宮：...
夫妻宮：...（依命主需求展開）

▍ 綜合論斷
八字喜+紫微吉 → 大吉：...
（依交叉矩陣給出實質建議）
```

### 第四章：重點宮位綜合（整個分析期間）
- 財帛宮趨勢總結
- 事業官祿宮趨勢
- 夫妻宮趨勢
- 健康疾厄提醒

### 第五章：趨吉避凶總建議
- 最佳把握年份（大吉年份列出）
- 需謹慎年份（大凶/小凶年份列出）
- 具體行動建議

---

## 交叉驗證矩陣

| 八字\紫微 | 吉 | 平 | 凶 |
|-----------|----|----|-----|
| 喜        | 大吉 | 吉 | 平 |
| 平        | 吉  | 平 | 小凶 |
| 忌        | 平  | 小凶 | 大凶 |

**八字評分 → 喜忌等級：**
- 80+：喜
- 50-79：平
- <50：忌

**紫微評分 → 吉凶等級：**
- 75+：吉
- 45-74：平
- <45：凶

---

## 新增 Helper 方法（Dy* 系列）

### DyGetYearStemBranch(int year) → (string stem, string branch)
以年份計算流年天干地支（六十甲子）

### DyCalcStemScore(string flowStem, string yongShenElem, string jiShenElem) → int
流年天干喜忌評分（0-100）

### DyCalcBranchScore(string flowBranch, string yongShenElem, string jiShenElem, string[] chartBranches) → int
流年地支喜忌評分，含刑沖會合影響

### DyGetFlowYearSiHua(string flowStem, Dictionary<string,string[]> palaces) → string
取得流年四化飛入各宮的描述

### DyCalcZiweiScore(string flowStem, string flowBranch, Dictionary<string,ZiweiPalace> palaces) → int
紫微十二宮本年吉凶評分（0-100）

### DyCrossClass(int baziScore, int ziweiScore) → string
依交叉矩陣回傳：大吉/吉/平/小凶/大凶

### DyBuildReport(命主資料, 流年清單) → string
整合五章報告文字

---

## 前端調整

### disk/page.tsx
- FORTUNE_DURATIONS 已有 5/10/20/30/終身 選項，無需新增
- 新增 package type 判斷：`packageId === 'daiyun-5yr'` 等
- 呼叫 `/api/Consultation/analyze-daiyun?years={years}`
- 新增 `annualForecasts` state，顯示逐年摘要卡片
- 報告渲染沿用現有 `renderReport()` + `generateDOC()` 邏輯

### 新增 packageId（disk/page.tsx 的 PACKAGES 或 FORTUNE_DURATIONS）
```typescript
// 大運命書使用獨立 packageId
{ id: 'daiyun-5yr',  label: '大運命書 5年',  points: 150, years: 5  }
{ id: 'daiyun-10yr', label: '大運命書 10年', points: 200, years: 10 }
{ id: 'daiyun-20yr', label: '大運命書 20年', points: 250, years: 20 }
{ id: 'daiyun-30yr', label: '大運命書 30年', points: 300, years: 30 }
{ id: 'daiyun-life', label: '大運命書 終身', points: 500, years: 0  }
```

---

## 涉及檔案

- `Ecanapi/Controllers/ConsultationController.cs` - 新增 `AnalyzeDaiyun` endpoint + `Dy*` helpers
- `MyWeb/app/disk/page.tsx` - 新增 daiyun package 選項 + 呼叫邏輯 + annualForecasts 顯示

---

## 注意事項

- 不修改 `AnalyzeLifelong` 或任何現有方法
- 紫微資料來源：使用者的 `UserBirthInfo`（同現有流程）
- 若使用者無紫微資料，紫微評分預設 50（平），並在報告中說明
- 大運命書與八字命書共用 `renderReport()` 渲染邏輯，無需額外改動
