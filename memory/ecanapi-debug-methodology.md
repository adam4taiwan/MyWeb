---
name: Ecanapi 除錯方法論
description: ConsultationController 新功能沒有輸出時的標準除錯流程，含兩條路架構說明
type: feedback
---

# Ecanapi ConsultationController 除錯方法論

## 最重要：先確認走哪條路

ConsultationController 有**兩條完全獨立的路**，新功能必須在兩條路都加：

| 端點 | 用途 | 輸出函式 |
|------|------|----------|
| `GET /analyze-kb` | 線上即時產生報告（回傳 JSON） | 直接在端點內用 `sb_out` 組字串 |
| `GET /analyze-yudongzi` | 線上即時產生玉洞子命書 | `LfBuildYudongziReportV2(...)` |
| `POST /export-yudongzi-docx` | 下載 DOCX 檔案 | `LfBuildYudongziReportV2(...)` |

**常見錯誤**：只在 `analyze-kb` 加了查詢，忘了 `analyze-yudongzi` 和 `export-yudongzi-docx`。
使用者下載 DOCX 走的是 `export-yudongzi-docx`，不是 `analyze-kb`。

---

## LfBuildYudongziReportV2 的限制

- 是 `private static string` 方法（非 async）
- **無法直接呼叫 async DB 查詢**（如 `KbQueryDoubleStarInPalace`）
- 解法：在 async caller 裡先查好，以參數傳入
- 目前有 `doubleDescs` / `minorDescs` 兩個 optional Dictionary 參數

### 新增 DB 查詢到玉洞子命書的標準流程

1. 在 `analyze-yudongzi`（約 line 2195）和 `export-yudongzi-docx`（約 line 2478）
   的 `ziweiGeJuYdz` 計算完之後、`LfBuildYudongziReportV2(...)` 呼叫之前，加入查詢
2. 把結果放進 Dictionary 或新增變數
3. 在 `LfBuildYudongziReportV2` 簽名加 optional 參數（加在最後，給預設值）
4. 兩個 call site 都更新，傳入新參數
5. 在函式體內的適當章節輸出

---

## 功能沒有出現的除錯步驟

### Step 1：確認功能加在哪條路

```
使用者看不到輸出 → 先問：他是下載 DOCX 還是看線上報告？
  ↓ 下載 DOCX → 看 export-yudongzi-docx + LfBuildYudongziReportV2
  ↓ 線上報告 → 看 analyze-kb 或 analyze-yudongzi
```

### Step 2：確認 DB 有資料

```sql
SELECT "Title", LEFT("ResultText", 50)
FROM "FortuneRules"
WHERE "SourceFile"='檔案名稱.docx'
AND "Title" LIKE '關鍵字%'
LIMIT 5;
```
- Local DB：`Host=172.22.192.1;Port=5432;Database=EcanApiDb`
- Production DB (NeonDB)：fly secrets 或 appsettings.Production.json

### Step 3：確認 JSON 屬性名稱

`AstrologyChartResult` 在 ASP.NET Core 預設以 **camelCase** 序列化並儲存：
- `palaces`（小寫 p）
- `palaceName`（camelCase）
- `majorStars`（camelCase）
- `secondaryStars`, `goodStars`, `badStars`

代碼中查 JSON 用的鍵名（如 `"palaceName"`）是正確的 camelCase。

### Step 4：確認 SQL 查詢格式正確

各文件的 Title 格式不同（易錯）：
- `9紫微斗数辅星-吉星入十二宮.docx`：Title = `文昌星、文曲星入夫妻`（**不含宮**）
- `4紫微斗数煞星入十二宮.docx`：Title = `擎羊星入夫妻宮`（**含宮**）
- `紫微斗数双星入十二宮(全).docx`：Title = `紫貪居六親宮位` 或 `紫貪居命宮`
- `5新.docx`（天府/太陽/太陰）：單行格式，多宮合併在一個 ResultText

**官祿宮 → 事業**：9.docx / 4.docx / 雙星.docx 均用「事業」，不用「官祿」

### Step 5：確認宮位映射

雙星文件的六親宮映射（夫妻/子女/父母/兄弟/交友 → 六親宮位）：
```csharp
"夫妻宮" or "子女宮" or "父母宮" or "兄弟宮" or "交友宮" => "六親宮位"
```
奴僕宮 = 交友宮（KbNormalizePalaceName 處理）

---

## 文件編輯注意事項

ConsultationController.cs 是 **Windows CRLF（`\r\n`）** 格式。
Edit 工具常失敗，改用 Python 腳本：

```python
with open(filepath, 'rb') as f:
    content = f.read().decode('utf-8')
content = content.replace(old_text, new_text, 1)
with open(filepath, 'wb') as f:
    f.write(content.encode('utf-8'))
```

多個替換要放同一個腳本，最後才寫檔，避免中途失敗導致部分寫入。

---

## 雙星/輔星功能（2026-04-15 上線）

### DoubleStarKeyMap 支援的雙星組合（25組）
紫破/紫府/紫相/紫殺/紫貪、武府/武相/武破/武殺/武貪、
廉府/廉相/廉破/廉殺/廉貪、同巨/同梁/同陰、機巨/機梁/機陰、
陽梁/巨日/日月

### 輔星查詢邏輯
- 吉星（9.docx）：昌曲/左右/魁鉞/祿馬，title 格式**不含宮**
- 煞星（4.docx）：羊/陀/火/鈴/劫/空，title 格式**含宮**
- 星曜縮寫位置：昌/曲/左/右/魁/鉞/祿/劫/空 → secondaryStars；馬 → goodStars；羊/陀/火/鈴 → badStars
- 祿存星的正確字元：U+4635（`䘵`），非 U+4558
