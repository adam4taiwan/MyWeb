# 命書名稱對照表（正式版）

## 四份主要命書（UI 可選）

| 溝通代號 | UI 顯示名稱 | DB reportType | 函數名稱 | API 端點 | 備註 |
|---------|------------|---------------|---------|---------|------|
| 玉洞子八字紫微命書 | 玉洞子八字紫微命書 | bazi-ziwei | LfBuildYudongziReportV2 | analyze-yudongzi | 主力命書，12章 |
| 大運命書 | 大運命書 | daiyun | DyBuildReport_V3 | analyze-daiyun | 聚焦大運 |
| 流年命書 | 流年命書 | liunian | LnBuildReport | analyze-liunian | 聚焦流年 |
| 八字真經命書 | 八字真經命書（管理員專用）| bazijing | LfBuildBaZiJingReport | analyze-bazijing | Admin only，11章 |

## 其他命書

| 溝通代號 | 說明 | DB reportType | 函數名稱 | API 端點 |
|---------|------|---------------|---------|---------|
| 玉洞子命書 | Admin 後台下載的 玉洞子命書.docx，非 UI 上4選項之一 | yudongzi | LfBuildYudongziReportV2 | analyze-yudongzi |
| 終身命書 | Legacy，2026/3 前舊系統，現無 UI 入口，admin/reports 仍可查歷史記錄 | lifelong | LfBuildReport | analyze-lifelong |

## 重要說明

- 玉洞子八字紫微命書 vs 玉洞子命書：函數相同（LfBuildYudongziReportV2），但 reportType 不同（bazi-ziwei vs yudongzi），入口不同
- 以後溝通一律用「溝通代號」欄的名稱，不用 DB 欄位名稱
- 八字真經命書 和 玉洞子命書 均為管理員專用

## 其他功能頁（非命書）

- 玉洞子傳家寶典 = 命盤頁的傳家寶典區塊（非獨立命書）
- 八字科學計量分析 = jiliang 頁面（/disk/jiliang），管理員限定
