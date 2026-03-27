# dotnet-api-architecture.md

此檔案定義 MyWeb 後端 C# .NET 8 API 的完整架構設計、專案結構和實現指南。

---

## 🏗️ 整體架構

```
┌──────────────────────────────────────────┐
│     Next.js 前端應用 (React)              │
│   (http://localhost:3000)                 │
└────────────────┬─────────────────────────┘
                 │ HTTPS/REST
┌────────────────▼─────────────────────────┐
│   C# .NET 8 API (Fly.io)                 │
│   (https://api.myweb.fly.dev)            │
├──────────────────────────────────────────┤
│ ├─ Authentication (JWT)                  │
│ ├─ Authorization (Role-based)            │
│ ├─ API Gateway / Middleware              │
│ └─ Business Logic Services               │
└────────────────┬─────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼──────────────┐  ┌──────▼────────────┐
│  PostgreSQL      │  │  Redis Cache      │
│  (Neon - Fly)    │  │  (內存緩存)        │
└──────────────────┘  └───────────────────┘
```

---

## 📁 專案結構 (推薦 Clean Architecture)

```
MyWeb.Api/
├── src/
│   ├── MyWeb.Api/                          # 主 API 專案
│   │   ├── Program.cs                      # 應用入口和配置
│   │   ├── appsettings.json               # 組態檔案
│   │   ├── appsettings.Production.json    # 生產組態
│   │   │
│   │   ├── Controllers/                    # API 控制器
│   │   │   ├── AuthController.cs
│   │   │   ├── UsersController.cs
│   │   │   ├── ConsultationsController.cs
│   │   │   ├── PaymentsController.cs
│   │   │   ├── PointsController.cs
│   │   │   └── ArticlesController.cs
│   │   │
│   │   ├── Middleware/                     # 中間件
│   │   │   ├── ErrorHandlingMiddleware.cs
│   │   │   ├── JwtMiddleware.cs
│   │   │   └── RateLimitingMiddleware.cs
│   │   │
│   │   ├── Filters/                        # 過濾器
│   │   │   ├── ValidationFilter.cs
│   │   │   └── AuthorizeFilter.cs
│   │   │
│   │   └── Extensions/                     # 擴展方法
│   │       ├── ServiceExtensions.cs
│   │       └── MiddlewareExtensions.cs
│   │
│   ├── MyWeb.Application/                  # 應用層
│   │   ├── Interfaces/
│   │   │   ├── IAuthService.cs
│   │   │   ├── IUserService.cs
│   │   │   ├── IConsultationService.cs
│   │   │   ├── IPaymentService.cs
│   │   │   ├── IPointService.cs
│   │   │   └── IEmailService.cs
│   │   │
│   │   ├── Services/
│   │   │   ├── AuthService.cs
│   │   │   ├── UserService.cs
│   │   │   ├── ConsultationService.cs
│   │   │   ├── PaymentService.cs
│   │   │   ├── PointService.cs
│   │   │   └── EmailService.cs
│   │   │
│   │   ├── DTOs/                         # Data Transfer Objects
│   │   │   ├── Auth/
│   │   │   │   ├── LoginRequest.cs
│   │   │   │   ├── LoginResponse.cs
│   │   │   │   └── RegisterRequest.cs
│   │   │   ├── User/
│   │   │   ├── Consultation/
│   │   │   ├── Payment/
│   │   │   └── Point/
│   │   │
│   │   ├── Mappers/                     # DTO 映射
│   │   │   ├── UserMapper.cs
│   │   │   └── ConsultationMapper.cs
│   │   │
│   │   └── Validators/                  # 驗證邏輯
│   │       ├── LoginRequestValidator.cs
│   │       ├── RegisterRequestValidator.cs
│   │       └── ConsultationValidator.cs
│   │
│   ├── MyWeb.Domain/                      # 領域層 (實體)
│   │   ├── Entities/
│   │   │   ├── User.cs
│   │   │   ├── Consultation.cs
│   │   │   ├── Payment.cs
│   │   │   ├── PointTransaction.cs
│   │   │   ├── Article.cs
│   │   │   └── Membership.cs
│   │   │
│   │   ├── ValueObjects/
│   │   │   ├── Email.cs
│   │   │   ├── Money.cs
│   │   │   └── Points.cs
│   │   │
│   │   └── Constants/
│   │       ├── PaymentConstants.cs
│   │       └── PointConstants.cs
│   │
│   ├── MyWeb.Infrastructure/               # 基礎設施層
│   │   ├── Database/
│   │   │   ├── AppDbContext.cs
│   │   │   ├── Migrations/               # EF Core 遷移
│   │   │   └── Seeding/
│   │   │
│   │   ├── Repositories/                # 資料倉庫
│   │   │   ├── IRepository.cs
│   │   │   ├── Repository.cs
│   │   │   ├── UserRepository.cs
│   │   │   └── ConsultationRepository.cs
│   │   │
│   │   ├── External/                    # 外部服務
│   │   │   ├── Payment/
│   │   │   │   ├── IPaymentProvider.cs
│   │   │   │   ├── BankTransferProvider.cs
│   │   │   │   ├── StripeProvider.cs
│   │   │   │   ├── LinePayProvider.cs
│   │   │   │   └── PayPalProvider.cs
│   │   │   │
│   │   │   ├── Email/
│   │   │   │   ├── IEmailProvider.cs
│   │   │   │   └── SendGridProvider.cs
│   │   │   │
│   │   │   └── Cache/
│   │   │       ├── ICacheService.cs
│   │   │       └── RedisCacheService.cs
│   │   │
│   │   ├── Security/
│   │   │   ├── JwtTokenService.cs
│   │   │   ├── PasswordHasher.cs
│   │   │   └── EncryptionService.cs
│   │   │
│   │   └── Logging/
│   │       └── LoggerService.cs
│   │
│   └── MyWeb.Tests/                        # 測試專案
│       ├── Unit/
│       ├── Integration/
│       └── Fixtures/
│
├── docker-compose.yml                      # 本地開發環境
├── Dockerfile.api                          # API 容器化
├── .github/
│   └── workflows/                          # CI/CD 設定
│       ├── build.yml
│       └── deploy.yml
│
└── README.md
```

---

## 🔧 Program.cs 完整配置

```csharp
using MyWeb.Infrastructure;
using MyWeb.Application;
using MyWeb.Infrastructure.Database;
using MyWeb.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// 日誌配置
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// 1. 資料庫配置
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, b => b.MigrationsAssembly("MyWeb.Infrastructure"))
);

// 2. 快取配置 (Redis)
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

// 3. 認證配置 (JWT)
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var jwtSecret = jwtSettings["Secret"] ?? throw new InvalidOperationException("JWT Secret not found");
var jwtExpiry = int.Parse(jwtSettings["ExpiryMinutes"] ?? "1440");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new()
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// 4. 依賴注入配置
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// 5. 控制器和端點
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 6. Swagger 配置
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "MyWeb API", Version = "v1" });

    // JWT 認證
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] { }
        }
    });
});

// 7. CORS 配置
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// 8. 限流配置
builder.Services.AddRateLimiter(rateLimiterOptions =>
{
    rateLimiterOptions.AddFixedWindowLimiter("fixed", options =>
    {
        options.PermitLimit = 100;
        options.Window = TimeSpan.FromMinutes(1);
    });
});

var app = builder.Build();

// 9. 中間件管道
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// HTTPS 重導向
app.UseHttpsRedirection();

// 限流
app.UseRateLimiter();

// CORS
app.UseCors("AllowFrontend");

// 身份驗證和授權
app.UseAuthentication();
app.UseAuthorization();

// 自訂中間件
app.UseMiddleware<ErrorHandlingMiddleware>();

// 端點對應
app.MapControllers();

// 10. 資料庫遷移
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();
}

app.Run();
```

---

## 💾 資料庫實體設計

### User 實體

```csharp
using System.ComponentModel.DataAnnotations;

namespace MyWeb.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string? Bio { get; set; }

        // 會員信息
        public MembershipType MembershipType { get; set; } = MembershipType.Free;
        public DateTime? MembershipEndDate { get; set; }

        // 點數
        public int PointBalance { get; set; }

        // 諮詢師信息
        public bool IsConsultant { get; set; }
        public string? ConsultantSpecialties { get; set; } // JSON: ["八字", "紫微斗數"]
        public decimal? HourlyRate { get; set; }
        public int ConsultationCount { get; set; }
        public double AverageRating { get; set; }

        // 身份驗證
        public bool EmailConfirmed { get; set; }
        public string? PhoneConfirmed { get; set; }

        // 時間戳
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }

        // 導航屬性
        public ICollection<PointTransaction> PointTransactions { get; set; } = new List<PointTransaction>();
        public ICollection<Consultation> ConsultationsAsUser { get; set; } = new List<Consultation>();
        public ICollection<Consultation> ConsultationsAsConsultant { get; set; } = new List<Consultation>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }

    public enum MembershipType
    {
        Free = 0,
        Basic = 1,        // NT$ 299/月
        Advanced = 2,      // NT$ 699/月
        VIP = 3            // NT$ 1,999/月
    }
}
```

### Consultation 實體

```csharp
namespace MyWeb.Domain.Entities
{
    public class Consultation
    {
        public Guid Id { get; set; }
        public Guid ConsultantId { get; set; }
        public Guid UserId { get; set; }

        public ConsultationType Type { get; set; }  // Text, Voice, Video
        public ConsultationService Service { get; set; }  // 八字, 紫微, 風水 等
        public int PointsUsed { get; set; }

        public ConsultationStatus Status { get; set; }
        public DateTime? ScheduledTime { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int DurationMinutes { get; set; }

        // 內容
        public string UserInput { get; set; } = string.Empty;
        public string? ConsultantResponse { get; set; }
        public string? RecordingUrl { get; set; }

        // 評分
        public int? Rating { get; set; }  // 1-5
        public string? ReviewComment { get; set; }
        public DateTime? ReviewedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // 導航屬性
        public virtual User Consultant { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }

    public enum ConsultationType
    {
        Text = 0,
        Voice = 1,
        Video = 2
    }

    public enum ConsultationService
    {
        BaZi = 0,          // 八字
        ZiWei = 1,         // 紫微斗數
        FengShui = 2,      // 風水
        Marriage = 3,      // 婚配
        Career = 4,        // 事業運
        Other = 5
    }

    public enum ConsultationStatus
    {
        Pending = 0,       // 待排程
        Scheduled = 1,     // 已排程
        Ongoing = 2,       // 進行中
        Completed = 3,     // 已完成
        Cancelled = 4      // 已取消
    }
}
```

### Payment 實體

```csharp
namespace MyWeb.Domain.Entities
{
    public class Payment
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }

        public PaymentType Type { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "TWD";

        public PaymentMethod Method { get; set; }
        public PaymentStatus Status { get; set; }

        // 點數購買
        public int? PointsPurchased { get; set; }
        public int? PointsDiscount { get; set; }

        // 會員訂閱
        public MembershipType? MembershipType { get; set; }
        public int? SubscriptionMonths { get; set; }
        public bool AutoRenew { get; set; }

        // 支付提供商信息
        public string? TransactionId { get; set; }
        public string? PaymentProviderId { get; set; } // Stripe, LinePlay, PayPal 等
        public string? ProviderResponse { get; set; }  // JSON

        // 發票
        public string? InvoiceNumber { get; set; }
        public DateTime? InvoiceIssuedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }

        public virtual User User { get; set; } = null!;
    }

    public enum PaymentType
    {
        PointsPurchase = 0,
        MembershipSubscription = 1,
        CoursePurchase = 2
    }

    public enum PaymentMethod
    {
        BankTransfer = 0,
        CreditCard = 1,      // 透過 Stripe
        LinePay = 2,
        PayPay = 3,
        Alipay = 4
    }

    public enum PaymentStatus
    {
        Pending = 0,
        Processing = 1,
        Completed = 2,
        Failed = 3,
        Refunded = 4
    }
}
```

### PointTransaction 實體

```csharp
namespace MyWeb.Domain.Entities
{
    public class PointTransaction
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }

        public PointTransactionType Type { get; set; }
        public int Amount { get; set; }
        public decimal AmountInTWD { get; set; }

        public Guid? RelatedConsultationId { get; set; }
        public Guid? RelatedPaymentId { get; set; }

        public string Description { get; set; } = string.Empty;
        public DateTime? ExpiryDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual User User { get; set; } = null!;
    }

    public enum PointTransactionType
    {
        Purchase = 0,       // 購買
        Consumption = 1,    // 消費
        Reward = 2,         // 獎勵
        Refund = 3,         // 退款
        Expiry = 4          // 過期
    }
}
```

---

## 🔐 認證和授權實現

### JwtTokenService

```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace MyWeb.Infrastructure.Security
{
    public interface IJwtTokenService
    {
        string GenerateToken(Guid userId, string email, string role);
        ClaimsPrincipal? ValidateToken(string token);
        RefreshTokenResponse RefreshToken(string refreshToken);
    }

    public class JwtTokenService : IJwtTokenService
    {
        private readonly IConfiguration _configuration;

        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(Guid userId, string email, string role)
        {
            var secretKey = _configuration["JwtSettings:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
            var expiryMinutes = int.Parse(_configuration["JwtSettings:ExpiryMinutes"] ?? "1440");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, role),
                new Claim("iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()),
            };

            var token = new JwtSecurityToken(
                issuer: "myweb",
                audience: "myweb-users",
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            var secretKey = _configuration["JwtSettings:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = securityKey,
                    ValidateIssuer = true,
                    ValidIssuer = "myweb",
                    ValidateAudience = true,
                    ValidAudience = "myweb-users",
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return principal;
            }
            catch
            {
                return null;
            }
        }

        public RefreshTokenResponse RefreshToken(string refreshToken)
        {
            // 實現刷新令牌邏輯（存儲在 Redis 中）
            throw new NotImplementedException();
        }
    }

    public class RefreshTokenResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}
```

---

## 📝 依賴注入配置

### ServiceExtensions.cs

```csharp
using MyWeb.Application.Services;
using MyWeb.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace MyWeb.Application
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // 應用層服務
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IConsultationService, ConsultationService>();
            services.AddScoped<IPaymentService, PaymentService>();
            services.AddScoped<IPointService, PointService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IArticleService, ArticleService>();

            // 工具服務
            services.AddScoped<PasswordHasher>();
            services.AddScoped<IJwtTokenService, JwtTokenService>();

            return services;
        }
    }
}
```

### InfrastructureExtensions.cs

```csharp
using MyWeb.Infrastructure.Database;
using MyWeb.Infrastructure.External.Payment;
using MyWeb.Infrastructure.External.Email;
using MyWeb.Infrastructure.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace MyWeb.Infrastructure
{
    public static class InfrastructureExtensions
    {
        public static IServiceCollection AddInfrastructureServices(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // 倉庫
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IConsultationRepository, ConsultationRepository>();
            services.AddScoped<IPaymentRepository, PaymentRepository>();

            // 支付提供商
            services.AddScoped<IPaymentProvider, BankTransferProvider>();
            services.AddScoped<IPaymentProvider, StripeProvider>();
            services.AddScoped<IPaymentProvider, LinePayProvider>();
            services.AddScoped<IPaymentProvider, PayPalProvider>();

            // 郵件服務
            services.AddScoped<IEmailProvider, SendGridProvider>();

            // 快取服務
            services.AddScoped<ICacheService, RedisCacheService>();

            return services;
        }
    }
}
```

---

## 🔌 支付提供商實現

### IPaymentProvider 介面

```csharp
namespace MyWeb.Infrastructure.External.Payment
{
    public interface IPaymentProvider
    {
        PaymentMethodType SupportedMethod { get; }

        /// <summary>
        /// 建立支付請求
        /// </summary>
        Task<PaymentInitiationResult> InitiatePaymentAsync(
            Guid paymentId,
            decimal amount,
            string currency,
            string description,
            string returnUrl,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// 驗證支付結果
        /// </summary>
        Task<PaymentVerificationResult> VerifyPaymentAsync(
            string transactionId,
            string signature,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// 處理 webhook
        /// </summary>
        Task<bool> HandleWebhookAsync(
            string payload,
            string signature,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// 退款
        /// </summary>
        Task<RefundResult> RefundAsync(
            string transactionId,
            decimal amount,
            CancellationToken cancellationToken = default);
    }

    public class PaymentInitiationResult
    {
        public bool Success { get; set; }
        public string? PaymentUrl { get; set; }  // 用戶應被導向的 URL
        public string? TransactionId { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class PaymentVerificationResult
    {
        public bool IsValid { get; set; }
        public decimal Amount { get; set; }
        public DateTime? TransactionTime { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public enum PaymentMethodType
    {
        BankTransfer,
        CreditCard,
        LinePay,
        PayPay,
        Alipay
    }
}
```

### 銀行轉帳實現（第一優先）

```csharp
namespace MyWeb.Infrastructure.External.Payment
{
    public class BankTransferProvider : IPaymentProvider
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<BankTransferProvider> _logger;

        public PaymentMethodType SupportedMethod => PaymentMethodType.BankTransfer;

        public BankTransferProvider(
            IConfiguration configuration,
            ILogger<BankTransferProvider> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<PaymentInitiationResult> InitiatePaymentAsync(
            Guid paymentId,
            decimal amount,
            string currency,
            string description,
            string returnUrl,
            CancellationToken cancellationToken = default)
        {
            // 生成發票號
            var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMddHHmmss}-{paymentId.ToString()[..8].ToUpper()}";

            // 銀行信息（從配置讀取）
            var bankName = _configuration["BankTransfer:BankName"] ?? "Taiwan Bank";
            var accountNumber = _configuration["BankTransfer:AccountNumber"] ?? "123456789";
            var accountName = _configuration["BankTransfer:AccountName"] ?? "MyWeb Inc.";

            // 返回銀行詳情
            var paymentUrl = $"{returnUrl}?method=bank_transfer&invoiceNumber={invoiceNumber}&amount={amount}";

            return await Task.FromResult(new PaymentInitiationResult
            {
                Success = true,
                PaymentUrl = paymentUrl,
                TransactionId = invoiceNumber
            });
        }

        public async Task<PaymentVerificationResult> VerifyPaymentAsync(
            string transactionId,
            string signature,
            CancellationToken cancellationToken = default)
        {
            // 銀行轉帳驗證：檢查是否已收到款項
            // 此處可集成銀行 API 或手動驗證

            // 簡化版本：假設管理員手動確認
            _logger.LogInformation($"Verifying bank transfer: {transactionId}");

            return await Task.FromResult(new PaymentVerificationResult
            {
                IsValid = false, // 需要管理員確認
                ErrorMessage = "Bank transfer requires manual verification"
            });
        }

        public async Task<bool> HandleWebhookAsync(
            string payload,
            string signature,
            CancellationToken cancellationToken = default)
        {
            // 銀行轉帳通常沒有自動 webhook
            // 可能需要定時檢查銀行帳戶
            return await Task.FromResult(false);
        }

        public async Task<RefundResult> RefundAsync(
            string transactionId,
            decimal amount,
            CancellationToken cancellationToken = default)
        {
            // 銀行轉帳退款：需要手動操作或通過銀行 API
            _logger.LogInformation($"Requesting refund for: {transactionId}, Amount: {amount}");

            return await Task.FromResult(new RefundResult
            {
                Success = false,
                ErrorMessage = "Bank transfer refunds require manual processing"
            });
        }
    }

    public class RefundResult
    {
        public bool Success { get; set; }
        public string? RefundTransactionId { get; set; }
        public string? ErrorMessage { get; set; }
    }
}
```

### Stripe 實現（信用卡）

```csharp
using Stripe;

namespace MyWeb.Infrastructure.External.Payment
{
    public class StripeProvider : IPaymentProvider
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<StripeProvider> _logger;

        public PaymentMethodType SupportedMethod => PaymentMethodType.CreditCard;

        public StripeProvider(
            IConfiguration configuration,
            ILogger<StripeProvider> logger)
        {
            _configuration = configuration;
            _logger = logger;

            // 初始化 Stripe
            StripeConfiguration.ApiKey = configuration["Stripe:SecretKey"];
        }

        public async Task<PaymentInitiationResult> InitiatePaymentAsync(
            Guid paymentId,
            decimal amount,
            string currency,
            string description,
            string returnUrl,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var options = new SessionCreateOptions
                {
                    // 改為使用 Checkout Session（推薦）
                    PaymentMethodTypes = new List<string> { "card" },
                    LineItems = new List<SessionLineItemOptions>
                    {
                        new SessionLineItemOptions
                        {
                            PriceData = new SessionLineItemPriceDataOptions
                            {
                                Currency = currency.ToLower(),
                                ProductData = new SessionLineItemPriceDataProductDataOptions
                                {
                                    Name = description,
                                },
                                UnitAmount = (long)(amount * 100), // Stripe 使用最小單位
                            },
                            Quantity = 1,
                        },
                    },
                    Mode = "payment",
                    SuccessUrl = $"{returnUrl}?payment_id={paymentId}&status=success",
                    CancelUrl = $"{returnUrl}?payment_id={paymentId}&status=cancel",
                };

                var service = new SessionService();
                var session = await service.CreateAsync(options, cancellationToken: cancellationToken);

                return new PaymentInitiationResult
                {
                    Success = true,
                    PaymentUrl = session.Url,
                    TransactionId = session.PaymentIntentId
                };
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Stripe payment initiation failed");
                return new PaymentInitiationResult
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        public async Task<PaymentVerificationResult> VerifyPaymentAsync(
            string transactionId,
            string signature,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var service = new PaymentIntentService();
                var paymentIntent = await service.GetAsync(transactionId, cancellationToken: cancellationToken);

                return new PaymentVerificationResult
                {
                    IsValid = paymentIntent.Status == "succeeded",
                    Amount = (decimal)paymentIntent.Amount / 100,
                    TransactionTime = paymentIntent.Created,
                };
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Stripe payment verification failed");
                return new PaymentVerificationResult
                {
                    IsValid = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        public async Task<bool> HandleWebhookAsync(
            string payload,
            string signature,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    payload,
                    signature,
                    _configuration["Stripe:WebhookSecret"]);

                switch (stripeEvent.Type)
                {
                    case Events.PaymentIntentSucceeded:
                        _logger.LogInformation("Payment succeeded");
                        break;
                    case Events.PaymentIntentPaymentFailed:
                        _logger.LogWarning("Payment failed");
                        break;
                }

                return true;
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Stripe webhook handling failed");
                return false;
            }
        }

        public async Task<RefundResult> RefundAsync(
            string transactionId,
            decimal amount,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var options = new RefundCreateOptions
                {
                    PaymentIntent = transactionId,
                    Amount = (long)(amount * 100),
                };

                var service = new RefundService();
                var refund = await service.CreateAsync(options, cancellationToken: cancellationToken);

                return new RefundResult
                {
                    Success = refund.Status == "succeeded",
                    RefundTransactionId = refund.Id
                };
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Stripe refund failed");
                return new RefundResult
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }
    }
}
```

---

## 📋 appsettings.json 配置

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=myweb;Username=postgres;Password=postgres;",
    "Redis": "localhost:6379"
  },
  "JwtSettings": {
    "Secret": "your-very-long-secret-key-min-32-characters-required",
    "ExpiryMinutes": 1440,
    "RefreshTokenExpiryDays": 7
  },
  "AllowedOrigins": [
    "http://localhost:3000",
    "https://localhost:3000",
    "https://myweb.fly.dev"
  ],
  "BankTransfer": {
    "BankName": "Taiwan Bank",
    "AccountNumber": "123456789",
    "AccountName": "MyWeb Inc."
  },
  "Stripe": {
    "PublicKey": "pk_live_xxxx",
    "SecretKey": "sk_live_xxxx",
    "WebhookSecret": "whsec_xxxx"
  },
  "LinePay": {
    "ChannelId": "xxxx",
    "ChannelSecret": "xxxx",
    "IsProduction": false
  },
  "SendGrid": {
    "ApiKey": "SG.xxxx"
  },
  "Serilog": {
    "MinimumLevel": "Information",
    "WriteTo": [
      {
        "Name": "Console"
      },
      {
        "Name": "File",
        "Args": {
          "path": "logs/log-.txt",
          "rollingInterval": "Day"
        }
      }
    ]
  }
}
```

---

## 🐳 Dockerfile 配置

```dockerfile
# 構建階段
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder
WORKDIR /app

# 複製專案檔案
COPY . .

# 還原依賴
RUN dotnet restore

# 發佈
RUN dotnet publish -c Release -o out

# 執行階段
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# 複製構建輸出
COPY --from=builder /app/out .

# 設定環境變數
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# 公開端口
EXPOSE 8080

# 啟動應用
ENTRYPOINT ["dotnet", "MyWeb.Api.dll"]
```

---

## 🚀 本地開發環境 (Docker Compose)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: myweb_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myweb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: myweb_redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: myweb_api
    environment:
      ASPNETCORE_ENVIRONMENT: Development
      ConnectionStrings__DefaultConnection: "Host=postgres;Database=myweb;Username=postgres;Password=postgres;"
      ConnectionStrings__Redis: "redis:6379"
    ports:
      - "5000:5000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./src:/app/src

volumes:
  postgres_data:
```

---

## 🎯 命令和快捷方式

```bash
# 建立新的 EF Core 遷移
dotnet ef migrations add "AddConsultationTable" --project src/MyWeb.Infrastructure

# 應用遷移
dotnet ef database update --project src/MyWeb.Infrastructure

# 運行本地開發
docker-compose up -d
dotnet run --project src/MyWeb.Api

# 執行測試
dotnet test

# 發佈到 Fly.io
fly deploy
```

---

此架構提供：
- ✅ 清晰的關注點分離 (Clean Architecture)
- ✅ 易於測試的依賴注入
- ✅ 多支付提供商支持
- ✅ 可擴展的服務層設計
- ✅ 企業級的日誌和監控
- ✅ 容器化部署就緒
