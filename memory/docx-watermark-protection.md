# DOCX 浮水印 + 唯讀保護 規格記錄

實作日期：2026-05-23
Commit：dea5e5d（Ecanapi main）

---

## 功能說明

### 1. 玉洞子印浮水印

**觸發位置：** `ConsultationController.cs` → `LfBuildYudongziDocxBytes` 末尾

**做法：**
- NPOI 生成 DOCX bytes 後，呼叫 `LfAddWatermarkToDocxBytes()` 用 DocumentFormat.OpenXml 後處理
- 在頁首（Header）插入 VML Shape 文字浮水印

**規格：**
- 來源：`wwwroot/images/玉洞子印.png`（圓形印章圖片，黑框紅字）
- 效果：Word「Washout 淡出」— `gain="19999"` + `blacklevel="22938f"`
- 定位：絕對定位，水平/垂直居中
- 尺寸：8cm × 8cm
- VML type：`#_x0000_t75`（圖片型）

**頁面範圍：**
- 封面頁（第一頁）：**無浮水印**（啟用 `TitlePage` + 空白首頁頁首）
- 第一章起所有頁：**有浮水印**
- 最後一頁玉洞子印圖章仍保留，浮水印在圖章後面

**適用範圍：**
- 目前：所有經 `export-generic-docx` 端點生成的 DOCX（含流年、大運、八字等）
- 管理員下載的草稿 DOCX 也有浮水印（Word 編輯時會保留 Header，不影響編輯）

---

### 2. 唯讀密碼保護

**觸發位置：** `ReportsController.cs` → `DownloadApproved` 端點

**做法：**
- 用戶下載時，系統對 DOCX bytes 加入 Word documentProtection
- 呼叫 `AddReadOnlyProtection()` 後處理，不修改 DB 中儲存的 bytes

**規格：**
- 保護模式：`readOnly`，`enforcement=1`
- 演算法：SHA-512（cryptAlgorithmSid=14）
- 參數：隨機 Salt 16 bytes，SpinCount=100,000 次迭代
- 符合 OOXML ECMA-376 §B.7 標準

**密碼：** `Adam520508`
- 設定位置：Ecanapi `appsettings.json` → `Report:ProtectionPassword`
- 若未設定則使用預設值 `Adam520508`

**管理員解鎖方式（Word）：**
1. 開啟 DOCX
2. 校閱（Review）> 限制編輯（Restrict Editing）
3. 點「停止保護（Stop Protection）」
4. 輸入密碼 `Adam520508`

**注意：**
- 管理員從 `admin/{id}/download-draft-docx` 下載的草稿**不加保護**（只有浮水印）
- 只有用戶從 `download-approved?token=...` 下載的才加保護

---

## 相關程式碼

| 方法 | 檔案 | 說明 |
|------|------|------|
| `LfAddWatermarkToDocxBytes` | ConsultationController.cs | DOCX 後處理加浮水印 |
| `LfBuildYudongziDocxBytes` | ConsultationController.cs | 呼叫浮水印方法 |
| `AddReadOnlyProtection` | ReportsController.cs | DOCX 後處理加唯讀保護 |
| `DownloadApproved` | ReportsController.cs | 用戶下載時呼叫保護方法 |

---

## 未來擴展

- 浮水印已套用至所有命書（共用 `LfBuildYudongziDocxBytes`）
- 若要對特定命書關閉浮水印，可在 `LfAddWatermarkToDocxBytes` 加入 `bookTitle` 判斷
- 若要更換密碼，修改 Ecanapi `appsettings.json` 的 `Report:ProtectionPassword` 並 redeploy
