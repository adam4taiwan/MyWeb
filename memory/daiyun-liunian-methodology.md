---
name: 大運流年分析方法論
description: 大運/流年五大判斷核心方法、重用模組、C# 方法規劃
type: methodology
created: 2026-04-30
---

# 大運流年分析方法論

> 此方法論適用於：八字命書大運章、流年命書逐年章、傳家寶典行運一覽
> 所有方法均設計為可重用 static method，命名前綴 `LfDy*`（大運）、`LfLn*`（流年）、`LfRun*`（通用）

---

## 一、整體架構

```
輸入：
  四柱干支 (yStem/yBranch / mStem/mBranch / dStem/dBranch / hStem/hBranch)
  用神/忌神元素 (yongShenElem / jiShenElem)
  日柱旬空 dayEmpty[] (由 LfKongWang 算出)
  大運干支 (dyStems / dyBranches / dyAges)
  流年干支 (lyYear / lyStem / lyBranch)

輸出：每步大運 / 每個流年的分析文字
```

---

## 二、五大判斷模組（大運與流年共用）

### 模組 A：地支六關係引動（最核心）

**地支六關係對照表：**

| 關係 | 組合 | 說明 |
|---|---|---|
| 六合 | 子丑、寅亥、卯戌、辰酉、巳申、午未 | 合化，力量轉換 |
| 三合 | 申子辰(水)、寅午戌(火)、巳酉丑(金)、亥卯未(木) | 三合局，力量最強 |
| 三會 | 亥子丑(北水)、寅卯辰(東木)、巳午未(南火)、申酉戌(西金) | 方局，力量次之 |
| 六沖 | 子午、丑未、寅申、卯酉、辰戌、巳亥 | 沖破，破壞結構 |
| 三刑 | 寅巳申、丑戌未、子卯（無禮）、辰辰/午午/酉酉/亥亥（自刑） | 刑傷，內部摩擦 |
| 六害 | 子未、丑午、寅巳、卯辰、申亥、酉戌 | 害破，暗損 |

---

#### 四種引動情境

##### 情境一：基本 1v1 引動（最常見）
**條件：** 八字中任1地支 ↔ 大運1地支，或 大運1地支 ↔ 流年1地支
**包含：** 六合、六沖、六害、三刑（任一對）、干克/干合（天干）

```
for each baziBranch in [年支,月支,日支,時支]:
    if LiuHe(runBranch, baziBranch) → 情境一合
    if LiuChong(runBranch, baziBranch) → 情境一沖
    if LiuHai(runBranch, baziBranch) → 情境一害
    if SanXing(runBranch, baziBranch) → 情境一刑
```

**輸出重點：** 引動地支的十神、宮位、喜忌加成

---

##### 情境二：原有關係加入/解開（八字內部已有關係）
**條件：** 八字內部兩地支已有刑/沖/害/合，大運第三地支介入

**兩種效果：**

A. **解開（拆合/沖散）：** 大運地支沖開或合走原有關係的一方
```
例：日支=子、時支=丑 → 子丑原合
    大運=午 → 午沖子 → 子被拉離，子丑合解開
    論斷：「原有{干支}合局被破，{宮位}關係生變，{情境}出現變化」
```

B. **加入戰局（擴大衝突）：** 大運地支加入原有關係，形成更複雜局面
```
例：日支=寅、月支=巳 → 寅巳已有刑
    大運=申 → 寅巳申三刑成局
    論斷：「原有{寅巳}刑再加申字，三刑大戰，{宮位}{宮位}俱受衝擊」
```

**需要預先計算：** 八字內部現有關係表（startupConflicts）

---

##### 情境三：三合/三會 2+1 成局（大運湊第三字）
**條件：** 八字四柱中已有三合/三會的任意2字，大運/流年帶入第3字 → 成局

```
SanHe groups: (申子辰/水), (寅午戌/火), (巳酉丑/金), (亥卯未/木)
SanHui groups: (亥子丑/水), (寅卯辰/木), (巳午未/火), (申酉戌/金)

for each group (b1,b2,b3,elem) in SanHe+SanHui:
    baziBranchSet = {年支,月支,日支,時支}
    missing = group - baziBranchSet  // 八字缺少的字
    if |missing| == 1 and runBranch in missing:
        → 三合/三會成局（最強情境）
        → 論斷：成局元素、涵蓋哪些柱位、喜忌效果
```

**最強版：** 若三合/三會的元素 == yongShenElem → 大吉；== jiShenElem → 大凶

---

##### 情境四：跨域三合/三會（八字1字＋大運1字＋流年1字）
**條件：** 八字有1字、大運地支1字、流年地支1字，三者合成三合/三會
**此情境僅在流年分析時觸發（需知道當前大運地支）**

```
for each group (b1,b2,b3,elem) in SanHe+SanHui:
    if b1 in baziBranches and dayunBranch==b2 and liunianBranch==b3:
        → 跨域三合/三會成局
    （六種排列都要檢查）
```

**特別說明：** 此情境代表「命、運、年三元合一」，力量極強，必出大事

---

#### 喜忌加成邏輯（情境一至四通用）
```
被引動/成局地支的藏干主氣元素 vs yongShenElem / jiShenElem：

合/三合/三會成局：
  + 喜神 → 大吉（喜上加喜）
  + 忌神 → 大凶（忌神成局，禍事加重）

沖/刑/害：
  + 喜神 → 吉中有損（喜神受剋，機會中有波折）
  + 忌神 → 凶性減輕（忌神被破，禍事減緩）
```

**凡觸發情境三/四（三合三會成局）→ 必為重大運，標注「★重大運★」**
**凡觸發情境一/二（1v1）→ 標注「重大運」**

---

### 模組 B：神煞影響

**使用已有的 DiZhiShenShaMap + TianGanShenShaMap：**

- 對於每個被引動的四柱地支，查其宮位的神煞（從 LfShenSha 已計算的結果）
- 若該宮位有神煞，則神煞性質也隨運發動：
  - 將星被引動 → 掌權機會出現
  - 驛馬被引動 → 移動變動加強
  - 劫煞被引動 → 破財危機加大
  - 桃花被引動 → 感情婚姻波動
  - 天乙貴人（乙貴）被引動 → 貴人出現
  - 文昌被引動 → 考試文書機會
  - 羊刃被引動 → 刑傷危機
  - 華蓋被引動 → 宗教孤立傾向
  - 孤辰/寡宿被引動 → 孤獨加深

---

### 模組 C：空亡判定

**使用 LfKongWang 的 dayEmpty（日柱旬空）：**

```
if runBranch in dayEmpty:
    標注「空亡運」
    若 runBranch 為喜神 → 吉性減半，空有名義無實效
    若 runBranch 為忌神 → 凶性減半，凶象虛而不實
    論述：「本步（年）行至空亡之地，凡事名存實亡，謀事宜保守，勿輕易大動。」
```

---

### 模組 D：三干三支成局（僅大運、流年各觸發一次）

**條件：八字中已有2個相同天干或地支，大運/流年再出現第3個：**

```
八字四柱天干計數：統計 yStem/mStem/dStem/hStem 各天干出現次數
八字四柱地支計數：統計 yBranch/mBranch/dBranch/hBranch 各地支出現次數

若某天干 count == 2 且 runStem == 該天干:
    → 三干成局，查 DB table "三干" WHERE stem = 該天干
    → 輸出 DB 規則文字（重大象）

若某地支 count == 2 且 runBranch == 該地支:
    → 三支成局，查 DB table "三支" WHERE branch = 該地支
    → 輸出 DB 規則文字（重大象）
```

**DB 查詢方式：**
- 此部分需在呼叫時傳入已查好的三干/三支規則 Dictionary
- 格式：`Dictionary<string, string> sanGanRules` (stem → content)
- 格式：`Dictionary<string, string> sanZhiRules` (branch → content)

---

### 模組 E：大運干支關係判定（僅大運專屬）

**判斷大運天干（dyStem）與大運地支（dyBranch）五行關係：**

| 關係 | 判斷條件 | 效果 |
|---|---|---|
| 同氣（一致/相生） | dyStem元素 == dyBranch主氣元素，或互生 | 十年同向，大吉或大凶十年整體 |
| 干克支 | dyStem元素克 dyBranch主氣元素 | 前5年天干主導較強 |
| 支克干 | dyBranch主氣元素克 dyStem元素 | 後5年地支主導較強 |

**同氣判斷邏輯：**
```csharp
// 同氣：相同元素 或 相互生
bool isSameQi = (dyStemElem == dyBranchElem) ||
                (LfElemGen[dyStemElem] == dyBranchElem) ||
                (LfElemGen[dyBranchElem] == dyStemElem);
// 干克支
bool stemKillsBranch = LfElemOvercome[dyStemElem] == dyBranchElem;
// 支克干
bool branchKillsStem = LfElemOvercome[dyBranchElem] == dyStemElem;
```

**輸出範例：**
- 同氣：「天干{dyStem}{十神} 與地支{dyBranch}{十神} 五行同氣，整段十年{吉/凶}象一致，{喜/忌神}力量貫串全程。」
- 干克支：「天干力道壓制地支，前五年（{startAge}-{startAge+4}歲）{dyStem十神}事件較明顯。」
- 支克干：「地支力道反制天干，後五年（{startAge+5}-{startAge+9}歲）{dyBranch十神}事件較明顯。」

---

## 三、流年專屬規則

**流年與大運差別：**
| 面向 | 大運 | 流年 |
|---|---|---|
| 天干主軸 | 十年整體格局定性 | **以流年干為十神，定當年吉凶事件類型** |
| 地支主軸 | 引動、關係、神煞、空亡 | 同樣引動、關係、神煞、空亡 |
| 三干三支 | 觸發時影響10年 | 觸發時影響當年 |
| 空亡效果 | 「空亡運，十年虛浮」 | 「空亡年，當年謀事易落空」 |

**流年天干十神事件對照（論當年主要事件類型）：**
| 十神 | 代表事件 |
|---|---|
| 比肩 | 競爭、破財、兄弟同業 |
| 劫財 | 破財損失、合夥糾紛、朋友之患 |
| 食神 | 才藝發揮、飲食豐足、子女喜事 |
| 傷官 | 換工作、官非口舌、創業突破 |
| 偏財 | 偏財機會、父親緣份、投資機遇 |
| 正財 | 穩定財源、正職收入、婚配（男） |
| 七殺 | 壓力考驗、小人官非、挑戰來臨 |
| 正官 | 升遷機會、正式職位、婚配（女） |
| 偏印 | 學習進修、宗教、孤獨思慮 |
| 正印 | 貴人資助、文書資格、長輩護持 |

---

## 四、完整輸出格式（含逐條驗證標注）

> 原則：每一條論斷都必須明確標示「哪個運字」→「哪種關係」→「四柱哪宮哪字」
> → 空亡/神煞/十神 → 白話說明。讓命理師可逐條審核驗證。

### 大運單步格式

```
【{startAge}-{endAge}歲｜{dyStem}{dyBranch} 大運】

▌一、天干論斷
  運（{dyStem}）為{dyStemSS}，{干支同氣/干克支/支克干}
  → {前5年/後5年/整體}主導，{一句白話說明}

▌二、地支引動逐條分析
  ┌─ 運（{dyBranch}）{關係} 四柱{柱位}宮（{baziBranch}）
  │   十神：{branchSS}　宮位：{宮位說明}
  │   空亡：{有空亡→"(空亡)力量減半" / 無→"無"}
  │   神煞：{有→"(神煞名)引動" / 無→"無"}
  │   白話：{一句白話論斷，說明此引動對命主的實際影響}
  └─ [情境二] 原有{A}{B}已{原關係}，運（{dyBranch}）介入
      → 效果：{解開/擴大戰局}，{白話說明}

  ┌─ 運（{dyBranch}）與{pillar1地支}、{pillar2地支} 湊成 {三合/三會}（{元素}局）★重大運★
  │   涉及柱位：{柱位1}宮（{字}·{十神}）、{柱位2}宮（{字}·{十神}）
  │   空亡：{成局地支是否有空亡}
  │   神煞：{成局地支神煞}
  │   白話：{三合三會成局的實際影響，吉凶明確說明}
  └─

▌三、三干/三支成局（若有）
  八字已有兩個「{X}」，運（{dyStem或dyBranch}）形成第三個
  → {DB規則原文}
  白話：{一句說明}

▌四、空亡總結（若有）
  運（{dyBranch}）落入空亡（{dayEmpty[0]}{dayEmpty[1]}旬空）
  → 此段十年行空亡運，謀事宜保守，{喜/忌神}力量虛而不實

▌五、綜合小結
  {整步大運30-50字結論，不重複上述細節，直接給方向建議}
```

---

### 流年單年格式

```
【{year}年 {lyStem}{lyBranch}（{生肖}年）】

▌一、流年天干
  年干（{lyStem}）為{lyStemSS}，當年主要事件類型：{事件描述}
  白話：{一句說明今年天干帶來的主要機遇或壓力}

▌二、地支引動逐條分析
  ┌─ 年（{lyBranch}）{關係} 四柱{柱位}宮（{baziBranch}）
  │   十神：{branchSS}　宮位：{宮位說明}
  │   空亡：{(空亡)力量減半 / 無}
  │   神煞：{(神煞名)引動 / 無}
  │   白話：{此引動對命主今年的實際影響}
  └─

  ┌─ [情境四] 年（{lyBranch}）+ 運（{dayunBranch}）+ 八字（{baziBranch}）
  │   湊成 {三合/三會}（{元素}局）★跨域重大運★
  │   白話：{命、運、年三元合一，今年必出大事，說明方向}
  └─

▌三、三干/三支成局（若有）
  八字已有兩個「{X}」，年（{lyStem或lyBranch}）形成第三個
  → {DB規則原文}
  白話：{說明}

▌四、空亡
  年（{lyBranch}）落入空亡（旬空{dayEmpty[0]}{dayEmpty[1]}）
  → 今年行空亡，謀事宜保守勿大動，{喜/忌神}論斷

▌五、流年小結
  {今年30字以內方向建議}
```

---

### 輸出規則
1. 每條引動必須包含：**運(字) → 關係 → 柱位(字) → 十神 → 空亡 → 神煞 → 白話**
2. 空亡無則寫「無」，神煞無則寫「無」，不省略欄位
3. 情境三/四（三合三會成局）標注 ★重大運★
4. 情境二（解開/擴大）明確寫原有關係是什麼
5. 白話說明必須具體（避免「需注意」「可能有」等模糊詞）

---

## 五、C# 方法規劃

### 通用方法（大運/流年共用）

```csharp
// A: 查地支四種情境引動
// runBranch     = 大運/流年地支
// dayunBranch   = 當前大運地支（流年分析時傳入，用於情境四；大運分析時傳 ""）
// 回傳：所有觸發的引動結果列表
static List<BranchImpact> LfRunBranchRelations(
    string runBranch,
    string[] pillarBranches,    // [yBranch, mBranch, dBranch, hBranch]
    string[] pillarBranchSS,    // [yBranchSS, mBranchSS, dBranchSS, hBranchSS]
    string yongShenElem, string jiShenElem,
    Dictionary<string, List<(string stem, double ratio)>> branchHiddenRatio,
    string dayunBranch = "");   // 僅流年分析傳入，用於跨域三合三會（情境四）

// B: 查神煞影響（已引動地支的神煞）
static string LfRunShenShaImpact(
    string runBranch,
    List<BranchImpact> impacts,
    Dictionary<string, Dictionary<string, string[]>> diZhiMap,
    string[] pillarBranches);

// C: 空亡判定
static string LfRunKongWangCheck(
    string runBranch, string[] dayEmpty,
    string yongShenElem, string jiShenElem,
    Dictionary<string, List<(string stem, double ratio)>> branchHiddenRatio);

// D: 三干三支成局
static string LfRunSanGanZhi(
    string runStem, string runBranch,
    string[] pillarStems, string[] pillarBranches,
    Dictionary<string, string> sanGanRules,
    Dictionary<string, string> sanZhiRules);

// E: 大運干支關係（僅大運用）
static string LfDyStemBranchRelation(
    string dyStem, string dyStemSS, string dyBranch, string dyBranchSS,
    string dyStemElem, string dyBranchElem,
    int startAge, int endAge);
```

### 輔助資料結構

```csharp
class BranchImpact {
    public string RunBranch;        // 大運/流年地支
    public string TargetBranch;     // 被引動的四柱地支（情境一/二），或成局主支（情境三/四）
    public string RelationType;     // 六合/六沖/六害/三刑/三合/三會
    public string Scenario;         // "1v1"/"解開"/"加入戰局"/"2+1成局"/"跨域成局"
    public string TargetPillar;     // 年/月/日/時（逗號分隔，情境三/四可多柱）
    public string TargetSS;         // 被引動地支十神（情境三/四=成局元素十神）
    public string PalaceName;       // 宮位名稱
    public string FormedElement;    // 三合/三會成局的五行元素（如"水"/"火"）
    public string FavorStatus;      // 喜神/忌神/中性
    public string ImpactLevel;      // ★重大運★（三合三會成局）/ 重大運（1v1）/ 吉/凶
}
```

### 主方法

```csharp
// 大運單步分析
static string LfDyStepAnalysis(
    string dyStem, string dyBranch, int startAge, int endAge,
    string[] pillarStems, string[] pillarBranches,
    string[] pillarStemSS, string[] pillarBranchSS,
    string yongShenElem, string jiShenElem,
    string[] dayEmpty,        // 日柱旬空
    string[] yearEmpty,       // 年柱旬空（日支用）
    Dictionary<string, string> sanGanRules,
    Dictionary<string, string> sanZhiRules);

// 流年單年分析
static string LfLnYearAnalysis(
    string lyStem, string lyBranch, int year, string zodiac,
    string[] pillarStems, string[] pillarBranches,
    string[] pillarStemSS, string[] pillarBranchSS,
    string yongShenElem, string jiShenElem,
    string[] dayEmpty,
    Dictionary<string, string> sanGanRules,
    Dictionary<string, string> sanZhiRules);
```

---

## 六、地支六關係靜態對照表

```csharp
// 六合：branch → 合的地支
LfLiuHe = { "子":"丑","丑":"子","寅":"亥","亥":"寅","卯":"戌","戌":"卯",
             "辰":"酉","酉":"辰","巳":"申","申":"巳","午":"未","未":"午" };

// 六沖：branch → 沖的地支
LfLiuChong = { "子":"午","午":"子","丑":"未","未":"丑","寅":"申","申":"寅",
               "卯":"酉","酉":"卯","辰":"戌","戌":"辰","巳":"亥","亥":"巳" };

// 六害：branch → 害的地支
LfLiuHai = { "子":"未","未":"子","丑":"午","午":"丑","寅":"巳","巳":"寅",
              "卯":"辰","辰":"卯","申":"亥","亥":"申","酉":"戌","戌":"酉" };

// 三合局：branch → (合局元素, 另外兩支)
LfSanHe = {
    "申":("水","子","辰"), "子":("水","申","辰"), "辰":("水","申","子"),
    "寅":("火","午","戌"), "午":("火","寅","戌"), "戌":("火","寅","午"),
    "巳":("金","酉","丑"), "酉":("金","巳","丑"), "丑":("金","巳","酉"),
    "亥":("木","卯","未"), "卯":("木","亥","未"), "未":("木","亥","卯"),
};

// 三會方局：branch → (方局元素, 另外兩支)
LfSanHui = {
    "亥":("水","子","丑"), "子":("水","亥","丑"), "丑":("水","亥","子"),
    "寅":("木","卯","辰"), "卯":("木","寅","辰"), "辰":("木","寅","卯"),
    "巳":("火","午","未"), "午":("火","巳","未"), "未":("火","巳","午"),
    "申":("金","酉","戌"), "酉":("金","申","戌"), "戌":("金","申","酉"),
};

// 三刑：branch → 刑的地支list
LfSanXing = {
    "寅":["巳","申"], "巳":["申","寅"], "申":["寅","巳"],  // 無恩之刑
    "丑":["戌","未"], "戌":["未","丑"], "未":["丑","戌"],  // 持勢之刑
    "子":["卯"],      "卯":["子"],                          // 無禮之刑
    "辰":["辰"],      "午":["午"], "酉":["酉"], "亥":["亥"] // 自刑
};
```

---

## 七、開發順序建議

1. **先建立靜態對照表**（六合/沖/害/三合/三會/三刑）→ `LfRunBranchRelations`
2. **先查 DB 確認三干/三支表結構**
3. **實作 LfRunBranchRelations**（最核心）
4. **實作 LfRunKongWangCheck**（複用 dayEmpty）
5. **實作 LfDyStemBranchRelation**（大運專屬）
6. **實作 LfRunSanGanZhi**（需 DB 查詢）
7. **組裝 LfDyStepAnalysis + LfLnYearAnalysis**
8. **整合至傳家寶典 Ch.10（行運一覽）**
9. **整合至大運命書 / 流年命書**

---

## 八、DB 三干/三支表結構（已確認）

### public."三干"（20筆）
| day | desc |
|---|---|
| 三甲 | 天上貴，孤獨守空房 |
| 三乙 | 多陰私，又要敗祖業 |
| ...（三丙～三癸） | ... |
| 四甲 | 少夫妻 |
| 四乙 | 命早亡 |
| ...（四丙～四癸） | ... |

- `day` = "三" + 天干（3個）或 "四" + 天干（4個）
- 查詢：`WHERE "day" = "三" + runStem` 或 `"四" + runStem`

### public."三支"（12筆）
| day | desc |
|---|---|
| 三子 | 婚事重 |
| 三丑 | 四夫妻 |
| ...（三寅～三亥） | ... |

- `day` = "三" + 地支
- 查詢：`WHERE "day" = "三" + runBranch`

### 查詢條件
```
八字四柱天干中某天干出現 2 次 且 運/年天干相同 → 三干（"三X"）
八字四柱天干中某天干出現 3 次 且 運/年天干相同 → 三干（"四X"，四柱+運年合計4個）
八字四柱地支中某地支出現 2 次 且 運/年地支相同 → 三支（"三X"）
```

## 九、待確認事項

- [ ] 三合/三會 是否需要四柱「湊齊兩支」才算引動（還是只要大運/流年帶一支就算）
- [ ] 大運天干的十神論斷深度（簡短/詳細）
- [ ] 流年天干事件是否需要分男女
