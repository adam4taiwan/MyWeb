---
name: 命書年齡適切性過濾規則
description: 所有命書/大運/流年論斷的共用年齡過濾規則 - 依年齡跳過不合現實的宮位論斷
type: project
---

# 命書年齡適切性過濾規則

> 適用範圍：大運命書、流年命書、終身命書、主題命書所有宮位論斷段落

---

## 核心原則

**論斷先看年齡，年齡不合的論斷一律跳過或刪除。**
- 不談 80 歲老人的感情婚姻
- 不談 80 歲老人的父母
- 不談 15 歲少年的婚姻子女
- 高齡者一律聚焦：健康、財庫、子女孫輩

---

## 宮位過濾規則（`LfShouldSkipPalace`）

| 宮位 | 跳過條件 | 理由 |
|------|---------|------|
| 父母宮 | age >= 65 | 65+ 父母多已故世 |
| 夫妻宮 | age < 16 OR age >= 75 | 太小不談婚戀；75+ 不談新感情 |
| 子女宮 | age < 18 | 18前不談子女 |
| 官祿宮 | age >= 80 | 80+ 不談事業升遷 |

---

## 宮位名稱年齡化（`LfPalaceAgeLabel`）

| 原名 | 年齡條件 | 顯示名稱 |
|------|---------|---------|
| 父母宮 | 61-64歲 | 長輩宮 |
| 子女宮 | 50歲以上 | 子女孫輩宮 |

---

## 年齡主題提示（`LfAgeTopicHint`）

| 年齡 | 提示文字 |
|------|---------|
| ≤15歲 | 著重學業、父母庇蔭、品格養成 |
| 16-25歲 | 著重事業起步、感情萌芽 |
| 26-60歲 | （無提示，全面論斷） |
| 61-70歲 | 著重健康、財庫穩定、子女孫輩 |
| 71-80歲 | 不談父母（已故）、不談新感情，著重健康長壽、財庫守護 |
| 80歲以上 | 著重健康養生、財庫守護、子女孫輩 |

---

## 適用位置（已實作）

### ConsultationController.cs

| 位置 | 說明 |
|------|------|
| `LfBranchEventsPalace(age)` | 大運/大限地支刑宮分析 |
| `LfPalaceImpact(relType, palace, age)` | 宮位互動影響文字 |
| Ch.3 宮干四化顯示 | 用 `pStart`（大限起始年齡）過濾 |
| Ch.4 流年四化顯示 | 用 `d.age`（當年年齡）過濾 |
| 紫微大限警示 | 用 `lc.startAge` 過濾 |
| 大限事業宮顯示 | age >= 80 跳過 |
| Ch.4 章節開頭 | `LfAgeTopicHint` 顯示年齡背景提示 |
| analyze-kb 婚姻感情節 | `LfShouldSkipPalace("夫妻宮", currentAge)` 整節跳過 |
| analyze-kb 家庭緣份節 | 父母宮/子女宮分別過濾 + `LfPalaceAgeLabel` |
| analyze-lifelong Ch.5 六親論斷 | 父母/夫妻/子女宮分別過濾 |
| analyze-lifelong Ch.8 婚姻感情 | 整節跳過 |
| analyze-lifelong Ch.10 開頭 | `LfAgeTopicHint` 年齡提示 |
| `DyCalcZiweiScore(age)` | 正向四化跳過不合年齡宮位；化忌不過濾 |

### FortuneController.cs（2026-03-23 完成）

| 位置 | 說明 |
|------|------|
| `daily-personal` 感情域 | `currentAge<16 \|\| >=75` 跳過 |
| `daily-personal` 開頭 | `GetDailyAgeTopicHint(currentAge)` 年齡提示 |
| `daily-kb` 感情域 | 載入用戶 BirthYear，同感情過濾規則 |
| `daily` Gemini prompt | `GetGeminiAgeNote(age)` 注意事項，感情欄位條件顯示 |

---

## 未來擴充方向

- 流年命書 Ch.3（月建分析）加入年齡過濾
- 終身命書 LfBuildReport 的流年逐年段落加入年齡過濾
