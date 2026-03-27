---
name: 玉洞子命書 v2.0 架構規格
description: 玉洞子命書（內部版）完整規格，含表頭/表尾/16章/每章標題與內容來源
type: project
---

# 玉洞子命書 v2.0（內部版）完整規格

---

## 全域原則：日柱斷語優先（BaziDayPillarReadings）

**核心規則：** 所有章節，凡有對應 `BaziDayPillarReadings` 欄位者，**優先以 KB 原文輸出**，再接計算結果補充。無 KB 內容時才僅用計算結果。

| 章節 | 優先使用的 KB 欄位 | 補充來源 |
|------|-------------------|---------|
| 第一章 審時聞切 | — | `LfShiWenSection` |
| 第二章 日元分析 | `Overview`（概論）| `LfPillarNaYin` 納音說明 |
| 第三章 | 全部 10 欄位 | — |
| 第四章 命局格局 | `ShenAnalysis`（神殺特質，補充性格說明）| `LfCalcWuXingMatrix` |
| 第五章 格局用神 | — | `LfDetectGeJuAndYongShen` |
| 第六章 先天星盤 | — | `ChartJson.palaces` |
| 第七章 宮星化象 | — | `KbZiweiFullQuery` |
| 第八章 命宮格局 | — | `ziwei_patterns_144` |
| 第九章 四化飛星 | — | `KbGongWeiSiHuaQuery` |
| 第十章 事業格局 | `Career`（事業傾向，置於過三關之前）| `KbSanmenCareer` |
| 第十一章 六親 | `MotherInfluence`（母星影響，置於母緣之後）| `KbSanmenSixRelatives` |
| 第十二章 婚姻 | `MaleChart` / `FemaleChart`（男/女命婚姻特質）| 紫微夫妻宮 |
| 第十三章 疾厄 | `Weaknesses`（天生弱點，置於臟腑分析後）| `KbSanmenHealthLongevity` |
| 第十四章 大運 | — | `scored` |
| 第十五章 開運 | `SpecialHours`（最佳時辰，置於貴人期之後）| 八字/紫微方位色彩 |
| 第十六章 總評 | `InnerTraits`（內在特質，收尾引用）| `scored` 聚合 |

---

## 表頭（Header）

**圖樣：**
- 背景紙紋：`wwwroot/images/中國風格書寫紙.png`
- 封面英雄圖：`wwwroot/images/cover_page.jpg`（頁首橫圖，450×180 EMU）

**文字內容：**
```
玉 洞 子 命 書（內部版）
________________________
姓名          {userName}
陽曆生日      {year}年 {month}月 {day}日 {hour}時 {minute}分
農曆生日      {lunarDateText}
四柱          {yStem}{yBranch}  {mStem}{mBranch}  {dStem}{dBranch}  {hStem}{hBranch}

時辰恐有錯  陰騭最難憑
萬般皆是命  半點不求人
```

**資料來源：**
- `user.UserName`、`user.BirthYear/Month/Day/Hour/Minute`
- 農曆：`ChartJson.lunarDate`（或由排盤回傳）
- 四柱：`ChartJson.bazi.*Pillar`

---

## 第一章：審時聞切

**章節標題：** `第一章：審時聞切 · 四時定數`

**定位：** 開篇驗身章。目的是讓命主確認出生時辰是否正確（胎記/疤痕位置、外貌像父/母、出生時人數），作為全書命盤可信度的基礎。若時辰有誤，後續論斷需保留彈性。

**輸出格式：**

```
【審時聞切 · 四時定數】
您生於 {timeBranch}時之{timeSection}（第{totalQuarter}刻）。外貌個性{lookLike}{personality}
印記印證：{胎記文字}。根據出生的刻分判定，您出生時母親身邊只有 {personCount} 個人。

【時柱斷驗 · 古傳口訣】
{mingshuDetail}
```

若 `birthMinute` 無資料（精確刻分未知）：
```
（時辰精確刻分未提供，審時聞切略去，建議當面確認時辰後補驗）
```

**輸出邏輯（`LfShiWenSection` 靜態方法）：**
- `timeBranch`：時柱地支
- `timeSection`：時初（第1-4刻）/ 時末（第5-8刻）
- `totalQuarter`：`(birthMinute / 15) + 1`，取 1-8
- `personCount`：`relativeQuarter`（上四刻第幾刻 / 下四刻第幾刻）
- 胎記：男命陰時有，女命陽時有
- 胎記位置：第1刻=臉上，第2刻=身上，第3刻=手上，第4刻=腳上
- 外貌像誰：陽支像母（男）/ 陰支像父（男）；女相反
- `mingshuDetail`：辰戌丑未孤煞口訣（或其他地支對應口訣）

**資料來源：**
- `user.BirthMinute`（`userChart` 或 `user` 欄位）
- `LfShiWenSection(timeBranch, birthMinute, gender)`（提取自 `AnalysisReportService.GenerateShiWenSection()`）

**KB 優先：** 此章無對應 `BaziDayPillarReadings` 欄位，全用計算邏輯。

---

## 第二章：四柱根苗花果

**章節標題：** `第二章：先天八字依古制定`

**一、根苗花果（四柱表）**

```
        時柱        日柱        月柱        年柱
六神    {hStemSS}   元神        {mStemSS}   {yStemSS}
天干    {hStem}     {dStem}     {mStem}     {yStem}
地支    {hBranch}   {dBranch}   {mBranch}   {yBranch}
藏神    {h藏神}     {d藏神}     {m藏神}     {y藏神}
納音    {hNaYin}    {dNaYin}    {mNaYin}    {yNaYin}
        旺          相          死          休          囚
五行    {月令旺}    {月令相}    {月令死}    {月令休}    {月令囚}
```

**資料來源：**
- 六神：`LfStemShiShen(stem, dStem)`
- 藏神：`LfPillarHiddenPairs(pillar)`（主氣 > 中氣 > 餘氣）
- 納音：`LfPillarNaYin(pillar)`
- 旺相死休囚：以月令 `mBranch` 推各五行狀態

---

**二、干支五行十神計分表（pipe table）**

天干十神：
```
| 天干 | 甲 | 乙 | 丙 | 丁 | 戊 | 己 | 庚 | 辛 | 壬 | 癸 |
| 五行 | 木 | 木 | 火 | 火 | 土 | 土 | 金 | 金 | 水 | 水 |
| 十神 |    |    |    |    |    |    |    |    |    |    |
```

地支藏神計分（逐支計算有根力）：
```
計 {yStem計} {yBranch計} ... 合計 {total}
```

**資料來源：** `LfCalcWuXingMatrix()` / `LfStemShiShen()`

---

**三、日元分析**

- `{dStem}{dBranch}` 日柱古典評等（下等/中等/上等）
- 納音描述（`dNaYin` 對應說明）
- 日干口訣（來自 AnalysisReportService 的 `DiagnoseDayStemAuspiciousness`，或直接查 `BaziDayPillarReadings.Overview`）

**資料來源：** `BaziDayPillarReadings.Overview`（DB）

---

## 第三章：日柱深度論斷

**章節標題：** `第三章：日柱深度論斷`

**副標題：** `【日柱 {dStem}{dBranch} — 古傳斷語】`

各欄位（非空才輸出，連同標題一起）：

| 標題 | DB 欄位 |
|------|---------|
| 概論 | `Overview` |
| 神殺特質 | `ShenAnalysis` |
| 內在特質 | `InnerTraits` |
| 事業傾向 | `Career` |
| 天生弱點 | `Weaknesses` |
| 母星影響 | `MotherInfluence` |
| 月令影響 | `MonthInfluence` |
| 男命論斷（gender=1）或 女命論斷（gender=2）| `MaleChart` / `FemaleChart` |
| 最佳時辰 | `SpecialHours` |

**資料來源：** `BaziDayPillarReadings` WHERE `DayPillar = {dStem}{dBranch}`

**規則：**
- 純原文，禁止 Gemini 介入
- 若查無資料標注「（此日柱斷語尚待補充）」，不中斷報告

---

## 第四章：命局體性與格局

**章節標題：** `第四章：命局格局判定`

**一、命局體性（寒暖濕燥）**

```
月支 {mBranch} 生人，命局屬【{seaLabel}】。
最喜：{調候喜用}。最忌：{調候禁忌}。
```

條件輸出（溫和體性省略）

**二、日主強弱判定**

```
日干 {dStem}（{dmElem}），月令 {mBranch}（{season}季）。
五行分布：木{木%}% 火{火%}% 土{土%}% 金{金%}% 水{水%}%
比印陣：{biJiPct}% | 洩克陣：{100-biJiPct}%
結論：日主【{bodyLabel}】（強弱度：{bodyPct}%）
```

**三、格局判定**

```
格局：【{pattern}】
{LfPatternDesc(pattern)}
```

**資料來源：**
- `LfGetSeasonLabel(mBranch)` → seaLabel
- `LfCalcWuXingMatrix()` → wuXing
- `LfGetBodyStrengthPct/Label()` → bodyPct, bodyLabel
- `LfDetectGeJuAndYongShen()` → pattern

---

## 第五章：天干地支喜忌

**章節標題：** `第五章：格局與用神判定`

**一、用神喜忌**

```
格局：【{pattern}】
用神：【{yongShenElem}】（理由：{yongReason}）
喜用：天干 {LfElemStems(yongShenElem)}，地支 {LfElemBranches(yongShenElem)}
輔助喜神：【{fuYiElem}】（{印比互補/官財互補}）   ← 與用神不同才顯示
調候喜神：【{tuneElem}】（冬月寒凍喜火/夏月炎熱喜水）← 需要才顯示
大忌(X)：{jiShenElem}，天干 {...}，地支 {...}
次忌(△忌)：{jiYongElem}（克用神 {yongShenElem}）  ← 不同才顯示
格局說明：{LfPatternDesc(pattern)}
```

**二、天干喜忌對照表**

```
| 天干 | 甲 | 乙 | 丙 | 丁 | 戊 | 己 | 庚 | 辛 | 壬 | 癸 |
| 五行 | 木 | 木 | 火 | 火 | 土 | 土 | 金 | 金 | 水 | 水 |
| 十神 |    |    |    |    |    |    |    |    |    |    |
| 喜忌 | ○  | ○  | △  | X  | ...                         |
```

**三、地支喜忌對照表**

```
| 地支 | 子 | 丑 | 寅 | 卯 | 辰 | 巳 | 午 | 未 | 申 | 酉 | 戌 | 亥 |
| 五行 | 水 | 土 | 木 | 木 | 土 | 火 | 火 | 土 | 金 | 金 | 土 | 水 |
| 十神 |    |    |    |    |    |    |    |    |    |    |    |    |
| 喜忌 | △  | △  | ○  | ○  | ...                                   |
| 命局 | =  |    | =  |    | ...（命局已有者標記）                 |
```

圖例：`○=喜用  △忌=次忌（克用神）  △=中性  X=大忌（克身）  ==命局已有`

**資料來源：**
- `LfDetectGeJuAndYongShen()` → pattern, yongShenElem, fuYiElem, yongReason
- `LfGetJiShenElem()` → jiShenElem
- `LfBuildYongJiTable()` → 喜忌表（已有）

---

## 第六章：先天星盤（紫微）

**章節標題：** `第六章：先天星盤`

**一、審時聞切 · 四時定數**

```
【審時聞切 · 四時定數】
您生於 {timeBranch}時之{timeSection}（第{totalQuarter}刻）。外貌個性{lookLike}{personality}
{印記印證}：{胎記文字}。根據出生的刻分判定，您出生時母親身邊只有 {personCount} 個人。

【時柱斷驗 · 古傳口訣】
{mingshuDetail}
```

若 `birthMinute` 無資料：`（時辰精確刻分未知，略去此節）`

**資料來源：** 複製 `AnalysisReportService.GenerateShiWenSection()` 核心邏輯為靜態方法 `LfShiWenSection(timeBranch, birthMinute, gender)`

---

**二、命盤基本**

```
【五行局】：{wuXingJuText}
【命主星】：{mingZhu}
【身主星】：{shenZhu}
```

**資料來源：**
- `ChartJson.wuXingJuText`（root.wuXingJuText）
- `ChartJson.mingZhu`（root.mingZhu）
- `ChartJson.shenZhu`（root.shenZhu）

---

**三、十二宮位星曜**

```
命宮（坐{branch}）：{stars}
兄弟宮（坐{branch}）：{stars}
夫妻宮（坐{branch}）：{stars}
子女宮（坐{branch}）：{stars}
財帛宮（坐{branch}）：{stars}
疾厄宮（坐{branch}）：{stars}
遷移宮（坐{branch}）：{stars}
奴僕宮（坐{branch}）：{stars}
官祿宮（坐{branch}）：{stars}
田宅宮（坐{branch}）：{stars}
福德宮（坐{branch}）：{stars}
父母宮（坐{branch}）：{stars}
```

**資料來源：** `ChartJson.palaces` 陣列，`KbGetPalaceStars(palaces, "命宮")` 等

---

## 第七章：宮星化象（十二宮）

**章節標題：** `第七章：宮星化象`

**格式（逐宮，分隔線區隔）：**

```
────────────────────────────────────────
● {宮名}宮（坐{branch}）- 【{stars}】

▶ 特性診斷：{ziwei_patterns_144 篩選內容}

※ 專家建議：{starDescMing（命宮用）/ 其他宮用 starDesc}
────────────────────────────────────────
```

若某宮查無 KB 內容：只輸出宮名+星曜，`▶ 特性診斷：（待補充）`

**資料來源：**
- `KbZiweiFullQuery(palaces, ziweiPos)` → `ziweiFullContent`
- `KbFilterZiweiContent(KbExtractPalaceSection(ziweiFullContent, "命宮"), ...)` → 各宮內容
- `KbQueryStarInPalace(palaces, "命宮")` → starDescMing

---

## 第八章：命宮格局論

**章節標題：** `第八章：命宮格局論`

```
【命宮格局·{mingGongStars}】
{ziweiMing — ziwei_patterns_144 命宮完整格局論述}

【命宮星情】
{starDescMing}

【格局交叉驗證】
{若八字與紫微同向：「八字與紫微雙重印證，命格論斷可信度高。」}
```

**資料來源：**
- `KbZiweiFullQuery(palaces, ziweiPos)` + `KbExtractPalaceSection(..., "命宮")` → ziweiMing
- `KbQueryStarInPalace(palaces, "命宮")` → starDescMing
- `userChart.MingGongMainStars` → mingGongStars

---

## 第九章：四化飛星論

**章節標題：** `第九章：四化飛星論`

各項有內容才輸出：

```
【命宮化祿飛{mingLuPalace}】{mingLuContent}
【命宮化忌飛{mingJiPalace}】{mingJiContent}
【官祿宮化祿飛{offLuPalace}】{offLuContent}
【官祿宮化忌飛{offJiPalace}】{offJiContent}
【財帛宮化祿飛{wltLuPalace}】{wltLuContent}
【財帛宮化忌飛{wltJiPalace}】{wltJiContent}
【夫妻宮化祿飛{spsLuPalace}】{spsLuContent}
【夫妻宮化忌飛{spsJiPalace}】{spsJiContent}
【疾厄宮化忌飛{hltJiPalace}】{hltJiContent}
```

**資料來源：** `KbGongWeiSiHuaQuery(palaces, "命宮", "化祿")` 等（已有，複用 analyze 端點邏輯）

---

## 第十章：事業格局鑑定

**章節標題：** `第十章：事業格局鑑定`

**一、外面（社會資源）**
- 年柱 `{yStem}{yBranch}`：年干十神 + 年支十神

**二、家裡（個人資源）**
- 日支 `{dBranch}`：日支十神
- 時柱 `{hStem}{hBranch}`：時干十神 + 時支十神

**三、事業格局判定·結論**
- 公家政府命格 / 自營創業命格 / 技術/專業受薪命格（過三關邏輯）

**四、自營 vs 打工結論**

**五、五行職業取象**
- 格局取象（宗教藝術/技術研發 等）
- 用神 {yongShenElem} 取象（教育文化/金融工業 等）
- 開運方位 + 開運色彩

**資料來源：** `KbSanmenCareer()`（現有，不改動）

---

## 第十一章：六親緣分鑑定

**章節標題：** `第十一章：六親緣分鑑定`

**年齡提示**（`LfAgeTopicHint(currentAge)`，不適用的主題跳過）

**一、六親宮位分布**
- 祖緣宮（年柱）、父母宮（月柱）、夫妻宮（日支）、子女宮（時柱）

**二、父母緣**
- 母緣：印星（{motherElem}）占 {pct}%，緣分【深厚/一般/較薄】
- 父緣：財星（{fatherElem}）占 {pct}%，緣分【深厚/一般/較薄】

**三、兄弟姐妹緣**
- 比劫（{siblingPct}%）→ 深厚/一般/較淡

**四、婚姻深度論斷**
- 配偶星、夫妻宮分析
- 婚期大運時機

**五、子女緣**
- 食傷星占比 → 緣深/緣淡

**資料來源：** `KbSanmenSixRelatives()`（現有，不改動）

---

## 第十二章：婚姻深度鑑定（紫微補強）

**章節標題：** `第十二章：婚姻深度鑑定`

**一、八字婚姻論**（取自第十章婚姻子段）

**二、紫微夫妻宮**
```
【夫妻宮主星·{ziweiSpsStar}（感情個性）】{ziweiSps}
【夫妻宮化祿飛{spsLuPalace}】{spsLuContent}
【夫妻宮化忌飛{spsJiPalace}】{spsJiContent}
```

若無 KB 資料：`（紫微夫妻宮資料待補充）`

**資料來源：**
- `ziweiSps`：`KbFilterZiweiContent(KbExtractPalaceSection(ziweiFullContent, "夫妻宮"), ...)`
- 四化：`KbGongWeiSiHuaQuery(palaces, "夫妻宮", "化祿/化忌")`

---

## 第十三章：疾厄壽元

**章節標題：** `第十三章：疾厄壽元鑑定`

**一、八字疾厄論**（`KbSanmenHealthLongevity()`現有邏輯）
- 元神/扶神/壞神/制神 四象定位
- 壽元強弱判定
- 乾坤戰（天干地支沖剋）
- 五行臟腑分析（木→肝膽，火→心臟，土→脾胃，金→肺，水→腎）
- 大運健康期預測

**二、紫微疾厄宮補強**
```
【疾厄宮主星·{ziweiHltStar}】{ziweiHlt}
【疾厄宮化忌飛{hltJiPalace}】{hltJiContent}
```

若無 KB 資料：`（紫微疾厄宮資料待補充）`

**資料來源：**
- 八字：`KbSanmenHealthLongevity()`（現有）
- 紫微：`ziweiHlt`、`hltJiContent`（已有變數）

---

## 第十四章：大運逐運論斷

**章節標題：** `第十四章：大運逐運論斷（百分制評分）`

**格式（逐步大運）：**

```
{startAge}-{endAge} 歲 大運：{stem}{branch}（天干{stemSS}·地支{branchSS}） 評分：{score} 分（{level}）
{論斷文字（依評分等級）}

【地支事項】大運地支{branch}（{branchSS}）：
{與各宮位六親之六沖/六合/刑/破/害分析}
```

**資料來源：** `scored` 陣列（`LfCalcLuckScore()`，現有）

---

## 第十五章：開運指南

**章節標題：** `第十五章：開運指南`

**一、八字開運方向（用神五行）**

```
【開運方位】
喜用五行：{yongShenElem} → 方位：{elemDir}（如：木→東方）
次喜五行：{fuYiElem} → 方位：{elemDir}

【開運色彩】
主色：{openColor[yongShenElem]}（如：木→綠色、青色）
輔色：{openColor[fuYiElem]}

【開運材質】
{openMat[yongShenElem]}（如：木→植物、木製品）

【忌用方位與色彩】
大忌五行：{jiShenElem} → 方位：{elemDir}，色彩：{openColor[jiShenElem]}（建議避免）
```

**二、八字貴人方向**

```
【天乙貴人】
{dStem} 日主，天乙貴人在：{tianYiGuiRen}（依日干查表）

【大運貴人期】
評分最高的兩步大運為最佳貴人期：
- {top1 大運} {startAge}-{endAge} 歲（{score}分）：此期貴人助力最強
- {top2 大運} {startAge}-{endAge} 歲（{score}分）：次佳貴人期
```

天乙貴人查表（靜態 dict，依日干）：
- 甲戊庚：丑未
- 乙己：子申
- 丙丁：亥酉
- 壬癸：卯巳
- 辛：午寅
- 庚：丑未

**三、紫微開運指引（命宮主星）**

```
【命宮主星 {mingGongStars} 開運方向】
{依命宮主星五行/性質給出適合的行業/方位/色彩建議}

【化祿飛入宮位——財運貴人方向】
命宮化祿飛{mingLuPalace}：{簡短說明此宮位代表的人事物貴人}

【官祿宮化祿——事業貴人方向】
官祿化祿飛{offLuPalace}：{事業貴人說明}
```

**命宮主星五行對應開運方位（靜態 dict）：**
- 紫微/天府（土）→ 中央、黃色、穩重職業
- 天機/巨門（水/木）→ 北方/東方、藍黑/綠色、策劃顧問
- 太陽/太陰（火/水）→ 南方/北方、紅色/白色、公眾事業
- 武曲/廉貞（金/火）→ 西方、白色/金色、金融財務
- 天同/天梁（水/土）→ 北方、淺色系、服務助人
- 七殺/破軍/貪狼（金/水/木）→ 西方/北方、多元

**四、適合行業綜合建議**

```
【八字格局取象】：{LfPatternDesc 職業取象}
【用神 {yongShenElem} 取象】：{KbSanmenJobByElem}
【紫微命宮取象】：{mingGongStars 職業傾向}
【綜合建議】：三者方向一致者優先；若三者不同，以八字格局為主，紫微命宮為輔
```

**資料來源：**
- 八字方位色彩：`KbSanmenFengShui` 現有 `elemDir / openColor / openMat` dict
- 貴人：靜態天乙貴人 dict（依日干）
- 貴人期：`scored` 取 top2
- 紫微命宮：`mingGongStars` + `mingLuPalace` + `offLuPalace`（已有變數）
- 行業建議：`KbSanmenJobByElem`（現有）

---

## 第十六章：一生命運總評

**章節標題：** `第十六章：一生命運總評`

```
【前運（0-30 歲）】平均 {pct} 分：{描述}
【中運（31-50 歲）】平均 {pct} 分：{描述}
【後運（51 歲後）】平均 {pct} 分：{描述}

人生最佳期：{age} 歲 {干支}（{score} 分）
人生考驗期：{age} 歲 {干支}（{score} 分）

財富等級：{財星%推算}   功名等級：{官殺%推算}

命主喜走{yongShenElem}方位（{direction}），從事{jobDesc}為吉。
趨吉避凶：謹慎避免【{jiShenElem}】方向的事情，尤其在中凶/大凶運期間。
```

**資料來源：** `scored` 聚合統計（現有）

---

---

## 【待辦章節】居家風水鑑定

**預計章號：** 第十六章（v2.1 加入）

**章節標題：** `第十六章：居家風水鑑定`

**內容（來自現有 `KbSanmenFengShui()`）：**
1. 先天住宅原型（四柱天干地支類象，stemImage / branchImage）
2. 用神吉方（最適合居住的方位與環境）
3. 忌神凶方（應避免的方位）
4. 家居開運佈置建議（色彩、材質、主臥方位）
5. 搬遷吉運期（大運評分 >= 70 的移居時機）

**待辦理由：** 內容已有現成方法，但需與第十四章「開運指南」整合去重，避免重複，待開運指南確認格式後再加入。

---

## 表尾（Footer）

**分隔線：**
```
-----------------------------------------------------------------
```

**文字：**
```
命理大師：玉洞子 | 玉洞子命書 v2.0（內部版）
```

**印章圖（右對齊）：**
- `wwwroot/images/signature.png`（80×30 EMU）
- `wwwroot/images/玉洞子印.png`（50×50 EMU）

> 注意：現有 `analyze-yudongzi` 為純文字回傳（string），印章圖僅在 DOCX 格式下顯示。
> v2.0 維持純文字格式，表尾印章以 ASCII 線條代替，圖像版留待後續 DOCX 匯出時加入。

---

## 資料來源總覽

| 章節 | 標題 | 主要來源 | KB優先欄位 | 狀態 |
|------|------|---------|-----------|------|
| 表頭 | 命主資料+古訓+圖 | user + ChartJson + 圖檔 | — | 補充欄位 |
| 第一章 | 審時聞切 · 四時定數 | `LfShiWenSection` | — | **新增** |
| 第二章 | 先天八字依古制定 | 排盤計算 | `Overview` | 改版（完整表格）|
| 第三章 | 日柱深度論斷 | `BaziDayPillarReadings` DB | 全部10欄位 | **新增** |
| 第四章 | 命局格局判定 | `LfCalcWuXingMatrix` / `LfDetectGeJu` | `ShenAnalysis` | 重組 |
| 第五章 | 格局與用神判定 | `LfBuildYongJiTable` | — | 重組 |
| 第六章 | 先天星盤（紫微）| `ChartJson.palaces/mingZhu/shenZhu` | — | **新增** |
| 第七章 | 宮星化象（十二宮）| `KbZiweiFullQuery` | — | **新增** |
| 第八章 | 命宮格局論 | `ziwei_patterns_144` + `KbQueryStarInPalace` | — | **新增** |
| 第九章 | 四化飛星論 | `KbGongWeiSiHuaQuery` | — | **新增** |
| 第十章 | 事業格局鑑定 | `KbSanmenCareer` | `Career` | 改章號+補強 |
| 第十一章 | 六親緣分鑑定 | `KbSanmenSixRelatives` | `MotherInfluence` | 改章號+補強 |
| 第十二章 | 婚姻深度鑑定 | 第十一章子段 + 紫微夫妻宮 | `MaleChart`/`FemaleChart` | 補強 |
| 第十三章 | 疾厄壽元鑑定 | `KbSanmenHealthLongevity` + 紫微疾厄宮 | `Weaknesses` | 補強 |
| 第十四章 | 大運逐運論斷 | `scored` | — | 改章號 |
| 第十五章 | 開運指南 | 八字方位色彩 + 紫微命宮 | `SpecialHours` | **新增** |
| 第十六章 | 一生命運總評 | `scored` 聚合 | `InnerTraits`（收尾引用）| 改章號 |
| 表尾 | 印章 | `signature.png` / `玉洞子印.png` | — | DOCX版有圖 |
| 【待辦 v2.1】| 居家風水鑑定 | `KbSanmenFengShui` | — | v2.1 加入 |

---

## 版本對照（v1.0 → v2.0）

| v1.0 | v2.0 |
|------|------|
| — | Ch.1 **審時聞切（新增，開篇驗身）** |
| Ch.1 命盤基本資訊（1行）| Ch.2 四柱根苗花果（完整表）|
| — | Ch.3 **日柱深度論斷（新增，純 KB）** |
| Ch.2 命局體性 | Ch.4 命局格局判定（合併強弱+格局）|
| Ch.3+4 強弱+格局 | Ch.5 格局與用神判定（喜忌表）|
| — | Ch.6 **先天星盤（新增，紫微）** |
| — | Ch.7 **宮星化象（新增，紫微十二宮）** |
| — | Ch.8 **命宮格局論（新增，紫微 KB）** |
| — | Ch.9 **四化飛星論（新增，宮干四化）** |
| Ch.5 事業格局 | Ch.10 事業格局鑑定（+KB Career 補強）|
| Ch.6 六親緣分 | Ch.11 六親緣分鑑定（+KB Mother 補強）|
| — | Ch.12 **婚姻深度鑑定（新增，紫微夫妻宮）** |
| Ch.7 疾厄壽元 | Ch.13 疾厄壽元鑑定（+KB Weaknesses+紫微疾厄）|
| — | Ch.14 大運逐運論斷（原有功能獨立成章）|
| Ch.8 居家風水 | Ch.15 **開運指南（新增，八字+紫微貴人方位色彩）** |
| — | Ch.16 一生命運總評 |
| — | 【待辦 v2.1】Ch.17 居家風水 |
