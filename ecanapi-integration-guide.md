# Ecanapi 集成指南 - 銀行轉帳支付 + 命書交付

基于您现有的 **ecanapi** 完整源代码分析，这份指南描述如何：
1. 保留所有现有命盘计算和 Word 文档生成逻辑
2. **替换 Stripe 为銀行轉帳**
3. 完善命盤儲存和命書交付流程

---

## 📊 现有架构分析

您已经有：

✅ **命盤計算完整**
- `AstrologyService.CalculateChartAsync()` - 八字 + 紫微 + 易经
- 返回 `AstrologyChartResult` 包含完整数据

✅ **Word 文檔生成完整**
- `AnalysisReportService.GenerateReportAsync()` - NPOI 生成 .docx
- 4 章節：八字、天時、紫微宮位、宮星化象

✅ **Excel 導出**
- `ExcelExportService` - 生成 XLS

✅ **用戶認證**
- JWT 令牌 + Identity
- `ApplicationUser` with `PointRecords`

✅ **點數系統**
- `PointRecords` 表已存在
- `PaymentController` 做 Stripe 支付

❌ **缺失的：銀行轉帳**
❌ **缺失的：命盤持久化**
❌ **缺失的：命書儲存和交付**

---

## 🏗️ 新建表結構（擴展現有 DbContext）

在 `ApplicationDbContext.cs` 中添加：

```csharp
public DbSet<BaziProfile> BaziProfiles { get; set; }
public DbSet<AnalysisReport> AnalysisReports { get; set; }
public DbSet<Consultation> Consultations { get; set; }
public DbSet<BankTransferPayment> BankTransferPayments { get; set; }
```

### SQL 遷移

```sql
-- 1. 命盤儲存表
CREATE TABLE bazi_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES asp_net_users(id) ON DELETE CASCADE,

    -- 出生信息
    birth_year INT NOT NULL,
    birth_month INT NOT NULL,
    birth_day INT NOT NULL,
    birth_hour INT,
    birth_minute INT,
    birth_place VARCHAR(255),
    gender VARCHAR(10),

    -- 前端生成的命盤JSON（從前端上傳）
    bazi_json JSONB NOT NULL,

    -- 天干地支（冗余存储便于查询）
    year_stem VARCHAR(2),
    year_branch VARCHAR(2),
    month_stem VARCHAR(2),
    month_branch VARCHAR(2),
    day_stem VARCHAR(2),
    day_branch VARCHAR(2),
    hour_stem VARCHAR(2),
    hour_branch VARCHAR(2),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id),
    INDEX idx_user_id (user_id)
);

-- 2. 命書報告儲存表
CREATE TABLE analysis_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bazi_profile_id UUID NOT NULL REFERENCES bazi_profiles(id) ON DELETE CASCADE,

    -- 報告類型和信息
    report_type VARCHAR(50) DEFAULT 'basic',
    report_title VARCHAR(255),

    -- 生成的 Word 文檔（NPOI 生成的 .docx 二進制）
    word_document_bytes BYTEA NOT NULL,
    word_document_hash VARCHAR(64),

    -- 生成信息
    generated_by_user_id UUID REFERENCES asp_net_users(id),
    generation_timestamp TIMESTAMP DEFAULT NOW(),
    generation_duration_ms INT,

    -- 交付狀態
    delivery_status VARCHAR(20) DEFAULT 'pending',
    download_count INT DEFAULT 0,
    last_downloaded_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_profile_id (bazi_profile_id),
    INDEX idx_status (delivery_status)
);

-- 3. 諮詢訂單表（命書購買記錄）
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES asp_net_users(id) ON DELETE CASCADE,
    bazi_profile_id UUID NOT NULL REFERENCES bazi_profiles(id) ON DELETE CASCADE,

    -- 諮詢類型
    consultation_type VARCHAR(50) NOT NULL DEFAULT 'ba_zi_report',
    description TEXT,

    -- 點數信息
    points_required INT NOT NULL,
    points_paid INT DEFAULT 0,

    -- 狀態
    status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'unpaid',

    -- 生成的報告
    generated_report_id UUID REFERENCES analysis_reports(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,

    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- 4. 銀行轉帳支付表（替換現有的 Stripe 支付）
CREATE TABLE bank_transfer_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES asp_net_users(id) ON DELETE CASCADE,

    -- 轉帳信息
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TWD',
    invoice_number VARCHAR(100) UNIQUE NOT NULL,

    -- 狀態流程
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'user_notified', 'admin_confirmed', 'failed'

    -- 管理員確認
    admin_confirmed_by_id UUID REFERENCES asp_net_users(id),
    admin_confirmed_at TIMESTAMP,
    admin_notes TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_invoice (invoice_number)
);
```

---

## 📝 C# 實體模型（添加到現有項目）

在 `Data/` 文件夾中創建：

```csharp
// Data/BaziProfile.cs
public class BaziProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    public int BirthYear { get; set; }
    public int BirthMonth { get; set; }
    public int BirthDay { get; set; }
    public int? BirthHour { get; set; }
    public int? BirthMinute { get; set; }
    public string? BirthPlace { get; set; }
    public string? Gender { get; set; }

    // JSON 儲存
    [Column(TypeName = "jsonb")]
    public Dictionary<string, object>? BaziJson { get; set; }

    // 天干地支
    public string? YearStem { get; set; }
    public string? YearBranch { get; set; }
    public string? MonthStem { get; set; }
    public string? MonthBranch { get; set; }
    public string? DayStem { get; set; }
    public string? DayBranch { get; set; }
    public string? HourStem { get; set; }
    public string? HourBranch { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // 導航
    public virtual ApplicationUser? User { get; set; }
    public virtual ICollection<AnalysisReport> AnalysisReports { get; set; } = new List<AnalysisReport>();
    public virtual ICollection<Consultation> Consultations { get; set; } = new List<Consultation>();
}

// Data/AnalysisReport.cs
public class AnalysisReport
{
    public Guid Id { get; set; }
    public Guid BaziProfileId { get; set; }

    public string ReportType { get; set; } = "basic";
    public string? ReportTitle { get; set; }

    // 由 AnalysisReportService 生成的 .docx
    public byte[] WordDocumentBytes { get; set; } = Array.Empty<byte>();
    public string? WordDocumentHash { get; set; }

    public Guid? GeneratedByUserId { get; set; }
    public DateTime GenerationTimestamp { get; set; } = DateTime.UtcNow;
    public int? GenerationDurationMs { get; set; }

    public string DeliveryStatus { get; set; } = "pending";
    public int DownloadCount { get; set; }
    public DateTime? LastDownloadedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // 導航
    public virtual BaziProfile? BaziProfile { get; set; }
}

// Data/Consultation.cs
public class Consultation
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid BaziProfileId { get; set; }

    public string ConsultationType { get; set; } = "ba_zi_report";
    public string? Description { get; set; }

    public int PointsRequired { get; set; }
    public int PointsPaid { get; set; }

    public string Status { get; set; } = "pending";
    public string PaymentStatus { get; set; } = "unpaid";

    public Guid? GeneratedReportId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    // 導航
    public virtual ApplicationUser? User { get; set; }
    public virtual BaziProfile? BaziProfile { get; set; }
    public virtual AnalysisReport? GeneratedReport { get; set; }
}

// Data/BankTransferPayment.cs
public class BankTransferPayment
{
    public Guid Id { get; set; }
    public Guid ConsultationId { get; set; }
    public Guid UserId { get; set; }

    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TWD";
    public string InvoiceNumber { get; set; } = string.Empty;

    public string Status { get; set; } = "pending";

    public Guid? AdminConfirmedByUserId { get; set; }
    public DateTime? AdminConfirmedAt { get; set; }
    public string? AdminNotes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // 導航
    public virtual ApplicationUser? User { get; set; }
    public virtual Consultation? Consultation { get; set; }
}
```

---

## 🔧 修改現有代碼

### 1️⃣ 更新 `Program.cs` - 添加 DbSet

```csharp
// 在 Data context 配置後
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// ApplicationDbContext.cs
public DbSet<BaziProfile> BaziProfiles { get; set; }
public DbSet<AnalysisReport> AnalysisReports { get; set; }
public DbSet<Consultation> Consultations { get; set; }
public DbSet<BankTransferPayment> BankTransferPayments { get; set; }
```

### 2️⃣ 創建新的 `BaziService`（在 `Services/` 中）

```csharp
public interface IBaziService
{
    Task<BaziProfile> SaveBaziProfileAsync(
        Guid userId,
        AstrologyRequest request,
        CancellationToken cancellationToken);

    Task<BaziProfile?> GetBaziProfileAsync(Guid userId, CancellationToken cancellationToken);
}

public class BaziService : IBaziService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BaziService> _logger;

    public BaziService(ApplicationDbContext context, ILogger<BaziService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<BaziProfile> SaveBaziProfileAsync(
        Guid userId,
        AstrologyRequest request,
        CancellationToken cancellationToken)
    {
        var existing = await _context.BaziProfiles
            .FirstOrDefaultAsync(b => b.UserId == userId, cancellationToken);

        var profile = existing ?? new BaziProfile { Id = Guid.NewGuid(), UserId = userId };

        profile.BirthYear = request.BirthYear;
        profile.BirthMonth = request.BirthMonth;
        profile.BirthDay = request.BirthDay;
        profile.BirthHour = request.BirthHour;
        profile.BirthMinute = request.BirthMinute;
        profile.Gender = request.Gender;
        // BaziJson 從前端上傳
        profile.UpdatedAt = DateTime.UtcNow;

        if (existing == null)
            _context.BaziProfiles.Add(profile);
        else
            _context.BaziProfiles.Update(profile);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation($"Ba Zi profile saved for user {userId}");
        return profile;
    }

    public async Task<BaziProfile?> GetBaziProfileAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        return await _context.BaziProfiles
            .FirstOrDefaultAsync(b => b.UserId == userId, cancellationToken);
    }
}
```

在 `Program.cs` 註冊：
```csharp
builder.Services.AddScoped<IBaziService, BaziService>();
```

### 3️⃣ 修改 `PaymentController` - 添加銀行轉帳端點

```csharp
// Controllers/PaymentController.cs

[ApiController]
[Route("api/payment")]
public class PaymentController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _config;
    private readonly ILogger<PaymentController> _logger;

    // 保留現有的 Stripe 端點...

    /// <summary>
    /// 請求命書報告（銀行轉帳）
    /// </summary>
    [HttpPost("request-ba-zi-report")]
    [Authorize]
    public async Task<IActionResult> RequestBaZiReport(
        [FromBody] RequestBaZiReportRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        try
        {
            // 1. 取得命盤
            var baziProfile = await _context.BaziProfiles
                .FirstOrDefaultAsync(b => b.UserId == userGuid, cancellationToken);

            if (baziProfile == null)
                return BadRequest(new { error = "找不到命盤，請先上傳生日信息" });

            // 2. 建立諮詢記錄
            var consultation = new Consultation
            {
                Id = Guid.NewGuid(),
                UserId = userGuid,
                BaziProfileId = baziProfile.Id,
                ConsultationType = "ba_zi_report",
                PointsRequired = 1500 / 3, // 1500 TWD = 500 points (1 point = 3 TWD)
                Status = "pending",
                PaymentStatus = "unpaid"
            };

            _context.Consultations.Add(consultation);

            // 3. 生成銀行轉帳發票
            var invoiceNumber = GenerateInvoiceNumber(userGuid);

            var payment = new BankTransferPayment
            {
                Id = Guid.NewGuid(),
                ConsultationId = consultation.Id,
                UserId = userGuid,
                Amount = 1500m,
                Currency = "TWD",
                InvoiceNumber = invoiceNumber,
                Status = "pending"
            };

            _context.BankTransferPayments.Add(payment);
            await _context.SaveChangesAsync(cancellationToken);

            return Ok(new
            {
                success = true,
                consultationId = consultation.Id,
                paymentId = payment.Id,
                invoiceNumber = invoiceNumber,
                amount = 1500m,
                bankInfo = new
                {
                    bankName = _config["BankTransfer:BankName"],
                    accountNumber = _config["BankTransfer:AccountNumber"],
                    accountName = _config["BankTransfer:AccountName"],
                    transferAmount = "NT$ 1,500"
                },
                message = "請轉帳到指定帳戶，備註中寫入發票號"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error requesting report");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// 用戶確認已完成銀行轉帳
    /// </summary>
    [HttpPost("confirm-transfer/{consultationId}")]
    [Authorize]
    public async Task<IActionResult> ConfirmTransfer(
        Guid consultationId,
        [FromBody] ConfirmTransferRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        var consultation = await _context.Consultations
            .FirstOrDefaultAsync(c => c.Id == consultationId && c.UserId == userGuid, cancellationToken);

        if (consultation == null)
            return NotFound();

        consultation.PaymentStatus = "user_confirmed";
        consultation.UpdatedAt = DateTime.UtcNow;

        var payment = await _context.BankTransferPayments
            .FirstOrDefaultAsync(p => p.ConsultationId == consultationId, cancellationToken);

        if (payment != null)
        {
            payment.Status = "user_notified";
            payment.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            success = true,
            message = "轉帳已記錄，管理員將在 1-2 小時內確認"
        });
    }

    /// <summary>
    /// 管理員確認支付並觸發命書生成
    /// </summary>
    [HttpPost("admin/confirm-transfer/{paymentId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AdminConfirmTransfer(
        Guid paymentId,
        [FromBody] AdminConfirmTransferRequest request,
        CancellationToken cancellationToken)
    {
        var adminId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(adminId) || !Guid.TryParse(adminId, out var adminGuid))
            return Unauthorized();

        var payment = await _context.BankTransferPayments
            .Include(p => p.Consultation)
            .ThenInclude(c => c!.BaziProfile)
            .FirstOrDefaultAsync(p => p.Id == paymentId, cancellationToken);

        if (payment == null)
            return NotFound();

        try
        {
            // 1. 標記支付為已確認
            payment.Status = "admin_confirmed";
            payment.AdminConfirmedByUserId = adminGuid;
            payment.AdminConfirmedAt = DateTime.UtcNow;
            payment.AdminNotes = request.AdminNotes;
            payment.UpdatedAt = DateTime.UtcNow;

            var consultation = payment.Consultation!;
            consultation.PaymentStatus = "confirmed";
            consultation.Status = "processing";

            // 2. 增加用戶點數
            var pointRecord = new PointRecord
            {
                Id = Guid.NewGuid(),
                UserId = consultation.UserId,
                Amount = consultation.PointsRequired,
                Type = "purchase_confirmed",
                Description = $"命書購買確認 - {payment.InvoiceNumber}",
                CreatedAt = DateTime.UtcNow
            };

            _context.PointRecords.Add(pointRecord);
            consultation.PointsPaid = consultation.PointsRequired;

            // 3. 取得命盤用於生成報告
            var baziProfile = consultation.BaziProfile;
            if (baziProfile?.BaziJson != null)
            {
                // 4. 使用現有的 AnalysisReportService 生成報告
                var reportService = HttpContext.RequestServices.GetRequiredService<IAnalysisReportService>();

                var astrologyRequest = new AstrologyRequest
                {
                    BirthYear = baziProfile.BirthYear,
                    BirthMonth = baziProfile.BirthMonth,
                    BirthDay = baziProfile.BirthDay,
                    BirthHour = baziProfile.BirthHour ?? 0,
                    BirthMinute = baziProfile.BirthMinute ?? 0,
                    Gender = baziProfile.Gender ?? "未知",
                    Name = (await _context.Users.FindAsync(consultation.UserId, cancellationToken))?.UserName ?? "用戶"
                };

                var reportBytes = await reportService.GenerateReportAsync(
                    baziProfile.BaziJson,
                    astrologyRequest,
                    cancellationToken);

                // 5. 保存報告
                var report = new AnalysisReport
                {
                    Id = Guid.NewGuid(),
                    BaziProfileId = baziProfile.Id,
                    ReportType = "basic",
                    ReportTitle = $"{astrologyRequest.Name} - 命書",
                    WordDocumentBytes = reportBytes,
                    WordDocumentHash = ComputeHash(reportBytes),
                    GeneratedByUserId = adminGuid,
                    GenerationTimestamp = DateTime.UtcNow,
                    DeliveryStatus = "delivered"
                };

                _context.AnalysisReports.Add(report);

                // 6. 連接報告到諮詢
                consultation.GeneratedReportId = report.Id;
                consultation.Status = "completed";
                consultation.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation($"Payment {paymentId} confirmed by admin {adminGuid}");

            return Ok(new
            {
                success = true,
                message = "支付已確認，命書已生成，用戶已添加點數",
                paymentId = payment.Id,
                reportId = consultation.GeneratedReportId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming payment");
            return BadRequest(new { error = ex.Message });
        }
    }

    private string GenerateInvoiceNumber(Guid userId)
    {
        return $"INV-{DateTime.UtcNow:yyyyMMddHHmmss}-{userId.ToString()[..8].ToUpper()}";
    }

    private string ComputeHash(byte[] data)
    {
        using (var sha256 = System.Security.Cryptography.SHA256.Create())
        {
            var hash = sha256.ComputeHash(data);
            return Convert.ToHexString(hash);
        }
    }
}

public class RequestBaZiReportRequest
{
    public Guid BaziProfileId { get; set; }
}

public class ConfirmTransferRequest
{
    public string? TransferDetail { get; set; }
}

public class AdminConfirmTransferRequest
{
    public string? AdminNotes { get; set; }
}
```

### 4️⃣ 新建或修改 `BaziController`

```csharp
// Controllers/BaziController.cs

[ApiController]
[Route("api/bazi")]
[Authorize]
public class BaziController : ControllerBase
{
    private readonly IBaziService _baziService;
    private readonly ApplicationDbContext _context;

    public BaziController(IBaziService baziService, ApplicationDbContext context)
    {
        _baziService = baziService;
        _context = context;
    }

    /// <summary>
    /// 保存前端計算的命盤 JSON
    /// </summary>
    [HttpPost("save-profile")]
    public async Task<IActionResult> SaveBaziProfile(
        [FromBody] SaveBaziProfileRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        try
        {
            var profile = await _baziService.SaveBaziProfileAsync(
                userGuid,
                request.ToAstrologyRequest(),
                cancellationToken);

            return Ok(new
            {
                success = true,
                profileId = profile.Id,
                message = "命盤已保存"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// 取得用戶的命盤
    /// </summary>
    [HttpGet("profile")]
    public async Task<IActionResult> GetBaziProfile(CancellationToken cancellationToken)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        var profile = await _baziService.GetBaziProfileAsync(userGuid, cancellationToken);

        if (profile == null)
            return NotFound(new { error = "未找到命盤" });

        return Ok(new
        {
            success = true,
            data = new
            {
                profile.Id,
                profile.BirthYear,
                profile.BirthMonth,
                profile.BirthDay,
                profile.BirthHour,
                profile.BirthMinute,
                profile.Gender,
                profile.BaziJson
            }
        });
    }

    /// <summary>
    /// 下載命書 Word 文檔
    /// </summary>
    [HttpGet("download-report/{reportId}")]
    public async Task<IActionResult> DownloadReport(
        Guid reportId,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        var report = await _context.AnalysisReports
            .Include(r => r.BaziProfile)
            .FirstOrDefaultAsync(r => r.Id == reportId, cancellationToken);

        if (report == null)
            return NotFound();

        // 驗證擁有權
        if (report.BaziProfile?.UserId != userGuid)
            return Forbid();

        // 更新下載計數
        report.DownloadCount++;
        report.LastDownloadedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        // 返回 Word 文檔
        var fileName = $"{report.ReportTitle ?? "命書"}_{DateTime.Now:yyyyMMdd}.docx";
        return File(
            report.WordDocumentBytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            fileName);
    }
}

public class SaveBaziProfileRequest
{
    public int BirthYear { get; set; }
    public int BirthMonth { get; set; }
    public int BirthDay { get; set; }
    public int? BirthHour { get; set; }
    public int? BirthMinute { get; set; }
    public string? Gender { get; set; }
    public string? Name { get; set; }
    public string? BirthPlace { get; set; }
    public Dictionary<string, object>? BaziJson { get; set; }

    public AstrologyRequest ToAstrologyRequest()
    {
        return new AstrologyRequest
        {
            BirthYear = BirthYear,
            BirthMonth = BirthMonth,
            BirthDay = BirthDay,
            BirthHour = BirthHour ?? 12,
            BirthMinute = BirthMinute ?? 0,
            Gender = Gender ?? "未知",
            Name = Name ?? "用戶"
        };
    }
}
```

---

## 📱 前端集成（Next.js）

### Next.js API 路由（可選轉發層）

```typescript
// app/api/bazi/save-profile/route.ts
import { getAuth } from '@/lib/auth';

export async function POST(req: Request) {
  const token = await getAuth();
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bazi/save-profile`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  return response;
}
```

### 前端頁面組件

```typescript
// app/bazi/save-and-buy.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';

export default function SaveAndBuyReport() {
  const { token } = useAuth();
  const [baziJson] = useState(loadBaziFromLocalStorage());
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [bankInfo, setBankInfo] = useState<any>(null);

  const handleRequestReport = async () => {
    if (!baziJson) {
      alert('請先生成命盤');
      return;
    }

    // 1. 保存命盤到後端
    const saveResponse = await fetch('/api/bazi/save-profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        birthYear: baziJson.year,
        birthMonth: baziJson.month,
        birthDay: baziJson.day,
        birthHour: baziJson.hour,
        birthMinute: baziJson.minute,
        gender: '男',
        baziJson
      })
    });

    const saveData = await saveResponse.json();
    if (!saveData.success) {
      alert('保存命盤失敗');
      return;
    }

    // 2. 請求購買命書報告
    const paymentResponse = await fetch('/api/payment/request-ba-zi-report', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        baziProfileId: saveData.profileId
      })
    });

    const paymentData = await paymentResponse.json();
    if (paymentData.success) {
      setInvoiceNumber(paymentData.invoiceNumber);
      setBankInfo(paymentData.bankInfo);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">購買完整命書</h1>

      {!invoiceNumber ? (
        <button
          onClick={handleRequestReport}
          className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700"
        >
          生成銀行轉帳信息 (NT$ 1,500)
        </button>
      ) : (
        <div className="bg-blue-50 p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-bold">請轉帳到以下帳戶</h2>

          <div className="space-y-2 text-sm">
            <p><span className="font-bold">銀行：</span>{bankInfo.bankName}</p>
            <p><span className="font-bold">帳號：</span>{bankInfo.accountNumber}</p>
            <p><span className="font-bold">戶名：</span>{bankInfo.accountName}</p>
            <p><span className="font-bold">金額：</span>{bankInfo.transferAmount}</p>
          </div>

          <div className="bg-yellow-100 border border-yellow-400 p-4 rounded">
            <p className="font-bold text-yellow-800">發票號（請在備註欄寫入）</p>
            <p className="text-lg font-mono">{invoiceNumber}</p>
          </div>

          <button
            onClick={async () => {
              // 通知後端用戶已轉帳
              const confirmResponse = await fetch(`/api/payment/confirm-transfer`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (confirmResponse.ok) {
                alert('感謝！已記錄您的轉帳通知。管理員將在 1-2 小時內確認並生成命書。');
              }
            }}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            已完成轉帳，通知管理員
          </button>
        </div>
      )}
    </div>
  );
}
```

### 命書下載頁面

```typescript
// app/reports/downloads.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';

export default function ReportsDownloadPage() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      const response = await fetch('/api/bazi/my-reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setReports(data.reports);
    };

    fetchReports();
  }, [token]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">我的命書</h1>

      {reports.length === 0 ? (
        <p className="text-gray-600">您還未購買任何命書</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report: any) => (
            <div key={report.id} className="border p-4 rounded">
              <h3 className="font-bold">{report.reportTitle}</h3>
              <p className="text-sm text-gray-600">已下載 {report.downloadCount} 次</p>
              <a
                href={`/api/bazi/download-report/${report.id}`}
                download
                className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                下載 Word 文檔
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🔑 配置

在 `appsettings.json` 添加銀行信息：

```json
{
  "BankTransfer": {
    "BankName": "台灣銀行",
    "AccountNumber": "12345678",
    "AccountName": "MyWeb 命理諮詢"
  }
}
```

---

## ✅ 實現檢查清單

- [ ] 建立 EF Core migration（4 個新表）
- [ ] 添加實體類到 `Data/` 文件夾
- [ ] 更新 `ApplicationDbContext.cs`
- [ ] 創建 `IBaziService` 和 `BaziService`
- [ ] 修改 `PaymentController` - 添加銀行轉帳端點
- [ ] 創建 `BaziController` - 保存/取得/下載端點
- [ ] 註冊服務在 `Program.cs`
- [ ] 更新前端頁面
- [ ] 測試完整流程

---

## 🎯 核心工作流程

```
前端用戶上傳生日
    ↓
POST /api/bazi/save-profile (保存JSONPG)
    ↓
POST /api/payment/request-ba-zi-report (生成發票)
    ↓
顯示銀行信息 + 發票號
    ↓
用戶轉帳 + 確認
    ↓
管理員後台確認 (POST /api/payment/admin/confirm-transfer)
    ↓
自動觸發 AnalysisReportService.GenerateReportAsync()
    ↓
保存 Word 文檔到 analysis_reports 表
    ↓
增加用戶點數
    ↓
用戶登入系統 → GET /api/bazi/download-report/{reportId}
    ↓
下載 Word 文檔
```

---

這個方案：
✅ **完全基於您現有的 ecanapi**
✅ **保留所有命盤計算和 Word 生成邏輯**
✅ **簡單銀行轉帳（無第三方）**
✅ **清晰的數據流**
✅ **易於實現和維護**

準備開始實現了嗎？
