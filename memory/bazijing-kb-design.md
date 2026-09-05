# 八字真經命書 - 知識庫設計草案

## 一、命書章節結構

| 章 | 標題 | 對應八字真經 | 資料來源 |
|----|------|------------|---------|
| Ch.1 | 審時聞切·四時定數 | （同玉洞子） | 程式邏輯（不需新 DB）|
| Ch.2 | 先天八字依古制定 | （同玉洞子） | 程式邏輯（不需新 DB）|
| Ch.3 | 命局氣勢·格局高低 | 第一講 看命入式 | `BaziJingConfig` |
| Ch.4 | 財官論命 | 第二講 搜尋八字 | `BaziJingCaiGuan` |
| Ch.5 | 干支象法精微 | 第三講 用活象法 | `BaziJingXiang` |
| Ch.6 | 神煞命運 | 第四講 巧用神煞 | `BaziJingShenSha` |
| Ch.7 | 盲派口訣精華 | 第五講 盲派口訣 | `BaziJingKouJue` |
| Ch.8 | 六親緣分 | 第二十六~二十七講 | `BaziJingLiuQin` |
| Ch.9 | 大運批斷 | 第十九~二十講 歲運 | 程式邏輯 + `BaziJingYunShi` |
| Ch.10 | 流年批斷 | 同上 | 程式邏輯 + `BaziJingYunShi` |

---

## 二、DB 表設計

### 表 1：`BaziJingConfig`（命局吉凶組合）

吉凶組合論斷，對應第一講「吉福配置」與「兇險組合」。

| 欄位 | 型別 | 說明 |
|------|------|------|
| Id | int PK | |
| ConfigType | varchar(10) | 吉/凶 |
| ConfigName | varchar(50) | 如「身財兩停」「七殺攻身」|
| Condition | varchar(200) | 判斷條件（程式用關鍵字）|
| Content | text | 命書論斷文字 |

候選吉組合（15個）：身財兩停、財官雙美、官印相生、化殺生身、食神制殺、羊刃駕殺、傷官配印、食傷生財、食傷泄秀、傷官傷盡、五行流通、寒暖適度、燥濕平衡、地支平和、病重得藥

候選凶組合（15個）：七殺攻身、財多壞印、梟神奪食、傷官見官、比劫奪財、體弱財旺、背祿逐馬、身旺無倚、刑沖穿破、偏枯失衡、純陰純陽、兩行相戰、流通不暢、有病無藥

---

### 表 2：`BaziJingCaiGuan`（財官論斷）

對應第二講財官論命，依財官配置輸出論斷。

| 欄位 | 型別 | 說明 |
|------|------|------|
| Id | int PK | |
| Category | varchar(20) | 財/官/財官互動 |
| ConfigType | varchar(50) | 如「比劫取財」「食傷生財」「印梟合財」|
| Condition | varchar(200) | 程式判斷條件 |
| Content | text | 命書論斷文字 |

候選配置（依書中分類）：
- **財**：比劫取財、食傷生財、印梟合財、用財取財、財多壞印、印多壞財
- **官**：官印相生、食神制殺、羊刃駕殺、傷官配印、官殺混雜、傷官見官
- **互動**：身財兩停、體弱財旺、財官雙美

---

### 表 3：`BaziJingXiang`（干支象法）

對應第三講，10天干 + 12地支各自的象意。

| 欄位 | 型別 | 說明 |
|------|------|------|
| Id | int PK | |
| XiangType | varchar(5) | 天干/地支 |
| Key | varchar(5) | 甲/乙/.../子/丑/... |
| BasicImage | text | 基本象意（自然、物品）|
| BodyImage | text | 人體/臟腑象 |
| PersonImage | text | 人物/性格象 |
| CareerImage | text | 職業/事業象 |
| RelationImage | text | 六親象 |
| Notes | text | 特殊說明 |

備註：天干象已有千里課堂版（`LfQianLiShiGanXiangFa`），此表側重十二地支象及組合象補充。

---

### 表 4：`BaziJingShenSha`（神煞查法+論斷）

對應第四講神煞。

| 欄位 | 型別 | 說明 |
|------|------|------|
| Id | int PK | |
| Name | varchar(20) | 神煞名（驛馬、文昌...）|
| LookupBase | varchar(10) | 查法基準（年支/日干/日支）|
| LookupMap | varchar(200) | JSON: { "子":"寅", "丑":"亥",... } |
| AuspiciousText | text | 吉論（得位/生旺時）|
| InauspiciousText | text | 凶論（克制/死絕時）|
| SpecialRule | text | 特殊條件說明 |

候選神煞（優先）：驛馬、桃花（咸池）、文昌、文曲、天德、月德、天乙貴人、紅艷、孤辰寡宿、亡神劫煞、陰差陽錯、魁罡

---

### 表 5：`BaziJingKouJue`（盲派口訣）

對應第五講口訣，包含年月日時四柱口訣及十神口訣。

| 欄位 | 型別 | 說明 |
|------|------|------|
| Id | int PK | |
| Category | varchar(20) | 年柱/月柱/日柱/時柱/十排歌/十神口訣 |
| Condition | varchar(100) | 條件鍵（如「年干=甲」「月支=子」）|
| Content | text | 口訣論斷文字 |
| SortOrder | int | 同 Category 內排序 |

分類說明：
- **四柱口訣**：年/月/日/時各柱干支特徵斷語（來自盲師看命四柱口訣）
- **十排歌**：十神×1~7重出現（七組×10神 = 70筆）
- **十神看命**：兩神組合（如「兩才抬身」「兩傷抬身」等）

---

### 表 6：`BaziJingLiuQin`（六親論斷）

對應第二十六~二十七講六親三關。

| 欄位 | 型別 | 說明 |
|------|------|------|
| Id | int PK | |
| LiuQinType | varchar(10) | 父/母/兄弟/配偶/子女 |
| Category | varchar(30) | 個數/性別/時機/品質/克損 |
| Condition | varchar(200) | 判斷條件 |
| Content | text | 論斷文字 |

---

### 表 7：`BaziJingYunShi`（歲運論斷）

對應第十九~二十講歲運關口。

| 欄位 | 型別 | 說明 |
|------|------|------|
| Id | int PK | |
| Category | varchar(20) | 大運/流年/共通 |
| Condition | varchar(200) | 觸發條件（如「大運=喜用」「流年沖日支」）|
| Content | text | 論斷文字 |

---

## 三、資料量估算

| 表 | 預估筆數 | 優先填充 |
|----|---------|---------|
| BaziJingConfig | 30 | ★★★ |
| BaziJingCaiGuan | 40 | ★★★ |
| BaziJingXiang | 22 (10干+12支) | ★★ |
| BaziJingShenSha | 60 (12神煞×5) | ★★ |
| BaziJingKouJue | ~200 | ★★★ |
| BaziJingLiuQin | ~80 | ★ |
| BaziJingYunShi | ~40 | ★★ |

---

## 四、實作順序建議

### 階段一（最小可行版）
1. 建立 DB 表 + Migration
2. 填充 `BaziJingConfig`（吉凶組合 30 筆）
3. 填充 `BaziJingKouJue`（四柱口訣 + 十排歌）
4. 填充 `BaziJingCaiGuan`（財官論斷）
5. 新增端點 `analyze-bazijing`（Admin Only）
6. 前端 disk 頁新增「八字真經」選項（僅 isAdmin 顯示）

### 階段二
7. 填充 `BaziJingShenSha`（12 神煞）
8. 填充 `BaziJingXiang`（地支象補充）
9. 補充 Ch.8 六親論斷

### 階段三
10. 大運/流年批斷整合 `BaziJingYunShi`
11. 命書品質調整

---

## 五、討論點

1. **Ch.5 干支象法**：天干已有千里版，是否需要再做地支象？還是直接用現有方法？
2. **盲派口訣資料量**：四柱口訣每柱約 20~30 條，總計約 100+ 筆，是否全部建入 DB？
3. **大運流年批斷**：要用全新邏輯（純八字真經方法），還是沿用現有大運框架再加八字真經論斷層？
4. **報告格式**：輸出 DOCX 還是純文字（先做純文字版驗證內容，再包 DOCX）？
