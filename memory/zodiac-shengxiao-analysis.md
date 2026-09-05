---
name: 生肖分析（劉威吾四柱論）規格文件
updated: 2026-05-11
---

# 生肖分析（劉威吾生肖四柱論）

## 概述

以年柱生肖為主軸，與月/日/時柱地支交叉查表，得出每柱的生肖論斷。
資料來源為劉威吾三本 docx，**非師傳.doc**（師傳.doc 只用於 Ch1/2/3 納音理論）。

## 資料來源（劉威吾 docx）

| 生肖 | 所在文件 |
|------|----------|
| 子鼠、丑牛、辰龍、酉雞 | `D:\命理知識庫\劉威吾\子丑辰酉.docx` |
| 卯兔、巳蛇、戌狗、申猴 | `D:\命理知識庫\劉威吾\卯巳戌申.docx` |
| 寅虎、午馬、未羊、亥豬 | `D:\命理知識庫\劉威吾\寅午未亥.docx` |

原始文件中有些 OCR 錯字需修正（如「西時」→「酉時」、「已時」→「巳時」、「開時」→「丑時」）。

## 四個 Dictionary（nayinCh4~7）

| 方法 | Key 格式 | 說明 |
|------|---------|------|
| `nayinCh4` | `年干+年支`（如 `癸卯`）| 年柱生肖+納音特質（60甲子） |
| `nayinCh5` | `年支_月支`（如 `卯_巳`）| 年生肖 × 月支（子=正月系統，需 offset -2） |
| `nayinCh6` | `年支_日支`（如 `卯_亥`）| 年生肖 × 日支 |
| `nayinCh7` | `年支_時支`（如 `卯_戌`）| 年生肖 × 時支 |

### Ch5 月份 offset 說明（重要）

ch5 字典的月份以**子=正月**為起點（子丑寅卯...），
但八字月支以**寅=正月**為起點（寅卯辰...）。
查表前需做 offset 修正：

```csharp
string[] ch5BranchOrder = { "子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥" };
int mBranchIdx = Array.IndexOf(ch5BranchOrder, mBranch);
string mBranchForDict = ch5BranchOrder[(mBranchIdx - 2 + 12) % 12];
string ch5Key = yBranch + "_" + mBranchForDict;
```

## LfNaYin 架構（2026-05-11 重構後）

```csharp
private static (string nayin, string zodiac) LfNaYin(
    string yStem, string yBranch, string mBranch,
    string dStem, string dBranch, string hBranch)
```

回傳 tuple：
- `nayin`：Ch1/2/3 純納音理論（年柱 Ch1+Ch3，日柱 Ch2）
- `zodiac`：Ch4/5/6/7 劉威吾生肖四柱論

## 輸出格式（命書中的【生肖分析】）

```
【生肖分析】
【年柱生肖論】
（nayinCh4 對應文字）

【月柱生肖論】（月支）
（nayinCh5 對應文字，如「兔人生於四月...」）

【日柱生肖論】（日干+日支）
（nayinCh6 對應文字，如「卯人生於亥日...」）

【時柱生肖論】（時支）
（nayinCh7 對應文字，如「卯人生於戌時...」）
```

## 各命書導入狀態

| 端點 | 函式 | 位置 | 狀態 |
|------|------|------|------|
| `analyze-bazi-ziwei` | `LfBuildReport` | Ch5 六親論斷後 | **已上線 2026-05-11** |
| `analyze-yudongzi` | `LfBuildYudongziReportV2` | Ch5 用神喜忌後 | **已上線 2026-05-11** |
| `analyze-daiyun` | `DyBuildReport` | 待評估 | 未實作 |
| `analyze-liunian` | `LnBuildReport` | 待評估（流年×生肖可用） | 未實作 |

## 導入方式（未來端點參考）

```csharp
// 1. 呼叫 LfNaYin 取得 tuple
var (nayinText, zodiacText) = LfNaYin(yStem, yBranch, mBranch, dStem, dBranch, hBranch);

// 2. nayin 放在 Ch3 納音論斷
if (!string.IsNullOrEmpty(nayinText))
{
    sb.AppendLine("【納音論斷】");
    sb.AppendLine(nayinText);
    sb.AppendLine();
}

// 3. zodiac 放在 Ch5 後的【生肖分析】
if (!string.IsNullOrEmpty(zodiacText))
{
    sb.AppendLine("【生肖分析】");
    sb.AppendLine(zodiacText);
    sb.AppendLine();
}
```

## 命宮 / 身宮 / 胎元（2026-05-11 上線）

### 計算公式來源（詩訣）
- 胎元：月干進一，月支進三
- 命宮：子起正月逆查行，生月支上起生時，順查至卯是命宮
- 身宮：子起正月順查行，生月支上起生時，逆推到酉知身宮

### 公式對照
| 宮位 | 月支序 | 基準 | 過氣 |
|------|--------|------|------|
| 胎元 | 無（月干+1，月支+3） | - | 不需要 |
| 命宮 | 寅=1...丑=12 | 卯（sum=12時） | 需要 |
| 身宮 | 子=1...亥=12 | 酉（sum=4時） | 需要 |

- 兩宮通用：sum = mNum + hNum；sum<14 → 14-sum；sum>=14 → 26-sum
- 天干：五虎遁月 `LfWuHuDunStem(yStem, branch)`
- 過氣：`LfCheckGuoQi` 查 CalendarDb，出生日 >= 當月「氣」日期 → mBranch+1

### 顯示位置
- 八字命書 `LfBuildReport`：Ch.1 三表格之後
- 傳家寶典 `LfBuildYudongziReportV2`：Ch.2 三表格之後
- 待辦：十二宮排序確定後改為 4×4 宮格格式

## 命書規範提醒

- 輸出文字為劉威吾原文，語氣直接，無需 AI 潤飾
- 嚴禁出現方法論術語（如「nayinCh5」「Ch5 月柱論」）在命書正文中
- 各柱標題（如「【月柱生肖論】（巳）」）中的地支用**原始八字地支**，不用 dict key
