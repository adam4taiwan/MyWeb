---
name: admin-ui-plan
description: 玉洞子管理後台 UI 完整規劃（v0.2 已確認版）
type: project
---

# 玉洞子管理後台 UI 規劃

> 版本：v0.2，2026-04-01（已納入玉洞子確認意見）

---

## 一、整體架構決策

**整合進現有 Next.js**，路由統一在 `/admin/*`，以 `isAdmin` 判斷保護，非 admin 導向 403 頁面。

### 技術選型
- 前端：Next.js 15 App Router，`'use client'`，使用現有 `useAuth()` + `isAdmin`
- 後端：Ecanapi 新增 `AdminController`，所有端點需 `[Authorize]` + isAdmin 驗證
- 表格：Tailwind 自製（不引入額外 UI library）
- 圖表：現有 recharts
- Email 通知：**Resend.com**（免費方案：每月 3,000 封，每日 100 封，費用最低，開發最友善）

---

## 二、頁面路由總覽

```
/admin                          # Dashboard 總覽
/admin/members                  # 會員列表
/admin/members/[id]             # 會員詳情
/admin/subscriptions            # 訂閱管理（展期/手動開通）
/admin/orders                   # 付款紀錄（ECPay + 線下）
/admin/fortune-books            # 命書紀錄
/admin/fortune-books/[id]       # 單筆命書內容
/admin/bookings                 # 預約管理（問事/視訊）
/admin/bookings/[id]            # 預約詳情
/admin/blessings                # 祈福服務管理
/admin/blessings/[id]           # 祈福詳情
/admin/line-push                # LINE 推播管理
/admin/courses                  # 課程管理（預留 Phase 3）
/admin/system                   # 系統維護（備份/健康）
```

---

## 三、各模組詳細功能

### 3.1 Dashboard `/admin`

**核心指標卡片（4張）：**
- 有效訂閱人數（BRONZE / SILVER / GOLD 分色顯示）
- 本月新訂閱 / 本月即將到期（7天內）
- 本月收入（ECPay 付款總額）
- 待處理事項：祈福待付款數 + 預約待確認數

**圖表（recharts）：**
- 訂閱人數趨勢（近 12 個月折線圖）
- 收入趨勢（近 12 個月長條圖）
- 命書類型分布（圓餅圖：八字/大運/流年）

---

### 3.2 會員管理 `/admin/members`

**列表頁：**
- 搜尋：姓名 / Email / 電話
- 篩選：訂閱狀態（有效/到期/未訂閱）、卡別（BRONZE/SILVER/GOLD）
- 欄位：姓名、Email、卡別、訂閱到期日、LINE 綁定、生辰資料有無、最後登入

**詳情頁 `/admin/members/[id]`：**
- 基本資料（名稱、Email、電話、地址）
- 生辰資料（年月日時、性別）
- **訂閱狀態卡片：**
  - 目前卡別 + 到期日
  - 已繳總金額（所有歷史訂閱加總）
  - 未使用配額估算價值（剩餘配額 × 單項定價，僅供參考）
  - 訂閱歷史列表
- **配額使用狀況：**
  - BOOK_BAZI：已用/總量
  - BOOK_DAIYUN：已用/總量
  - BOOK_LIUNIAN：已用/總量
  - CONSULT_VIDEO：已用/總量
- 命書紀錄（此會員所有命書）
- 預約紀錄
- 付款紀錄
- LINE 綁定狀態 + NotifyEnabled
- **操作按鈕：**
  - 手動新增訂閱（線下收款）
  - 展期（延長到期日）
  - 補發配額
  - 寄密碼重設 Email
  - 停用帳號

---

### 3.3 訂閱管理 `/admin/subscriptions`

**列表頁：**
- 篩選：狀態（active/expired/cancelled）、卡別
- 欄位：會員名稱、卡別、開始日、到期日、PaymentRef、狀態
- 即將到期（7天內）標橙色
- 今日到期標紅色

**操作：**
- 展期（手動延長 ExpiryDate，記錄 AdminActionLogs）
- 退款標記（Status 改 cancelled + 備註）
- 手動新增訂閱（線下收款流程）

---

### 3.4 付款紀錄 `/admin/orders`

- 來源：ECPay 交易紀錄 + 線下手動記錄
- 欄位：日期、會員、金額、類型（訂閱/祈福/其他）、付款方式、PaymentRef、狀態
- 篩選：日期範圍、類型、狀態
- 匯出 CSV（月結、報稅用）

---

### 3.5 命書紀錄 `/admin/fortune-books`

> 需新增 `FortuneBookLogs` 資料表（見第五節）
> 確認：命書全文存伺服器，防客戶遺失或下載失敗

**列表頁：**
- 欄位：會員、命書類型、建立時間、配額消耗
- 篩選：類型（bazi/daiyun/liunian/yudongzi）、日期範圍、會員

**詳情頁 `/admin/fortune-books/[id]`：**
- 完整命書輸出（markdown 渲染）
- 輸入參數（生辰、分析年份等）
- Admin 備註欄（命理師可補充意見）
- 重新下載 DOCX 按鈕（Admin 可代客戶補發）

---

### 3.6 預約管理 `/admin/bookings`

**流程：** 客人填表 → 收到通知 → Admin 確認時間 → 寄確認 Email + 視訊連結 → 完成後標記

**視訊平台選擇（專家建議）：**

| 平台 | 費用 | 建議 |
|------|------|------|
| Google Meet | 免費（Google 帳號） | **建議使用**，玉洞子已在用，免費無限時 |
| LINE 視訊 | 免費 | 一對一可用，但不支援錄影存檔 |
| Zoom 免費版 | 免費 40 分鐘限制 | 不建議，有時間限制 |

**結論：Google Meet 為主，LINE 視訊為輔（客人沒 Google 時）**

**費用處理：** 預約問事費用**獨立另付**（ECPay 或 LINE Pay），不扣訂閱配額。

**列表頁：**
- 欄位：會員、預約類型（問事/視訊）、希望時間、狀態
- 狀態：待確認 / 已確認 / 已完成 / 已取消

**詳情頁：**
- 會員資料 + 生辰資料
- 客人填寫的問題說明
- **操作：**
  - 確認預約 → 填入視訊連結（Google Meet URL）→ 寄確認 Email 給客人
  - 取消並退還費用（ECPay 退款備註）
  - 完成標記 + 命理師筆記

---

### 3.7 祈福服務管理 `/admin/blessings`

**確認流程：**
```
客人填表申請
  → 系統寄通知 Email 給 Admin
  → Admin 後台確認，寄付款通知給客人（金額 + ECPay 連結）
  → 客人完成付款
  → ECPay Webhook 通知收款成功 → 狀態改 paid
  → Admin 辦理祈福（安排日期）
  → 完成後標記 + 寄完成通知給客人
```

**費用：獨立另付，與訂閱無關**

**狀態流程：**
`pending_payment` → `paid` → `in_progress` → `completed`

**列表頁：**
- 欄位：姓名、祈福類型、申請日、付款狀態、辦理狀態
- 待付款橙色 / 已付款待辦綠色

**詳情頁：**
- 申請人資料 + 農曆生辰（安太歲用）
- 祈福類型 + 說明
- **操作：**
  - 寄付款通知（帶 ECPay 連結）
  - 標記已付款（線下收款）
  - 安排辦理日期
  - 標記完成 + 寄完成通知
  - 列印祈福名單 PDF

**需新增：**
- `BlessingOrders` 資料表（見第五節）
- Ecanapi `/api/Blessing/*` 端點
- 前台 `/blessings` 填表頁

---

### 3.8 LINE 推播管理 `/admin/line-push`

**推播統計：**
- 今日推播人數（成功 / 失敗）
- 歷史推播紀錄列表

**手動推播：**
- 全體訂閱會員
- 指定會員
- 自訂訊息 or 今日開運訊息

**狀況監控：**
- 已開啟通知人數 / 已關閉人數
- 未綁定 LINE 的訂閱會員列表（提醒引導去綁定）

---

### 3.9 課程管理 `/admin/courses`（預留 Phase 3）

**視訊課程平台建議（專家意見）：**

| 方案 | 費用 | 適合情況 |
|------|------|---------|
| YouTube 未公開連結 | **免費** | 錄播課程，最省錢，學員有連結才能看 |
| Google Drive 影片 | **免費**（15GB）| 小量錄播，超過需付費 |
| Vimeo 免費版 | 免費（5GB） | 較專業的播放體驗 |
| 自架影片（Fly.io Volume） | 依容量付費 | 完全自控，但需要較多技術 |

**建議起步方案：**
- **錄播優先**：先用 YouTube 未公開連結，學員付款後發連結，零成本上線
- **未來升級**：流量大後再考慮自架或 Vimeo Pro

**Phase 3 功能：**
- 課程列表（名稱、售價、狀態、報名人數）
- 報名管理（誰報了哪堂課）
- 課程資料（影片連結、講義 PDF 上傳）
- 新增/編輯課程
- 學員通知（開課提醒 Email）

---

### 3.10 系統維護 `/admin/system`（Phase 3）

**DB 健康狀態：**
- 各資料表筆數
- Gemini API 月用量監控

**資料備份（費用最低方案）：**

| 方案 | 費用 | 建議 |
|------|------|------|
| Fly.io Volume | 已包含（3GB 免費） | **建議主備份**，最省 |
| Backblaze B2 | $0.006/GB/月 | 最便宜的異地備份，每月幾元台幣 |
| Google Drive | 15GB 免費 | 用 `rclone` 同步，零成本 |

**建議策略：**
- 主備份：Fly.io Volume（每日 `pg_dump`，保留 7 天）
- 異地備份：Google Drive（每週一份，保留 4 週，用 rclone 工具）
- 月備份：Google Drive（保留 12 個月）
- 備份成功/失敗 → 寄 Email 給 admin

**設定管理：**
- LINE Bot 通知全局開關
- ECPay Enabled/Disabled 狀態顯示
- 各命書定價顯示（未來可視化調整）

---

## 四、Email 通知系統規劃

### 推薦：Resend.com

**為何選 Resend：**
- 免費方案：每月 3,000 封、每日 100 封（足夠初期用）
- 使用自訂網域 `@yudongzi.tw`（提升信任度）
- API 極簡單（一個 HTTP 請求即可發送）
- 支援 HTML 範本

**需要 Email 的場景：**

| 場景 | 觸發時機 | 收件者 |
|------|---------|--------|
| 歡迎信 | 新會員註冊 | 會員 |
| 訂閱確認 | ECPay 付款成功 | 會員 |
| 訂閱到期提醒 | 到期前 14 天 / 7 天 | 會員 |
| 祈福申請通知 | 客人填表後 | Admin |
| 祈福付款通知 | Admin 確認後 | 會員 |
| 祈福完成通知 | Admin 標記完成 | 會員 |
| 預約確認 | Admin 確認預約 | 會員 |
| 視訊連結通知 | Admin 填入連結 | 會員 |
| 備份結果通知 | 每日備份後 | Admin |
| 密碼重設 | 會員申請 | 會員 |

**實作方式：** Ecanapi 新增 `EmailService`（呼叫 Resend API），統一管理所有 Email 發送。

---

## 五、需新增的資料表

### 5.1 FortuneBookLogs（命書紀錄）

```sql
CREATE TABLE "FortuneBookLogs" (
    "Id"          SERIAL PRIMARY KEY,
    "UserId"      TEXT NOT NULL,
    "BookType"    VARCHAR(20) NOT NULL,   -- bazi / daiyun / liunian / yudongzi
    "InputJson"   TEXT NOT NULL,          -- 輸入參數（生辰等）
    "OutputText"  TEXT,                   -- 命書全文（存伺服器防遺失）
    "PointsCost"  INT NOT NULL DEFAULT 0,
    "AdminNote"   TEXT,
    "CreatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON "FortuneBookLogs"("UserId");
CREATE INDEX ON "FortuneBookLogs"("CreatedAt" DESC);
```

### 5.2 BlessingOrders（祈福服務）

```sql
CREATE TABLE "BlessingOrders" (
    "Id"            SERIAL PRIMARY KEY,
    "UserId"        TEXT,                  -- 已登入會員（可為 null，未登入也可申請）
    "BlessingType"  VARCHAR(30) NOT NULL,  -- antaisui / light / wealth / prayer
    "Name"          VARCHAR(50) NOT NULL,  -- 祈福對象姓名
    "LunarBirth"    VARCHAR(30),           -- 農曆生辰
    "ContactEmail"  VARCHAR(100),          -- 聯絡 Email
    "ContactPhone"  VARCHAR(20),
    "Note"          TEXT,                  -- 客人說明
    "Amount"        INT NOT NULL DEFAULT 0, -- 應付金額
    "PaymentRef"    VARCHAR(100),          -- ECPay 交易單號
    "Status"        VARCHAR(30) NOT NULL DEFAULT 'pending_payment',
    -- pending_payment / paid / in_progress / completed / cancelled
    "ScheduledAt"   TIMESTAMPTZ,           -- 預排辦理日期
    "CompletedAt"   TIMESTAMPTZ,
    "AdminNote"     TEXT,
    "CreatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 5.3 AdminActionLogs（操作審計）

```sql
CREATE TABLE "AdminActionLogs" (
    "Id"         SERIAL PRIMARY KEY,
    "AdminId"    TEXT NOT NULL,
    "Action"     VARCHAR(50) NOT NULL,
    -- extend_subscription / add_quota / manual_subscription
    -- cancel_subscription / disable_member / complete_blessing...
    "TargetType" VARCHAR(30),
    "TargetId"   TEXT,
    "Detail"     JSONB,                    -- 操作細節（前後值）
    "CreatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 5.4 PaymentRecords（統一付款記錄）

```sql
-- 整合訂閱付款 + 祈福付款 + 未來其他付款
CREATE TABLE "PaymentRecords" (
    "Id"            SERIAL PRIMARY KEY,
    "UserId"        TEXT,
    "PaymentType"   VARCHAR(30) NOT NULL, -- subscription / blessing / booking / course
    "TargetId"      TEXT,                 -- 對應的 UserSubscription.Id 或 BlessingOrder.Id
    "Amount"        INT NOT NULL,
    "PaymentMethod" VARCHAR(20),          -- ecpay / manual / line_pay
    "PaymentRef"    VARCHAR(100),
    "Status"        VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending / paid / refunded / failed
    "PaidAt"        TIMESTAMPTZ,
    "CreatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 5.5 Courses + CourseEnrollments（預留）

```sql
CREATE TABLE "Courses" (
    "Id"           SERIAL PRIMARY KEY,
    "Title"        TEXT NOT NULL,
    "Description"  TEXT,
    "Price"        INT NOT NULL DEFAULT 0,
    "MaxStudents"  INT,
    "VideoUrl"     TEXT,                   -- YouTube / Vimeo 連結
    "MaterialUrl"  TEXT,                   -- 講義 PDF 連結
    "StartAt"      TIMESTAMPTZ,
    "Status"       VARCHAR(20) DEFAULT 'draft',
    "CreatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "CourseEnrollments" (
    "Id"         SERIAL PRIMARY KEY,
    "CourseId"   INT NOT NULL,
    "UserId"     TEXT NOT NULL,
    "PaymentRef" VARCHAR(100),
    "Status"     VARCHAR(20) DEFAULT 'enrolled',
    "CreatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 六、Ecanapi 新增 API 端點清單

### Phase 1（AdminController）

```
GET  /api/Admin/dashboard            # 總覽指標
GET  /api/Admin/members              # 會員列表（?page=&search=&status=）
GET  /api/Admin/members/{id}         # 會員詳情（含訂閱/配額/命書/付款）
POST /api/Admin/subscriptions        # 手動新增訂閱（線下收款）
PUT  /api/Admin/subscriptions/{id}   # 展期 / 取消
GET  /api/Admin/orders               # 付款紀錄（?page=&from=&to=&type=）
GET  /api/Admin/orders/export-csv    # CSV 匯出
POST /api/Admin/members/{id}/quota   # 補發配額
PUT  /api/Admin/members/{id}/status  # 停用/啟用帳號
```

### Phase 2（擴充）

```
GET  /api/Admin/fortune-books        # 命書列表
GET  /api/Admin/fortune-books/{id}   # 命書詳情
PUT  /api/Admin/fortune-books/{id}   # 更新 AdminNote

GET  /api/Admin/bookings             # 預約列表
GET  /api/Admin/bookings/{id}        # 預約詳情
PUT  /api/Admin/bookings/{id}        # 確認/取消/完成

GET  /api/Admin/blessings            # 祈福列表
GET  /api/Admin/blessings/{id}       # 祈福詳情
PUT  /api/Admin/blessings/{id}       # 更新狀態
POST /api/Admin/blessings/{id}/notify # 寄付款通知 Email

GET  /api/Admin/line-push/stats      # 推播統計
POST /api/Admin/line-push/send       # 手動推播
```

---

## 七、實作分期

### Phase 1：核心後台 MVP（約 2 週）

**目標：** Admin 可以管理會員與訂閱，看到收入狀況

1. Ecanapi：AdminController（Phase 1 端點）
2. MyWeb：`/admin` layout + 權限保護
3. MyWeb：Dashboard（4 個指標卡片）
4. MyWeb：`/admin/members`（列表 + 搜尋篩選）
5. MyWeb：`/admin/members/[id]`（詳情 + 訂閱/配額）
6. MyWeb：`/admin/subscriptions`（列表 + 手動開通 + 展期）
7. MyWeb：`/admin/orders`（列表 + CSV 匯出）

---

### Phase 2：服務管理（約 3 週）

1. Ecanapi：`FortuneBookLogs` 資料表 + 寫入 log
2. MyWeb：`/admin/fortune-books`（命書紀錄 + 詳情）
3. Ecanapi：`BlessingOrders` 資料表 + API
4. MyWeb：`/blessings`（前台填表頁）
5. MyWeb：`/admin/blessings`（祈福管理）
6. MyWeb：`/admin/bookings`（預約管理）
7. Ecanapi：Email Service（Resend）+ 各場景 Email 範本
8. MyWeb：`/admin/line-push`（推播管理）

---

### Phase 3：進階功能（未定）

1. 課程管理（YouTube 錄播方案）
2. 系統維護（pg_dump + Google Drive 備份）
3. Dashboard 完整圖表
4. 到期提醒自動 Email（排程）

---

## 八、商業邏輯規範（最終確認版）

### 未使用配額
- 不退款（標準 SaaS 慣例）
- 後台顯示「配額剩餘估算價值」供 Admin 參考

### 祈福費用
- 獨立另付，不扣訂閱配額
- 費用由 Admin 決定後通知客人付款

### 預約問事費用
- 獨立另付
- 視訊平台：Google Meet（免費）為主，LINE 視訊為備

### 備份費用
- 主備份：Fly.io Volume（已包含，免費）
- 異地備份：Google Drive（rclone，免費 15GB）

### 命書隱私保護
- 命書全文存 `FortuneBookLogs.OutputText`
- 只有 Admin 和命書所有人可以查看
- API 端需驗證 userId 或 isAdmin

---

## 九、技術備忘

- Resend.com 免費方案足夠初期（3000 封/月），超過再升級 $20/月
- 發信人地址：info@yudongzi.tw（已申請固定）
- `pg_dump` 備份用 Ecanapi BackgroundService + `Process.Start`
- rclone 同步 Google Drive：`rclone copy /backups gdrive:yudongzi-backup`
- `AdminActionLogs` 的 `Detail` 用 JSONB 存前後值，方便稽核
- 所有 Admin API 需加 `[Authorize]` + isAdmin 驗證，避免越權
