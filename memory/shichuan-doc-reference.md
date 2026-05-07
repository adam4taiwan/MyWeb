---
name: 師傳.doc 及十干象法.docx 資料來源與用法
description: 兩份命理知識庫文檔的章節結構、萃取方法、C# 實作對應
type: reference
---

# 師傳.doc 及十干象法.docx 資料來源紀錄

## 檔案路徑

- `D:\命理知識庫\江湖法\師傳.doc` — OLE Compound Document (Big5/UTF-16LE)
- `D:\命理知識庫\江湖法\十干象法.docx` — ZIP/XML (繁體中文版)

---

## 師傳.doc — 章節結構與用途

### 萃取方法

```python
import struct
with open('/mnt/d/命理知識庫/江湖法/師傳.doc', 'rb') as f:
    data = f.read()
# 掃描 UTF-16LE Unicode 字元（U+4E00~U+9FFF CJK + 標點）
text_blocks = []
i = 0; current = []
while i < len(data) - 1:
    val = struct.unpack_from('<H', data, i)[0]
    if 0x4E00 <= val <= 0x9FFF or 0x3000 <= val <= 0x303F or val in [0x0020,0x000A,0x000D] or 0xFF00 <= val <= 0xFFEF:
        current.append(chr(val)); i += 2
    elif 0x20 <= val <= 0x7E:
        current.append(chr(val)); i += 2
    else:
        if len(current) > 8: text_blocks.append(''.join(current))
        current = []; i += 1
all_text = ' '.join(text_blocks)
```

### 七章結構與四柱用途

| 章節 | 標題 | 內容格式 | 四柱用途 | C# 方法/變數 |
|------|------|----------|----------|--------------|
| 第一章 | 甲子納音五行論 | 30 組納音對（甲子乙丑...）: 命名原理 | **年柱** 納音象意 | `nayinCh1[納音名]` |
| 第二章 | 六十甲子納音細注 | 60 個干支各一筆: XY金/火..., 喜..., 神煞名 | **日柱** 納音特質 | `nayinCh2[dStem+dBranch]` |
| 第三章 | 甲子納音推年命 | 30 組: 年命推算走向（跳過首句與Ch1重疊） | **年柱** 年命補充 | `nayinCh3[納音名]` |
| 第四章 | 六十甲子論青紅 | 60 個: 生肖+納音命格特質 | **年柱** 生肖+納音 | `nayinCh4[yStem+yBranch]` |
| 第五章 | 十二生肖逐月考 | 12生肖 × 12月 = 144: 年支生肖×月份 | **月柱** 一項 | `nayinCh5[yBranch+"_"+mBranch]` |
| 第六章 | 十二生肖逐日考 | 12生肖 × 12日支 = 144: 年支生肖×日支 | **日柱** 一項 | `nayinCh6[yBranch+"_"+dBranch]` |
| 第七章 | 十二生肖逐時考 | 12生肖 × 12時支 = 144: 年支生肖×時支 | **時柱** 一項 | `nayinCh7[yBranch+"_"+hBranch]` |

### 月支對農曆月對照（Ch.5 查詢用）

| 農曆月 | 月支 | 農曆月 | 月支 |
|--------|------|--------|------|
| 正月 | 寅 | 七月 | 申 |
| 二月 | 卯 | 八月 | 酉 |
| 三月 | 辰 | 九月 | 戌 |
| 四月 | 巳 | 十月 | 亥 |
| 五月 | 午 | 冬月 | 子 |
| 六月 | 未 | 臘月 | 丑 |

### 已實作狀態

- **LfNaYin(yStem, yBranch, mBranch, dStem, dBranch, hBranch)** — 已整合至傳家寶典 Ch.3（2026-04-29）
- 輸出標籤：`【納音論斷】` > `【年柱納音：X】` / `【月柱生肖論】` / `【日柱納音：X】` / `【時柱生肖論】`
- 覆蓋率：Ch5=143/144、Ch6=141/144、Ch7=142/144（少數原文無對應自動略過）

### 大運/流年再用時的應用建議

| 應用場景 | 建議章節 | 說明 |
|----------|----------|------|
| 大運行至生肖對應月份 | Ch.5 逐月考 | 大運干支所在月份 × 年生肖 → 當步大運時段氣象 |
| 流年日柱納音輔助 | Ch.2 細注 | 流年日主特質補充說明 |
| 大運地支×年生肖 | Ch.6 逐日考 | 將大運地支當日支查 → 該大運對命主的環境影響 |
| 流年地支×年生肖 | Ch.6 逐日考 | 流年地支 × 年生肖 → 流年感受 |
| 時盤/流時 | Ch.7 逐時考 | 若需細到時辰分析 |

### 注意事項

- 原書有打字錯誤：`丁西` = `丁酉`（Ch.2 已手動修正）
- `nayinCh2` 包含神煞名稱（平頭/懸針/截路等），為完整保留原文，不過濾
- Ch.3「推年命」首句與 Ch.1 重疊，程式已跳過首句取後文

---

## 十干象法.docx — 章節結構與用途

### 萃取方法

```python
import zipfile, re
with zipfile.ZipFile('/mnt/d/命理知識庫/江湖法/十干象法.docx') as z:
    xml = z.read('word/document.xml').decode('utf-8')
text = re.sub(r'<[^>]+>', '', xml)
# 儲存至 /tmp/shiganxiangfa_trad.txt（繁體版）
```

### 結構

- 10 天干 × 12 月支 = 120 組論斷
- 格式：`甲木X月：...` 每組 2-5 句

### 已實作狀態

- **LfShiGanXiangFa(dStem, mBranch)** — 已整合至傳家寶典 Ch.3（2026-04-29）
- 輸出標籤：`【十干象法】`
- 資料：`stemBase`（10 干基礎描述）+ `monthDesc`（120 組干×月）

### 大運/流年再用時的應用建議

| 應用場景 | 建議 |
|----------|------|
| 大運天干論斷 | 以大運天干代入 dStem，月支保持出生月支 |
| 流年天干加成 | 以流年天干代入 dStem，輸出當年天干象意 |
| 大運日主新視角 | 可對比原日主象法 vs 大運天干象法，看轉變 |
