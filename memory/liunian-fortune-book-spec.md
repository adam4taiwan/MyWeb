---
name: 流年命書規格文件
description: 流年命書新功能完整規格，五術合一（八字/太歲/生肖/盲派/紫微四化），含逐月分析+月曆卡片
type: project
---

# 流年命書（analyze-liunian）規格文件

## 上線日期
2026-03-20 上線（持續優化中）

## 功能概述

以指定年份（當年或未來年份）為範圍，產出完整流年分析報告。
整合**五術精華**：八字流年喜忌、命宮守宮太歲、生肖十二太歲、盲派串宮壓運、流年紫微四化。
加上**春夏秋冬四季**論斷與**逐月分析**（月建喜忌 + 流月四化），共六章報告。

---

## API 規格

**端點**：`GET /api/Consultation/analyze-liunian?year={year}`

- `year` = 當年或未來年份（不可早於本年，後端驗證）
- 需 JWT 認證
- 每年消耗 **100 點**
- 不修改任何現有方法，完全獨立實作（前綴 `Ln*`）

**回傳結構**：
```json
{
  "result": "完整報告文字（同八字命書格式，供 renderReport 渲染）",
  "annualSummary": {
    "year": 2026,
    "stemBranch": "丙午",
    "currentDaiyun": "甲子",
    "daiyunAge": "35-44",
    "baziScore": 72,
    "ziweiScore": 68,
    "taisuiRelation": "沖太歲",
    "crossClass": "吉",
    "bestMonths": [3, 7, 11],
    "cautionMonths": [2, 8]
  },
  "monthlyForecasts": [
    {
      "month": 1,
      "stemBranch": "戊寅",
      "season": "冬末/春初",
      "flowStar": "祿存入財帛宮",
      "baziHint": "天干戊土生扶日主，月令地支寅木剋日主",
      "ziweiPalace": "財帛宮：武曲化祿，財運旺",
      "crossClass": "吉",
      "tip": "適合投資理財，月初把握機會"
    }
  ],
  "remainingPoints": 250
}
```

---

## 報告六章結構

### 第一章：命主資料 + 流年概況
- 姓名、性別、出生日期、八字四柱
- 流年天干地支（例：2026 丙午年）
- 當前大運天干地支 + 年齡段（保留大運脈絡）
- 流年整體評分 + 一句話定調

### 第二章：八字流年分析
- 流年天干（五行/十神）喜忌評分 + 解說
- 流年地支（五行/十神）喜忌評分 + 刑沖合害分析
- 大運 + 流年互動：大運天干 vs 流年天干、大運地支 vs 流年地支
- 歲運並臨之影響論斷

### 第三章：民間五術加成（核心特色）

#### 3.1 流年歲君（命宮起算）
- 以命宮地支起算十二歲君，流年地支對應第幾位歲君
- 顯示歲君名稱/別名/吉凶/建議
- 輸出格式：`逢 第 N 位歲君：【名稱（別名）】`

#### 3.1b 小限歲君
- 虛歲起算，男順女逆，命宮第1歲
- 步數 = (虛歲-1) % 12，計算小限落宮
- 輸出格式：`虛歲 N 歲，小限落在：X宮  小限第 N 位歲君：【名稱（別名）】`

#### 3.2 生肖十二歲君
- 生肖（年支）起算，看外在環境對命主的衝擊
- 判定生肖 vs 流年太歲地支關係（守/沖/刑/害/破/合/平）
- 輸出：`歲君：【N.名稱（別名）】` + `安太歲：建議安制` (需要時)

#### 3.3 流星壓運（盲派串宮）
- 流年地支起太歲，依地支順序排列12神
  - 神序：太歲/青龍/喪門/六合/官符/小耗/大耗/朱雀/白虎/貴神/吊客/病符
- 天干通地支查各柱對應神：甲→寅, 乙→卯, 丙→巳, 丁→午, 戊→戌, 己→丑, 庚→申, 辛→酉, 壬→亥, 癸→子
- 四柱對應季節：年柱=春, 月柱=夏, 日柱=秋, 時柱=冬；大運=全年根基
- 各柱天干通地支，查其落在第幾神，輸出影響

#### 3.4 流年紫微四化
- 依流年天干取四化星（化祿/化權/化科/化忌）
- 逐一分析四化飛入哪個命盤宮位
- 各宮化入影響（例：化祿入財帛 → 財運大旺）
- 化忌飛入宮位須特別提醒

### 第四章：春夏秋冬四季論斷
每季格式：
```
【春季】寅月(2月)~辰月(4月)（木旺）  評分：八字N·紫微N·綜合【吉/凶】
  八字面向：季節木旺，與用神X相輔/忌神得勢
  本季佳月：一月、三月（有時省略）
  本季謹慎：二月（有時省略）
```
（無流月星曜彙總，已移除）

四季定義（以節氣為準）：
- 春：寅月（2月）、卯月（3月）、辰月（4月）
- 夏：巳月（5月）、午月（6月）、未月（7月）
- 秋：申月（8月）、酉月（9月）、戌月（10月）
- 冬：亥月（11月）、子月（12月）、丑月（1月）

### 第五章：逐月分析（12個月）
每月一段，格式：
```
【一月】庚寅（春季）  綜合：【吉】  八字N·紫微N
  月建喜忌：天干庚（金·七殺）X忌  地支寅（木·偏印）○喜用
  月化祿（太陽）入命宮
  月化權（武曲）入兄弟宮
  月化科（太陰）入夫妻宮
  月化忌（天同）入夫妻宮
  本月提示：...
```

**流月四化計算規則（2026-03-21 修正）：**
- 月干：以五虎遁（年干起月法）決定，`LnGetMonthStemBranch(yearStem, monthIdx)` 已正確實作
  - 例：丙/辛年 → 正月庚寅, 二月辛卯, ...
- 月支 = 流月命宮（寅=命宮起，逆時針標宮）
- 宮位對應：`offset = (月支索引 - 星所在宮支索引 + 12) % 12` → 命宮/兄弟宮/夫妻宮/.../父母宮
- 顯示全部4個四化（化祿/化權/化科/化忌）+ 完整星名（縮寫展開）
- 無流月星曜（已移除）

### 第六章：趨吉避凶全年建議
- 最佳季節 + 最佳月份（Top 3）
- 需謹慎季節 + 需謹慎月份（Top 2）
- 全年核心行動建議（事業/感情/財運/健康各一條）
- 化忌方向（針對流年化忌或沖太歲的化解建議）

---

## 交叉評分矩陣（沿用大運命書）

| 八字\紫微 | 吉 | 平 | 凶 |
|-----------|----|----|-----|
| 喜        | 大吉 | 吉 | 平 |
| 平        | 吉  | 平 | 小凶 |
| 忌        | 平  | 小凶 | 大凶 |

八字評分門檻：80+ = 喜、50-79 = 平、<50 = 忌
紫微評分門檻：75+ = 吉、45-74 = 平、<45 = 凶

---

## 新增 Helper 方法（Ln* 系列）

### LnValidateYear(int year) → bool
驗證年份不早於當年（伺服器時間），回傳 false 則 400 Bad Request

### LnGetFlowYearStemBranch(int year) → (string stem, string branch)
六十甲子取流年天干地支

### LnGetCurrentDaiyun(UserBirthInfo birth, int year) → DaiyunInfo
取得指定流年時的大運天干地支及年齡段

### LnCalcTaisuiRelation(string shengXiao, string flowBranch) → TaisuiRelation
生肖 vs 流年地支，回傳：守/沖/刑/害/破/合/平 + 吉凶等級

### LnCalcMingGongGuard(string flowBranch, string mingGongBranch) → MingGongGuardResult
判定流年地支是否入命宮，及太歲位置對命宮的影響距離

### LnCalcBlindSectChain(string flowBranch, yStem, yBranch, mStem, mBranch, dStem, dBranch, hStem, hBranch, daiyunStem, daiyunBranch) → string
盲派流星壓運：以流年地支起太歲排12神，天干通地支查各柱（年=春/月=夏/日=秋/時=冬/大運=根基）對應神煞
- 靜態欄位：BlindSect12Names/BlindSect12Luck/BlindSect12Desc/BlindSectStemToBranch

### LnGetFlowYearSiHua(string flowStem, Dictionary<string, ZiweiPalace> palaces) → SiHuaResult[]
流年天干四化，逐一取四化星並飛入對應宮位

### LnGetMonthStemBranch(int year, int month) → (string stem, string branch)
月建計算（陽曆約略固定日期靜態對照表，無需精確天文計算）

### LnGetMonthFlowStar(int year, int month, string flowYearStem) → string
流月星曜（依流年天干起流月，逐月追蹤主星進駐宮位）

### LnCalcSeasonAnalysis(string season, string yongShen, string jiShen, Dictionary palaces) → SeasonResult
四季分析：季節五行 vs 喜忌用神 + 紫微宮位當季重點

### LnBuildReport(命主資料, 流年資料, 五術結果, 四季結果, 月份清單) → string
整合六章報告文字（同八字命書格式，供 renderReport 渲染）

---

## 前端調整（disk/page.tsx）

### 新增 Package 選項
```typescript
// 流年命書：動態產生當年及未來5年
const currentYear = new Date().getFullYear();
const liunianPackages = Array.from({ length: 6 }, (_, i) => ({
  id: `liunian-${currentYear + i}`,
  label: `流年命書 ${currentYear + i}年`,
  points: 100,
  year: currentYear + i,
  type: 'liunian'
}));
```

### 年份選擇 UI
- 下拉選單顯示：「2026年 流年命書 — 消耗 100 點」
- 選擇後顯示確認提示：「確認扣除 100 點，分析 {year} 年流年命書？」
- 灰色標示過去年份（disabled）

### 計費說明顯示（重要）
在選單旁顯示：
```
流年命書計費說明：每選擇一個年份消耗 100 點
目前餘額：XXX 點
```

### API 呼叫
```typescript
const response = await fetch(
  `${API_BASE}/api/Consultation/analyze-liunian?year=${selectedYear}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const data = await response.json();
// data.result → renderReport()
// data.monthlyForecasts → 月曆卡片
// data.annualSummary → 年度摘要卡
```

### 月曆卡片 UI（新增）
報告文字下方追加 12 月卡片網格：

```tsx
{/* 月曆卡片區 */}
<div className="mt-8">
  <h3 className="text-amber-400 text-lg font-semibold mb-4">流年逐月速覽</h3>
  <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
    {monthlyForecasts.map((m) => (
      <div key={m.month} className={`
        rounded-lg p-3 border
        ${m.crossClass === '大吉' || m.crossClass === '吉'
          ? 'border-amber-500 bg-amber-900/20'
          : m.crossClass === '大凶' || m.crossClass === '小凶'
          ? 'border-red-700 bg-red-900/20'
          : 'border-gray-600 bg-gray-800/30'}
      `}>
        <div className="text-amber-300 font-bold text-sm">{m.month}月</div>
        <div className="text-gray-400 text-xs">{m.stemBranch} · {m.season}</div>
        <div className="text-gray-300 text-xs mt-1">{m.flowStar}</div>
        <div className={`text-xs font-semibold mt-2 ${
          m.crossClass.includes('吉') ? 'text-amber-400'
          : m.crossClass.includes('凶') ? 'text-red-400'
          : 'text-gray-400'
        }`}>{m.crossClass}</div>
        <div className="text-gray-300 text-xs mt-1 leading-tight">{m.tip}</div>
      </div>
    ))}
  </div>
</div>
```

---

## 涉及檔案

- `Ecanapi/Controllers/ConsultationController.cs` - 新增 `AnalyzeLiunian` endpoint + `Ln*` helpers
- `MyWeb/app/disk/page.tsx` - 新增流年命書 package 選項 + 年份下拉 + 月曆卡片 + 計費說明

---

## 注意事項

- 不修改 `AnalyzeDaiyun`、`AnalyzeLifelong` 或任何現有方法
- 紫微資料來源：`UserBirthInfo`（同現有流程），無資料則紫微評分預設 50
- 月建以**陽曆約略固定日期**計算（非精確天文計算），靜態對照表如下：
  - 寅月：2/4、卯月：3/6、辰月：4/5、巳月：5/6、午月：6/6
  - 未月：7/7、申月：8/7、酉月：9/8、戌月：10/8、亥月：11/7
  - 子月：12/7、丑月：1/6
- 流年命書與八字命書、大運命書共用 `renderReport()` + `generateDOC()` 渲染，無需額外改動
- 年份驗證：後端 + 前端雙重驗證，不可選過去年份
- 若使用者點數不足，前端提前攔截，不送出 API 請求
