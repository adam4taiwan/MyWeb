---
name: LINE 九星開運推播設定
description: LINE Bot 每日九星開運指南推播架構、收件條件、維護方式
type: project
---

# LINE 九星開運推播設定

## 架構概覽

```
每日 07:30 (台灣時間)
    ↓
LineBotDailyPushService (Ecanapi BackgroundService)
    ↓
1. 查詢收件人：MyWeb 有效訂閱 + LINE 已綁定 + 有出生年月日 + NotifyEnabled 未關閉
    ↓
2. 以每位會員的 BirthYear/Month/Day/Gender 計算本命星
    ↓
3. NsBuildDailyFortune(natalStar) — 查 NineStarDailyRules DB 取今日文字
    ↓
4. POST api.line.me/v2/bot/message/push
   (to: LineUserId, messages: [{type: "text", text: 九星開運指南}])
```

## 收件條件（四個條件全部成立才會推播）

| 條件 | 說明 |
|------|------|
| MyWeb 有效訂閱 | `UserSubscriptions.Status == "active"` 且未過期 |
| LINE 已綁定 | `AspNetUsers.LineUserId != null`（需用 LINE 帳號登入過 MyWeb）|
| 有出生年月日 | `BirthYear / BirthMonth / BirthDay` 皆不為 null |
| 通知未關閉 | `LineUsers.NotifyEnabled != false`（預設開啟，會員可在「訂閱方案」Tab 關閉）|

## 推播內容

- 格式：`【MM/dd 九星開運】\n本命：XXX\n流年：XXX 流月：XXX 流日：XXX\n\n運勢文字\n\n宜：...\n忌：...\n吉方位：...\n幸運色：...`
- 本命星：依會員在 MyWeb 登記的出生年月日性別計算（立春前出生用前一年）
- 每日流日星：依當日日期計算，同一天所有人的流日星相同，各人本命星不同

## Fly.io Secrets（Ecanapi）

| Secret | 說明 |
|--------|------|
| `LineBot:ChannelAccessToken` | LINE Messaging API Channel Access Token |

## 會員端設定（member/page.tsx 訂閱方案 Tab）

- 已綁 LINE：顯示推播開關（toggle）
- 未綁 LINE：引導步驟（加 @213qrysy → 填生辰 → 用 LINE 登入）
- 開關 API：`PUT /api/NineStar/notify { enabled: true/false }`

## 踩坑紀錄（2026-04-01 ~ 04-05）

### 問題：4/2 起停止推播
- 原因：4/1 08:05 的「simplify LINE Bot」commit 刪除了 Block 1（九星全員推播）
- Block 1 原本推播給所有 LineUsers（含未訂閱者），4/1 08:05 後才刪除
- 4/1 07:30 推播在刪除前執行，所以 4/1 還有收到

### 修復（2026-04-05）
- 改為：查 MyWeb 有效訂閱會員 + 用 MyWeb 出生日計算本命星 + 推播九星指南
- 不再依賴 LineUsers.NatalStar（那是舊 LINE Bot 內登記的，現已廢棄）

## 相關檔案

- `Ecanapi/Services/LineBotDailyPushService.cs` — 主服務
- `Ecanapi/Controllers/NineStarController.cs` — `NsBuildDailyFortune()` / `NsCalcNatalStarStatic()`
- `MyWeb/app/member/page.tsx` — 會員端推播開關 UI
