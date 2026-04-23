---
name: 紫微 KB 副星過濾方法
description: KbContentLineHasAbsentSecondaryStar - 過濾 KB 命書中宮位沒有的副星描述句，一勞永逸方案
type: project
---

# 紫微 KB 副星過濾方法（一勞永逸版）

## 問題背景

紫微 KB（知識庫）取出的宮位內容，每一句話可能含有副星條件描述，例如：

- `巳亥[廉貪]有火鈴同度，暴發暴敗...` → 只有宮位 JSON 有「火」或「鈴」才應顯示
- `巳亥[廉貪]與陀羅同度，易進退失據。` → 只有宮位 JSON 有「陀」才應顯示

若宮位沒有那些副星，該句不應出現在命書。

## 實作位置

`Ecanapi/Controllers/ConsultationController.cs`

## 核心資料：AllSecondaryStarSingleChars

JSON 中副星以單字儲存（火星=火, 鈴星=鈴, 陀羅=陀, 左輔=左, 文昌=昌 等）。

```csharp
private static readonly HashSet<char> AllSecondaryStarSingleChars = new()
{
    // 六吉星
    '左','右','昌','曲','魁','鉞',
    // 六煞星
    '火','鈴','羊','陀','空','劫',
    // 祿馬雜曜
    '馬','祿','刑','姚','鸞','喜',
    '孤','寡','虛','哭','壽','福',
    '官','巫','碎','耗','神','臺','座','光',
};
```

## 核心方法：KbContentLineHasAbsentSecondaryStar

```csharp
private static bool KbContentLineHasAbsentSecondaryStar(string line, HashSet<string> palaceStars)
{
    bool anyPresent = false;
    bool anyAbsent  = false;

    foreach (char c in line)
    {
        if (!AllSecondaryStarSingleChars.Contains(c)) continue;
        string s = c.ToString();
        if (palaceStars.Contains(s))
            anyPresent = true;
        else
            anyAbsent = true;
        if (anyPresent) break; // 已確認有副星在宮，提早結束
    }

    // 句中出現副星字，且全部不在此宮 → 過濾
    return anyAbsent && !anyPresent;
}
```

## 呼叫位置（KbFilterZiweiContent 內）

```csharp
if (!inConditional || includeSection)
{
    if (inConditional && includeSection && KbLineHasUnavailableCombination(line, palaceStars))
        continue;
    // 副星過濾：句中有副星字但全部不在此宮 → 過濾
    if (KbContentLineHasAbsentSecondaryStar(line, palaceStars))
        continue;
    result.AppendLine(line);
}
```

## 邏輯說明

1. 逐字掃描句子，遇到 `AllSecondaryStarSingleChars` 中的字視為副星引用
2. `palaceStars` 含 JSON 原始單字（由 `KbGetPalaceStarsSet` 建立）
3. **anyPresent = true** → 至少一個提及的副星在此宮 → **保留句子**
4. **anyAbsent && !anyPresent** → 全部提及的副星都不在此宮 → **過濾句子**
5. 沒有掃到任何副星字 → 通用描述 → **保留**

## 設計原則

- **寧可過濾，不要顯示不該出現的內容**（用戶指示）
- 只要有任一副星在宮即保留，不要求全部都在（因「火鈴」只需有火或鈴之一即成立）
- 不依賴關鍵字列表（同度/加臨/同臨...），直接掃字，一勞永逸

## 各命書同步狀態（已確認 2026-04-23）

`KbContentLineHasAbsentSecondaryStar` 內建於共用方法 `KbFilterZiweiContent`（line 1379），所有呼叫該方法的地方均自動套用副星過濾。

- [x] **八字命書** (`analyze-bazi-ziwei`) - lines 530-545，已套用
- [x] **玉洞子命書** (`analyze-yudongzi`) - lines 2792-2809、3091-3108、6930（`LfBuildYudongziReportV2` Ch.7 十二宮），已套用
- [x] **大運命書** (`analyze-daiyun`) - `DyBuildReport` lines 9269、9391，已套用
- [x] **流年命書** (`analyze-liunian`) - `LnBuildReport` 不使用 KB 宮位文字（只用紫微評分），不需要套用
