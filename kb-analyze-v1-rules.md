# KB 綜合命書 v1 規則說明文件

> 端點：`GET /api/Consultation/analyze-kb`
> 版本：v2.1（2026-03-14 上線）
> 費用：50 點
> 特色：純知識庫查詢，不呼叫 Gemini AI

---

## 一、觸發條件

| 條件 | 行為 |
|------|------|
| 已登入 + 有 UserCharts 資料 | 走 KB 端點 |
| 已登入 + 無 UserCharts 資料 | 前端 fallback → POST `/Consultation/analyze`（Gemini） |
| 點數 < 50 | 回傳 `點數不足` 錯誤 |

---

## 二、輸入資料來源

### 2.1 UserCharts.ChartJson（命盤 JSON）
從 `UserCharts` 資料表的 `ChartJson` 欄位解析，包含以下節點：

| JSON 節點 | 用途 |
|-----------|------|
| `bazi.yearPillar` | 年柱天干地支、六神、納音 |
| `bazi.monthPillar` | 月柱天干地支、六神、納音 |
| `bazi.dayPillar` | 日柱天干地支、納音 |
| `bazi.timePillar` | 時柱天干地支、六神、納音 |
| `bazi.*.hiddenStemLiuShen[0]` | 各柱地支藏干主氣十神 |
| `baziAnalysisResult.shiShen` | 四柱斷語（含年月日時柱分段標記） |
| `baziAnalysisResult.rootType` | 身強弱根源 |
| `baziAnalysisResult.phenomenon` | 格局綱領 |
| `palaces[]` | 紫微十二宮（含 palaceName、majorStars、decadeAgeRange） |
| `baziLuckCycles[]` | 八字大運（startAge、endAge、heavenlyStem、earthlyBranch、liuShen） |
| `solarBirthDate` | 陽曆生日 |
| `lunarBirthDate` | 農曆生日（格式：YYYYMMDD，如 `1963415`） |
| `wuXingJuText` | 五行局文字 |
| `mingZhu` | 命主星 |
| `shenZhu` | 身主星 |

### 2.2 UserCharts.MingGongMainStars
命宮主星全名（已展開縮寫，如「紫微、天府」）。

### 2.3 Users 資料表
- `user.BirthYear`：計算當前年齡
- `user.ChartName`（優先）/ `user.Name`：命書用名
- `user.Points`：扣點

---

## 三、衍生計算邏輯

| 衍生值 | 計算方式 |
|--------|----------|
| `riWuXing`（日主五行） | 甲乙→木、丙丁→火、戊己→土、庚辛→金、壬癸→水 |
| `season`（月令季節） | 寅卯辰→春、巳午未→夏、申酉戌→秋、亥子丑→冬 |
| `nianShiCombo` | 年干 + 時干（2字，查 astro_twoheader） |
| `hourCol` | 時支→astro_twoheader 欄位（子丑→D、寅卯→E、辰巳→G、午未→H、申酉→J、戌亥→K） |
| `nianAnimal` / `riAnimal` | 年支/日支→生肖（子鼠丑牛寅虎卯兔辰龍巳蛇午馬未羊申猴酉雞戌狗亥豬） |
| `currentAge` | `DateTime.Today.Year - user.BirthYear` |
| `daYunPalace` | 從 palaces[].decadeAgeRange 找 currentAge 所在宮位 |
| `daYunStem/Branch/SS` | 從 baziLuckCycles[] 找 currentAge 所在大運 |

---

## 四、DB 查詢規則（9 個 Table）

### 4.1 六十甲子命主
- **查詢鍵**：`rgz = 日柱（日干+日支）`
- **取得欄位**：

| 欄位 | 用途 |
|------|------|
| `rgxx` | 日柱概述 |
| `rgcz` | 坐星詳解 |
| `rgzfx` | 日柱綜合論述 |
| `xgfx` | 性格分析 |
| `aqfx` | 感情特質 |
| `syfx`（未輸出，保留備用） | 事業分析 |
| `cyfx`（未輸出，保留備用） | 財運分析 |
| `jkfx` | 健康傾向 |

### 4.2 六十甲子納音
- **查詢鍵**：`干支 = 日柱`
- **取得欄位**：`desc`（納音性情描述）

### 4.3 六十甲子日對時（三命論會）
- **查詢鍵**：`Sky = 日干`、`Month = 月支 + '月'`、`time LIKE '%時支%'`
- **取得欄位**：`desc`

### 4.4 五行喜忌
- **查詢鍵**：`wh = 日主五行`、`sj = 月令季節（春/夏/秋/冬）`
- **取得欄位**：`sjrs`（用神喜忌）

### 4.5 六神四柱數
- **查詢鍵**：`position = 柱位+十神`（格式：`年干食神`、`月支七殺`）
- **查詢 6 個位置**：年干、月干、年支、月支、日支、時干（各取地支藏干主氣）
- **取得欄位**：`Desc`

### 4.6 十二生肖性向
- **查詢鍵**：`sx IN (生肖名, 地支)`（年支、日支各查一次）
- **取得欄位**：`sxgx`

### 4.7 astro_twoheader（年時組合）
- **查詢鍵**：`trim(A) = 年干+時干`（共 2 字）
- **取得欄位**：

| 欄位 | 對應輸出 |
|------|----------|
| `N` | 格局名稱（詩評標題） |
| `M` | 詩評內容 |
| 時支對應欄（D/E/G/H/J/K） | 先天緣性 |
| `R` | 基業發展 |
| `X` | 婚姻論斷 |
| `Z` | 子息緣份 |
| `T` | 兄弟緣份 |

### 4.8 窮通寶鑑
- **查詢鍵**：`tg = 日干`、`dz = 月支`
- **取得欄位**：`content`（月令精論）

### 4.9 ziwei_patterns_144
- **查詢鍵**：`major_stars LIKE '%第一顆主星%'`、`palace_position = 宮名`
- **查詢宮位**：命宮、官祿、財帛、夫妻、疾厄、父母、子女、當前大限宮位
- **取得欄位**：`content`

---

## 五、輸出格式（八章）

### 章節結構

```
=== 一、命盤概覽 ===
姓名：{userName}  陽曆：{格式化陽曆}  農曆：{中文農曆}
四柱：{年柱}年 {月柱}月 {日柱}日 {時柱}時
納音：{年納音} · {月納音} · {日納音} · {時納音}
日主：{日干}（{五行}）  五行局：{wuXingJu}
命宮主星：{MingGongMainStars}  命主星：{mingZhu}  身主星：{shenZhu}

=== 二、格局用神 ===
[年柱(根)](祖先及父母)：{年柱斷語}
[月柱(苗)](兄弟姊妹)：{月柱斷語}
[日柱(花)](本人及配偶)：{日柱斷語}
[時柱(果)](子女及晚年)：{時柱斷語}
【身強弱根源】{rootType}
【格局綱領】{phenomenon}
【用神喜忌】{五行喜忌.sjrs}
【月令精論·窮通寶鑑】{窮通寶鑑.content}
【日柱綜合論述】{六十甲子命主.rgzfx}

=== 三、性格特質 ===
【日柱概述】{rgxx}
【納音性情·{日納音}】{六十甲子納音.desc}
【坐星詳解】{rgcz}
【性格分析】{xgfx}
【年干{nianSS}】{六神四柱數.Desc}
【月干{yueSS}】{六神四柱數.Desc}
【年支{nianZhiSS}】{六神四柱數.Desc}
【月支{yueZhiSS}】{六神四柱數.Desc}
【日支{riZhiSS}】{六神四柱數.Desc}
【時干{shiSS}】{六神四柱數.Desc}
【年支{nianZhi}·{生肖}性向】{十二生肖性向.sxgx}
【日支{riZhi}·{生肖}性向】{十二生肖性向.sxgx}
【命宮·{命宮主星}】{ziwei_patterns_144.content（命宮）}
【詩評·{N}】{M}
【先天緣性】{時支欄位}

=== 四、事業財運 ===
【六神喜用分析】{五行喜忌.sjrs}
【基業發展】{astro_twoheader.R}
【紫微職業·{官祿宮主星}】{ziwei_patterns_144.content（官祿）}
【財帛宮·{財帛宮主星}】{ziwei_patterns_144.content（財帛）}

=== 五、婚姻感情 ===
【感情特質】{aqfx}
【婚姻論斷】{astro_twoheader.X}
【夫妻宮·{夫妻宮主星}】{ziwei_patterns_144.content（夫妻）}

=== 六、健康壽元 ===
【健康傾向】{jkfx}
【疾厄宮·{疾厄宮主星}】{ziwei_patterns_144.content（疾厄）}

=== 七、家庭緣份 ===
【兄弟緣份】{astro_twoheader.T}
【子息緣份】{astro_twoheader.Z}
【父母宮·{父母宮主星}】{ziwei_patterns_144.content（父母）}
【子女宮·{子女宮主星}】{ziwei_patterns_144.content（子女）}

=== 八、大運流年 ===
【三命論會】{六十甲子日對時.desc}
【當前大運】{大運干支}（{起歲}-{終歲}歲，{十神全名}）
【大運宮位·{宮名}】{ziwei_patterns_144.content（大限宮）}

-----------------------------------------------------------------
命理鑑定大師：玉洞子  |  修身齊家，命在人心。  v2.1
```

---

## 六、輔助處理規則

### 6.1 四柱斷語分段解析（KbSplitPillars）
- 原始 `shiShen` 欄位以 `[年柱(根)]`、`[月柱(苗)]`、`[日柱(花)]`、`[時柱(果)]` 為分隔符
- 非時柱自動移除「生時XX，...。」錯誤文句（regex）

### 6.2 HTML 清除（KbStripHtml）
- 所有從資料庫取得的文字欄位皆移除 HTML 標籤（`<.*?>`）
- 不適用欄位：`astroN`（格局名標題，用作標籤顯示）

### 6.3 農曆轉中文（KbLunarToChineseStr）
- 輸入格式：`YYYYMMDD`（月/日 1-2 位，無補零），如 `1963415` = 一九六三年四月十五日
- 月份：正、二、三...十二月；日期：初一、初二...三十

### 6.4 大運十神縮寫展開（KbExpandLiuShen）
比→比肩、劫→劫財、食→食神、傷→傷官、財→偏財、才→正財、殺→七殺、官→正官、梟→偏印、印→正印

### 6.5 空值處理
- 所有 `COALESCE(欄位,'')` 處理 NULL
- 每個輸出段落皆有 `IsNullOrEmpty` 判斷，有值才輸出，不顯示空標籤

---

## 七、已知限制與待改進項目

| 項目 | 現況 | 建議方向 |
|------|------|----------|
| `syfx`、`cyfx` | 已查詢但未輸出 | 可加入四、事業財運章節 |
| ziwei_patterns_144 查詢 | 只取第一顆主星 | 多主星（如紫微+天府）組合查詢 |
| 四柱斷語有時為空 | shiShen 欄位依排盤結果而定 | 加入備用描述 |
| 命書格式 | 純文字，無段落層次 | 可考慮 Markdown 標題或分行 |
| 大運宮位 | 只顯示當前大限 | 可列出下一大限預告 |
| 流年加成 | 尚未加入 | Phase 7 可加今年流年 × 命盤互動 |

---

## 八、前端呼叫邏輯（disk/page.tsx）

```
選擇「綜合命書」且 profileLoaded（已有命盤）
  → GET /api/Consultation/analyze-kb
  → loading 文字：「知識庫命書生成中，請稍候...」
  → 成功：顯示 result 文字

其他類型 或 無命盤
  → POST /api/Consultation/analyze（Gemini 版）
  → loading 文字：「命理鑑定分析中，請稍候...」
```

---

*文件建立：2026-03-15*
*對應程式：`/home/adamtsai/projects/Ecanapi/Controllers/ConsultationController.cs`，`GetKbAnalysis()` 方法*
