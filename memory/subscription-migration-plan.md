---
name: 訂閱制改造計劃（移除點數系統）
description: 將點數系統全面改為三檔年訂閱制，通過 ECPay 審核，待實作
type: project
---

# 訂閱制改造計劃

## 背景
ECPay 非信用卡收款審核不通過，原因：網站有「點數」字眼涉及虛擬儲值。
解法：改為純訂閱制，移除所有點數概念。

## 新訂閱規格（已確認）

| 服務 | BRONZE NT$1,000 | SILVER NT$2,000 | GOLD NT$3,000 |
|------|:-:|:-:|:-:|
| 八字命書 | 1 次/年 | 1 次/年 | 1 次/年 |
| 流年命書 | — | 1 次/年 | 1 次/年 |
| 大運命書 | — | — | 1 次/年 |
| 每日運勢 | 無限 | 無限 | 無限 |

- 未訂閱：只能看九星、命理文章，命書全擋，導向訂閱頁
- 週期：年訂閱，從訂閱日起滿一年重置（靠 UserSubscriptions.ExpiryDate 判斷）
- 問事（主題命書）：暫不在訂閱方案內，先從 UI 移除

---

## 待改動清單

### 1. SQL 腳本 (Ecanapi/sql/20260329_UpdateSubscriptionModel.sql)
- UPDATE MembershipPlans 價格：BRONZE→1000, SILVER→2000, GOLD→3000
- UPDATE Description
- DELETE FROM MembershipPlanBenefits（清除舊設計）
- 重新 INSERT 新 benefits：
  - BRONZE: BOOK_BAZI quota=1, DAILY_FORTUNE access=true
  - SILVER: BOOK_BAZI quota=1, BOOK_LIUNIAN quota=1, DAILY_FORTUNE access=true
  - GOLD: BOOK_BAZI quota=1, BOOK_LIUNIAN quota=1, BOOK_DAIYUN quota=1, DAILY_FORTUNE access=true

### 2. ConsultationController.cs
新增 helper method（加在 GetSubscriptionDiscountRate 旁邊）：
```csharp
private async Task<(bool ok, string error)> CheckAndClaimQuota(string userId, string productCode)
{
    var now = DateTime.UtcNow;
    var sub = await _context.UserSubscriptions
        .Where(s => s.UserId == userId && s.Status == "active" && s.ExpiryDate > now)
        .OrderByDescending(s => s.ExpiryDate)
        .Include(s => s.Plan).ThenInclude(p => p.Benefits)
        .FirstOrDefaultAsync();
    if (sub == null) return (false, "請先訂閱方案後使用此服務");
    var benefit = sub.Plan.Benefits.FirstOrDefault(b => b.BenefitType == "quota" && b.ProductCode == productCode);
    if (benefit == null) return (false, "您的訂閱方案不包含此服務，請升級方案");
    int quota = int.TryParse(benefit.BenefitValue, out var q) ? q : 0;
    int used = await _context.UserSubscriptionClaims.CountAsync(c =>
        c.UserId == userId && c.SubscriptionId == sub.Id && c.ProductCode == productCode);
    if (used >= quota) return (false, $"本訂閱週期此服務已使用完畢（{used}/{quota} 次）");
    _context.UserSubscriptionClaims.Add(new UserSubscriptionClaim {
        UserId = userId, SubscriptionId = sub.Id, ProductCode = productCode,
        ClaimYear = now.Year, ClaimedAt = now
    });
    return (true, "");
}
```

**各端點改動（移除點數check+deduct，改用 CheckAndClaimQuota）：**

| 端點 | 位置 | 產品碼 | 現有 check 行 | 現有 deduct 行 |
|------|------|--------|-------------|--------------|
| POST analyze | ~52-73 + 106 | BOOK_BAZI / BOOK_LIUNIAN / BOOK_DAIYUN（依 type） | 73 | 106 |
| GET analyze-kb | 344 | BOOK_BAZI | 363-364 | 731 |
| GET analyze-lifelong | 1471 | BOOK_BAZI | 1491-1492 | 1616 |
| GET analyze-daiyun | 2244 | BOOK_DAIYUN | 2264-2265 | 2427 |
| GET analyze-liunian | 6745 | BOOK_LIUNIAN | 6770-6771 | 6952 |
| GET analyze-topic | 7551 | 暫保留點數（UI 移除） | 7575 | 7647 |

return Ok 中的 `remainingPoints = user.Points` 也要移除。

### 3. disk/page.tsx

**移除：**
- `remainingPoints` state (line 61)
- `syncPoints` function (line 166-179)
- `subscriptionDiscount` state + useEffect (line 185-208)
- `getEffectiveCost` function (line 210-213)
- `renderCostBadge` function (line 215-226)
- `paymentSuccess` state + useEffect (line 228-236)
- `purchaseLoading` state (line 72)
- `handlePurchase` function (line 686-712)
- REPORT_TYPES 的 cost 欄位
- FORTUNE_DURATIONS 的 cost 欄位
- 問事 option（不在訂閱方案內）
- handleAnalysis 的點數 check (line 334-337)
- handleAnalysis 後設定 remainingPoints (line 404)
- handleExpertReport 的點數 check (line 579)
- 購買卡片 UI (line 921-925)
- 餘額顯示 (line 764-767)

**新增：**
- `subscriptionStatus` state：`{ isSubscribed, planCode, quotaStatus: {BOOK_BAZI:{used,total}, BOOK_LIUNIAN:{used,total}, BOOK_DAIYUN:{used,total}} }`
- useEffect: 載入時 fetch `/api/Subscription/status` 解析 quota
- helper: `canUseService(productCode)` → 'available' | 'used' | 'locked' | 'no_subscription'
- handleAnalysis 改為先 check `canUseService`，locked/no_subscription 導向 `/subscribe`
- 服務選擇 UI：各命書旁顯示 badge（可用/已使用/升級解鎖）
- 無訂閱時顯示 "訂閱解鎖此服務" 提示

### 4. member/page.tsx

**移除：**
- 'points' 從 Tab type 移除 (line 9)
- `points`, `pointHistory` state (line 84-85)
- `fetchPoints` function (line 119-134)
- points useEffect (line 137-138)
- payment=success 導向 points tab (line 150-163)
- `handlePurchasePoints` function (line 329-348)
- 頁首點數餘額顯示 (line 405-411)
- 「點數管理」Tab 整個 content (line 807-882)

**更新：**
- 訂閱 Tab 顯示每個服務的剩餘次數（從 quotaStatus 取得）

### 5. subscribe/page.tsx

更新 PLAN_META 價格：
- BRONZE: 1000（原 1200）
- SILVER: 2000（原 1800）
- GOLD: 3000（原 2500）
移除 `pointsValue` 欄位

### 6. PricingSection.tsx

移除「方案含點數」/ 「點數市值」卡片區塊（line 122-134）
更新方案價格（同上）

---

## 部署順序
1. SQL 腳本先在本地 PostgreSQL 執行，確認 OK
2. Ecanapi 本地測試：各端點訂閱驗證正確
3. MyWeb 本地測試：UI 正常顯示
4. 兩個 repo 同時 push + deploy
5. SQL 腳本在 NeonDB 執行
