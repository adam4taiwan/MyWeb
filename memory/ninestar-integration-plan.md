# 九星氣學整合計劃

## 知識庫現狀（D:\命理知識庫\AI\九星\）

### 已有檔案與評估

| 檔案 | 內容 | 可用程度 | 備註 |
|---|---|---|---|
| 玄空九星推算秘法.docx | 本命星計算公式、年飛星表 | 直接可用 | 核心算法來源 |
| 九星算法1.txt | 年飛星、日飛星、時飛星詩訣與說明 | 直接可用 | 含日星逆順計算說明 |
| 九星概要.docx | 九星屬性、雙星組合斷事81條、凶星化解 | 直接可用 | 需從玄空風水語境轉換成個人運勢語境 |
| 玄空九星吉凶组合三十三则.docx | 山星向星33則組合 | 參考用 | 偏風水格局，個人運勢參考價值有限 |
| 九星与三元九运.docx | 九星歷史淵源、三元九運說明 | 參考用 | 適合作為部落格文章素材 |
| 九星氣學建議.docx | AI生成的簡報大綱與名人範例 | 參考用 | 無直接可用規則文字 |

### 本命星計算公式（已確認）

```
男 1999年前：10 - (出生年尾兩位數字相加，超過10再加一次) = 本命星號
男 2000年後：9 - (出生年尾兩位數字相加) = 本命星號
女 1999年前：(出生年尾兩位數字相加) - 4 = 本命星號
女 2000年後：(出生年尾兩位數字相加) - 3 = 本命星號
結果為0時 = 9，超過9取與9的差
```

注意：立春（約2月4日）前出生者，年份減一計算。

舊 Python 程式使用簡化公式：`(10 - (year - 1900) % 9)`，效果相同。

---

## 舊 Python LineBot 原始碼分析

### 技術架構
- Flask + LINE Bot SDK v2（已過時，現行版為 v3）
- MySQL 資料庫（儲存 user_id、性別、生日、出生時辰）
- Gemini API 生成所有運勢文字（個性、今日、本月、年度、人際、事業、健康）
- Flex Message 雙語顯示（中文＋英文翻譯）

### 功能選單（8項）
1. 個性特質
2. 年度運勢
3. 人際關係
4. 事業財運
5. 健康養生
6. 今日運勢
7. 本月運勢
8. 我的設定

### 舊版缺點（需改善）
- 全依賴 Gemini API 生成文字，每次回應都要等待且費用高
- 月星、日星計算為簡化版（實際用流年星代替，不夠精確）
- MySQL 資料庫需獨立維護，與 Ecanapi PostgreSQL 不統一
- SDK 版本已過時（linebot v2 → 需升級至 v3）
- 翻譯功能（中英）增加 API 呼叫次數，可考慮移除

---

## 專家評估：現有資料是否足夠？

### 已足夠的部分
- 本命星計算公式（男女×年份）完整
- 九星五行屬性（顏色、卦象、方位）完整
- 雙星組合斷事（81條）有完整基礎，需改寫語境

### 仍缺少的關鍵資料

**第一優先：九星個性特質（9顆星各一篇）**
每顆星約300-500字，內容涵蓋：
- 性格優點、缺點
- 適合職業方向
- 感情特質
- 開運建議（方位、顏色、數字）

目前舊Bot靠Gemini即時生成，沒有固定文字。
**這是最重要的缺口，決定服務品質。**

**第二優先：今日/本月飛星通俗建議（81組合）**
本命星（1-9）× 流星（1-9）= 81條每日建議
每條約100-150字，包含：
- 今日宜忌
- 幸運方位、顏色
- 一句核心提醒

**第三優先：年度流星×本命星影響（9條/年）**
每年流年星不同，9顆本命星各自的年度影響。
目前完全缺少，低優先可後補。

---

## 新版整合架構（C# Ecanapi）

### 與舊 Python 版的差異

| 項目 | 舊版（Python）| 新版（Ecanapi）|
|---|---|---|
| 語言/框架 | Python Flask | C# ASP.NET Core |
| 資料庫 | MySQL（獨立） | PostgreSQL（NeonDB，與現有系統共用）|
| 運勢內容 | 全靠 Gemini 即時生成 | KB 規則庫為主，Gemini 為備援 |
| 本命星計算 | Python 函式 | C# 方法（NsCal* 前綴）|
| 雙語顯示 | 中英（Gemini 翻譯）| 純繁體中文 |
| 用戶資料 | 獨立 MySQL | 整合至現有 Users 資料表 |

### 新端點規劃（前綴 Ns）
```
GET /api/NineStar/natal?birthYear=1963&gender=M    → 計算本命星
GET /api/NineStar/daily                             → 今日九星每日建議（需登入）
GET /api/NineStar/year?year=2026                   → 流年九星資訊
POST /api/NineStar/register                        → LINE Bot 用戶登記生辰
```

### 資料表規劃
```
NineStarTraits (Id, StarNumber, StarName, Description, LuckyDirection, LuckyColor, LuckyNumber)
NineStarDailyRules (Id, NatalStar, FlowStar, FortuneText, Auspicious, Avoid, Direction, Color)
LineUsers (Id, LineUserId, BirthYear, BirthMonth, BirthDay, Gender, NatalStar, CreatedAt)
```

---

## 商業策略

### 免費 vs 付費設計
| 功能 | LINE Bot（免費）| 會員（登入）| 訂閱（付費）|
|---|---|---|---|
| 本命星查詢 | 免費 | 免費 | 免費 |
| 今日通用九星建議 | 免費每日推播 | 免費 | 免費 |
| 個人化八字×九星交叉 | 無 | 有 | 有 |
| 月/年運深度分析 | 無 | 無 | 有 |
| 流年命書（含九星章節）| 無 | 點數購買 | 折扣購買 |

### 導流漏斗
```
LINE Bot（免費每日九星）
    → 「想看個人化版本？加入玉洞子會員」
    → 網頁會員（個人化八字×九星）
    → 訂閱方案（月報、命書折扣）
```

---

## 開發優先順序

### Phase 1：計算引擎（可馬上開始）
Ecanapi 新增 NineStarController，實作本命星計算、流年星計算

### Phase 2：KB 資料建立（需補充資料）
建立 NineStarTraits、NineStarDailyRules 資料表，填入九星特質文字

### Phase 3：網頁整合
member 頁面新增「九星運勢」Tab

### Phase 4：LINE Bot
升級舊 Bot 架構（SDK v3），Webhook 指向 Ecanapi

### Phase 5：流年命書加值
流年命書新增「九星加成」章節

---

## LINE Bot Channel 資訊（待確認）
- 舊 Bot 名稱：神機妙算BOT
- LINE Developers Console 已有 Channel
- 需確認：Channel Access Token、Webhook URL 目前狀態
- 對話記錄參考：D:\命理知識庫\AI\AI算命師.txt
