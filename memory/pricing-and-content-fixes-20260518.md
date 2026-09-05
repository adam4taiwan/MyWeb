# 2026-05-18 命書精簡 + 定價全面更新

## 八字紫微命書三項精簡（LfBuildYudongziReportV2）

1. **居家風水**：移除「先天住宅原型（四柱天干地支類象）」整段（年/月/日/時柱 ×8 行）
2. **紫微十二宮 Ch.7**：`▶ 星情特質` 由全文截取首句（IndexOf('。')），刪後續長段
3. **六親論斷 Ch.5**：`seenPoetry = new HashSet<string>()` 跨柱去重，▍天干/▍地支相同文字只顯示一次

## 定價結構全面更新

| 方案 | 舊價 | 新價 |
|------|------|------|
| BRONZE 銅 | 2,500 | 3,600 |
| SILVER 銀 | 3,000 | 4,800 |
| GOLD 金 | 3,600 | 6,000 |
| VIP | 6,000 | 8,000 |

- **SQL**: `sql/20260518_UpdateBronzePrice.sql` + `sql/20260518_UpdateSilverGoldVipPrice.sql`（已手動執行 NeonDB）
- **PricingSection.tsx**: `planPrices = [3600, 4800, 6000]`
- **subscribe/page.tsx**: VIP 顯示 8,000；方案價值 10,000+；PayPal 8000TWD

## 多國語言同步修正

- **vipPrice** zh-TW/EN/JA 三語言：6,000 → 8,000
- **JA 方案命書名**：「八字命書」→「玉洞子八字紫微命書」（銅/銀/金全部）
- **EN/JA vipFeatures**：舊版（折扣/祈福）→ 現行 zh-TW 內容（傳家寶典/8大運/流年命書/17章/九星）
