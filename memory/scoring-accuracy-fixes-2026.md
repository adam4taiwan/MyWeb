---
name: 命書評分準確度修正紀錄（2026）
description: 紫微評分、格局識別、年齡適切性過濾的關鍵修正邏輯，避免日後重蹈同樣錯誤
type: project
---

# 命書評分準確度修正紀錄

> 修正日期：2026-03-23
> 適用：ConsultationController.cs 所有命書端點

---

## 一、格局識別修正（從強格 vs 從殺/財/兒格）

### 問題
`bodyPct <= 20` 時，原程式只要 `oppPct >= 70` 就一律標為「從強格」→ 完全錯誤。
從強格是「印重+比劫重」，不是「日主極弱」。

### 正確邏輯（已實作）
```
if (bodyPct <= 20 && oppPct >= 70)
    依最強非日主元素決定：
    - 七殺(guanPct) 最大 → 從殺格
    - 財星(caiPct) 最大  → 從財格
    - 食傷(shiPct) 最大  → 從兒格
```

### 各從格用神/忌神
| 格局 | 用神(yongShenElem) | 輔助(fuYiElem) | 忌神(jiShenElem) |
|------|-------------------|----------------|-----------------|
| 從殺格 | 七殺（克日主）| 財（生殺）| 印星（破格） |
| 從財格 | 財（日主所克）| 食傷（生財）| 印/比劫（破格） |
| 從兒格 | 食傷（日主所生）| 財（食傷所生）| 印星（制食傷） |

---

## 二、DyCalcZiweiScore 年齡過濾修正

### 問題
化祿入夫妻宮對 80 歲老人 +20 分 → 紫微分虛高 → 顯示小凶而非大凶

### 修正原則
- **正向四化（化祿/化權/化科）**：目標宮位被 `LfShouldSkipPalace(palace, age)` 過濾時，不計入加分
- **化忌**：任何年齡都不過濾（財庫損失、健康受損任何年齡都有意義）
- **大限四化正向**：同樣用 age 過濾

### 函數簽名
```csharp
private static int DyCalcZiweiScore(
    string flStem, JsonElement palaces,
    string daiyunStem = "", int age = 0)
```

### 呼叫點（4處，全部需傳 age）
| 位置 | age 來源 |
|------|---------|
| analyze-daiyun 年度循環 | `age = yr - birthYear` |
| analyze-liunian 流年 | `flAge = year - birthYear` |
| analyze-liunian 逐月 | `flAge`（流年年齡） |
| analyze-topic KB | `flAge = y - birthYear` |

---

## 三、年齡適切性過濾 - 全命書覆蓋狀態

### 核心函式（ConsultationController.cs）
- `LfShouldSkipPalace(palace, age)` - 判斷是否跳過
- `LfPalaceAgeLabel(palace, age)` - 取年齡化標籤
- `LfAgeTopicHint(age)` - 取章節開頭提示文字

### 各命書套用狀態（2026-03-23 完成）

| 命書 | 端點 | 年齡提示 | 婚姻過濾 | 父母過濾 | 子女過濾 | ZiWei評分過濾 |
|------|------|---------|---------|---------|---------|-------------|
| 綜合命書 | analyze-kb | ✓ 報告開頭 | ✓ 整節 | ✓ | ✓ | N/A |
| 八字命書 | analyze-lifelong | ✓ Ch.10 | ✓ Ch.8 | ✓ Ch.5 | ✓ Ch.5 | N/A |
| 大運命書 | analyze-daiyun | ✓ Ch.4 | ✓ LfBranchEventsPalace | ✓ | ✓ | ✓ age參數 |
| 流年命書 | analyze-liunian | ✓ Ch.4 | ✓ LfBranchEventsPalace | ✓ | ✓ | ✓ age參數 |
| 主題命書 | analyze-topic | 不在範圍 | | | | |

### 今日運氣（FortuneController）- 已完成（2026-03-23）

| 端點 | 年齡提示 | 感情過濾 |
|------|---------|---------|
| `daily-personal` | ✓ `GetDailyAgeTopicHint` | ✓ age<16 或 >=75 跳過 |
| `daily-kb` | 無 | ✓ 載入 BirthYear，同規則 |
| `daily`（Gemini）| ✓ `GetGeminiAgeNote` 注入 prompt | ✓ 感情欄位條件顯示 |

---

## 四、DyCrossClass 評分門檻確認

| 八字分 | 紫微分 | 結果 |
|-------|-------|------|
| ≥70（喜）| ≥68（吉）| 大吉 |
| 喜/平 | 吉/平 | 吉/平 |
| <50（忌）| <50（凶）| 大凶 |
| 忌 + 平(50-67) | | 小凶（不是大凶！） |

> 張仙州 2026年修正：從殺格 → 火(丙午)=忌神=15分(忌) + 夫妻宮化祿濾掉後42分(凶) = 大凶 ✓
