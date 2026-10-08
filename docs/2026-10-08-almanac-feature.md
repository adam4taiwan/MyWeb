# 2026-10-08 工作紀錄：每日農民曆功能

## 背景

評估是否能將 goodaytw.com 的農民曆（宜忌、吉時）資料整合至 yudongzi.tw。
最終採用 **lunar-javascript（MIT 授權）**開源套件自行計算，無版權疑慮。

---

## 完成項目

### 1. 評估 lunar-javascript 套件
- 安裝 `lunar-javascript` npm 套件
- 驗證資料與 goodaytw.com 比對：宜忌、沖煞、神位方向完全吻合
- 發現輸出為簡體字 → 建立 Simplified→Traditional 字元轉換 Map 解決
- 時辰吉凶標籤算法略有不同（黃道/黑道 binary），但宜忌內容正確

### 2. 後端 API（Next.js Route Handler）

**`GET /api/almanac?date=YYYY-MM-DD`**
- 省略 date 自動使用台灣今日（UTC+8）
- 回傳：農曆干支、節氣、宜/忌、沖煞、喜/財/福/貴神方位、彭祖百忌、12時辰詳情
- Cache-Control: s-maxage=3600

**`GET /api/almanac/month?year=YYYY&month=MM`**
- 回傳整月每日摘要（農曆日、節氣、吉/凶、宜忌前3項）
- 含 firstDayOfWeek 供前端排列月曆格線

### 3. 前端頁面

**`/[locale]/almanac`**
- 日詳情 / 月曆視圖 tab 切換
- URL 狀態保留：`?view=day&date=` / `?view=month`

**日詳情視圖：**
- 前後一天導覽、「回到今日」快捷
- 農曆資訊卡（年月日干支、節氣）
- 宜/忌 tag 雙欄
- 神位方向（喜/財/福/貴神）+ 沖煞
- 彭祖百忌
- 12時辰表（黃道=金色背景、天神/宜忌/沖煞）

**月曆視圖：**
- 上/下月導覽、「回到本月」
- 每格：日期、農曆日（月初顯示農曆月份）、節氣 badge、宜事第一項
- 右上角圓點：黃道=金色、黑道=灰色
- 今日 amber ring 框標示
- 點擊日期 → 切換日詳情視圖

### 4. Header 導覽連結
- 加入「問事預約」下拉選單（有分隔線區隔，amber 色醒目）
- 三語言：繁中「每日農民曆」/ EN「Daily Almanac」/ 日「毎日農民暦」
- 行動版選單同步加入

### 5. TypeScript 型別宣告
- 新增 `types/lunar-javascript.d.ts`

---

## 相關檔案

| 檔案 | 說明 |
|------|------|
| `app/api/almanac/route.ts` | 單日 API |
| `app/api/almanac/month/route.ts` | 整月 API |
| `app/[locale]/almanac/page.tsx` | 農民曆完整頁面 |
| `types/lunar-javascript.d.ts` | TypeScript 宣告 |
| `components/Header.tsx` | 下拉選單加連結 |
| `messages/zh-TW.json` | 繁中翻譯 |
| `messages/en.json` | 英文翻譯 |
| `messages/ja.json` | 日文翻譯 |

---

## Git Commits

```
45c6d472 feat: add monthly calendar view to almanac page
10c984a0 feat: add almanac link to header dropdown menu
55f01452 feat: add daily almanac page with lunar-javascript
```

---

## 未來可延伸

- 首頁今日農民曆摘要卡（引流到 /almanac）
- Footer 加農民曆連結（SEO）
- 農民曆與命盤分析結合（擇日功能）
