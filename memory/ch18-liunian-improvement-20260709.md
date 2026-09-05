# Ch18 流年提要改進（2026-07-09，commit d580480）

## 改動目標

解決「大運吉但流年凶，命書仍說全力進取」的根本問題。
以黃鎮科案例（198310181536男）為驗證：34-43歲戊午大運評「人生最佳期」，
但38-42歲虧損上億——原因是流年壬寅/癸卯忌神爆發，命書未給出足夠警示。

---

## 改動一：次忌元素（ciJiElem）納入評分

**位置：** `LfBuildFlowYearSummaryChapter`，for loop 前

```csharp
string ciJiElem = LfElemOvercomeBy.GetValueOrDefault(yongShenElem, "");
// 次忌 = 克用神的五行（如用神=火則次忌=水）
```

**stemBad/brBad 拆分 Major/Minor：**
```csharp
bool stemBadMajor = flStemElem == jiShenElem;          // 大忌（克身）
bool stemBadMinor = !stemBadMajor && flStemElem == ciJiElem; // 次忌（克用神）
bool stemBad      = stemBadMajor || stemBadMinor;
// brBad 同理
```

---

## 改動二：goodScore 重新計算

```csharp
int stemScore = stemGood ? 2 : stemBadMajor ? -2 : stemBadMinor ? -1 : 0;
int brScore   = brGood   ? 1 : brBadMajor   ? -1 : brBadMinor   ?  0 : 0;
int goodScore = stemScore + brScore + (hasAuspicious ? 1 : 0) - (hasFiend ? 1 : 0);
// 三合成忌神局額外扣2分（已成局者影響全年）
foreach (var (brs, elem) in LfSanHe)
{
    var pts = brs.Where(b => b != flBranch && chartBranches.Contains(b)).ToList();
    if (pts.Count == 2)
        goodScore += (elem == yongShenElem || elem == fuYiElem) ? 1 : -2;
}
```

---

## 改動三：四象限文字分級

加入 **`flBadSevere`**（嚴重凶年）：天干地支皆大忌，或三合成忌神局。

```csharp
bool flBadSevere = (stemBadMajor && brBadMajor) ||
    LfSanHe.Any(sh => sh.branches.Contains(flBranch) &&
        sh.branches.Where(b => b != flBranch).All(b => chartBranches.Contains(b)) &&
        sh.elem == jiShenElem);
```

**文字分級對照：**

| 大運 | 流年 | 輸出文字 |
|------|------|---------|
| 吉 | 嚴重凶 | 【警示】大運雖有護持，本年忌神（XXX）雙重爆發，切勿大額投資，嚴格守成 |
| 吉 | 凶 | 喜用大運×忌神流年：大方向有利，但本年逆風（XXX），宜守不宜攻 |
| 吉 | 吉 | 喜用大運×喜用流年：順境疊加，本年主事機遇最強，全力把握 |
| 凶 | 吉 | 忌神大運×喜用流年：底盤壓力仍在，今年有小機遇，低調中把握，切勿重押 |
| 凶 | 嚴重凶 | 【嚴重警示】大運與流年忌神雙重壓力，此年風險極高，全面守成，不動為上 |
| 凶 | 凶 | 忌神大運×忌神流年：雙重壓力疊加（XXX），暫緩重大決策 |

**jiDesc（忌神方向說明）**：
- 木 → 官殺忌（防壓力、法律糾紛）
- 水 → 財忌（切勿大額舉債投資）
- 火 → 印忌（防貴人失去、文書困擾）
- 金 → 食傷忌（防才藝耗損、官非）
- 土 → 比劫忌（防競爭破財、合夥損失）

---

## 改動四：流年神煞

**位置：** yunEvents 輸出之後，異動信號之前

計算方式（依流年地支三合組判斷）：

| 神煞 | 申子辰 | 亥卯未 | 寅午戌 | 巳酉丑 | 吉凶判斷 |
|------|------|------|------|------|---------|
| 驛馬 | 寅 | 巳 | 申 | 亥 | 神煞五行喜→吉，忌→凶 |
| 桃花 | 酉 | 子 | 卯 | 午 | 神煞五行喜→吉，忌→凶 |
| 劫煞 | 巳 | 申 | 亥 | 寅 | 固定凶（防破財小人） |
| 犯太歲 | flBranch == 生年支 | → 固定警示 |

若神煞地支出現在命局（chartBranches），標注「引動更強」。

---

## 驗證（黃鎮科 2022壬寅）

舊版：壬（中性）+ 寅（大忌）= 流年「忌」，文字「凶中有護，謹慎推進」
新版：壬（次忌）+ 寅（大忌）+ 三合亥卯未成木局（助凶-2）= 流年「大凶」
→ 輸出「【警示】大運雖有護持，本年忌神（官殺忌）雙重爆發，切勿大額投資，嚴格守成」
→ 神煞：劫煞（引動命局）、驛馬（引動命局，出行易耗損）

---

## 命書品質問題（今日討論，待後續改進）

1. **第三章一柱論命**：大量女命條件混入男命，需過濾
2. **第六/八/九章 KB 技術術語**：「如格局不強，薪水生涯」「奉子命結婚」需移除
3. **補充論斷條件過濾**：條件不符者不應顯示（如「年干為丙」但本命年干是癸）
4. **身弱月刃格大運評分**：大運吉需配合流年逐年評估，不可只標「人生最佳期」
