# membership-and-points-system.md

此檔案詳細說明 MyWeb 的會員系統和點數系統的完整業務邏輯和技術實現。

---

## 💎 會員系統設計

### 會員等級定義

```
┌─────────────────────────────────────────────────────┐
│              會員等級與特權對照表                     │
├─────────────────────────────────────────────────────┤
│ 等級     │ 月費    │ 月點額  │ 優惠    │ 主要特權   │
├──────────┼────────┼────────┼────────┼──────────┤
│ 免費     │ 免費   │ 0 點   │ -      │ 基本功能 │
│ 基礎會員 │ NT$ 299 │ 50 點 │ 無    │ 優先排隊 │
│ 進階會員 │ NT$ 699 │ 150 點│ 5% 折扣│ 專屬客服 │
│ VIP 會員 │ NT$1999 │ 500 點│ 20% 折扣│ 優先預約 │
└─────────────────────────────────────────────────────┘
```

### 會員特權詳解

#### 基礎會員 (NT$ 299/月)

```
✓ 每月 50 點贈送
✓ 存檔：可在需要的月份延續未使用的點數（最多 3 個月）
✓ 優先排隊：諮詢排隊優先級別提升
✓ 優先客服：郵件回應時間 < 12 小時
✓ 積分獎勵：每筆消費 5% 積分（可用於下月抵扣）
✓ 專屬討論區：訪問會員專屬討論社區
✓ 月度直播：參加會員專屬月度直播課程
```

#### 進階會員 (NT$ 699/月)

```
✓ 每月 150 點贈送（相當於基礎會員的 3 倍）
✓ 跨月累積：未使用的點數可跨 6 個月累積
✓ 5% 點數折扣：購買點數套餐自動享受 5% 折扣
✓ 優先預約：可提前 14 天預約諮詢
✓ VIP 客服：客服回應時間 < 2 小時，專屬客服經理
✓ 免費「深度分析報告」一份/月：價值 500 點
✓ 增值課程：免費參加進階課程（定期更新）
✓ 邀請返利：邀請朋友成為會員，雙方各得 100 點
```

#### VIP 會員 (NT$ 1,999/月)

```
✓ 每月 500 點贈送（相當於基礎會員的 10 倍）
✓ 無限點數保留：未使用的點數永遠不過期
✓ 20% 點數折扣：所有購買自動享受 20% 折扣
✓ 專屬諮詢師：分配一位專屬諮詢師
✓ 優先預約：可隨時預約（同日內回應）
✓ 白金客服：24/7 即時客服，專屬 VIP 經理
✓ 免費「完整命盤分析」+ 「年度運勢預測」：價值 1500 點
✓ 高級課程：所有課程免費（包括新發佈課程）
✓ 三人團購：組織朋友購買，全部享受 VIP 折扣
✓ 年度專屬活動：邀請參加 VIP 年度論壇和工作坊
```

### 會員計費模式

#### 計費周期

```csharp
public class Membership
{
    public Guid UserId { get; set; }
    public MembershipType Type { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool AutoRenew { get; set; }
    public DateTime? LastBilledAt { get; set; }
    public DateTime? NextBillingDate { get; set; }

    // 計算會員是否有效
    public bool IsActive => DateTime.UtcNow >= StartDate && DateTime.UtcNow <= EndDate;

    // 計算天數剩餘
    public int DaysRemaining => (int)(EndDate - DateTime.UtcNow).TotalDays;

    // 計算退款金額（日均扣費）
    public decimal CalculateRefund()
    {
        var totalDays = (EndDate - StartDate).TotalDays;
        var daysUsed = (DateTime.UtcNow - StartDate).TotalDays;
        var dailyRate = GetMonthlyPrice() / 30; // 簡化計算

        return (decimal)((totalDays - daysUsed) * dailyRate);
    }

    private decimal GetMonthlyPrice() => Type switch
    {
        MembershipType.Basic => 299,
        MembershipType.Advanced => 699,
        MembershipType.VIP => 1999,
        _ => 0
    };
}
```

#### 自動續費邏輯

```csharp
public class AutoRenewalService
{
    public async Task ProcessAutoRenewalsAsync(CancellationToken cancellationToken)
    {
        // 每天執行一次，檢查即將到期的會員
        var expiringMemberships = await _membershipRepository.GetExpiringMembershipsAsync(
            daysUntilExpiry: 3, // 到期前 3 天
            cancellationToken);

        foreach (var membership in expiringMemberships)
        {
            if (!membership.AutoRenew)
                continue;

            try
            {
                // 自動扣費
                var payment = new Payment
                {
                    Id = Guid.NewGuid(),
                    UserId = membership.UserId,
                    Type = PaymentType.MembershipSubscription,
                    Amount = GetMembershipPrice(membership.Type),
                    Currency = "TWD",
                    Method = PaymentMethod.CreditCard, // 存儲的卡片
                    Status = PaymentStatus.Processing,
                    MembershipType = membership.Type,
                    SubscriptionMonths = 1,
                    AutoRenew = true,
                    CreatedAt = DateTime.UtcNow
                };

                // 處理支付
                var result = await ProcessPaymentAsync(payment, cancellationToken);

                if (result.Success)
                {
                    // 延長會員期限
                    membership.EndDate = membership.EndDate.AddMonths(1);
                    membership.LastBilledAt = DateTime.UtcNow;
                    membership.NextBillingDate = membership.EndDate.AddDays(-3);

                    await _membershipRepository.UpdateAsync(membership, cancellationToken);

                    // 發送續費確認郵件
                    await _emailService.SendRenewalConfirmationAsync(membership, cancellationToken);

                    _logger.LogInformation($"Auto-renewal succeeded for user {membership.UserId}");
                }
                else
                {
                    // 自動扣費失敗，通知用戶
                    await _emailService.SendRenewalFailureAsync(membership, cancellationToken);

                    _logger.LogWarning($"Auto-renewal failed for user {membership.UserId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Auto-renewal error for user {membership.UserId}");
            }
        }
    }
}
```

---

## ⭐ 點數系統設計

### 點數套餐定價

```
┌────────────────────────────────────────────┐
│          點數套餐價格表                     │
├────────────────────────────────────────────┤
│ 套餐  │ 點數  │ 價格    │ 單價  │ 優惠   │
├───────┼───────┼────────┼────────┼──────┤
│  A   │ 500  │ NT$ 1,500│ NT$ 3│ 0%   │
│  B   │ 1200 │ NT$ 3,300│ NT$ 2.75│ 10% │
│  C   │ 3000 │ NT$ 8,700│ NT$ 2.90│ 15% │
│  D   │ 5000 │ NT$14,000│ NT$ 2.80│ 20% │
└────────────────────────────────────────────┘

基準價: 1 點 = NT$ 3
優惠說明: 買得越多，優惠越大
```

### 點數有效期

```csharp
public class PointTransaction
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    public int Amount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiryDate { get; set; } // 購買後 1 年有效

    // 檢查點數是否過期
    public bool IsExpired => DateTime.UtcNow > ExpiryDate;

    // 計算點數狀態
    public PointStatus Status
    {
        get
        {
            if (IsExpired) return PointStatus.Expired;

            var daysUntilExpiry = (ExpiryDate - DateTime.UtcNow).Days;
            if (daysUntilExpiry <= 30) return PointStatus.WillExpire; // 即將過期警告

            return PointStatus.Valid;
        }
    }
}

public enum PointStatus
{
    Valid,       // 有效
    WillExpire,  // 即將過期（30 天內）
    Expired      // 已過期
}
```

### 點數消費規則

#### 諮詢服務扣點表

```
┌────────────────────────────────────────────┐
│      諮詢服務點數消費表                     │
├────────────────────────────────────────────┤
│ 服務類型      │ 扣點  │ 時長    │ 平均成本  │
├───────────────┼──────┼────────┼────────┤
│ 文字諮詢      │ 50   │ 24h    │ NT$ 150 │
│ 語音諮詢      │ 200  │ 15 分  │ NT$ 600 │
│ 視訊諮詢      │ 300  │ 15 分  │ NT$ 900 │
│ 深度分析      │ 500  │ 諮詢+報告│ NT$1500 │
│ 線上課程      │ 100-300│ 依課程 │ 依課程 │
│ 優質文章      │ 30   │ 永久    │ NT$ 90  │
└────────────────────────────────────────────┘
```

### 點數計算邏輯

```csharp
public class PointService
{
    /// <summary>
    /// 消費點數時的邏輯：
    /// 1. 優先使用「會員月度贈送」的點數
    /// 2. 再使用「購買」的點數
    /// 3. 優先消費即將過期的點數
    /// </summary>
    public async Task<bool> ConsumePointsAsync(
        Guid userId,
        int pointsNeeded,
        CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

        if (user.PointBalance < pointsNeeded)
        {
            throw new InvalidOperationException("Insufficient points");
        }

        // 獲取所有點數交易（按類型和過期日期排序）
        var pointTransactions = await _pointRepository.GetUserPointTransactionsAsync(
            userId,
            cancellationToken);

        // 分離會員贈送點數和購買點數
        var membershipPoints = pointTransactions
            .Where(p => p.Type == PointTransactionType.Reward)
            .OrderBy(p => p.ExpiryDate)
            .ToList();

        var purchasedPoints = pointTransactions
            .Where(p => p.Type == PointTransactionType.Purchase)
            .OrderBy(p => p.ExpiryDate)
            .ToList();

        int consumedFromMembership = 0;
        int consumedFromPurchased = 0;

        // 優先消費會員贈送的點數
        foreach (var transaction in membershipPoints)
        {
            if (consumedFromMembership >= pointsNeeded)
                break;

            int toConsume = Math.Min(pointsNeeded - consumedFromMembership, transaction.Amount);
            transaction.Amount -= toConsume;
            consumedFromMembership += toConsume;

            if (transaction.Amount == 0)
            {
                transaction.Type = PointTransactionType.Consumption;
            }
        }

        // 再消費購買的點數
        foreach (var transaction in purchasedPoints)
        {
            if (consumedFromMembership + consumedFromPurchased >= pointsNeeded)
                break;

            int toConsume = Math.Min(
                pointsNeeded - consumedFromMembership - consumedFromPurchased,
                transaction.Amount);
            transaction.Amount -= toConsume;
            consumedFromPurchased += toConsume;

            if (transaction.Amount == 0)
            {
                transaction.Type = PointTransactionType.Consumption;
            }
        }

        // 更新用戶點數餘額
        user.PointBalance -= pointsNeeded;

        await _userRepository.UpdateAsync(user, cancellationToken);

        return true;
    }

    /// <summary>
    /// 計算用戶的點數明細
    /// </summary>
    public async Task<PointBreakdown> GetPointBreakdownAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        var transactions = await _pointRepository.GetUserPointTransactionsAsync(
            userId,
            cancellationToken);

        var breakdown = new PointBreakdown
        {
            TotalBalance = user.PointBalance,
            MembershipPoints = transactions
                .Where(t => t.Type == PointTransactionType.Reward && !t.IsExpired)
                .Sum(t => t.Amount),
            PurchasedPoints = transactions
                .Where(t => t.Type == PointTransactionType.Purchase && !t.IsExpired)
                .Sum(t => t.Amount),
            WillExpirePoints = transactions
                .Where(t => !t.IsExpired && (t.ExpiryDate - DateTime.UtcNow).Days <= 30)
                .Sum(t => t.Amount),
            ExpiredPoints = transactions
                .Where(t => t.IsExpired)
                .Sum(t => t.Amount),
            Transactions = transactions
        };

        return breakdown;
    }
}

public class PointBreakdown
{
    public int TotalBalance { get; set; }
    public int MembershipPoints { get; set; }  // 會員月度贈送
    public int PurchasedPoints { get; set; }   // 購買的點數
    public int WillExpirePoints { get; set; }  // 即將過期（30 天內）
    public int ExpiredPoints { get; set; }     // 已過期
    public IEnumerable<PointTransaction> Transactions { get; set; } = new List<PointTransaction>();
}
```

### 每月會員點數增發邏輯

```csharp
public class MonthlyMembershipPointService
{
    /// <summary>
    /// 每月 1 日 00:00 UTC 執行
    /// 為所有有效會員增加該月的點數贈送
    /// </summary>
    public async Task DistributeMonthlyPointsAsync(CancellationToken cancellationToken)
    {
        var activeMembers = await _membershipRepository.GetActiveMembershipsAsync(cancellationToken);

        foreach (var membership in activeMembers)
        {
            var monthlyPoints = membership.Type switch
            {
                MembershipType.Basic => 50,
                MembershipType.Advanced => 150,
                MembershipType.VIP => 500,
                _ => 0
            };

            if (monthlyPoints == 0)
                continue;

            // 建立點數交易記錄
            var transaction = new PointTransaction
            {
                Id = Guid.NewGuid(),
                UserId = membership.UserId,
                Type = PointTransactionType.Reward, // 會員贈送
                Amount = monthlyPoints,
                AmountInTWD = monthlyPoints * 3, // 基準價 1 點 = NT$ 3
                Description = $"{membership.Type} Monthly Reward - {DateTime.UtcNow:yyyy-MM}",
                ExpiryDate = DateTime.UtcNow.AddDays(365), // 1 年有效期
                CreatedAt = DateTime.UtcNow
            };

            await _pointRepository.AddAsync(transaction, cancellationToken);

            // 更新用戶點數餘額
            var user = await _userRepository.GetByIdAsync(membership.UserId, cancellationToken);
            user.PointBalance += monthlyPoints;

            await _userRepository.UpdateAsync(user, cancellationToken);

            // 發送提醒郵件
            await _emailService.SendMonthlyPointsNotificationAsync(
                user,
                monthlyPoints,
                cancellationToken);

            _logger.LogInformation(
                $"Distributed {monthlyPoints} points to user {membership.UserId}");
        }
    }
}
```

### 過期點數提醒

```csharp
public class ExpiredPointsWarningService
{
    /// <summary>
    /// 每天執行一次，提醒即將過期的點數
    /// </summary>
    public async Task SendExpirationWarningsAsync(CancellationToken cancellationToken)
    {
        var pointsExpiringIn30Days = await _pointRepository
            .GetPointsExpiringInDaysAsync(daysUntilExpiry: 30, cancellationToken);

        foreach (var pointBatch in pointsExpiringIn30Days)
        {
            var user = await _userRepository.GetByIdAsync(pointBatch.UserId, cancellationToken);

            // 發送提醒郵件
            await _emailService.SendPointsExpirationWarningAsync(
                user,
                pointBatch.Amount,
                pointBatch.ExpiryDate,
                cancellationToken);

            _logger.LogInformation(
                $"Sent expiration warning to user {user.Id}. Points: {pointBatch.Amount}");
        }

        // 標記已過期的點數
        var expiredPoints = await _pointRepository
            .GetExpiredPointsAsync(cancellationToken);

        foreach (var point in expiredPoints)
        {
            point.Type = PointTransactionType.Expiry;
            await _pointRepository.UpdateAsync(point, cancellationToken);
        }
    }
}
```

---

## 📊 前端點數和會員顯示

### 用戶儀表板

```typescript
// app/dashboard/membership-points-panel.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';

interface MembershipInfo {
  type: string;
  endDate: string;
  daysRemaining: number;
  monthlyPoints: number;
}

interface PointsInfo {
  totalBalance: number;
  membershipPoints: number;
  purchasedPoints: number;
  willExpirePoints: number;
  expiredPoints: number;
}

export default function MembershipPointsPanel() {
  const { token, user } = useAuth();
  const [membership, setMembership] = useState<MembershipInfo | null>(null);
  const [points, setPoints] = useState<PointsInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [membershipRes, pointsRes] = await Promise.all([
        fetch('/api/memberships/current', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/points/breakdown', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (membershipRes.ok) {
        setMembership(await membershipRes.json());
      }

      if (pointsRes.ok) {
        setPoints(await pointsRes.json());
      }

      setLoading(false);
    };

    fetchData();
  }, [token]);

  if (loading) return <div>載入中...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 會員信息卡 */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">會員狀態</h3>

        {membership ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">目前等級</p>
              <p className="text-3xl font-bold text-amber-600">
                {membership.type === 'Free' ? '免費會員' :
                 membership.type === 'Basic' ? '基礎會員' :
                 membership.type === 'Advanced' ? '進階會員' : 'VIP 會員'}
              </p>
            </div>

            {membership.type !== 'Free' && (
              <>
                <div className="bg-white p-3 rounded">
                  <p className="text-sm text-gray-600">會員到期</p>
                  <p className="text-lg font-semibold">{membership.endDate}</p>
                  <p className="text-xs text-amber-600">剩餘 {membership.daysRemaining} 天</p>
                </div>

                <div className="bg-white p-3 rounded">
                  <p className="text-sm text-gray-600">月度贈送點數</p>
                  <p className="text-2xl font-bold text-green-600">+{membership.monthlyPoints}</p>
                </div>

                <button className="w-full bg-amber-600 text-white py-2 rounded hover:bg-amber-700">
                  續費或升級
                </button>
              </>
            )}

            {membership.type === 'Free' && (
              <button className="w-full bg-amber-600 text-white py-3 rounded hover:bg-amber-700 font-semibold">
                升級會員，享受更多優惠
              </button>
            )}
          </div>
        ) : (
          <p>無會員信息</p>
        )}
      </div>

      {/* 點數信息卡 */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">點數餘額</h3>

        {points ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">總點數</p>
              <p className="text-4xl font-bold text-blue-600">
                {points.totalBalance}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-3 rounded">
                <p className="text-gray-600">會員贈送</p>
                <p className="text-lg font-bold text-green-600">
                  {points.membershipPoints}
                </p>
              </div>

              <div className="bg-white p-3 rounded">
                <p className="text-gray-600">已購買</p>
                <p className="text-lg font-bold text-blue-600">
                  {points.purchasedPoints}
                </p>
              </div>

              {points.willExpirePoints > 0 && (
                <div className="bg-yellow-100 border border-yellow-400 p-3 rounded col-span-2">
                  <p className="text-xs text-yellow-800">即將過期（30 天內）</p>
                  <p className="text-lg font-bold text-yellow-700">
                    {points.willExpirePoints} 點
                  </p>
                </div>
              )}
            </div>

            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              購買點數
            </button>
          </div>
        ) : (
          <p>無點數信息</p>
        )}
      </div>
    </div>
  );
}
```

---

## 💎 會員升級選擇器

```typescript
// app/membership/upgrade-selector.tsx
'use client';

import { useState } from 'react';

const membershipPlans = [
  {
    type: 'Free',
    name: '免費會員',
    price: 0,
    monthlyPoints: 0,
    features: [
      '基本功能',
      '社區訪問',
      '文章閱讀'
    ],
    cta: '目前方案'
  },
  {
    type: 'Basic',
    name: '基礎會員',
    price: 299,
    monthlyPoints: 50,
    discount: '0%',
    features: [
      '每月 50 點',
      '優先排隊',
      '優先客服',
      '專屬討論區',
      '月度直播'
    ],
    cta: '立即升級',
    highlight: false
  },
  {
    type: 'Advanced',
    name: '進階會員',
    price: 699,
    monthlyPoints: 150,
    discount: '10%',
    features: [
      '每月 150 點',
      '免費深度分析報告',
      'VIP 客服（2小時內回應）',
      '可提前 14 天預約',
      '所有課程免費',
      '邀請返利：200 點/人'
    ],
    cta: '立即升級',
    highlight: true  // 推薦
  },
  {
    type: 'VIP',
    name: 'VIP 會員',
    price: 1999,
    monthlyPoints: 500,
    discount: '20%',
    features: [
      '每月 500 點（無限保留）',
      '20% 點數折扣',
      '專屬諮詢師',
      '24/7 即時客服',
      '免費完整分析 + 年度運勢',
      '高級課程全部免費',
      '三人團購享 VIP 折扣'
    ],
    cta: '開通 VIP',
    highlight: false
  }
];

export default function MembershipUpgradeSelector() {
  const [selectedPlan, setSelectedPlan] = useState('Basic');

  const handleUpgrade = (planType: string) => {
    // 重導向到支付頁面
    window.location.href = `/payments?type=membership&plan=${planType}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center">選擇最適合您的會員方案</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {membershipPlans.map((plan) => (
          <div
            key={plan.type}
            className={`relative border-2 rounded-lg p-6 transition-all cursor-pointer ${
              plan.highlight
                ? 'border-amber-600 shadow-xl transform scale-105 bg-amber-50'
                : selectedPlan === plan.type
                ? 'border-amber-600 shadow-lg'
                : 'border-gray-200 hover:border-amber-400'
            }`}
            onClick={() => setSelectedPlan(plan.type)}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                推薦
              </div>
            )}

            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>

            <div className="mb-4">
              {plan.price === 0 ? (
                <p className="text-3xl font-bold">FREE</p>
              ) : (
                <>
                  <p className="text-3xl font-bold">NT$ {plan.price}</p>
                  <p className="text-sm text-gray-600">/月</p>
                </>
              )}
            </div>

            {plan.monthlyPoints > 0 && (
              <div className="mb-4 p-3 bg-white rounded border border-green-200">
                <p className="text-lg font-bold text-green-600">+{plan.monthlyPoints} 點/月</p>
              </div>
            )}

            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="text-sm flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan.type)}
              disabled={plan.type === 'Free'}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                plan.type === 'Free'
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : plan.highlight
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h4 className="font-bold mb-2">❓ 常見問題</h4>
        <ul className="space-y-2 text-sm">
          <li><strong>Q：可以隨時取消會員嗎？</strong><br/>A：是的，可以隨時取消。已支付的費用按日償還。</li>
          <li><strong>Q：點數可以退款嗎？</strong><br/>A：購買的點數無法退款，但可以保留 1 年使用。</li>
          <li><strong>Q：會員升級時會退款嗎？</strong><br/>A：升級時會根據剩餘天數計算差價。</li>
        </ul>
      </div>
    </div>
  );
}
```

---

## 📋 會員和點數系統檢查清單

### Phase 1 實現
- [ ] 會員資料模型設計
- [ ] 三種會員等級邏輯實現
- [ ] 基本點數系統實現
- [ ] 點數消費邏輯
- [ ] 自動續費邏輯
- [ ] 郵件通知機制
- [ ] 前端會員和點數顯示

### 優化和擴展
- [ ] 點數禮券和代碼兌換
- [ ] 朋友邀請獎勵系統
- [ ] 點數轉讓功能
- [ ] 訂閱管理儀表板
- [ ] 自動續費失敗重試機制

---

## 💰 財務報表

### 會員收入預測

```
免費會員: 無直接收入（提高用戶基數）
基礎會員: 25% 轉化率 × 10,000 用戶 × NT$ 299 = NT$ 747,500/月
進階會員: 10% 轉化率 × 10,000 用戶 × NT$ 699 = NT$ 699,000/月
VIP 會員: 2% 轉化率 × 10,000 用戶 × NT$ 1,999 = NT$ 399,800/月

月會員收入 = NT$ 1,846,300
年會員收入 = NT$ 22,155,600
```

### 點數消費指數

```
平均用戶月消費: 300-500 點 (相等 NT$ 900-1,500)
轉化為收入: 每位活躍用戶 = NT$ 1,200-2,000/月
1,000 活躍用戶: NT$ 1.2M-2M /月
```

---

這份文檔提供了整個會員和點數系統的完整業務邏輯和技術實現。
