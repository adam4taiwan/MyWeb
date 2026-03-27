# 綜合命書變數對應文件

## 資料來源說明

| 來源 | 描述 |
|------|------|
| `UserCharts.ChartJson` | PostgreSQL，由 `POST /Astrology/save-chart` 儲存（API calculate 結果）|
| `AspNetUsers` | 用戶生辰：BirthYear/Month/Day/Hour/Minute/Gender/DateType |
| PostgreSQL 命理 DB | 已整理的各命理知識表，可直接 SQL 查詢 |
| `FortuneRules` | EF Core 管理的知識庫（用於今日運勢 KB 系統）|

---

## ChartJson 實際結構（PostgreSQL 讀出）

> key 為 `bazi`（非 `baziInfo`），為 API calculate 回傳格式

```json
{
  "bazi": {
    "yearPillar":  { "heavenlyStem": "癸", "earthlyBranch": "卯", "heavenlyStemLiuShen": "食", "naYin": "金箔金", "hiddenStemLiuShen": ["才","乙"] },
    "monthPillar": { "heavenlyStem": "丁", "earthlyBranch": "巳", "heavenlyStemLiuShen": "殺", "naYin": "沙中土", "hiddenStemLiuShen": ["官","丙","印","戊","劫","庚"] },
    "dayPillar":   { "heavenlyStem": "辛", "earthlyBranch": "亥", "heavenlyStemLiuShen": "",   "naYin": "釵釧金", "hiddenStemLiuShen": ["傷","壬","財","甲"] },
    "timePillar":  { "heavenlyStem": "戊", "earthlyBranch": "戌", "heavenlyStemLiuShen": "印", "naYin": "平地木", "hiddenStemLiuShen": ["印","戊","比","辛","殺","丁"] },
    "animalSign": "兔",
    "dayMaster": "辛"
  },
  "palaces": [
    {
      "index": 1,
      "palaceName": "命宮",
      "palaceStem": "己",
      "earthlyBranch": "未 南西南",
      "majorStars": ["相"],
      "secondaryStars": ["右","左"],
      "annualStarTransformations": [],
      "decadeAgeRange": "46-55",
      "lifeCycleStage": "死",
      "mainStarBrightness": "3+",
      "palaceStemTransformations": "福夫父疾",
      "goodStars": ["官","蓋"],
      "badStars": ["龍","鳳","火"],
      "smallStars": [...]
    }
    // ... 共 12 宮
  ],
  "baziLuckCycles": [
    { "startAge": 6,  "endAge": 15, "heavenlyStem": "壬", "earthlyBranch": "午", "liuShen": "才" },
    { "startAge": 16, "endAge": 25, "heavenlyStem": "癸", "earthlyBranch": "未", "liuShen": "食" },
    ...
  ],
  "wuXingJuText": "水二局",
  "mingZhu": "文曲",
  "shenZhu": "天相",
  "userName": "蔡嘉麟",
  "solarBirthDate": "1963-04-15",
  "lunarBirthDate": "1963/03/23",
  "baziAnalysisResult": { "shiShen": "正財格", "rootType": "身弱", "phenomenon": "...", "explanation": "..." },
  "baziShensha": ["天乙貴人","文昌"]
}
```

---

## ChartJson 欄位全覽

### 八字四柱（`bazi.*Pillar`）

| 欄位 | 說明 |
|------|------|
| `heavenlyStem` | 天干（年干/月干/日干=日主/時干）|
| `earthlyBranch` | 地支 |
| `heavenlyStemLiuShen` | 天干十神（縮寫：食/才/殺/官/印/比/劫 等）|
| `naYin` | 納音五行 |
| `hiddenStemLiuShen` | 地支藏干十神（\[十神, 天干, 十神, 天干...\] 交錯排列）|
| `bazi.animalSign` | 生肖 |
| `bazi.dayMaster` | 日主天干（即 dayPillar.heavenlyStem）|

### 紫微宮位（`palaces[i]`，12 宮）

| 欄位 | 說明 |
|------|------|
| `palaceName` | 宮位名稱（命宮/兄弟/夫妻/子女/財帛/疾厄/遷移/奴僕/官祿/田宅/福德/父母）|
| `palaceStem` | 宮干（宮位天干）|
| `earthlyBranch` | 所在地支方位 |
| `majorStars[]` | 主星縮寫（相/機/紫/破/府/廉/貪/巨/梁/同/陰/陽/武/殺）|
| `secondaryStars[]` | 輔星（昌/曲/左/右/魁/鉞/祿/馬/火/鈴/羊/陀 等）|
| `annualStarTransformations[]` | 流年四化（祿/權/科/忌）|
| `decadeAgeRange` | 此宮對應大限年齡範圍（如 `46-55`）|
| `lifeCycleStage` | 長生十二宮（生/浴/冠/臨/旺/衰/病/死/墓/絕/胎/養）|
| `mainStarBrightness` | 主星廟旺程度（`3+`廟/`3!`旺/`2!`得/`1*`利/`0+`平/`0-`陷）|
| `palaceStemTransformations` | 宮干四化目標宮（如 `"福夫父疾"` = 化祿→福德/化權→夫妻/化科→父母/化忌→疾厄）|
| `goodStars[]` | 年系吉星 |
| `badStars[]` | 年系凶星 |
| `smallStars[]` | 博士/將前等雜曜 |

### 八字大運（`baziLuckCycles[i]`）

| 欄位 | 說明 |
|------|------|
| `startAge` / `endAge` | 起訖歲數（每 10 年一組）|
| `heavenlyStem` | 大運天干 |
| `earthlyBranch` | 大運地支 |
| `liuShen` | 大運十神縮寫（才/食/殺/官/印/比 等）|

### 其他欄位

| 欄位 | 說明 |
|------|------|
| `wuXingJuText` | 紫微五行局（水二局/木三局/金四局/土五局/火六局）|
| `mingZhu` | 命主星（文曲/文昌/天機/天同/天梁/天府/太陰）|
| `shenZhu` | 身主星（火星/天相/天梁/天同/文昌/天機/天梁）|
| `baziAnalysisResult.shiShen` | 格局十神名稱 |
| `baziAnalysisResult.rootType` | 身強/身弱/中和 |
| `baziShensha[]` | 八字神煞（天乙貴人/文昌/驛馬 等）|

---

## 可直接查詢的 PostgreSQL 命理 Table

### 紫微相關

| Table | 說明 | 查詢方式 |
|-------|------|---------|
| `ziwei_patterns_144` | 紫微 144 格局（14 主星 × 12 宮位）| `SELECT content FROM ziwei_patterns_144 WHERE major_stars='相' AND palace_position='命宮'` |
| `紫微星性` | 主星性質（廟旺陷 × 六星群）| `SELECT des1, des2 FROM "紫微星性" WHERE "MainStar"='天相'` |
| `先天四化入十二宮` | 天干四化飛入宮位的吉凶 | `SELECT gd, bd FROM "先天四化入十二宮" WHERE mapstar='化祿' AND mainstar='天相'` |
| `十二宮化入十二宮` | 宮干四化飛入目標宮的影響 | `SELECT gd, bd FROM "十二宮化入十二宮" WHERE mapstar='化忌' AND position='夫妻'` |
| `starstyle` / `styledesc` | 星曜在各宮的風格描述 | `SELECT stardesc FROM starstyle WHERE mapstar='天相' AND position='命宮'` |

### 八字相關

| Table | 說明 | 查詢方式 |
|-------|------|---------|
| `六十甲子命主` | **日柱命格核心**（性格/事業/愛情/財運/健康，60 甲子各一筆）| `SELECT rgxx,rgcz,rgzfx,xgfx,aqfx,syfx,cyfx,jkfx FROM "六十甲子命主" WHERE "rgz"='辛亥'` |
| `六十甲子納音` | **日柱納音性情**（納音名稱/性格象意/玄空卦運）| `SELECT "納音","desc","玄空","卦運","卦名" FROM "六十甲子納音" WHERE "干支"='辛亥'` |
| `六十甲子日對時` | **三命論會**（日干×月份×時柱 → 格局詳解，必引用）| `SELECT "desc" FROM "六十甲子日對時" WHERE "Sky"='辛' AND "Month"='巳月' AND "time"='戊戌'` |
| `六神四柱數` | **四柱六神斷句**（年干/月干/日支/時干 × 十神 → 各位置命理意涵，絕對參考）| `SELECT "Desc" FROM "六神四柱數" WHERE "position"='年干食'`（格式：柱位+干支類型+六神，如「年干財」「月支殺」）|
| `十二生肖性向` | **地支性向斷句**（四柱各地支的生肖性格/象意）| `SELECT "sxgx" FROM "十二生肖性向" WHERE "sx"='兔'`（查年/月/日/時各支生肖）|
| `五行喜忌` | **用神喜忌條件**（日主五行 × 生月季節 → 喜用/忌用說明）| `SELECT "sjrs" FROM "五行喜忌" WHERE "wh"='金' AND "sj"='夏'`（日主辛=金，巳月=夏）|
| `astro_twoheader` | **年干+時干**組合命格（格局名稱/判斷/基業/婚姻/子息/收成）| `SELECT "M","N","O","R","T","X","Z","AB","K" FROM astro_twoheader WHERE trim("A")='癸戊'`（時辰欄位：子→D/寅→E/辰→G/午→H/申→J/戌→K）|
| `tiangan_characteristics` | 十天干特質（五行/個性/體質/外貌）| `SELECT personality, body_systems FROM tiangan_characteristics WHERE tiangan='辛'` |
| `dizhi_symbolism` | 十二地支象義（行業/臟腑/病症）| `SELECT industry_fields, body_parts, pathology_indicators FROM dizhi_symbolism WHERE dizhi='亥'` |
| `combination_patterns` | 八字格局組合（十神配置/財富/地位）| `SELECT wealth_level, status_level FROM combination_patterns WHERE shishen_configuration='財多身弱'` |
| `dizhi_combination_rules` | 地支合化（三合/六合/三會等）| `SELECT formed_element, energy_level FROM dizhi_combination_rules WHERE dizhi_group='寅午戌'` |
| `dizhi_piercing_rules` | 地支沖剋（六沖/六害/六破）| `SELECT damage_characteristics, health_impact FROM dizhi_piercing_rules WHERE dizhi1='巳' AND dizhi2='亥'` |
| `virtual_real_strength` | 天干地支虛實強弱 | `SELECT strength_level, root_status FROM virtual_real_strength WHERE tiangan_dizhi='辛'` |
| `窮通寶鑑` | 傳統八字格局書（天干×月令 → 格局精論）| `SELECT content FROM "窮通寶鑑" WHERE tg='辛' AND dz='巳'`（tg=日干, dz=月支）|

### 事業財健康婚姻分析表

| Table | 說明 | 主要欄位 |
|-------|------|---------|
| `career_analysis` | 事業路徑分析 | official_career_path, creative_career_path, suitable_industries, career_advancement_age |
| `wealth_analysis` | 財富分析 | wealth_source, wealth_stability, wealth_peak_period, investment_risk_level |
| `marriage_analysis` | 婚姻分析 | spouse_star_analysis, spouse_characteristics, marriage_timing, divorced_indicator |
| `health_risk_assessment` | 健康風險 | organ_system, disease_indicator, age_of_onset, severity_level |
| `life_event_predictions` | 人生事件預測 | event_category, prediction_type, trigger_condition, prediction_content, confidence_level |
| `energy_transformation` | 五行能量轉化 | bad_shishen, transformation_method, helper_element, result_after_transformation |
| `fortune_grading_system` | 運勢評分系統 | base_score, good_combination_bonus, final_score, fortune_level, stars_rating |

### 流年/萬年曆

| Table | 說明 | 查詢方式 |
|-------|------|---------|
| `calendar` | 萬年曆（含節氣/干支）| `SELECT 日干支, 節氣 FROM calendar WHERE 西元年=2026 AND 陽月=3` |
| `yearflow` | 流年資料 | 查詢流年干支吉凶 |
| `yearstar` | 流年星曜 | 流年對應星曜 |

---

## 各章節資料來源對應

### 第一章：命盤概覽
| 資料項目 | ChartJson 欄位 | 直接查詢 Table |
|----------|---------------|--------------|
| 四柱干支納音 | `bazi.*Pillar` | — |
| 生肖 | `bazi.animalSign` | — |
| 命主/身主 | `mingZhu` / `shenZhu` | — |
| 五行局 | `wuXingJuText` | — |
| 命宮主星 | `palaces["命宮"].majorStars` | `ziwei_patterns_144` |
| 身宮 | `palaces` 找 `decadeAgeRange` 含當前歲 | — |

### 第二章：格局用神（身強弱）
| 資料項目 | ChartJson 欄位 | 直接查詢 Table |
|----------|---------------|--------------|
| 格局名稱 | `baziAnalysisResult.shiShen` | `combination_patterns` |
| 身強弱判定 | `baziAnalysisResult.rootType` | — |
| **用神喜忌** | 日主五行 + 月支季節 | **`五行喜忌` (wh=日主五行, sj=月支季節)** |
| 日主特質 | `bazi.dayMaster` | `tiangan_characteristics` |
| **日柱命格（核心）** | `dayPillar.heavenlyStem + earthlyBranch` | **`六十甲子命主` (rgz = 日干+日支)** |
| **日柱納音性情** | `dayPillar.*` | **`六十甲子納音` (干支 = 日干+日支)** |
| 月令格局 | `bazi.monthPillar.earthlyBranch` | `窮通寶鑑` (tg=日干, dz=月支) |
| 年干+時干格局 | `yearPillar.heavenlyStem + timePillar.heavenlyStem` | **`astro_twoheader` (trim(A) = 年干+時干)** |
| **三命論會** | 日干 + 月份 + 時柱干支 | **`六十甲子日對時` (Sky=日干, Month=月份, time=時柱)** |
| 虛實強弱 | 四柱天干 | `virtual_real_strength` |

### 第三章：性格特質
| 資料項目 | ChartJson 欄位 | 直接查詢 Table |
|----------|---------------|--------------|
| 日主性格 | `bazi.dayMaster` | `tiangan_characteristics` (personality) |
| **日柱性格（詳細）** | `dayPillar.heavenlyStem + earthlyBranch` | **`六十甲子命主` → xgfx (性格分析)** |
| 日柱坐星詳解 | 同上 | **`六十甲子命主` → rgcz (坐星詳解), rgzfx (綜合分析)** |
| **日柱納音性格** | 同上 | **`六十甲子納音` → desc (性情象意)** |
| **四柱六神性格** | 各柱天干十神 | **`六神四柱數` (position = 年干+十神, 月干+十神 等)** |
| **四柱地支生肖性向** | 年支/月支/日支/時支 | **`十二生肖性向` (sx = 生肖或地支，各支查一次)** |
| 年干+時干性格 | `yearPillar + timePillar heavenlyStem` | **`astro_twoheader` → M (判斷), N (格局名稱)** |
| 命宮主星性格 | `palaces["命宮"].majorStars` | `紫微星性` (des1, des2) |
| 命宮格局描述 | `palaces["命宮"].majorStars` + `palaceName` | `ziwei_patterns_144` |
| 神煞影響 | `baziShensha[]` | — |

### 第四章：事業財運
| 資料項目 | ChartJson 欄位 | 直接查詢 Table |
|----------|---------------|--------------|
| **日柱事業傾向** | `dayPillar.heavenlyStem + earthlyBranch` | **`六十甲子命主` → syfx (事業分析)** |
| **日柱財運** | 同上 | **`六十甲子命主` → cyfx (財運分析)** |
| 年干+時干基業 | `yearPillar + timePillar heavenlyStem` | **`astro_twoheader` → R (基業), AB (收成)** |
| 官祿宮主星 | `palaces["官祿"].majorStars` | `ziwei_patterns_144` (palace_position=官祿) |
| 財帛宮主星 | `palaces["財帛"].majorStars` | `ziwei_patterns_144` (palace_position=財帛) |
| 宮干化祿飛入 | `palaces["官祿"].palaceStemTransformations` | `先天四化入十二宮` |
| 事業路徑 | 格局類型 | `career_analysis` |
| 財富分析 | 財星強弱 | `wealth_analysis` |
| 適合行業 | 日主五行 + 月干十神 | `dizhi_symbolism` (industry_fields) |

### 第五章：婚姻感情
| 資料項目 | ChartJson 欄位 | 直接查詢 Table |
|----------|---------------|--------------|
| **日柱感情特質** | `dayPillar.heavenlyStem + earthlyBranch` | **`六十甲子命主` → aqfx (愛情分析)** |
| 年干+時干婚姻 | `yearPillar + timePillar heavenlyStem` | **`astro_twoheader` → X (婚姻)** |
| 夫妻宮主星 | `palaces["夫妻"].majorStars` | `ziwei_patterns_144` (palace_position=夫妻) |
| 夫妻宮化忌 | `palaces["夫妻"].annualStarTransformations` 含"忌" | `十二宮化入十二宮` |
| 夫妻宮吉凶 | `palaces["夫妻"].mainStarBrightness` | — |
| 婚姻時機 | 大運天干 | `marriage_analysis` |
| 配偶星分析 | 男財星/女官殺星 | `marriage_analysis` (spouse_star_analysis) |

### 第六章：健康壽元
| 資料項目 | ChartJson 欄位 | 直接查詢 Table |
|----------|---------------|--------------|
| **日柱健康特質** | `dayPillar.heavenlyStem + earthlyBranch` | **`六十甲子命主` → jkfx (健康分析)** |
| 疾厄宮主星 | `palaces["疾厄"].majorStars` | `ziwei_patterns_144` (palace_position=疾厄) |
| 疾厄宮化忌 | `palaces["疾厄"].annualStarTransformations` | — |
| 日主五行臟腑 | `bazi.dayMaster` | `tiangan_characteristics` (body_systems) |
| 地支病症 | 四柱地支 | `dizhi_symbolism` (pathology_indicators) |
| 健康風險 | 格局+大運 | `health_risk_assessment` |
| 五行沖剋 | 地支組合 | `dizhi_piercing_rules` (health_impact) |

### 第七章：家庭緣份
| 資料項目 | ChartJson 欄位 | 直接查詢 Table |
|----------|---------------|--------------|
| 年干+時干子息 | `yearPillar + timePillar heavenlyStem` | **`astro_twoheader` → Z (子息), T (兄弟)** |
| 父母宮主星 | `palaces["父母"].majorStars` | `ziwei_patterns_144` (palace_position=父母) |
| 子女宮主星 | `palaces["子女"].majorStars` | `ziwei_patterns_144` (palace_position=子女) |
| 兄弟宮主星 | `palaces["兄弟"].majorStars` | `ziwei_patterns_144` |
| 年柱（早年緣）| `bazi.yearPillar.*` | — |
| 年干十神（父母星）| `bazi.yearPillar.heavenlyStemLiuShen` | `tiangan_characteristics` |

### 第八章：大運流年
| 資料項目 | ChartJson 欄位 | 直接查詢 Table |
|----------|---------------|--------------|
| 當前八字大運 | `baziLuckCycles` 找 startAge ≤ 當前歲 ≤ endAge | — |
| 大運天干地支十神 | `baziLuckCycles[i].heavenlyStem/earthlyBranch/liuShen` | `FortuneRules` (十神應事) |
| 大運對應紫微宮位 | `palaces` 找 `decadeAgeRange` 含當前歲 | `ziwei_patterns_144` |
| 大限宮四化影響 | 找到宮位的 `annualStarTransformations` | `十二宮化入十二宮` |
| 大限宮干四化 | 找到宮位的 `palaceStemTransformations` | `先天四化入十二宮` |
| 流年干支 | 計算今年干支 | `calendar` |
| 人生事件預測 | 大運+格局 | `life_event_predictions` (trigger_condition) |
| 運勢評分 | 各方面綜合 | `fortune_grading_system` |

---

## 星曜縮寫展開對照

### 主星（14 顆）
| 縮寫 | 全名 | 縮寫 | 全名 |
|------|------|------|------|
| 紫 | 紫微 | 機 | 天機 |
| 太(陽) | 太陽 | 武 | 武曲 |
| 同 | 天同 | 廉 | 廉貞 |
| 府 | 天府 | 陰(月) | 太陰 |
| 貪 | 貪狼 | 巨 | 巨門 |
| 相 | 天相 | 梁 | 天梁 |
| 殺 | 七殺 | 破 | 破軍 |

### 輔星
| 縮寫 | 全名 | 縮寫 | 全名 |
|------|------|------|------|
| 左 | 左輔 | 右 | 右弼 |
| 昌 | 文昌 | 曲 | 文曲 |
| 魁 | 天魁 | 鉞 | 天鉞 |
| 祿 | 祿存 | 馬 | 天馬 |
| 火 | 火星 | 鈴 | 鈴星 |
| 羊 | 擎羊 | 陀 | 陀羅 |

---

## 查詢範例（以辛亥日 / 癸卯年 / 丁巳月 / 戊戌時 為例）

| 查詢目的 | SQL |
|----------|-----|
| 日柱命格全文 | `SELECT rgxx,rgcz,rgzfx,xgfx,aqfx,syfx,cyfx,jkfx FROM "六十甲子命主" WHERE "rgz"='辛亥'` |
| 日柱納音性情 | `SELECT "納音","desc","玄空","卦名" FROM "六十甲子納音" WHERE "干支"='辛亥'` |
| 三命論會 | `SELECT "desc" FROM "六十甲子日對時" WHERE "Sky"='辛' AND "Month"='巳月' AND "time"='戊戌'` |
| 用神喜忌（金×夏）| `SELECT "sjrs" FROM "五行喜忌" WHERE "wh"='金' AND "sj"='夏'` |
| 年干食神斷句 | `SELECT "Desc" FROM "六神四柱數" WHERE "position"='年干食'` |
| 月干七殺斷句 | `SELECT "Desc" FROM "六神四柱數" WHERE "position"='月干殺'` |
| 年支卯（兔）性向 | `SELECT "sxgx" FROM "十二生肖性向" WHERE "sx"='兔'` |
| 日支亥（豬）性向 | `SELECT "sxgx" FROM "十二生肖性向" WHERE "sx"='豬'` |
| 年干+時干格局 | `SELECT "M","N","R","X","Z","K" FROM astro_twoheader WHERE trim("A")='癸戊'`（K=戌時命）|
| 月令精論 | `SELECT content FROM "窮通寶鑑" WHERE tg='辛' AND dz='巳'` |
| 命宮主星（天相）格局 | `SELECT content FROM ziwei_patterns_144 WHERE major_stars='相' AND palace_position='命宮'` |

---

## 重要備註

1. **ChartJson 不含流年資料** — 流年干支從 `calendar` table 或即時計算
2. **ziwei_patterns_144** — 最重要的紫微文字來源，可直接取各宮格局描述，無需 Gemini
3. **rizhu_destiny_system** — 日干+日支組合（60 甲子），直接對應個人命格特質
4. **大限宮位對應** — 從 `palaces[i].decadeAgeRange` 解析，如 `"46-55"` → 此宮為 46-55 歲大限宮
5. **宮干四化** — `palaceStemTransformations` 格式為 `"福夫父疾"`，代表化祿→福德/化權→夫妻/化科→父母/化忌→疾厄
6. **十神縮寫** — 才=正財、財=偏財、殺=七殺、梟=偏印、官=正官、印=正印、食=食神、傷=傷官、比=比肩、劫=劫財
