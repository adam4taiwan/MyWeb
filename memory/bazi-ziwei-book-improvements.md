---
name: 八字紫微命書 品質改善進度
updated: 2026-05-11
---

# 八字紫微命書（analyze-bazi-ziwei）品質改善記錄

## 已完成（2026-05-11）

### Ch.5 後新增【生肖分析】（劉威吾四柱論）
- 詳細規格：[zodiac-shengxiao-analysis.md](zodiac-shengxiao-analysis.md)
- **位置**：六親論斷（Ch.5）之後，性格志向（Ch.6）之前
- **資料來源**：劉威吾三本 docx（子丑辰酉 / 卯巳戌申 / 寅午未亥）
- **四個子區塊**：年柱（Ch4）/ 月柱（Ch5）/ 日柱（Ch6）/ 時柱（Ch7）生肖論
- **LfNaYin 架構重構**：改為回傳 `(string nayin, string zodiac)` tuple
  - `nayin`（Ch1/2/3 純納音理論）→ Ch3 【納音論斷】
  - `zodiac`（Ch4/5/6/7 劉威吾生肖四柱論）→ Ch5 後【生肖分析】
- **Ch5 月份 offset bug 已修正**：ch5 dict 用子=正月，八字月支用寅=正月，offset = -2
- **6 筆缺失 nayinCh7 已補入**（commit d170f96）

## 已完成（2026-05-06）

### Ch.5 六親論斷補強
- **父母宮補充**：月柱後新增 父親（偏財）/ 母親（印星）喜忌論斷
  - 修正 `fuYiElem` 未定義的編譯錯誤（改為只比對 `yongShenElem`）
- **子女宮補充**：時柱後新增子女緣分析
  - 男命：掃描食神/傷官位置 → 喜忌論斷
  - 女命：掃描正官/七殺位置 → 喜忌論斷
  - 食傷/官殺不顯時給「子女緣薄」提示

### 紫微 Ch.11 修正
- `官祿宮` header 改為 `事業宮`（與 `BzDisplayPalace` mapping 一致）

### Ch.1 新增（傳家寶典 Ch.2 同步）
- 根苗花果四柱表：六神/天干/地支/藏神/納音/旺相（橫排 5 欄）
- 天干十神表：10 干對應十神
- 地支藏神十神表：12 支藏神，命局地支標 ★

### Ch.2 末尾新增（傳家寶典 Ch.3 精選）
- 日柱深度論斷：核心 / 神殺特質 / 內在特質 / 事業傾向 / 天生弱點
- 依 `BaziDayPillarReadings` 資料表（60 甲子日柱）

### Ch.3 末尾新增（傳家寶典 Ch.3 其餘）
- 月令影響（依月支季節篩選）
- 男/女命論斷（依性別顯示）
- 十干象法（`LfShiGanXiangFa`，日干 × 月支）

### 實作細節（重要）
- `LfBuildReport` 新增兩個選用參數（加在最後）：
  ```csharp
  string yNaYin = "", string mNaYin = "", string dNaYin = "", string hNaYin = "",
  BaziDayPillarReading? kb = null
  ```
- `GetBaziZiweiAnalysis` 呼叫點新增：
  ```csharp
  var bzDayKb = await _context.BaziDayPillarReadings.FirstOrDefaultAsync(r => r.DayPillar == dStem + dBranch);
  string bzYNaYin = LfPillarNaYin(yearP); ...
  ```
- `GetLifelongAnalysis`（analyze-lifelong）呼叫點**不傳** kb/nayin，沿用原有章節不受影響

---

## 未完成 / 待研究

### 命書整體品質（由 DOCX 樣本分析）
- [ ] **Ch.6 性格志向**：目前 `LfPersonalityDesc` 已擴充為 3 段，但可再加入傳家寶典
  的「特殊時辰」（`kb.SpecialHours`）作為補充
- [ ] **Ch.7 事業財運**：已加入格局天賦描述；可再比對紫微事業宮加強
- [ ] **Ch.8 婚姻感情**：`LfMarriageDesc` 已擴充為 4 段，可再加入 `kb.MaleChart/FemaleChart`
  的感情部份（目前全文加入 Ch.3，但感情面向可再 Ch.8 補充）
- [ ] **Ch.10 一生命運總評**：已加入目前行運分析；可再加入人生最佳/最低潮時期統計
- [ ] **傳家寶典其他章節同步至八字命書**：
  - 空亡論斷（`LfKongWang`）→ 八字命書目前無此段
  - ~~納音論斷（`LfNaYin`）~~ → 已加入（2026-05-06）
  - 四柱神煞（`LfShenSha`）→ 八字命書目前無此段
  - 天乙貴人方向（已加入大運命書/流年命書，八字命書 Ch.1 已有）
- [ ] **生肖分析移植至傳家寶典（analyze-yudongzi）**：已有骨架（Ch5後已插入），資料來源相同，可直接複用（詳見 zodiac-shengxiao-analysis.md）
- [ ] **生肖分析移植至大運/流年命書**：流年逢X年的生肖論可對應 Ch5 月柱/流年地支

### Ziwei 紫微 Ch.11 品質
- [ ] 空宮宮位空行問題（過濾後只剩標題，無內容）
- [ ] 部分宮位「在三方四正中：」dangling header 待清除

### 前端 DOCX 匯出
- [ ] 八字紫微命書 DOCX 新增章節的分頁控制（傳家寶典三表格適合單頁呈現）
