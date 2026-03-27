# Ba Zi Persistence & API Integration

基於您現有的 `AnalysisReportService.cs`，這份文檔描述如何將前端命盤JSON持久化、生成命書、並通過支付流程交付。

---

## 1️⃣ PostgreSQL Schema（命盤持久化）

### 核心表結構

```sql
-- 用戶命盤儲存表
CREATE TABLE bazi_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- 出生信息
    birth_year INT NOT NULL,
    birth_month INT NOT NULL,
    birth_day INT NOT NULL,
    birth_hour INT,
    birth_minute INT,
    birth_place VARCHAR(255),
    gender VARCHAR(10),

    -- 前端生成的完整命盤JSON
    bazi_json JSONB NOT NULL,

    -- 農曆日期（前端傳來或後端計算）
    lunar_year INT,
    lunar_month INT,
    lunar_day INT,
    is_leap_month BOOLEAN DEFAULT FALSE,

    -- 天干地支（冗余儲存，便於查詢）
    year_stem CHAR(1),
    year_branch CHAR(1),
    month_stem CHAR(1),
    month_branch CHAR(1),
    day_stem CHAR(1),
    day_branch CHAR(1),
    hour_stem CHAR(1),
    hour_branch CHAR(1),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_stem_branch (year_stem, month_stem, day_stem)
);

-- 命書生成記錄
CREATE TABLE analysis_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bazi_profile_id UUID NOT NULL REFERENCES bazi_profiles(id) ON DELETE CASCADE,

    -- 報告內容
    report_type VARCHAR(50) DEFAULT 'basic', -- 'basic', 'detailed', 'annual_forecast'
    report_title VARCHAR(255),

    -- 生成的文件
    word_document_bytes BYTEA NOT NULL,  -- .docx 文件二進制
    word_document_hash VARCHAR(64),       -- SHA-256 雜湊，用於版本控制

    -- 生成信息
    generated_by_user_id UUID REFERENCES users(id),  -- 誰觸發的生成
    generation_timestamp TIMESTAMP DEFAULT NOW(),
    generation_duration_ms INT,

    -- 交付狀態
    delivery_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'delivered', 'downloaded'
    download_count INT DEFAULT 0,
    last_downloaded_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_profile_id (bazi_profile_id),
    INDEX idx_status (delivery_status)
);

-- 諮詢訂單（連接命盤、付款、報告生成）
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bazi_profile_id UUID NOT NULL REFERENCES bazi_profiles(id) ON DELETE CASCADE,

    -- 諮詢類型
    consultation_type VARCHAR(50) NOT NULL, -- 'text', 'voice', 'video', 'ba_zi_report'
    description TEXT,

    -- 點數信息
    points_required INT NOT NULL,
    points_paid INT DEFAULT 0,

    -- 狀態流程
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'processing', 'completed', 'cancelled'
    payment_status VARCHAR(20) DEFAULT 'unpaid', -- 'unpaid', 'pending_confirmation', 'confirmed', 'failed'

    -- 銀行轉帳特有字段
    bank_transfer_invoice_id VARCHAR(100), -- 發票號，用於對帳
    bank_transfer_amount DECIMAL(10, 2),
    bank_transfer_note TEXT, -- 用戶確認已轉帳的備註

    -- 報告生成信息
    generated_report_id UUID REFERENCES analysis_reports(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,

    INDEX idx_user_id (user_id),
    INDEX idx_profile_id (bazi_profile_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status)
);

-- 支付記錄（簡化版，僅支持銀行轉帳）
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- 支付信息
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TWD',
    payment_method VARCHAR(50) DEFAULT 'bank_transfer',

    -- 銀行轉帳流程
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    bank_account_last4 VARCHAR(4),
    user_bank_info_id UUID, -- 可選，用於保存用戶銀行信息以便復用

    -- 狀態
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'user_notified', 'admin_confirmed', 'failed'
    admin_confirmed_by_id UUID REFERENCES users(id),
    admin_confirmed_at TIMESTAMP,

    notes TEXT, -- 管理員備註（例如收款銀行轉帳備註）

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(consultation_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_invoice (invoice_number)
);

-- 用戶點數餘額
CREATE TABLE user_points (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    balance INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    INDEX idx_balance (balance)
);

-- 點數交易日誌
CREATE TABLE point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(30) NOT NULL, -- 'purchase', 'consumption', 'refund', 'reward'
    points_amount INT NOT NULL,
    related_consultation_id UUID REFERENCES consultations(id),
    related_payment_id UUID REFERENCES payments(id),

    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_user_id (user_id),
    INDEX idx_type (transaction_type)
);
```

### 索引優化

```sql
-- 常用查詢優化
CREATE INDEX idx_bazi_user_created ON bazi_profiles(user_id, created_at DESC);
CREATE INDEX idx_consultation_user_status ON consultations(user_id, status);
CREATE INDEX idx_payment_invoice_status ON payments(invoice_number, status);
CREATE INDEX idx_reports_profile_status ON analysis_reports(bazi_profile_id, delivery_status);
```

---

## 2️⃣ C# 實體模型

### Entity Framework Core 配置

```csharp
namespace MyWeb.Domain.Entities
{
    public class BaziProfile
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }

        // 出生信息
        public int BirthYear { get; set; }
        public int BirthMonth { get; set; }
        public int BirthDay { get; set; }
        public int? BirthHour { get; set; }
        public int? BirthMinute { get; set; }
        public string? BirthPlace { get; set; }
        public string? Gender { get; set; }

        // 農曆
        public int? LunarYear { get; set; }
        public int? LunarMonth { get; set; }
        public int? LunarDay { get; set; }
        public bool IsLeapMonth { get; set; }

        // 天干地支
        public string YearStem { get; set; } = string.Empty;
        public string YearBranch { get; set; } = string.Empty;
        public string MonthStem { get; set; } = string.Empty;
        public string MonthBranch { get; set; } = string.Empty;
        public string DayStem { get; set; } = string.Empty;
        public string DayBranch { get; set; } = string.Empty;
        public string? HourStem { get; set; }
        public string? HourBranch { get; set; }

        // JSON 完整儲存
        [Column(TypeName = "jsonb")]
        public Dictionary<string, object>? BaziJson { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // 導航
        public virtual User? User { get; set; }
        public virtual ICollection<AnalysisReport> AnalysisReports { get; set; } = new List<AnalysisReport>();
        public virtual ICollection<Consultation> Consultations { get; set; } = new List<Consultation>();
    }

    public class AnalysisReport
    {
        public Guid Id { get; set; }
        public Guid BaziProfileId { get; set; }

        public string ReportType { get; set; } = "basic"; // 'basic', 'detailed'
        public string? ReportTitle { get; set; }

        // 生成的Word文檔（NPOI生成的.docx二進制）
        public byte[] WordDocumentBytes { get; set; } = Array.Empty<byte>();
        public string? WordDocumentHash { get; set; }

        // 生成信息
        public Guid? GeneratedByUserId { get; set; }
        public DateTime GenerationTimestamp { get; set; } = DateTime.UtcNow;
        public int? GenerationDurationMs { get; set; }

        // 交付狀態
        public string DeliveryStatus { get; set; } = "pending"; // 'pending', 'delivered', 'downloaded'
        public int DownloadCount { get; set; }
        public DateTime? LastDownloadedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // 導航
        public virtual BaziProfile? BaziProfile { get; set; }
        public virtual User? GeneratedByUser { get; set; }
    }

    public class Consultation
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid BaziProfileId { get; set; }

        public string ConsultationType { get; set; } = string.Empty; // 'ba_zi_report'
        public string? Description { get; set; }

        public int PointsRequired { get; set; }
        public int PointsPaid { get; set; }

        public string Status { get; set; } = "pending"; // 'pending', 'paid', 'processing', 'completed'
        public string PaymentStatus { get; set; } = "unpaid";

        // 銀行轉帳
        public string? BankTransferInvoiceId { get; set; }
        public decimal? BankTransferAmount { get; set; }
        public string? BankTransferNote { get; set; }

        // 報告生成
        public Guid? GeneratedReportId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        // 導航
        public virtual User? User { get; set; }
        public virtual BaziProfile? BaziProfile { get; set; }
        public virtual AnalysisReport? GeneratedReport { get; set; }
        public virtual Payment? Payment { get; set; }
    }

    public class Payment
    {
        public Guid Id { get; set; }
        public Guid ConsultationId { get; set; }
        public Guid UserId { get; set; }

        public decimal Amount { get; set; }
        public string Currency { get; set; } = "TWD";
        public string PaymentMethod { get; set; } = "bank_transfer";

        // 銀行轉帳
        public string InvoiceNumber { get; set; } = string.Empty;
        public string? BankAccountLast4 { get; set; }

        public string Status { get; set; } = "pending"; // 'pending', 'user_notified', 'admin_confirmed', 'failed'
        public Guid? AdminConfirmedByUserId { get; set; }
        public DateTime? AdminConfirmedAt { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // 導航
        public virtual User? User { get; set; }
        public virtual Consultation? Consultation { get; set; }
        public virtual User? AdminConfirmedByUser { get; set; }
    }

    public class UserPoints
    {
        public Guid UserId { get; set; }
        public int Balance { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        public virtual User? User { get; set; }
    }

    public class PointTransaction
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string TransactionType { get; set; } = string.Empty;
        public int PointsAmount { get; set; }
        public Guid? RelatedConsultationId { get; set; }
        public Guid? RelatedPaymentId { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual User? User { get; set; }
    }
}
```

### EF Core DbContext 配置

```csharp
public class MyWebDbContext : DbContext
{
    public MyWebDbContext(DbContextOptions<MyWebDbContext> options) : base(options) { }

    public DbSet<BaziProfile> BaziProfiles { get; set; }
    public DbSet<AnalysisReport> AnalysisReports { get; set; }
    public DbSet<Consultation> Consultations { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<UserPoints> UserPoints { get; set; }
    public DbSet<PointTransaction> PointTransactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // BaziProfile 配置
        modelBuilder.Entity<BaziProfile>()
            .HasIndex(b => b.UserId)
            .IsUnique();

        modelBuilder.Entity<BaziProfile>()
            .Property(b => b.BaziJson)
            .HasColumnType("jsonb");

        // Consultation - Payment 一對一
        modelBuilder.Entity<Consultation>()
            .HasOne(c => c.Payment)
            .WithOne(p => p.Consultation)
            .HasForeignKey<Payment>(p => p.ConsultationId);

        // AnalysisReport - Consultation 關係
        modelBuilder.Entity<Consultation>()
            .HasOne(c => c.GeneratedReport)
            .WithMany()
            .HasForeignKey(c => c.GeneratedReportId)
            .OnDelete(DeleteBehavior.SetNull);

        // 索引
        modelBuilder.Entity<AnalysisReport>()
            .HasIndex(a => new { a.BaziProfileId, a.DeliveryStatus });

        modelBuilder.Entity<Consultation>()
            .HasIndex(c => new { c.UserId, c.Status });

        modelBuilder.Entity<Payment>()
            .HasIndex(p => p.InvoiceNumber)
            .IsUnique();

        modelBuilder.Entity<Payment>()
            .HasIndex(p => p.Status);

        modelBuilder.Entity<PointTransaction>()
            .HasIndex(pt => pt.UserId);
    }
}
```

---

## 3️⃣ API 端點設計

### 核心工作流

```
用戶上傳生日 → 保存命盤JSON
                ↓
           顯示命盤給用戶
                ↓
        用戶選擇購買命書報告
                ↓
         生成銀行轉帳發票
                ↓
        用戶確認轉帳（或管理員確認）
                ↓
         觸發命書Word文檔生成
                ↓
          用戶下載命書PDF/Word
```

### API 端點

#### 1️⃣ 保存/取得命盤

```csharp
[ApiController]
[Route("api/bazi")]
[Authorize]
public class BaziController : ControllerBase
{
    private readonly IBaziService _baziService;

    /// <summary>
    /// 保存命盤JSON（前端計算後上傳）
    /// </summary>
    [HttpPost("save-profile")]
    public async Task<IActionResult> SaveBaziProfile(
        [FromBody] SaveBaziProfileRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        try
        {
            var profile = await _baziService.SaveBaziProfileAsync(
                Guid.Parse(userId),
                request,
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
            return BadRequest(new { success = false, error = ex.Message });
        }
    }

    /// <summary>
    /// 取得用戶的命盤
    /// </summary>
    [HttpGet("profile")]
    public async Task<IActionResult> GetBaziProfile(CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var profile = await _baziService.GetBaziProfileAsync(
            Guid.Parse(userId),
            cancellationToken);

        if (profile == null)
            return NotFound(new { success = false, error = "未找到命盤" });

        return Ok(new
        {
            success = true,
            data = profile
        });
    }
}

public class SaveBaziProfileRequest
{
    public int BirthYear { get; set; }
    public int BirthMonth { get; set; }
    public int BirthDay { get; set; }
    public int? BirthHour { get; set; }
    public int? BirthMinute { get; set; }
    public string? BirthPlace { get; set; }
    public string? Gender { get; set; }
    public Dictionary<string, object>? BaziJson { get; set; }
}
```

#### 2️⃣ 購買命書報告（銀行轉帳）

```csharp
[ApiController]
[Route("api/consultations")]
[Authorize]
public class ConsultationsController : ControllerBase
{
    private readonly IConsultationService _consultationService;
    private readonly IPaymentService _paymentService;

    /// <summary>
    /// 發起命書報告購買（生成銀行轉帳發票）
    /// </summary>
    [HttpPost("request-ba-zi-report")]
    public async Task<IActionResult> RequestBaZiReport(
        [FromBody] RequestBaZiReportRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        try
        {
            // 1. 建立諮詢記錄
            var consultation = await _consultationService.CreateConsultationAsync(
                Guid.Parse(userId),
                request.BaziProfileId,
                "ba_zi_report",
                cancellationToken);

            // 2. 生成銀行轉帳發票
            var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString()[..8].ToUpper()}";

            var payment = await _paymentService.CreateBankTransferPaymentAsync(
                consultation.Id,
                Guid.Parse(userId),
                1500m, // 基礎命書 1500 元
                invoiceNumber,
                cancellationToken);

            return Ok(new
            {
                success = true,
                consultationId = consultation.Id,
                paymentId = payment.Id,
                invoiceNumber = invoiceNumber,
                amount = 1500m,
                bankInfo = new
                {
                    bankName = "台灣銀行",
                    accountNumber = "12345678",
                    accountName = "MyWeb 命理諮詢",
                    transferAmount = "NT$ 1,500"
                },
                message = "請轉帳到銀行帳戶，備註中請寫入發票號"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }

    public class RequestBaZiReportRequest
    {
        public Guid BaziProfileId { get; set; }
        public string? SpecialRequests { get; set; }
    }
}
```

#### 3️⃣ 用戶確認轉帳

```csharp
/// <summary>
/// 用戶確認已完成銀行轉帳（等待管理員確認）
/// </summary>
[HttpPost("confirm-transfer/{consultationId}")]
public async Task<IActionResult> ConfirmTransfer(
    Guid consultationId,
    [FromBody] TransferConfirmationRequest request,
    CancellationToken cancellationToken)
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userId))
        return Unauthorized();

    try
    {
        var consultation = await _consultationService.ConfirmUserTransferAsync(
            consultationId,
            Guid.Parse(userId),
            request.TransferNote,
            cancellationToken);

        return Ok(new
        {
            success = true,
            message = "轉帳已記錄，管理員將在 1-2 小時內確認",
            consultationId = consultation.Id,
            status = consultation.PaymentStatus
        });
    }
    catch (Exception ex)
    {
        return BadRequest(new { success = false, error = ex.Message });
    }
}

public class TransferConfirmationRequest
{
    public string? TransferNote { get; set; } // 轉帳備註 / 銀行轉帳時間
}
```

#### 4️⃣ 管理員確認支付（手動觸發命書生成）

```csharp
[ApiController]
[Route("api/admin/payments")]
[Authorize(Roles = "Admin")]
public class AdminPaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IAnalysisReportService _reportService;

    /// <summary>
    /// 管理員確認銀行轉帳收款並觸發命書生成
    /// </summary>
    [HttpPost("confirm-transfer/{paymentId}")]
    public async Task<IActionResult> ConfirmTransferAndGenerateReport(
        Guid paymentId,
        [FromBody] AdminPaymentConfirmRequest request,
        CancellationToken cancellationToken)
    {
        var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(adminId))
            return Unauthorized();

        try
        {
            // 1. 確認支付
            var payment = await _paymentService.ConfirmPaymentAsync(
                paymentId,
                Guid.Parse(adminId),
                request.AdminNote,
                cancellationToken);

            // 2. 更新點數
            await _paymentService.AddPointsToUserAsync(
                payment.UserId,
                payment.Consultation?.PointsRequired ?? 0,
                $"Ba Zi Report Payment - {payment.InvoiceNumber}",
                cancellationToken);

            // 3. 取得命盤信息
            var baziProfile = payment.Consultation?.BaziProfile;
            if (baziProfile?.BaziJson != null)
            {
                // 4. 觸發命書生成（使用您現有的 AnalysisReportService）
                var reportBytes = await _reportService.GenerateReportAsync(
                    baziProfile.BaziJson,
                    new AstrologyRequest
                    {
                        Gender = baziProfile.Gender,
                        BirthYear = baziProfile.BirthYear,
                        // ... 其他信息
                    },
                    cancellationToken);

                // 5. 保存報告
                var report = await _paymentService.SaveAnalysisReportAsync(
                    baziProfile.Id,
                    reportBytes,
                    "ba_zi_basic",
                    cancellationToken);

                // 6. 連接報告到諮詢
                await _paymentService.LinkReportToConsultationAsync(
                    payment.Consultation.Id,
                    report.Id,
                    cancellationToken);

                // 7. 發送通知郵件給用戶
                // await _emailService.SendReportReadyNotificationAsync(...);
            }

            return Ok(new
            {
                success = true,
                message = "支付已確認，命書已生成，用戶已成功添加點數",
                paymentId = payment.Id,
                reportId = payment.Consultation?.GeneratedReportId
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }

    public class AdminPaymentConfirmRequest
    {
        public string? AdminNote { get; set; } // 如"已確認銀行進帳"
    }
}
```

#### 5️⃣ 用戶下載命書

```csharp
[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IAnalysisReportService _reportService;

    /// <summary>
    /// 取得用戶的命書報告（列表）
    /// </summary>
    [HttpGet("my-reports")]
    public async Task<IActionResult> GetMyReports(CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var reports = await _reportService.GetUserReportsAsync(
            Guid.Parse(userId),
            cancellationToken);

        return Ok(new
        {
            success = true,
            data = reports.Select(r => new
            {
                r.Id,
                r.ReportType,
                r.ReportTitle,
                r.DeliveryStatus,
                r.DownloadCount,
                r.CreatedAt
            })
        });
    }

    /// <summary>
    /// 下載命書為 Word 文檔
    /// </summary>
    [HttpGet("download/{reportId}")]
    public async Task<IActionResult> DownloadReport(
        Guid reportId,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        try
        {
            var report = await _reportService.GetReportAsync(reportId, cancellationToken);

            if (report == null)
                return NotFound();

            // 驗證擁有權
            if (report.BaziProfile?.UserId != Guid.Parse(userId))
                return Forbid();

            // 更新下載計數
            await _reportService.IncrementDownloadCountAsync(reportId, cancellationToken);

            // 返回 Word 文檔
            var fileName = $"{report.ReportTitle}_{DateTime.Now:yyyyMMdd}.docx";
            return File(
                report.WordDocumentBytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                fileName);
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }
}
```

---

## 4️⃣ Service 層實現示例

```csharp
public interface IBaziService
{
    Task<BaziProfile> SaveBaziProfileAsync(
        Guid userId,
        SaveBaziProfileRequest request,
        CancellationToken cancellationToken);

    Task<BaziProfile?> GetBaziProfileAsync(
        Guid userId,
        CancellationToken cancellationToken);
}

public class BaziService : IBaziService
{
    private readonly IRepository<BaziProfile> _repository;
    private readonly ILogger<BaziService> _logger;

    public async Task<BaziProfile> SaveBaziProfileAsync(
        Guid userId,
        SaveBaziProfileRequest request,
        CancellationToken cancellationToken)
    {
        var existing = await _repository.FirstOrDefaultAsync(
            b => b.UserId == userId,
            cancellationToken);

        var profile = existing ?? new BaziProfile { Id = Guid.NewGuid(), UserId = userId };

        profile.BirthYear = request.BirthYear;
        profile.BirthMonth = request.BirthMonth;
        profile.BirthDay = request.BirthDay;
        profile.BirthHour = request.BirthHour;
        profile.BirthMinute = request.BirthMinute;
        profile.BirthPlace = request.BirthPlace;
        profile.Gender = request.Gender;
        profile.BaziJson = request.BaziJson;
        profile.UpdatedAt = DateTime.UtcNow;

        if (existing == null)
            await _repository.AddAsync(profile, cancellationToken);
        else
            await _repository.UpdateAsync(profile, cancellationToken);

        _logger.LogInformation($"Ba Zi profile saved for user {userId}");
        return profile;
    }

    public async Task<BaziProfile?> GetBaziProfileAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        return await _repository.FirstOrDefaultAsync(
            b => b.UserId == userId,
            cancellationToken);
    }
}
```

---

## 5️⃣ 支付工作流程

### 銀行轉帳流程

```
1. 用戶點擊「購買命書」
   ↓
2. 系統生成唯一發票號 (INV-yyyyMMddHHmmss-UUID)
3. 顯示銀行信息 + 發票號給用戶
   ↓
4. 用戶手動轉帳 NT$1,500 到指定帳戶
   備註中寫入發票號
   ↓
5a. 用戶點擊「已完成轉帳」通知系統
   ↓
5b. 或管理員定期檢查銀行進帳
   ↓
6. 管理員在後台確認轉帳
   （匹配發票號）
   ↓
7. 系統自動：
   a) 更新支付狀態為 'confirmed'
   b) 獲取命盤信息
   c) 觸發 AnalysisReportService.GenerateReportAsync()
   d) 保存生成的 Word 文檔到數據庫
   e) 增加用戶點數
   f) 發送郵件通知用戶可下載
   ↓
8. 用戶登入系統，下載命書 Word 文檔
```

### 代碼實現（支付確認邏輯）

```csharp
public class PaymentService : IPaymentService
{
    private readonly IRepository<Payment> _paymentRepository;
    private readonly IRepository<UserPoints> _pointsRepository;
    private readonly IAnalysisReportService _reportService;
    private readonly ILogger<PaymentService> _logger;

    public async Task<Payment> ConfirmPaymentAsync(
        Guid paymentId,
        Guid adminId,
        string? adminNote,
        CancellationToken cancellationToken)
    {
        var payment = await _paymentRepository.GetByIdAsync(paymentId, cancellationToken);
        if (payment == null)
            throw new KeyNotFoundException($"Payment {paymentId} not found");

        // 1. 標記為已確認
        payment.Status = "admin_confirmed";
        payment.AdminConfirmedByUserId = adminId;
        payment.AdminConfirmedAt = DateTime.UtcNow;
        payment.Notes = adminNote;
        payment.UpdatedAt = DateTime.UtcNow;

        await _paymentRepository.UpdateAsync(payment, cancellationToken);

        // 2. 更新諮詢狀態
        var consultation = payment.Consultation;
        if (consultation != null)
        {
            consultation.PaymentStatus = "confirmed";
            consultation.Status = "processing";
            consultation.UpdatedAt = DateTime.UtcNow;
            // await _consultationRepository.UpdateAsync(consultation, cancellationToken);
        }

        _logger.LogInformation($"Payment {paymentId} confirmed by admin {adminId}");
        return payment;
    }

    public async Task<AnalysisReport> GenerateAndSaveReportAsync(
        BaziProfile baziProfile,
        string reportType,
        CancellationToken cancellationToken)
    {
        try
        {
            var startTime = DateTime.UtcNow;

            // 調用您現有的 AnalysisReportService
            var reportBytes = await _reportService.GenerateReportAsync(
                baziProfile.BaziJson,
                new AstrologyRequest
                {
                    Gender = baziProfile.Gender ?? "未知",
                    BirthYear = baziProfile.BirthYear,
                    BirthMonth = baziProfile.BirthMonth,
                    BirthDay = baziProfile.BirthDay,
                    BirthHour = baziProfile.BirthHour,
                    BirthMinute = baziProfile.BirthMinute
                },
                cancellationToken);

            // 計算哈希以檢測重複
            var hash = ComputeSha256(reportBytes);

            var report = new AnalysisReport
            {
                Id = Guid.NewGuid(),
                BaziProfileId = baziProfile.Id,
                ReportType = reportType,
                ReportTitle = $"{baziProfile.Gender} - {baziProfile.BirthYear}年{baziProfile.BirthMonth}月{baziProfile.BirthDay}日命書",
                WordDocumentBytes = reportBytes,
                WordDocumentHash = hash,
                DeliveryStatus = "pending",
                GenerationTimestamp = DateTime.UtcNow,
                GenerationDurationMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds
            };

            await _reportRepository.AddAsync(report, cancellationToken);

            _logger.LogInformation(
                $"Report generated for profile {baziProfile.Id}, size: {reportBytes.Length} bytes");

            return report;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to generate report for profile {baziProfile.Id}");
            throw;
        }
    }

    public async Task AddPointsToUserAsync(
        Guid userId,
        int pointsAmount,
        string description,
        CancellationToken cancellationToken)
    {
        var userPoints = await _pointsRepository.FirstOrDefaultAsync(
            p => p.UserId == userId,
            cancellationToken) ?? new UserPoints { UserId = userId, Balance = 0 };

        userPoints.Balance += pointsAmount;
        userPoints.LastUpdated = DateTime.UtcNow;

        if (userPoints.UserId == Guid.Empty)
            await _pointsRepository.AddAsync(userPoints, cancellationToken);
        else
            await _pointsRepository.UpdateAsync(userPoints, cancellationToken);

        // 紀錄交易
        var transaction = new PointTransaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TransactionType = "purchase",
            PointsAmount = pointsAmount,
            Description = description,
            CreatedAt = DateTime.UtcNow
        };

        // await _transactionRepository.AddAsync(transaction, cancellationToken);

        _logger.LogInformation(
            $"Added {pointsAmount} points to user {userId}. New balance: {userPoints.Balance}");
    }

    private string ComputeSha256(byte[] data)
    {
        using (var sha256 = System.Security.Cryptography.SHA256.Create())
        {
            var hash = sha256.ComputeHash(data);
            return Convert.ToHexString(hash);
        }
    }
}
```

---

## 6️⃣ 前端集成（Next.js）

### 購買命書流程組件

```typescript
// app/bazi/buy-report.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';

export default function BuyReportPage({ baziProfileId }: { baziProfileId: string }) {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [bankInfo, setBankInfo] = useState<any>(null);

  const handleRequestReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/consultations/request-ba-zi-report', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ baziProfileId })
      });

      const data = await response.json();
      if (data.success) {
        setInvoiceNumber(data.invoiceNumber);
        setBankInfo(data.bankInfo);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!invoiceNumber) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">購買命書報告</h2>
        <p className="text-gray-600 mb-6">
          生成您的完整命書分析報告，包含八字和紫微斗數的詳細解讀。
        </p>
        <div className="bg-amber-50 p-4 rounded mb-6">
          <p className="text-lg font-bold text-amber-700">NT$ 1,500</p>
          <p className="text-sm text-gray-600">包含：八字分析 + 紫微宮位詳解</p>
        </div>
        <button
          onClick={handleRequestReport}
          disabled={loading}
          className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? '處理中...' : '取得銀行轉帳信息'}
        </button>
      </div>
    );
  }

  // 顯示銀行信息...
  return (
    <div className="max-w-md mx-auto p-6 bg-blue-50 rounded-lg">
      <h3 className="text-xl font-bold mb-4">銀行轉帳信息</h3>
      <div className="space-y-3 mb-6">
        <div>
          <p className="text-sm text-gray-600">銀行名稱</p>
          <p className="font-mono">{bankInfo.bankName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">帳號</p>
          <p className="font-mono">{bankInfo.accountNumber}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">戶名</p>
          <p>{bankInfo.accountName}</p>
        </div>
        <div className="bg-yellow-100 border border-yellow-400 p-3 rounded">
          <p className="text-sm font-bold">發票號</p>
          <p className="font-mono text-lg">{invoiceNumber}</p>
          <p className="text-xs text-gray-600 mt-2">
            ⚠️ 請在轉帳備註中寫入發票號
          </p>
        </div>
      </div>
      {/* 確認轉帳按鈕... */}
    </div>
  );
}
```

### 命書下載

```typescript
// app/reports/my-reports.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';

export default function MyReportsPage() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const response = await fetch('/api/reports/my-reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setReports(data.data);
      }
      setLoading(false);
    };

    fetchReports();
  }, [token]);

  if (loading) return <div>載入中...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">我的命書報告</h1>

      {reports.length === 0 ? (
        <p className="text-gray-600">您還未購買任何報告</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report: any) => (
            <div key={report.id} className="border p-4 rounded-lg">
              <h3 className="font-bold">{report.reportTitle}</h3>
              <p className="text-sm text-gray-600">
                已下載 {report.downloadCount} 次
              </p>
              <button
                onClick={() => {
                  window.location.href = `/api/reports/download/${report.id}`;
                }}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                下載 Word 文檔
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## ✅ 總結

這個系統連接了您現有的：
- ✅ **前端命盤計算** → JSON 儲存到 PostgreSQL
- ✅ **AnalysisReportService** → 在確認支付後自動觸發
- ✅ **銀行轉帳** → 簡單、實用、無第三方依賴

**下一步實現順序：**
1. 數據庫遷移（上述 SQL schema）
2. EF Core DbContext + Entities
3. Service 層實現
4. API Controllers
5. 前端集成
6. 測試整個工作流

需要我詳細實現任何特定部分嗎？
