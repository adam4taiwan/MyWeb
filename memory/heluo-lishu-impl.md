# 河洛理數 實作規格（已驗證）

> 最後更新：2026-05-26
> 驗測案例：1963/05/08 20:00 男（癸卯年 農曆四月十五 戌時）
> 結果：先天=地風升, 後天=山地剝 ✓

---

## 一、輸入變數

| 變數 | 說明 | 取值 |
|------|------|------|
| intY | 年支數（子=1..亥=12） | ChartJson.bazi.yearPillar.earthlyBranch |
| intM | 農曆月（0-indexed = 農曆月-1） | calendar DB 查陽曆 → LunarMonth，再 -1 |
| intD | 農曆日（0-indexed = 農曆日-1） | calendar DB 查陽曆 → LunarDay，再 -1 |
| intT | 時支數（子=1..亥=12） | ChartJson.bazi.timePillar.earthlyBranch |

**重要：月和日均為 0-indexed（農曆月-1, 農曆日-1）**
截圖驗證：地數 = intY+(月-1)+(日-1)+intT = 4+3+14+11 = 32 ✓

---

## 二、起卦公式（已驗證）

```
下卦數 flNum = (intY + intM + intD) % 8  ← 餘0取8
上卦數 skNum = (intY + intM + intD + intT) % 8  ← 餘0取8
動爻 ichange = (intY + intM + intD + intT) % 6  ← 餘0取6
```

驗測：intY=4, intM=3, intD=14, intT=11
→ flNum=21%8=5(巽), skNum=32%8=0→8(坤), ichange=32%6=2 ✓

---

## 三、先天八卦序碼（正確版）

| 數字 | 卦名 | 三爻碼（初→三，陽=1 陰=0） |
|------|------|--------------------------|
| 1 | 乾 | 111 |
| 2 | 兌 | 110 |
| 3 | 離 | 101 |
| 4 | 震 | 100 |
| 5 | 巽 | 011 |
| 6 | 坎 | 010 |
| 7 | 艮 | 001 |
| 8 | 坤 | 000 |

先天卦碼 = guaCode[flNum] + guaCode[skNum]（下卦在前）

---

## 四、後天卦公式（已驗證，非單爻翻轉）

```
後天下卦數 htFlNum = skNum        ← 先天上卦 → 後天下卦
後天上卦數 htSkNum = (flNum + ichange) % 8  ← 餘0取8
後天卦碼 = guaCode[htFlNum] + guaCode[htSkNum]
```

驗測：skNum=8(坤)→後天下=坤，(5+2)%8=7(艮)→後天上=艮
後天 = 坤(000)+艮(001) = "000001" = 山地剝 ✓

---

## 五、元堂位置

| | 元堂 |
|--|------|
| 先天 | ichange（動爻） |
| 後天 | 7 - ichange |

驗測：ichange=2 → 後天元堂=5(五爻) ✓

---

## 六、大運計算（已驗證）

- 陽爻（碼=1）= 9年，陰爻（碼=0）= 6年
- 先天大運：從元堂(ichange)爻起，依初→二→三→四→五→六→初循環
- 後天大運：從後天元堂(7-ichange)爻起，同樣循環
- 先天大運從虛歲1起；後天從先天結束後+1起

驗測地風升（碼"011000"），ichange=2：
二(9,1~9)→三(9,10~18)→四(6,19~24)→五(6,25~30)→六(6,31~36)→初(6,37~42) ✓
後天山地剝（碼"000001"），htChange=5：
五(6,43~48)→六(9,49~57)→初(6,58~63)→二(6,64~69)→三(6,70~75)→四(6,76~81) ✓

---

## 七、世應位置（GetShiYing - DB rowid 對照）

**DB rowid 編碼規則：rowid=1=本宮/六世，2=初世，3=二世...6=五世，7=游魂，8=歸魂**

| DB rowid | 卦類型 | 世爻 | 應爻 |
|----------|--------|------|------|
| 1 | 本宮/六世 | 六爻 | 三爻 |
| 2 | 初世 | 初爻 | 四爻 |
| 3 | 二世 | 二爻 | 五爻 |
| 4 | 三世 | 三爻 | 六爻 |
| 5 | 四世 | 四爻 | 初爻 |
| 6 | 五世 | 五爻 | 二爻 |
| 7 | 游魂 | 四爻 | 初爻 |
| 8 | 歸魂 | 初爻 | 四爻 |

驗測：地風升 rowid=5 → 世=四,應=初 ✓；山地剝 rowid=6 → 世=五,應=二 ✓

---

## 八、納干規則

| 位置 | 卦 | 納干 |
|------|----|------|
| 下卦（內） | 乾 | 甲 |
| 下卦（內） | 坤 | 乙 |
| 下卦（內） | 坎 | 戊 |
| 下卦（內） | 離 | 己 |
| 下卦（內） | 艮 | 丙 |
| 下卦（內） | 震 | 庚 |
| 下卦（內） | 巽 | 辛 |
| 下卦（內） | 兌 | 丁 |
| 上卦（外） | 乾 | 壬 |
| 上卦（外） | 坤 | 癸 |
| 上卦（外） | 坎 | 戊 |
| 上卦（外） | 離 | 己 |
| 上卦（外） | 艮 | 丙 |
| 上卦（外） | 震 | 庚 |
| 上卦（外） | 巽 | 辛 |
| 上卦（外） | 兌 | 丁 |

初~三爻用下卦(內)納干，四~六爻用上卦(外)納干

---

## 九、六神（依年天干，初爻→六爻）

| 年天干 | 初 | 二 | 三 | 四 | 五 | 六 |
|--------|----|----|----|----|----|----|
| 甲/乙 | 青龍 | 朱雀 | 勾陳 | 螣蛇 | 白虎 | 玄武 |
| 丙/丁 | 朱雀 | 勾陳 | 螣蛇 | 白虎 | 玄武 | 青龍 |
| 戊 | 勾陳 | 螣蛇 | 白虎 | 玄武 | 青龍 | 朱雀 |
| 己 | 螣蛇 | 白虎 | 玄武 | 青龍 | 朱雀 | 勾陳 |
| 庚/辛 | 白虎 | 玄武 | 青龍 | 朱雀 | 勾陳 | 螣蛇 |
| 壬/癸 | 玄武 | 青龍 | 朱雀 | 勾陳 | 螣蛇 | 白虎 |

---

## 十、農曆日期取得方式

```csharp
// 優先從 lunarBirthDate 欄位解析
int lunarMonth = LfParseLunarMonth(lunarRawDocx);
int lunarDay   = LfParseLunarDay(lunarRawDocx);

// 若解析失敗，fallback 查 calendar DB
if (lunarMonth <= 0 || lunarDay <= 0)
{
    var calEntry = _calendarDb.CalendarEntries.FirstOrDefault(
        c => c.Year == birthYear && c.SolarMonth == birthMonth && c.SolarDay == birthDay);
    if (calEntry != null)
    {
        if (lunarMonth <= 0) lunarMonth = LfParseLunarMonthField(calEntry.LunarMonth);
        if (lunarDay <= 0)   lunarDay   = LfParseLunarDayField(calEntry.LunarDay);
    }
}
// 傳入公式時：intM = lunarMonth - 1, intD = lunarDay - 1
```

---

## 十一、資料庫表結構

### `public.ig`（主表）

| 欄位 | 說明 |
|------|------|
| id | PK |
| code | 六爻碼 varchar(6)，下卦前3位+上卦後3位 |
| name | 卦名 |
| description | 卦辭（含白話、象辭） |
| desc_one ~ desc_six | 初爻~六爻爻辭（含白話） |

### `public.ig64_six`（六親地支）

| 欄位 | 說明 |
|------|------|
| ig64 | 卦名 FK |
| one_yao ~ six_yao | 各爻資料：前2字=六親，第3字=地支，第4字=五行 |
| RowID | 世應序（見上方對照表） |
| gongming | 宮名 |
| wuxing | 五行 |

**已知問題**：ig64_six 的六親/地支數據與老系統有差異，需命理專家校正 DB 數據

---

## 十二、程式位置

- Controller：`Ecanapi/Controllers/ConsultationController.cs`
- 方法：`LfBuildHeLuoChapter(yStem, yBranch, hBranch, lunarMonth, lunarDay, context)`
- 呼叫點：玉洞子傳家寶典端點（`analyze-yudongzi`），星平大限之後
- DB Model：`Ecanapi/Models/HeLuoModels.cs`（IgHexagram, Ig64Six）
- DbContext：`ApplicationDbContext.cs`（IgHexagrams, Ig64Sixs）
- DB 查詢用 `FromSqlInterpolated`（避免 EF Core LINQ 回傳 null 的問題）

---

## 十三、輸出格式

```
【第二十章：河洛理數·命卦】

【起卦數】下卦=5(巽) 上卦=8(坤) 動爻=2

【先天命卦】地風升
宮象：震宮  五行：木
卦辭：...

| 爻位 | 六親 | 地支 | 納干 | 六神 | 大運 | 世應 |
|----|----|----|----|----|----|----|
| 六爻(上) | ... | ... | 癸 | ... | 31~36 | |
...
| 初爻 | ... | ... | 辛 | ... | 37~42 | 應 |

【初爻爻辭】...
【二爻爻辭】...
...
【六爻(上)爻辭】...

【後天命卦】山地剝
...（格式同上）
```
