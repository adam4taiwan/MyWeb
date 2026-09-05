# 河洛理數 API 開發規格

## 一、系統概述

河洛理數是一種以出生年月日時起六十四卦的傳統占卜系統，推算人命先天卦、後天卦及一生大運。

本規格依據舊系統（frmPrint2.cs 7493-8485）移植，算法與舊系統完全一致。

---

## 二、核心算法

### 2.1 輸入資料

| 變數 | 說明 | 來源 |
|------|------|------|
| 年支數 (intY) | 年地支數字，子=1..亥=12 | ChartJson.bazi.yearPillar.earthlyBranch |
| 農曆月數 (intM) | 農曆月，1-12 | calendar 表的 陰曆月（由出生陽曆查詢） |
| 農曆日數 (intD) | 農曆日，1-30 | calendar 表的 陰曆日（由出生陽曆查詢） |
| 時支數 (intT) | 時地支數字，子=1..亥=12 | ChartJson.bazi.timePillar.earthlyBranch |

地支轉數字對照：
```
子=1, 丑=2, 寅=3, 卯=4, 辰=5, 巳=6
午=7, 未=8, 申=9, 酉=10, 戌=11, 亥=12
```

### 2.2 起卦公式

```
下卦數 (flnumber) = (intY + intM + intD) % 8     -- 餘0取8
上卦數 (sknumber) = (intY + intM + intD + intT) % 8  -- 餘0取8
動爻   (ichange)  = (intY + intM + intD + intT) % 6  -- 餘0取6
```

### 2.3 數字配卦（先天八卦序）

| 數字 | 卦名 | 三爻二進位（初→三） |
|------|------|---------------------|
| 1 | 乾 | 111 |
| 2 | 兌 | 110 |
| 3 | 離 | 101 | ← 中間陰（中虛）
| 4 | 震 | 100 |
| 5 | 巽 | 011 | ← 底部陰（下斷）
| 6 | 坎 | 010 |
| 7 | 艮 | 001 |
| 8 | 坤 | 000 |

爻位：index 0=初爻（最下），index 1=二爻，index 2=三爻（上卦/下卦各3爻）

### 2.4 先天卦組合

```
先天卦 code = 下卦三爻 + 上卦三爻（共6位）
例：下卦=坎(010)，上卦=乾(111) → code = "010111"（水天需）
```

index 0-2 = 初爻至三爻（下卦），index 3-5 = 四爻至上爻（上卦）

查詢 DB：`SELECT * FROM public.ig WHERE code = '010111'`

### 2.5 後天卦（動爻變卦）

將先天卦 code 的第 `ichange - 1` 個 index 位置（0-based）進行陰陽互換（0↔1），所得新 code 即為後天卦。

```csharp
char[] code = xiantianCode.ToCharArray();
int idx = ichange - 1;   // 動爻 index（ichange 1=初爻=index 0）
code[idx] = code[idx] == '1' ? '0' : '1';
string houtianCode = new string(code);
```

查詢 DB：`SELECT * FROM public.ig WHERE code = houtianCode`

---

## 三、大運計算

### 3.1 大運年數規則（已驗證）

- **陽爻（碼=1）= 9年，陰爻（碼=0）= 6年**（依先天八卦碼 code[i] 判斷）
- 起運爻位：從**元堂（動爻 ichange）**開始，依初→二→三→四→五→六→初（循環）順序
- 先天大運從虛歲 1 起，後天大運緊接先天結束（先天總年數後+1起）
- 後天大運使用**後天卦碼**判斷各爻陰陽

例：地風升（code="011000"），動爻=二爻（ichange=2）
- code[0]=0(初=陰=6年), code[1]=1(二=陽=9年), code[2]=1(三=陽=9年)
- code[3]=0(四=陰=6年), code[4]=0(五=陰=6年), code[5]=0(六=陰=6年)
- 先天大運順序（從元堂二爻起循環）：二9→三9→四6→五6→六6→初6 = 共42年
- 大運範圍：二爻1~9, 三爻10~18, 四爻19~24, 五爻25~30, 六爻31~36, 初爻37~42

---

## 四、資料庫表結構

### 4.1 `public.ig`（六十四卦主表）

| 欄位 | 類型 | 說明 |
|------|------|------|
| code | varchar(6) | 六爻二進位碼（下卦+上卦） |
| name | varchar | 卦名（如「水天需」） |
| description | text | 卦辭 |
| img | varchar | 卦圖檔名 |
| desc_one | text | 初爻爻辭 |
| desc_two | text | 二爻爻辭 |
| desc_three | text | 三爻爻辭 |
| desc_four | text | 四爻爻辭 |
| desc_five | text | 五爻爻辭 |
| desc_six | text | 六爻爻辭 |

### 4.2 `public.ig64_six`（六親、地支詳細資料）

| 欄位 | 類型 | 說明 |
|------|------|------|
| ig64 | varchar | 卦名 FK（對應 ig.name） |
| wuxing | varchar | 卦宮五行 |
| gongming | varchar | 宮名（含世應資訊） |
| rowid | int | 世應序（1-8，決定世爻/應爻位置） |
| one_yao | varchar(4) | 初爻：六親(2) + 地支(1) + 附加(1) |
| two_yao | varchar(4) | 二爻（同上） |
| three_yao | varchar(4) | 三爻（同上） |
| four_yao | varchar(4) | 四爻（同上） |
| five_yao | varchar(4) | 五爻（同上） |
| six_yao | varchar(4) | 六爻（同上） |

六親：官鬼、妻財、兄弟、父母、子孫
各 yao 欄位前2字=六親，第3字=地支（子丑...亥），第4字=附加屬性

### 4.3 `public.ig64_desc`

需確認欄位（可能是卦辭的擴展描述或大運專用）。

---

## 五、六神（六獸）

依年天干（年柱天干）決定六神配爻順序（由初爻至六爻）：

| 年天干 | 六神順序（初→六） |
|--------|-----------------|
| 甲/乙 | 青龍、朱雀、勾陳、螣蛇、白虎、玄武 |
| 丙/丁 | 朱雀、勾陳、螣蛇、白虎、玄武、青龍 |
| 戊 | 勾陳、螣蛇、白虎、玄武、青龍、朱雀 |
| 己 | 螣蛇、白虎、玄武、青龍、朱雀、勾陳 |
| 庚/辛 | 白虎、玄武、青龍、朱雀、勾陳、螣蛇 |
| 壬/癸 | 玄武、青龍、朱雀、勾陳、螣蛇、白虎 |

### 世應位置（依 rowid）

| rowid | 世爻 | 應爻 |
|-------|------|------|
| 1 | 初爻 | 四爻 |
| 2 | 二爻 | 五爻 |
| 3 | 三爻 | 六爻 |
| 4 | 四爻 | 初爻 |
| 5 | 五爻 | 二爻 |
| 6 | 六爻 | 三爻 |
| 7 | 五爻 | 二爻（游魂卦） |
| 8 | 四爻 | 初爻（歸魂卦） |

---

## 六、納干規則

上卦（外卦）納干：
- 乾=壬, 坤=癸, 坎=戊, 離=己, 艮=丙, 震=庚, 巽=辛, 兌=丁

下卦（內卦）納干：
- 乾=甲, 坤=乙, 坎=戊, 離=己, 艮=丙, 震=庚, 巽=辛, 兌=丁

---

## 七、空亡計算

依年天干取空亡地支對（以年天干序號 CUE1=1..10 對應甲..癸）：

```csharp
// CUE1=年天干序號(甲=1..癸=10)，CUF1=年支數(子=1..亥=12)
switch (CUE1)
{
    case 1: Null01 = CUF1 + 10; break;  // 甲
    case 2: Null01 = CUF1 + 9;  break;  // 乙
    // ... 每次遞減1
    case 10: Null01 = CUF1 + 1; break; // 癸
}
Null02 = Null01 + 1;
if (Null01 > 12) Null01 -= 12;
if (Null02 > 12) Null02 -= 12;
```

各爻地支（從 ig64_six 取第3字）與 Null01/Null02 比較，相符則標記空亡。

---

## 八、API 設計

### 端點

```
GET /api/HeLuo/gua
```

### 認證
需 Bearer JWT（從 UserChart 取得命盤資料）

### 輸入（Query 或 Body）

```json
{
  "yearBranch": "子",       // 年支
  "lunarMonth": 5,          // 農曆月（1-12）
  "lunarDay": 15,           // 農曆日（1-30）
  "hourBranch": "午",       // 時支
  "yearStem": "甲"          // 年天干（用於六神、空亡）
}
```

> 若傳入 userId，系統自動從 UserChart + Calendar 表取得上述資料。

### 輸出

```json
{
  "input": {
    "yearBranchNum": 1,
    "lunarMonth": 5,
    "lunarDay": 15,
    "hourBranchNum": 7,
    "xiantianNum": "下卦數/上卦數/動爻",
    "downNum": 3,
    "upNum": 6,
    "yuanTang": 4
  },
  "xiantian": {
    "code": "011010",
    "name": "水火既濟",
    "description": "卦辭...",
    "wuxing": "水",
    "gongming": "坎宮",
    "yaos": [
      {
        "yaoNum": 1,
        "liuqin": "妻財",
        "dizhi": "子",
        "liushen": "青龍",
        "shiyingLabel": "世",
        "kongwang": false,
        "yaoDesc": "初爻爻辭..."
      }
      // ...共6爻
    ]
  },
  "yuanTang": 4,
  "houtian": {
    "code": "011110",
    "name": "澤火革",
    "description": "卦辭...",
    "yaos": [ /* 同上 */ ]
  },
  "dayun": {
    "xiantian": [
      { "yaoNum": 1, "startAge": 1, "endAge": 10 },
      { "yaoNum": 2, "startAge": 11, "endAge": 20 },
      // ...共6爻
    ],
    "houtian": [
      { "yaoNum": 1, "startAge": 61, "endAge": 70 },
      // ...共6爻
    ]
  }
}
```

---

## 九、C# 實作建議

### 9.1 Entity Models

```csharp
// Models/HeLuoModels.cs
[Table("ig")]
public class IgHexagram
{
    public string Code { get; set; } = "";       // PK
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public string? Img { get; set; }
    public string? DescOne { get; set; }
    public string? DescTwo { get; set; }
    public string? DescThree { get; set; }
    public string? DescFour { get; set; }
    public string? DescFive { get; set; }
    public string? DescSix { get; set; }
}

[Table("ig64_six")]
public class Ig64Six
{
    public int Id { get; set; }
    public string Ig64 { get; set; } = "";      // 卦名 FK
    public string? Wuxing { get; set; }
    public string? Gongming { get; set; }
    public int RowId { get; set; }              // 世應序
    public string? OneYao { get; set; }
    public string? TwoYao { get; set; }
    public string? ThreeYao { get; set; }
    public string? FourYao { get; set; }
    public string? FiveYao { get; set; }
    public string? SixYao { get; set; }
}
```

### 9.2 Controller

```
Controllers/HeLuoController.cs
```

### 9.3 靜態資料

```csharp
// 地支數字對照（子=1..亥=12）
private static readonly Dictionary<string, int> BranchNum = new()
{
    {"子",1},{"丑",2},{"寅",3},{"卯",4},{"辰",5},{"巳",6},
    {"午",7},{"未",8},{"申",9},{"酉",10},{"戌",11},{"亥",12}
};

// 配卦（先天八卦序，數字→三爻碼）
private static readonly Dictionary<int, string> GuaCode = new()
{
    {1,"111"},{2,"110"},{3,"011"},{4,"100"},
    {5,"101"},{6,"010"},{7,"001"},{8,"000"}
};

// 配卦名（先天八卦序）
private static readonly Dictionary<int, string> GuaName = new()
{
    {1,"乾"},{2,"兌"},{3,"離"},{4,"震"},
    {5,"巽"},{6,"坎"},{7,"艮"},{8,"坤"}
};

// 天干序號（甲=1..癸=10）
private static readonly Dictionary<string, int> StemNum = new()
{
    {"甲",1},{"乙",2},{"丙",3},{"丁",4},{"戊",5},
    {"己",6},{"庚",7},{"辛",8},{"壬",9},{"癸",10}
};
```

---

## 十、待確認事項

1. `public.ig64_desc` 表的欄位結構（執行 `\d ig64_desc` 確認）
2. `public.ig` 的 `code` 欄位大小寫（舊系統是 `stDown + stUP`，下卦在前上卦在後）
3. 農曆月日的取得：UserChart 端點已有生辰資料，需確認 calendar 表是否可查到農曆月日，或前端直接傳入
4. 是否需要「小限」（六爻流年推算）功能

---

## 十一、開發順序

1. 確認 ig / ig64_six / ig64_desc 三表欄位（查 DB）
2. 新增 EF Core Entity 和 DbSet（無需 Migration，表已存在）
3. 實作 `HeLuoController.cs` + `HeLuoService.cs`
4. 本地測試（用已知八字驗算先天卦）
5. Deploy Ecanapi
6. 前端 `/disk` 或 `/member` 頁加入河洛理數卦象顯示
