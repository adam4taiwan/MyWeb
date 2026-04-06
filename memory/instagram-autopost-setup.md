---
name: Instagram 自動發文設定與踩坑紀錄
description: IG 自動發文完整架構、Token 取得流程、修復踩坑紀錄、維護方式
type: project
---

# Instagram 自動發文設定

## 架構概覽

```
每日 07:35 (台灣時間)
    ↓
InstagramDailyPostService (Ecanapi BackgroundService)
    ↓
1. BuildCaptionAsync() — 從 NineStarDailyRules DB 取今日九星文字
    ↓
2. BuildImageUrlAsync() — 下載 yudongzi.tw/api/ig-card/{date}.jpg
                       → 上傳到 imgbb CDN
                       → 取得 https://i.ibb.co/xxx.jpg
    ↓
3. POST graph.instagram.com/v21.0/{userId}/media
   (image_url, media_type=IMAGE, caption, access_token)
    ↓
4. POST graph.instagram.com/v21.0/{userId}/media_publish
   (creation_id)
```

## 圖片生成端點（MyWeb）

- 路徑：`/api/ig-card/[filename]`（`app/api/ig-card/[filename]/route.tsx`）
- 格式：`/api/ig-card/2026-04-04.jpg`（支援 `.jpg`、`.png`）
- 輸出：1080x1080 JPEG（sharp PNG→JPEG 轉換，去除 alpha channel）
- 主題：8 種命理主題輪替（依年份第幾天 % 8），或九星版面（傳入 dayStar 參數）
- 字型：Noto Serif TC（從 Google Fonts CDN 載入，失敗則用 serif fallback）

## Fly.io Secrets（Ecanapi）

| Secret | 說明 |
|--------|------|
| `IG_ACCESS_TOKEN` | Instagram Graph API Long-lived Token（60 天有效）|
| `IG_USER_ID` | Instagram 帳號 ID（`25560314056975965`）|
| `IMGBB_API_KEY` | imgbb 圖床 API Key（免費，無到期）|

## Token 更新方式（每 60 天）

1. 前往 Meta Developer Console → 你的 App → Instagram Graph API
2. Generate Access Token，勾選 scopes：
   - `instagram_basic`
   - `instagram_content_publish`
3. 換取 Long-lived Token（有效 60 天）
4. 更新 Fly.io secret：
   ```bash
   fly secrets set IG_ACCESS_TOKEN="新token" --app ecanapi
   ```

## 管理介面（disk 頁面，Admin 限定）

| 按鈕 | 功能 |
|------|------|
| IG 帳號診斷 | 查帳號類型、是否有發文權限、每日配額 |
| IG API 連線測試（小圖+正文） | 用 Wikipedia 小圖測試 API 連線 |
| 立即觸發 Instagram 發文測試（大圖） | 立即發文（用今日動態圖） |

測試端點：`POST /api/NineStar/ig-post-now?testImageUrl={url}`

## 踩坑紀錄（2026-04-04）

### 問題一：PNG RGBA 格式
- `next/og` 的 `ImageResponse` 預設輸出 RGBA PNG（color type 6）
- 修復：用 `sharp` 轉成 JPEG（`.flatten({ background: '#1a1008' }).jpeg()`）

### 問題二：缺少 Content-Length
- 原本 `ImageResponse` 不回傳 `Content-Length`
- 修復：buffer 後 `new Response(buf, { headers: { Content-Length: ... } })`

### 問題三：Vary: rsc header
- Next.js App Router 自動加 `Vary: rsc, next-router-state-tree...`
- 嘗試用 `next.config.ts` headers() 覆蓋 → 無效（兩個 Vary 並存）
- 結論：非根本原因，被 imgbb 解法繞過

### 問題四：graph.facebook.com vs graph.instagram.com
- 改用 `graph.facebook.com/v21.0` → Token 格式不符（190 錯誤）
- 正確用 `graph.instagram.com/v21.0`（Instagram token 只能用這個）

### 問題五（根本原因）：Fly.io 新加坡伺服器被 Instagram CDN 封鎖
- Instagram CDN（美國）無法存取 `myweb.fly.dev`（新加坡）及 `yudongzi.tw`
- 所有 URL 都失敗，錯誤 9004/2207052 "URI does not conform to requirements"
- **修復：Ecanapi 先下載圖片，上傳到 imgbb（美國 CDN），再給 Instagram**

## 帳號狀態確認

- 帳號類型：`MEDIA_CREATOR` ✓
- 發文權限：`hasPublishPermission: true` ✓
- 每日配額：`quota_total: 100`，`quota_duration: 86400`（秒）

## 注意事項

- 每日內文以「流日星」為準，同一天不論發幾次內容相同
- 若同一天既有自動發文又有手動測試，Instagram 上會出現兩篇相同貼文，直接在 App 刪除重複那篇即可
- 確認正常運作後，不需要再手動測試

## 相關檔案

- `Ecanapi/Services/InstagramDailyPostService.cs` — 主服務
- `Ecanapi/Controllers/NineStarController.cs` — `ig-post-now` / `ig-check` 端點
- `MyWeb/app/api/ig-card/route.tsx` — 圖片生成
- `MyWeb/app/api/ig-card/[filename]/route.tsx` — 副檔名路由
