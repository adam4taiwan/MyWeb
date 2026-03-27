# payment-integration-guide.md

此檔案提供 MyWeb 在 C# .NET 8 環境下的完整支付集成指南，包括所有您指定的支付方式。

---

## 💳 支付方式優先級

根據您的需求，優先級順序為：

1. **銀行轉帳** (第一優先) - 適合台灣用戶，無手續費
2. **Visa/Mastercard** (第二) - 國際標準，通過 Stripe
3. **LINE Pay** - 日本用戶，亞洲普及
4. **PayPay** - 日本和台灣逐漸普及
5. **支付寶** - 中國用戶

---

## 🏦 Phase 1: 銀行轉帳 (優先實現)

### 實現方案

銀行轉帳是最簡單的支付方式，核心流程：
1. 用戶選擇銀行轉帳
2. 系統生成發票號和銀行信息
3. 用戶手動轉帳
4. **管理員手動確認** 或 **銀行 API 定時檢查**

### 前端頁面設計

```typescript
// app/payments/bank-transfer.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';

interface BankTransferPaymentProps {
  amount: number;
  pointsPlan: string;
  onSuccess: (transactionId: string) => void;
}

export default function BankTransferPayment({
  amount,
  pointsPlan,
  onSuccess
}: BankTransferPaymentProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [bankInfo, setBankInfo] = useState<{
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null>(null);

  const handleInitiateTransfer = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/payments/bank-transfer/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          pointsPlan,
          currency: 'TWD'
        })
      });

      const data = await response.json();

      if (data.success) {
        setInvoiceNumber(data.transactionId);
        setBankInfo(data.bankInfo);
      }
    } catch (error) {
      alert('無法初始化轉帳，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  if (!invoiceNumber) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold">銀行轉帳支付</h3>
        <p className="text-gray-600">
          購買 {pointsPlan} 點數，金額 NT$ {amount}
        </p>
        <button
          onClick={handleInitiateTransfer}
          disabled={isLoading}
          className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700"
        >
          {isLoading ? '處理中...' : '取得銀行信息'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-blue-50 p-6 rounded-lg">
      <h3 className="text-xl font-bold">轉帳信息</h3>

      {bankInfo && (
        <div className="space-y-3 text-sm">
          <div>
            <label className="font-semibold">銀行名稱</label>
            <p className="text-lg">{bankInfo.bankName}</p>
          </div>

          <div>
            <label className="font-semibold">帳號</label>
            <p className="text-lg font-mono">{bankInfo.accountNumber}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(bankInfo.accountNumber);
                alert('已複製到剪貼板');
              }}
              className="text-blue-600 mt-1"
            >
              複製帳號
            </button>
          </div>

          <div>
            <label className="font-semibold">戶名</label>
            <p>{bankInfo.accountName}</p>
          </div>

          <div>
            <label className="font-semibold">轉帳金額</label>
            <p className="text-lg">NT$ {amount}</p>
          </div>

          <div className="bg-yellow-100 border border-yellow-400 p-3 rounded">
            <label className="font-semibold">發票號</label>
            <p className="text-lg font-mono">{invoiceNumber}</p>
            <p className="text-xs text-gray-600 mt-2">
              ⚠️ 請在轉帳備註中寫入發票號，我們將以此確認您的支付
            </p>
          </div>
        </div>
      )}

      <div className="bg-green-50 border border-green-400 p-4 rounded">
        <h4 className="font-semibold mb-2">轉帳步驟</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>複製上述帳號並登入您的銀行</li>
          <li>轉帳金額：NT$ {amount}</li>
          <li>備註中寫入發票號：{invoiceNumber}</li>
          <li>完成轉帳</li>
          <li>我們將在 1-2 小時內確認並增加點數</li>
        </ol>
      </div>

      <div className="space-y-2">
        <label className="flex items-center">
          <input type="checkbox" required className="mr-2" />
          <span className="text-sm">我已完成銀行轉帳</span>
        </label>

        <button
          onClick={() => {
            // 通知系統已轉帳，等待管理員確認
            alert('感謝！我們已收到您的轉帳通知，將在 1-2 小時內確認');
            onSuccess(invoiceNumber);
          }}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
        >
          確認已轉帳
        </button>
      </div>

      <div className="text-xs text-gray-500">
        <p>如有任何問題，請聯繫支持：support@myweb.com</p>
      </div>
    </div>
  );
}
```

### 後端 API 實現

```csharp
// Controllers/PaymentsController.cs
[ApiController]
[Route("api/payments")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IConfiguration _configuration;

    [HttpPost("bank-transfer/initiate")]
    public async Task<IActionResult> InitiateBankTransfer(
        [FromBody] BankTransferInitiateRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // 生成發票號
            var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMddHHmmss}-{userId[..8].ToUpper()}";

            // 建立支付記錄
            var payment = new Payment
            {
                Id = Guid.NewGuid(),
                UserId = Guid.Parse(userId),
                Type = PaymentType.PointsPurchase,
                Amount = request.Amount,
                Currency = request.Currency,
                Method = PaymentMethod.BankTransfer,
                Status = PaymentStatus.Pending,
                PointsPurchased = request.PointsPlan switch
                {
                    "A" => 500,
                    "B" => 1200,
                    "C" => 3000,
                    "D" => 5000,
                    _ => 0
                },
                TransactionId = invoiceNumber,
                CreatedAt = DateTime.UtcNow
            };

            await _paymentService.CreatePaymentAsync(payment, cancellationToken);

            return Ok(new
            {
                success = true,
                transactionId = invoiceNumber,
                bankInfo = new
                {
                    bankName = _configuration["BankTransfer:BankName"],
                    accountNumber = _configuration["BankTransfer:AccountNumber"],
                    accountName = _configuration["BankTransfer:AccountName"]
                }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }

    [HttpPost("bank-transfer/confirm")]
    public async Task<IActionResult> ConfirmBankTransfer(
        [FromBody] BankTransferConfirmRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            // 記錄用戶已通知已轉帳
            // 管理員將定期檢查並確認

            return Ok(new
            {
                success = true,
                message = "轉帳通知已記錄，我們將在 1-2 小時內確認"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }
}

public class BankTransferInitiateRequest
{
    public decimal Amount { get; set; }
    public string PointsPlan { get; set; } = string.Empty;
    public string Currency { get; set; } = "TWD";
}

public class BankTransferConfirmRequest
{
    public string InvoiceNumber { get; set; } = string.Empty;
}
```

### 管理員確認工作流

管理員需要定期檢查銀行帳戶，並通過以下 API 確認收款：

```csharp
// 管理界面 API - 僅限管理員
[HttpPost("admin/bank-transfer/confirm")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> AdminConfirmBankTransfer(
    [FromBody] AdminConfirmRequest request,
    CancellationToken cancellationToken)
{
    try
    {
        var payment = await _paymentService.GetPaymentAsync(
            Guid.Parse(request.PaymentId),
            cancellationToken);

        if (payment == null)
            return NotFound();

        // 標記為已完成
        payment.Status = PaymentStatus.Completed;
        payment.CompletedAt = DateTime.UtcNow;

        // 增加用戶點數
        await _pointService.AddPointsAsync(
            payment.UserId,
            payment.PointsPurchased ?? 0,
            "Points purchase confirmed",
            payment.Id,
            cancellationToken);

        await _paymentService.UpdatePaymentAsync(payment, cancellationToken);

        // 發送確認郵件
        await _emailService.SendPaymentConfirmationAsync(payment, cancellationToken);

        return Ok(new { success = true, message = "Payment confirmed" });
    }
    catch (Exception ex)
    {
        return BadRequest(new { success = false, error = ex.Message });
    }
}
```

---

## 💳 Phase 2: Stripe 信用卡支付

### Stripe 設定

1. **建立 Stripe 帳戶**
   - 訪問 https://stripe.com
   - 註冊並驗證帳戶
   - 複製 API 密鑰

2. **安裝 Nuget 套件**
```bash
dotnet add package Stripe.net
```

### Stripe 前端實現（使用 Stripe Hosted Checkout）

```typescript
// app/payments/stripe-checkout.tsx
'use client';

import { loadStripe } from '@stripe/js';
import { useAuth } from '@/components/AuthContext';

interface StripeCheckoutProps {
  amount: number;
  pointsPlan: string;
  onSuccess: (sessionId: string) => void;
}

export default function StripeCheckout({
  amount,
  pointsPlan,
  onSuccess
}: StripeCheckoutProps) {
  const { token } = useAuth();

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/payments/stripe/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          pointsPlan,
          currency: 'TWD'
        })
      });

      const { sessionUrl } = await response.json();

      // 重導向到 Stripe Checkout
      window.location.href = sessionUrl;
    } catch (error) {
      alert('結帳失敗，請重試');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">信用卡支付</h3>
      <p className="text-gray-600">
        購買 {pointsPlan} 點數，金額 NT$ {amount}
      </p>

      <button
        onClick={handleCheckout}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
      >
        前往 Stripe 結帳
      </button>

      <p className="text-xs text-gray-500">
        我們接受 Visa、Mastercard 和其他信用卡
      </p>
    </div>
  );
}
```

### Stripe 後端實現

```csharp
using Stripe;
using Stripe.Checkout;

[HttpPost("stripe/checkout")]
[Authorize]
public async Task<IActionResult> CreateStripeCheckout(
    [FromBody] StripeCheckoutRequest request,
    CancellationToken cancellationToken)
{
    try
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "twd",
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = $"MyWeb Points - Plan {request.PointsPlan}",
                            Description = $"{request.PointsPlan} points package",
                        },
                        UnitAmount = (long)(request.Amount * 100),
                    },
                    Quantity = 1,
                },
            },
            Mode = "payment",
            SuccessUrl = $"https://myweb.fly.dev/payments/success?session_id={{CHECKOUT_SESSION_ID}}",
            CancelUrl = $"https://myweb.fly.dev/payments/cancelled",
            Metadata = new Dictionary<string, string>
            {
                { "userId", userId },
                { "pointsPlan", request.PointsPlan }
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options, cancellationToken: cancellationToken);

        // 記錄 Stripe session ID
        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            UserId = Guid.Parse(userId),
            Type = PaymentType.PointsPurchase,
            Amount = request.Amount,
            Currency = "TWD",
            Method = PaymentMethod.CreditCard,
            Status = PaymentStatus.Pending,
            PointsPurchased = request.PointsPlan switch
            {
                "A" => 500,
                "B" => 1200,
                "C" => 3000,
                "D" => 5000,
                _ => 0
            },
            PaymentProviderId = session.Id,
            TransactionId = session.PaymentIntentId,
            CreatedAt = DateTime.UtcNow
        };

        await _paymentService.CreatePaymentAsync(payment, cancellationToken);

        return Ok(new { sessionUrl = session.Url });
    }
    catch (StripeException ex)
    {
        return BadRequest(new { success = false, error = ex.Message });
    }
}

[HttpPost("stripe/webhook")]
[AllowAnonymous]
public async Task<IActionResult> HandleStripeWebhook(CancellationToken cancellationToken)
{
    var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

    try
    {
        var stripeEvent = EventUtility.ConstructEvent(
            json,
            Request.Headers["Stripe-Signature"],
            _configuration["Stripe:WebhookSecret"]);

        if (stripeEvent.Type == Events.CheckoutSessionCompleted)
        {
            var session = stripeEvent.Data.Object as Session;

            if (session?.PaymentIntentId != null)
            {
                // 查找相應的支付記錄
                var payment = await _paymentService.GetPaymentByTransactionIdAsync(
                    session.PaymentIntentId,
                    cancellationToken);

                if (payment != null)
                {
                    payment.Status = PaymentStatus.Completed;
                    payment.CompletedAt = DateTime.UtcNow;

                    await _pointService.AddPointsAsync(
                        payment.UserId,
                        payment.PointsPurchased ?? 0,
                        "Stripe payment completed",
                        payment.Id,
                        cancellationToken);

                    await _paymentService.UpdatePaymentAsync(payment, cancellationToken);

                    await _emailService.SendPaymentConfirmationAsync(payment, cancellationToken);
                }
            }
        }

        return Ok();
    }
    catch (StripeException)
    {
        return BadRequest();
    }
}
```

---

## 🟢 Phase 3: LINE Pay

### 前端實現

```typescript
// app/payments/linepay-checkout.tsx
'use client';

import { useAuth } from '@/components/AuthContext';

export default function LinePayCheckout({
  amount,
  pointsPlan,
  onSuccess
}: {
  amount: number;
  pointsPlan: string;
  onSuccess: (transactionId: string) => void;
}) {
  const { token } = useAuth();

  const handleLinePayCheckout = async () => {
    try {
      const response = await fetch('/api/payments/linepay/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          pointsPlan,
          currency: 'TWD',
          redirectUrls: {
            confirmUrl: 'https://myweb.fly.dev/payments/linepay/confirm',
            cancelUrl: 'https://myweb.fly.dev/payments/cancelled'
          }
        })
      });

      const data = await response.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      alert('LINE Pay 初始化失敗');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">LINE Pay 支付</h3>
      <button
        onClick={handleLinePayCheckout}
        className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600"
      >
        使用 LINE Pay 支付
      </button>
    </div>
  );
}
```

### 後端實現（簡化版）

```csharp
[HttpPost("linepay/request")]
[Authorize]
public async Task<IActionResult> RequestLinePayment(
    [FromBody] LinePayRequestRequest request,
    CancellationToken cancellationToken)
{
    try
    {
        var channelId = _configuration["LinePay:ChannelId"];
        var channelSecret = _configuration["LinePay:ChannelSecret"];

        // LINE Pay API 請求
        // 實際實現需要調用 LINE Pay REST API
        // 此處為簡化概念

        return Ok(new
        {
            paymentUrl = "https://sandbox-web-pay.line.me/..." // LINE Pay URL
        });
    }
    catch (Exception ex)
    {
        return BadRequest(new { error = ex.Message });
    }
}

[HttpPost("linepay/confirm")]
public async Task<IActionResult> ConfirmLinePayment(
    [FromQuery] string transactionId,
    [FromQuery] string orderId,
    CancellationToken cancellationToken)
{
    try
    {
        // 確認 LINE Pay 支付
        // 調用 LINE Pay API 進行最終確認
        // 更新支付狀態

        return Redirect("/payments/success");
    }
    catch (Exception ex)
    {
        return Redirect("/payments/failed");
    }
}
```

---

## 📱 Phase 4: PayPay

### 實現方案

PayPay 的實現類似於 LINE Pay，需要：
1. 建立 PayPay 商家帳戶
2. 獲取 API 密鑰
3. 實現支付請求和回調驗證

```csharp
[HttpPost("paypay/request")]
[Authorize]
public async Task<IActionResult> RequestPayPayPayment(
    [FromBody] PayPayRequestRequest request,
    CancellationToken cancellationToken)
{
    try
    {
        // PayPay API 實現
        // 流程類似 LINE Pay

        return Ok(new
        {
            paymentUrl = "https://api.paypay.ne.jp/..." // PayPay URL
        });
    }
    catch (Exception ex)
    {
        return BadRequest(new { error = ex.Message });
    }
}
```

---

## 💰 支付方式選擇器

前端支付方式選擇器：

```typescript
// app/payments/payment-method-selector.tsx
'use client';

import { useState } from 'react';
import BankTransferPayment from './bank-transfer';
import StripeCheckout from './stripe-checkout';
import LinePayCheckout from './linepay-checkout';

type PaymentMethod = 'bank' | 'stripe' | 'linepay' | 'paypay' | 'alipay';

interface PaymentSelectorProps {
  amount: number;
  pointsPlan: string;
  onSuccess: (method: PaymentMethod, transactionId: string) => void;
}

export default function PaymentMethodSelector({
  amount,
  pointsPlan,
  onSuccess
}: PaymentSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bank');

  const methods: {
    id: PaymentMethod;
    name: string;
    description: string;
    badge?: string;
    available: boolean;
  }[] = [
    {
      id: 'bank',
      name: '銀行轉帳',
      description: '直接轉帳到我們的銀行帳戶（無手續費）',
      badge: '首選',
      available: true
    },
    {
      id: 'stripe',
      name: 'Visa / Mastercard',
      description: '使用信用卡快速支付',
      available: true
    },
    {
      id: 'linepay',
      name: 'LINE Pay',
      description: '通過 LINE Pay 錢包支付',
      available: false // Phase 3
    },
    {
      id: 'paypay',
      name: 'PayPay',
      description: '通過 PayPay 應用支付',
      available: false // Phase 4
    },
    {
      id: 'alipay',
      name: '支付寶',
      description: '通過支付寶支付',
      available: false // Phase 5
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">選擇支付方式</h2>

      <div className="grid grid-cols-1 gap-4">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            disabled={!method.available}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              selectedMethod === method.id
                ? 'border-amber-600 bg-amber-50'
                : 'border-gray-200 hover:border-amber-600'
            } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{method.name}</h3>
                <p className="text-gray-600">{method.description}</p>
              </div>
              {method.badge && (
                <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs">
                  {method.badge}
                </span>
              )}
              {!method.available && (
                <span className="text-gray-500 text-sm">即將推出</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="border-t pt-6">
        {selectedMethod === 'bank' && (
          <BankTransferPayment
            amount={amount}
            pointsPlan={pointsPlan}
            onSuccess={(id) => onSuccess('bank', id)}
          />
        )}

        {selectedMethod === 'stripe' && (
          <StripeCheckout
            amount={amount}
            pointsPlan={pointsPlan}
            onSuccess={(id) => onSuccess('stripe', id)}
          />
        )}

        {selectedMethod === 'linepay' && (
          <div className="text-center text-gray-500">
            LINE Pay 支付即將推出
          </div>
        )}

        {selectedMethod === 'paypay' && (
          <div className="text-center text-gray-500">
            PayPay 支付即將推出
          </div>
        )}

        {selectedMethod === 'alipay' && (
          <div className="text-center text-gray-500">
            支付寶支付即將推出
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔒 支付安全最佳實踐

### 1. PCI DSS 合規

永遠不要在您的伺服器上儲存信用卡數據：

```csharp
// ❌ 錯誤 - 不要這樣做
public class BadPaymentService
{
    public void SaveCreditCard(string cardNumber, string cvv)
    {
        // 永遠不要儲存原始信用卡信息！
        _database.SaveCreditCard(cardNumber, cvv);
    }
}

// ✅ 正確 - 使用 Stripe Tokens
public class ProperPaymentService
{
    public async Task ProcessPayment(string stripeToken, decimal amount)
    {
        // Stripe 處理敏感信息
        // 您只儲存 Token
        var charge = await _stripeService.ChargeAsync(stripeToken, amount);
    }
}
```

### 2. 支付金額驗證

```csharp
[HttpPost("verify-amount")]
public async Task<IActionResult> VerifyPaymentAmount(
    [FromBody] PaymentVerificationRequest request,
    CancellationToken cancellationToken)
{
    // 伺服器端驗證金額
    var pointsPlan = request.PointsPlan;
    var expectedAmount = pointsPlan switch
    {
        "A" => 1500m,
        "B" => 3300m,
        "C" => 8700m,
        "D" => 14000m,
        _ => throw new InvalidOperationException("Invalid plan")
    };

    if (request.Amount != expectedAmount)
    {
        return BadRequest(new { error = "Amount mismatch" });
    }

    return Ok(new { valid = true });
}
```

### 3. Webhook 驗證

```csharp
// 驗證 Stripe Webhook 簽名
public bool VerifyStripeSignature(string json, string signature)
{
    var webhook = _configuration["Stripe:WebhookSecret"];

    try
    {
        EventUtility.ConstructEvent(json, signature, webhook);
        return true;
    }
    catch
    {
        return false;
    }
}
```

---

## 📋 支付集成檢查清單

### Phase 1: 銀行轉帳 (第 1-2 週)
- [ ] 確定銀行帳戶信息
- [ ] 設計發票號生成邏輯
- [ ] 實現前端銀行轉帳頁面
- [ ] 實現後端 API
- [ ] 建立管理員確認工作流
- [ ] 郵件通知實現
- [ ] 測試完整流程

### Phase 2: Stripe (第 3-4 週)
- [ ] 建立 Stripe 帳戶
- [ ] 配置 API 密鑰
- [ ] 實現 Checkout Session
- [ ] 設置 Webhook
- [ ] 前端集成 Stripe.js
- [ ] 支付成功/失敗處理
- [ ] 測試沙箱環境

### Phase 3+: 其他支付方式
- [ ] LINE Pay 集成
- [ ] PayPay 集成
- [ ] 支付寶集成

---

## 🚀 部署檢查清單

- [ ] API 密鑰安全儲存（環境變數）
- [ ] Webhook 端點受保護
- [ ] HTTPS 強制
- [ ] 金額驗證邏輯正確
- [ ] 錯誤處理完善
- [ ] 日誌記錄足夠
- [ ] 監控告警設定
- [ ] 測試所有支付路徑

---

## 📞 支付提供商聯繫

| 提供商 | 官方網站 | 支援郵件 |
|--------|--------|--------|
| Stripe | https://stripe.com | support@stripe.com |
| LINE Pay | https://pay.line.me | linepay-support@linecorp.com |
| PayPay | https://paypay.ne.jp | support@paypay.jp |
| 支付寶 | https://www.alipay.com | alipaybiz@list.alibaba-inc.com |

每個平台的文檔都包含詳細的 API 參考和測試方法。優先建議從銀行轉帳和 Stripe 開始，確保基本流程穩定。
