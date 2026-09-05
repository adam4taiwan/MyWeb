# YiZhuEngine.cs 方法一覽

路徑：`/home/adamtsai/projects/Ecanapi/Services/YiZhuEngine.cs`

---

## 主入口

### `public string Analyze(string dayStem, string dayBranch, string monthBranch, int gender)`
六步完整分析，回傳格式化命書文字。
- Step1 → `GetEffectiveStem`（結果僅供參考，**不再用於十神計算**）
- Step2 → `GetXunShou` + `GetXunMapping` + `GetKongWang`
- 驗證表 → 日干十神六親對照（2026-06-26 新增）
- Step3+4 → foreach Stems: `GetTenGodName(dayStem,stem)` + `GetRelativeName` + `GetLifeStage` + `GetBranchRelation` + `GetTenGodNonRelMeaning` → `BuildRelativeLine`
- Step5 → `GetBodyStrength` → `BuildBodyStrengthText`
- Step6 → `BuildXunInteractions(dayStem, dayBranch, dayStem, ...)`

---

## Step 1：有效日干（已廢棄實際用途）

### `private static string GetEffectiveStem(string dayStem, int gender)`
男命陰干 → 換對應陽干；女命陽干 → 換對應陰干。

**重要：2026-06-26 修正**
- `effStem` 原本被誤用於十神計算，導致陰日干的陰陽全部反轉
- 修正後：`GetTenGodName` 和 `BuildXunInteractions` 一律使用 **`dayStem`**
- `有效干` 顯示改為 `dayStem`（不再顯示 effStem）
- `effStem` 目前已無實際作用，保留函數但不使用回傳值

**錯誤根本原因（辛亥日男命案例）：**
- 原來：effStem=庚，十神從庚起算 → 甲=偏財(父)、乙=正財(妻)... 全錯
- 修正後：dayStem=辛，十神從辛起算 → 甲=正財(妻)、乙=偏財(父)... 正確

---

## Step 2：虛辰遁法

### `private static string GetXunShou(string dayStem, string dayBranch)`
計算日柱所屬旬首（甲X）。
- `startBi = (branchIdx - stemIdx % 12 + 12) % 12`
- 回傳 `"甲" + Branches[startBi]`

### `private static Dictionary<string, string> GetXunMapping(string xunShou)`
展開旬首起始的 10 干→地支對應表。
- 旬首地支起，10 個天干依序配 10 個地支（循環 mod 12）

### `private static List<string> GetKongWang(string xunShou)`
取得旬中空亡的 2 個地支。
- 12 地支扣除旬中 10 支 → 剩餘 2 支即空亡

---

## 十神計算

### `private static string GetTenGodName(string dayStem, string targetStem)`
依五行生剋 + 陰陽同異計算十神名稱。**必須傳入 dayStem（非 effStem）。**
- 同五行：同陰陽=比肩，異=劫財
- 我生：同=食神，異=傷官
- 我剋：同=偏財，異=正財
- 剋我：同=七殺，異=正官
- 生我：同=偏印，異=正印

### `private static string GetRelativeName(string tenGod, int gender)`
十神 → 六親稱謂（男女不同），固定映射，不依日干陰陽調整。

**男命：**
| 十神 | 六親 |
|------|------|
| 比肩 | 兄弟 |
| 劫財 | 姊妹 |
| 食神 | 女婿 |
| 傷官 | 媳婦 |
| 偏財 | 父   |
| 正財 | 妻   |
| 七殺 | 兒子 |
| 正官 | 女兒 |
| 偏印 | 祖父 |
| 正印 | 母   |

**女命：**
| 十神 | 六親 |
|------|------|
| 比肩 | 姊妹 |
| 劫財 | 兄弟 |
| 食神 | 女兒 |
| 傷官 | 兒子 |
| 偏財 | 繼父 |
| 正財 | 父   |
| 七殺 | 夫之兄 |
| 正官 | 夫   |
| 偏印 | 母   |
| 正印 | 祖母 |

**辛亥日男命驗證（2026-06-26 修正後）：**
```
▍日干十神六親對照
甲=正財(妻)　乙=偏財(父)　丙=正官(女兒)　丁=七殺(兒子)　戊=正印(母)
己=偏印(祖父)　庚=劫財(姊妹)　辛=比肩(本命)　壬=傷官(媳婦)　癸=食神(女婿)
```

---

## 驗證表（2026-06-26 新增）

輸出在「有效干/旬首/空亡」行之後，用於人工校驗十神六親對應是否正確。

```csharp
sb.AppendLine("▍日干十神六親對照");
// 甲=正財(妻)　乙=偏財(父)　... 依序列出 10 干
```

---

## Step 3：地支關係 + 六親強弱

### `public static string GetBranchRelation(string b1, string b2)`
判斷兩地支關係：六合 / 相沖 / 相害 / 相刑 / 半合 / 空字串。

### `private static string ClassifyStrength(string stage)`
十二長生 → 強弱等級。
- 旺：長生、冠帶、臨官、帝旺
- 中：沐浴、養
- 弱：衰、病
- 極弱：死、墓、絕、胎

### `private static string BuildRelativeLine(...)`
組合六親論斷文字（含：六親稱謂、十神、天干、地支、長生、日支關係、空亡、象意）。

---

## Step 4：十神非六親象意

### `private static string GetTenGodNonRelMeaning(string tenGod, string stage)`
依十神 + 強弱，輸出財運/官職/才藝/朋友等象意文字。

---

## Step 5：月令喜忌 → 先天根基

### `private static (string strength, string[] xiElements, string[] jiElements) GetBodyStrength(string dayStem, string monthBranch)`
計算身強弱 + 喜用/忌神五行。

### `private static string Fe(int el)`
五行索引 → 中文：0=木、1=火、2=土、3=金、4=水

### `private static string BuildBodyStrengthText(...)`
輸出先天根基文字段落。

---

## Step 6：旬中干支互動

### `private static string BuildXunInteractions(string dayStem, string dayBranch, string effStem, ...)`
注意：呼叫時第三個參數傳 `dayStem`（不傳 effStem）。
- 旬中每個干支（排除日柱本身）vs 日柱互動分析
- 有天干關係（合/沖）或地支關係才輸出
- 判斷喜/忌神 → 輸出吉凶強弱描述

### `private static string GetStemRelation(string s1, string s2)`
天干關係：相合（五合）/ 相沖（甲庚/乙辛/丙壬/丁癸）/ 空字串。

---

## 公用方法

### `public string GetLifeStage(string stem, string branch)`
計算天干在某地支的十二長生位。
- 陽干順行，陰干逆行

---

## 靜態查表資料

| 常數 | 說明 |
|------|------|
| `Stems[10]` | 天干順序 |
| `Branches[12]` | 地支順序 |
| `LifeStages[12]` | 十二長生名稱 |
| `LifeStageStart` | 各天干長生起始地支索引 |
| `StemElement[10]` | 天干五行索引（0木1火2土3金4水） |
| `LiuHeSet` | 六合地支對（雙向）|
| `LiuChongSet` | 六沖地支對（雙向）|
| `LiuHaiSet` | 六害地支對（雙向）|
| `SanHeGroups` | 三合局（4組）|
| `SanXingSet` | 三刑地支對（雙向）|
| `StemHeMap` | 天干五合對應表 |
| `StemChongSet` | 天干四沖（雙向）|

---

## 舊版相容（Diagnose）

### `public PillarAnalysisResult Diagnose(AstrologyChartResult data, int gender)`
舊版入口，保留向下相容。
