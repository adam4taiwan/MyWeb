# ba-zi-analysis-service-architecture.md

此檔案定義 MyWeb 命理分析服務的完整架構設計，包含八字、紫微斗數分析和 LLM 整合，支持自動化命書、流年、運勢預測生成。

---

## 📚 命理分析概述

### 核心概念

**八字（Ba Zi / Eight Characters）**
- 由出生年、月、日、時的天干地支組成（8個字）
- 共 10 個天干（甲乙丙丁戊己庚辛壬癸）和 12 個地支（子丑寅卯辰巳午未申酉戌亥）
- 包含：年柱、月柱、日柱、時柱各 2 個字

**紫微斗數（Zi Wei Du Shu）**
- 14 顆主星（紫微、天機、太陽、武曲、天同等）
- 12 個宮位（命、財帛、兄弟、田宅、事業、奴僕、夫妻、子女、財帛、疾厄、遷移、交友）
- 以出生時間推算星盤位置

**核心服務組合**
- 基礎命書：八字和紫微的完整解讀
- 流年運勢：當年的運勢變化（流年天干地支和大限）
- 中期預測：5年、10年運勢規劃
- 終身預測：整體人生運勢和重要節點提示

---

## 🗄️ 數據結構

### Ba Zi JSON 結構（現有格式）

```json
{
  "userId": "user-uuid",
  "birthInfo": {
    "year": 1989,
    "month": 5,
    "day": 15,
    "hour": 14,
    "minute": 30,
    "timezone": "Asia/Taipei",
    "gender": "male",
    "birthPlace": "Taiwan"
  },
  "baZi": {
    "year": { "heavenlyStem": "己", "earthlyBranch": "巳" },
    "month": { "heavenlyStem": "辛", "earthlyBranch": "未" },
    "day": { "heavenlyStem": "戊", "earthlyBranch": "戌" },
    "hour": { "heavenlyStem": "丙", "earthlyBranch": "午" }
  },
  "wuxing": {
    "wood": 2,
    "fire": 1,
    "earth": 2,
    "metal": 1,
    "water": 2
  },
  "lunarDate": {
    "year": 1989,
    "month": 4,
    "day": 18,
    "isLeapMonth": false
  },
  "siZhu": {
    "naYin": ["大林木", "路旁土", "屋上土", "天河水"],
    "analysis": "木火土水俱備之命"
  },
  "ziWei": {
    "fiveElementsScore": {
      "wood": 25,
      "fire": 35,
      "earth": 20,
      "metal": 10,
      "water": 10
    },
    "mainStar": "紫微",
    "secondaryStar": "天府",
    "luckyElements": ["火", "木"],
    "unLuckyElements": ["金"],
    "luckyNumbers": [2, 7],
    "luckyColors": ["紅", "綠"],
    "luckyDirection": "南"
  }
}
```

### PostgreSQL Schema

```sql
-- Ba Zi 基本信息表
CREATE TABLE bazi_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- 出生信息
    birth_year INT NOT NULL,
    birth_month INT NOT NULL,
    birth_day INT NOT NULL,
    birth_hour INT,
    birth_minute INT,
    timezone VARCHAR(50) DEFAULT 'Asia/Taipei',
    gender VARCHAR(10),
    birth_place VARCHAR(255),

    -- 陰曆轉換
    lunar_year INT,
    lunar_month INT,
    lunar_day INT,
    is_leap_month BOOLEAN DEFAULT FALSE,

    -- 八字（天干地支）
    year_stem CHAR(1),      -- 甲乙丙丁戊己庚辛壬癸
    year_branch CHAR(1),    -- 子丑寅卯辰巳午未申酉戌亥
    month_stem CHAR(1),
    month_branch CHAR(1),
    day_stem CHAR(1),
    day_branch CHAR(1),
    hour_stem CHAR(1),
    hour_branch CHAR(1),

    -- 五行統計
    wood_count INT,
    fire_count INT,
    earth_count INT,
    metal_count INT,
    water_count INT,

    -- JSON 儲存完整資訊
    full_data JSONB,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id),
    INDEX idx_user_id (user_id)
);

-- 紫微斗數宮位表
CREATE TABLE ziwei_palaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bazi_profile_id UUID NOT NULL REFERENCES bazi_profiles(id) ON DELETE CASCADE,

    -- 12 宮位
    palace_name VARCHAR(50),  -- 命宮、財帛宮、兄弟宮等
    palace_order INT,         -- 1-12

    -- 主星和副星
    main_star VARCHAR(50),    -- 紫微、天機、太陽等
    secondary_stars TEXT,     -- JSON array of stars

    -- 四化星（化祿、化權、化科、化忌）
    four_transformations JSONB,

    -- 吉凶信息
    good_bad_stars TEXT,      -- JSON array

    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_profile_id (bazi_profile_id),
    UNIQUE(bazi_profile_id, palace_order)
);

-- 分析結果緩存表
CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bazi_profile_id UUID NOT NULL REFERENCES bazi_profiles(id) ON DELETE CASCADE,

    -- 分析類型
    analysis_type VARCHAR(50),  -- 'basic', 'annual', '5year', '10year', 'lifetime'
    analysis_year INT,          -- 針對特定年份（可選）

    -- Analysis 結果
    title VARCHAR(255),
    content TEXT,              -- Markdown format
    key_points JSONB,          -- Array of key points

    -- LLM 生成信息
    llm_model VARCHAR(50),     -- 'gpt-4', 'claude-3', etc.
    llm_tokens_used INT,
    prompt_version INT,        -- For tracking prompt changes

    -- Cache control
    is_cached BOOLEAN DEFAULT FALSE,
    cache_hit_count INT DEFAULT 0,

    -- 用戶反饋
    user_rating SMALLINT,      -- 1-5 stars
    user_feedback TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,      -- For annual analysis, expires Dec 31st

    INDEX idx_profile_id (bazi_profile_id),
    INDEX idx_analysis_type (analysis_type),
    INDEX idx_created_at (created_at)
);

-- Forecast 結果表
CREATE TABLE forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_result_id UUID REFERENCES analysis_results(id),
    bazi_profile_id UUID NOT NULL REFERENCES bazi_profiles(id) ON DELETE CASCADE,

    -- 預測信息
    forecast_type VARCHAR(50),  -- 'monthly', 'annual', '5year', '10year', 'lifetime'
    forecast_year INT NOT NULL,
    forecast_month INT,        -- 1-12, NULL for yearly

    -- 預測內容
    summary TEXT,              -- 簡要預測
    detailed_forecast TEXT,    -- 詳細預測
    key_dates JSONB,           -- 重要日期和事件

    -- 避忌信息
    lucky_info JSONB,          -- 幸運方向、顏色、數字等
    unlucky_info JSONB,        -- 避忌信息

    -- 運勢指標
    overall_luck_score SMALLINT,      -- 0-100
    career_luck_score SMALLINT,
    wealth_luck_score SMALLINT,
    relationship_luck_score SMALLINT,
    health_luck_score SMALLINT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_profile_id (bazi_profile_id),
    INDEX idx_forecast_year (forecast_year)
);

-- 諮詢 Ba Zi 分析的關聯表
CREATE TABLE consultation_bazi_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    bazi_profile_id UUID NOT NULL REFERENCES bazi_profiles(id) ON DELETE CASCADE,
    analysis_result_id UUID NOT NULL REFERENCES analysis_results(id),

    -- 在諮詢中使用的具體内容
    selected_analysis_types TEXT,  -- JSON array: 'basic', 'annual', etc.

    -- 諮詢師注記
    consultant_notes TEXT,

    -- 是否包含在點數消費中
    points_included INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_consultation_id (consultation_id),
    INDEX idx_profile_id (bazi_profile_id)
);
```

---

## 🏗️ C# 領域實體

### Ba Zi 實體

```csharp
namespace MyWeb.Domain.Entities
{
    public class BaZiProfile
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }

        // 出生信息
        public int BirthYear { get; set; }
        public int BirthMonth { get; set; }
        public int BirthDay { get; set; }
        public int? BirthHour { get; set; }
        public int? BirthMinute { get; set; }
        public string Timezone { get; set; } = "Asia/Taipei";
        public string? Gender { get; set; }
        public string? BirthPlace { get; set; }

        // 陰曆日期
        public int? LunarYear { get; set; }
        public int? LunarMonth { get; set; }
        public int? LunarDay { get; set; }
        public bool IsLeapMonth { get; set; }

        // 八字（天干地支）
        public string YearStem { get; set; } = string.Empty;
        public string YearBranch { get; set; } = string.Empty;
        public string MonthStem { get; set; } = string.Empty;
        public string MonthBranch { get; set; } = string.Empty;
        public string DayStem { get; set; } = string.Empty;
        public string DayBranch { get; set; } = string.Empty;
        public string? HourStem { get; set; }
        public string? HourBranch { get; set; }

        // 五行
        public int WoodCount { get; set; }
        public int FireCount { get; set; }
        public int EarthCount { get; set; }
        public int MetalCount { get; set; }
        public int WaterCount { get; set; }

        // 完整 JSON 數據存儲
        public string? FullData { get; set; } // JSON string

        // 導航
        public virtual User User { get; set; } = null!;
        public virtual ICollection<ZiWeiPalace> ZiWeiPalaces { get; set; } = new List<ZiWeiPalace>();
        public virtual ICollection<AnalysisResult> AnalysisResults { get; set; } = new List<AnalysisResult>();
        public virtual ICollection<Forecast> Forecasts { get; set; } = new List<Forecast>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public enum HeavenlyStem
    {
        甲, 乙, 丙, 丁, 戊, 己, 庚, 辛, 壬, 癸
    }

    public enum EarthlyBranch
    {
        子, 丑, 寅, 卯, 辰, 巳, 午, 未, 申, 酉, 戌, 亥
    }
}
```

### Zi Wei Palace 實體

```csharp
namespace MyWeb.Domain.Entities
{
    public class ZiWeiPalace
    {
        public Guid Id { get; set; }
        public Guid BaZiProfileId { get; set; }

        // 宮位信息
        public string PalaceName { get; set; } = string.Empty;  // 命宮、財帛宮
        public int PalaceOrder { get; set; }  // 1-12

        // 星曜
        public string? MainStar { get; set; }  // 紫微、天機等
        public string? SecondaryStars { get; set; }  // JSON array

        // 四化星
        public string? FourTransformations { get; set; }  // JSON: {化祿, 化權, 化科, 化忌}

        // 吉凶
        public string? GoodBadStars { get; set; }  // JSON array

        // 導航
        public virtual BaZiProfile BaZiProfile { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    // Zi Wei 主星定義
    public enum ZiWeiMainStar
    {
        紫微, 天機, 太陽, 武曲, 天同, 廉貞, 天府, 太陰,
        貪狼, 巨門, 天相, 天梁, 七殺, 破軍
    }
}
```

### Analysis Result 實體

```csharp
namespace MyWeb.Domain.Entities
{
    public class AnalysisResult
    {
        public Guid Id { get; set; }
        public Guid BaZiProfileId { get; set; }

        // 分析類型
        public AnalysisType Type { get; set; }
        public int? AnalysisYear { get; set; }  // For annual forecasts

        // 結果內容
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;  // Markdown
        public string? KeyPoints { get; set; }  // JSON array

        // LLM 信息
        public string? LlmModel { get; set; }
        public int LlmTokensUsed { get; set; }
        public int PromptVersion { get; set; } = 1;

        // 緩存信息
        public bool IsCached { get; set; }
        public int CacheHitCount { get; set; }

        // 用戶反饋
        public int? UserRating { get; set; }  // 1-5 stars
        public string? UserFeedback { get; set; }

        // 時間戳
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ExpiresAt { get; set; }  // For cache expiry

        // 導航
        public virtual BaZiProfile BaZiProfile { get; set; } = null!;
        public virtual ICollection<Forecast> Forecasts { get; set; } = new List<Forecast>();
        public virtual ICollection<ConsultationBaZiAnalysis> ConsultationAnalyses { get; set; }
            = new List<ConsultationBaZiAnalysis>();
    }

    public enum AnalysisType
    {
        Basic,          // 基礎命書
        Annual,         // 流年
        FiveYear,       // 五年
        TenYear,        // 十年
        Lifetime        // 終身
    }
}
```

### Forecast 實體

```csharp
namespace MyWeb.Domain.Entities
{
    public class Forecast
    {
        public Guid Id { get; set; }
        public Guid? AnalysisResultId { get; set; }
        public Guid BaZiProfileId { get; set; }

        // 預測信息
        public ForecastType Type { get; set; }
        public int ForecastYear { get; set; }
        public int? ForecastMonth { get; set; }  // 1-12

        // 內容
        public string? Summary { get; set; }
        public string? DetailedForecast { get; set; }
        public string? KeyDates { get; set; }  // JSON

        // 運勢指標
        public int OverallLuckScore { get; set; }  // 0-100
        public int CareerLuckScore { get; set; }
        public int WealthLuckScore { get; set; }
        public int RelationshipLuckScore { get; set; }
        public int HealthLuckScore { get; set; }

        // 幸運/避忌信息
        public string? LuckyInfo { get; set; }  // JSON
        public string? UnluckyInfo { get; set; }  // JSON

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // 導航
        public virtual BaZiProfile BaZiProfile { get; set; } = null!;
        public virtual AnalysisResult? AnalysisResult { get; set; }
    }

    public enum ForecastType
    {
        Monthly,    // 月運勢
        Annual,     // 年運勢
        FiveYear,   // 五年運勢
        TenYear,    // 十年運勢
        Lifetime    // 終身運勢
    }
}
```

### Consultation Ba Zi Analysis 關聯實體

```csharp
namespace MyWeb.Domain.Entities
{
    public class ConsultationBaZiAnalysis
    {
        public Guid Id { get; set; }
        public Guid ConsultationId { get; set; }
        public Guid BaZiProfileId { get; set; }
        public Guid AnalysisResultId { get; set; }

        // 在此次諮詢中使用的分析類型
        public string? SelectedAnalysisTypes { get; set; }  // JSON array

        // 諮詢師注記
        public string? ConsultantNotes { get; set; }

        // 點數消費
        public int PointsIncluded { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // 導航
        public virtual Consultation Consultation { get; set; } = null!;
        public virtual BaZiProfile BaZiProfile { get; set; } = null!;
        public virtual AnalysisResult AnalysisResult { get; set; } = null!;
    }
}
```

---

## 🔧 服務架構

### Ba Zi 分析服務介面

```csharp
namespace MyWeb.Application.Interfaces
{
    public interface IBaZiAnalysisService
    {
        /// <summary>
        /// 導入或創建用戶的 Ba Zi 命盤
        /// </summary>
        Task<BaZiProfileDto> CreateBaZiProfileAsync(
            Guid userId,
            CreateBaZiProfileRequest request,
            CancellationToken cancellationToken);

        /// <summary>
        /// 獲取用戶的 Ba Zi 命盤
        /// </summary>
        Task<BaZiProfileDto?> GetBaZiProfileAsync(
            Guid userId,
            CancellationToken cancellationToken);

        /// <summary>
        /// 生成基礎命書（八字 + 紫微合論）
        /// </summary>
        Task<AnalysisResultDto> GenerateBasicAnalysisAsync(
            Guid bazi ProfileId,
            CancellationToken cancellationToken);

        /// <summary>
        /// 生成流年運勢預測
        /// </summary>
        Task<ForecastDto> GenerateAnnualForecastAsync(
            Guid baziProfileId,
            int forecastYear,
            CancellationToken cancellationToken);

        /// <summary>
        /// 生成多年期預測（5年、10年、終身）
        /// </summary>
        Task<ForecastDto> GenerateMultiYearForecastAsync(
            Guid baziProfileId,
            ForecastType forecastType,
            CancellationToken cancellationToken);

        /// <summary>
        /// 計算 Ba Zi 五行強弱
        /// </summary>
        Task<WuXingBalanceDto> CalculateWuXingBalanceAsync(
            Guid baziProfileId,
            CancellationToken cancellationToken);

        /// <summary>
        /// 獲取用戶已生成的所有分析
        /// </summary>
        Task<List<AnalysisResultDto>> GetUserAnalysesAsync(
            Guid userId,
            CancellationToken cancellationToken);
    }

    // DTOs
    public class CreateBaZiProfileRequest
    {
        public int BirthYear { get; set; }
        public int BirthMonth { get; set; }
        public int BirthDay { get; set; }
        public int? BirthHour { get; set; }
        public int? BirthMinute { get; set; }
        public string Timezone { get; set; } = "Asia/Taipei";
        public string? Gender { get; set; }
        public string? BirthPlace { get; set; }
        // ... JSON from existing ba zi data
    }

    public class BaZiProfileDto
    {
        public Guid Id { get; set; }
        public int BirthYear { get; set; }
        public int BirthMonth { get; set; }
        public int BirthDay { get; set; }
        public string YearStem { get; set; }
        public string YearBranch { get; set; }
        public string MonthStem { get; set; }
        public string MonthBranch { get; set; }
        public string DayStem { get; set; }
        public string DayBranch { get; set; }
        public string? HourStem { get; set; }
        public string? HourBranch { get; set; }

        // 五行統計
        public int WoodCount { get; set; }
        public int FireCount { get; set; }
        public int EarthCount { get; set; }
        public int MetalCount { get; set; }
        public int WaterCount { get; set; }
    }

    public class AnalysisResultDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }  // Markdown
        public AnalysisType Type { get; set; }
        public List<string>? KeyPoints { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ForecastDto
    {
        public Guid Id { get; set; }
        public ForecastType Type { get; set; }
        public int ForecastYear { get; set; }
        public int? ForecastMonth { get; set; }
        public string? Summary { get; set; }
        public string? DetailedForecast { get; set; }

        // 運勢評分（0-100）
        public int OverallLuckScore { get; set; }
        public int CareerLuckScore { get; set; }
        public int WealthLuckScore { get; set; }
        public int RelationshipLuckScore { get; set; }
        public int HealthLuckScore { get; set; }

        public LuckyInfoDto? LuckyInfo { get; set; }
        public UnluckyInfoDto? UnluckyInfo { get; set; }
    }

    public class LuckyInfoDto
    {
        public List<string> LuckyDirections { get; set; } = new();
        public List<string> LuckyColors { get; set; } = new();
        public List<int> LuckyNumbers { get; set; } = new();
        public string? LuckyMonth { get; set; }
    }

    public class UnluckyInfoDto
    {
        public List<string> UnluckyDirections { get; set; } = new();
        public List<string> UnluckyColors { get; set; } = new();
        public List<string> UnluckyActivities { get; set; } = new();
    }

    public class WuXingBalanceDto
    {
        public int WoodCount { get; set; }
        public int FireCount { get; set; }
        public int EarthCount { get; set; }
        public int MetalCount { get; set; }
        public int WaterCount { get; set; }

        // 補救建議
        public string StrongestElement { get; set; }
        public string WeakestElement { get; set; }
        public List<string> BalancingSuggestions { get; set; } = new();
    }
}
```

### Ba Zi 分析服務實現

```csharp
namespace MyWeb.Application.Services
{
    public class BaZiAnalysisService : IBaZiAnalysisService
    {
        private readonly IRepository<BaZiProfile> _baziRepository;
        private readonly IRepository<AnalysisResult> _analysisRepository;
        private readonly IRepository<Forecast> _forecastRepository;
        private readonly ILlmIntegrationService _llmService;
        private readonly ICacheService _cacheService;
        private readonly ILogger<BaZiAnalysisService> _logger;

        public BaZiAnalysisService(
            IRepository<BaZiProfile> baziRepository,
            IRepository<AnalysisResult> analysisRepository,
            IRepository<Forecast> forecastRepository,
            ILlmIntegrationService llmService,
            ICacheService cacheService,
            ILogger<BaZiAnalysisService> logger)
        {
            _baziRepository = baziRepository;
            _analysisRepository = analysisRepository;
            _forecastRepository = forecastRepository;
            _llmService = llmService;
            _cacheService = cacheService;
            _logger = logger;
        }

        public async Task<BaZiProfileDto> CreateBaZiProfileAsync(
            Guid userId,
            CreateBaZiProfileRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                // 檢查是否已存在
                var existing = await _baziRepository.FirstOrDefaultAsync(
                    b => b.UserId == userId,
                    cancellationToken);

                if (existing != null)
                {
                    throw new InvalidOperationException("User already has a Ba Zi profile");
                }

                // 計算農曆日期
                var (lunarYear, lunarMonth, lunarDay, isLeap) =
                    CalculateLunarDate(request.BirthYear, request.BirthMonth, request.BirthDay);

                // 計算天干地支
                var (yearStem, yearBranch) = GetStemBranch(request.BirthYear);
                var (monthStem, monthBranch) = GetStemBranch(request.BirthYear, request.BirthMonth);
                var (dayStem, dayBranch) = GetStemBranch(request.BirthYear, request.BirthMonth, request.BirthDay);
                var (hourStem, hourBranch) = GetStemBranch(
                    request.BirthYear,
                    request.BirthMonth,
                    request.BirthDay,
                    request.BirthHour);

                // 計算五行
                var (wood, fire, earth, metal, water) =
                    CalculateWuXing(yearStem, monthStem, dayStem, hourStem);

                // 建立 Ba Zi Profile
                var profile = new BaZiProfile
                {
                    UserId = userId,
                    BirthYear = request.BirthYear,
                    BirthMonth = request.BirthMonth,
                    BirthDay = request.BirthDay,
                    BirthHour = request.BirthHour,
                    BirthMinute = request.BirthMinute,
                    Timezone = request.Timezone,
                    Gender = request.Gender,
                    BirthPlace = request.BirthPlace,

                    LunarYear = lunarYear,
                    LunarMonth = lunarMonth,
                    LunarDay = lunarDay,
                    IsLeapMonth = isLeap,

                    YearStem = yearStem,
                    YearBranch = yearBranch,
                    MonthStem = monthStem,
                    MonthBranch = monthBranch,
                    DayStem = dayStem,
                    DayBranch = dayBranch,
                    HourStem = hourStem,
                    HourBranch = hourBranch,

                    WoodCount = wood,
                    FireCount = fire,
                    EarthCount = earth,
                    MetalCount = metal,
                    WaterCount = water,

                    FullData = JsonSerializer.Serialize(request)
                };

                await _baziRepository.AddAsync(profile, cancellationToken);

                _logger.LogInformation($"Ba Zi profile created for user {userId}");

                return MapToDto(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Ba Zi profile");
                throw;
            }
        }

        public async Task<AnalysisResultDto> GenerateBasicAnalysisAsync(
            Guid baziProfileId,
            CancellationToken cancellationToken)
        {
            try
            {
                // 檢查緩存
                var cacheKey = $"bazi_analysis_basic_{baziProfileId}";
                var cached = await _cacheService.GetAsync<AnalysisResult>(cacheKey, cancellationToken);

                if (cached != null)
                {
                    _logger.LogInformation($"Ba Zi basic analysis cache hit for {baziProfileId}");
                    cached.IsCached = true;
                    cached.CacheHitCount++;
                    return MapToDto(cached);
                }

                // 獲取 Ba Zi 命盤
                var profile = await _baziRepository.GetByIdAsync(baziProfileId, cancellationToken);
                if (profile == null)
                    throw new InvalidOperationException("Ba Zi profile not found");

                // 生成 Prompt
                var prompt = GenerateBasicAnalysisPrompt(profile);

                // 調用 LLM
                var llmResponse = await _llmService.GenerateAnalysisAsync(
                    prompt,
                    "basic_analysis",
                    cancellationToken);

                // 解析響應
                var (title, content, keyPoints) = ParseLlmResponse(llmResponse);

                // 儲存分析結果
                var analysis = new AnalysisResult
                {
                    BaZiProfileId = baziProfileId,
                    Type = AnalysisType.Basic,
                    Title = title,
                    Content = content,
                    KeyPoints = JsonSerializer.Serialize(keyPoints),
                    LlmModel = "gpt-4-turbo",
                    LlmTokensUsed = llmResponse.TokensUsed,
                    PromptVersion = 1
                };

                await _analysisRepository.AddAsync(analysis, cancellationToken);

                // 緩存結果（基礎分析無時限）
                await _cacheService.SetAsync(
                    cacheKey,
                    analysis,
                    TimeSpan.FromDays(365),
                    cancellationToken);

                _logger.LogInformation($"Basic analysis generated for Ba Zi profile {baziProfileId}");

                return MapToDto(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating basic analysis");
                throw;
            }
        }

        public async Task<ForecastDto> GenerateAnnualForecastAsync(
            Guid baziProfileId,
            int forecastYear,
            CancellationToken cancellationToken)
        {
            try
            {
                // 檢查緩存
                var cacheKey = $"bazi_forecast_annual_{baziProfileId}_{forecastYear}";
                var cached = await _cacheService.GetAsync<Forecast>(cacheKey, cancellationToken);

                if (cached != null)
                {
                    _logger.LogInformation($"Annual forecast cache hit for {baziProfileId}/{forecastYear}");
                    return MapToDto(cached);
                }

                // 獲取 Ba Zi 命盤
                var profile = await _baziRepository.GetByIdAsync(baziProfileId, cancellationToken);
                if (profile == null)
                    throw new InvalidOperationException("Ba Zi profile not found");

                // 獲取流年天干地支
                var (lunarStem, lunarBranch) = GetStemBranch(forecastYear);

                // 計算大限（10年一個大限）
                var majorPeriod = CalculateMajorPeriod(profile.DayStem, forecastYear);

                // 生成 Prompt
                var prompt = GenerateAnnualForecastPrompt(profile, forecastYear, lunarStem, lunarBranch, majorPeriod);

                // 調用 LLM
                var llmResponse = await _llmService.GenerateAnalysisAsync(
                    prompt,
                    "annual_forecast",
                    cancellationToken);

                // 解析響應
                var (summary, detailed, keyDates, luckyInfo, unluckyInfo, scores) =
                    ParseAnnualForecastResponse(llmResponse);

                // 儲存 Forecast
                var forecast = new Forecast
                {
                    BaZiProfileId = baziProfileId,
                    Type = ForecastType.Annual,
                    ForecastYear = forecastYear,
                    Summary = summary,
                    DetailedForecast = detailed,
                    KeyDates = JsonSerializer.Serialize(keyDates),
                    LuckyInfo = JsonSerializer.Serialize(luckyInfo),
                    UnluckyInfo = JsonSerializer.Serialize(unluckyInfo),
                    OverallLuckScore = scores.Overall,
                    CareerLuckScore = scores.Career,
                    WealthLuckScore = scores.Wealth,
                    RelationshipLuckScore = scores.Relationship,
                    HealthLuckScore = scores.Health
                };

                await _forecastRepository.AddAsync(forecast, cancellationToken);

                // 緩存結果到該年年底
                var cacheExpiry = new DateTime(forecastYear, 12, 31) - DateTime.Now;
                if (cacheExpiry.TotalSeconds > 0)
                {
                    await _cacheService.SetAsync(
                        cacheKey,
                        forecast,
                        cacheExpiry,
                        cancellationToken);
                }

                _logger.LogInformation($"Annual forecast generated for {baziProfileId}/{forecastYear}");

                return MapToDto(forecast);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating annual forecast");
                throw;
            }
        }

        public async Task<ForecastDto> GenerateMultiYearForecastAsync(
            Guid baziProfileId,
            ForecastType forecastType,
            CancellationToken cancellationToken)
        {
            var startYear = DateTime.Now.Year;

            return forecastType switch
            {
                ForecastType.FiveYear => await GenerateMultiYearForecastInternalAsync(
                    baziProfileId, startYear, startYear + 5, forecastType, cancellationToken),
                ForecastType.TenYear => await GenerateMultiYearForecastInternalAsync(
                    baziProfileId, startYear, startYear + 10, forecastType, cancellationToken),
                ForecastType.Lifetime => await GenerateLifetimeForecastAsync(
                    baziProfileId, cancellationToken),
                _ => throw new InvalidOperationException("Invalid forecast type")
            };
        }

        private async Task<ForecastDto> GenerateMultiYearForecastInternalAsync(
            Guid baziProfileId,
            int startYear,
            int endYear,
            ForecastType forecastType,
            CancellationToken cancellationToken)
        {
            try
            {
                var profile = await _baziRepository.GetByIdAsync(baziProfileId, cancellationToken);
                if (profile == null)
                    throw new InvalidOperationException("Ba Zi profile not found");

                // 生成 Prompt 涵蓋多年期
                var prompt = forecastType == ForecastType.FiveYear
                    ? GenerateFiveYearForecastPrompt(profile, startYear)
                    : GenerateTenYearForecastPrompt(profile, startYear);

                var llmResponse = await _llmService.GenerateAnalysisAsync(
                    prompt,
                    "multi_year_forecast",
                    cancellationToken);

                var (summary, detailed, keyDates, luckyInfo, unluckyInfo, scores) =
                    ParseAnnualForecastResponse(llmResponse);

                var forecast = new Forecast
                {
                    BaZiProfileId = baziProfileId,
                    Type = forecastType,
                    ForecastYear = startYear,
                    Summary = summary,
                    DetailedForecast = detailed,
                    KeyDates = JsonSerializer.Serialize(keyDates),
                    LuckyInfo = JsonSerializer.Serialize(luckyInfo),
                    UnluckyInfo = JsonSerializer.Serialize(unluckyInfo),
                    OverallLuckScore = scores.Overall,
                    CareerLuckScore = scores.Career,
                    WealthLuckScore = scores.Wealth,
                    RelationshipLuckScore = scores.Relationship,
                    HealthLuckScore = scores.Health
                };

                await _forecastRepository.AddAsync(forecast, cancellationToken);

                return MapToDto(forecast);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating multi-year forecast");
                throw;
            }
        }

        public async Task<WuXingBalanceDto> CalculateWuXingBalanceAsync(
            Guid baziProfileId,
            CancellationToken cancellationToken)
        {
            var profile = await _baziRepository.GetByIdAsync(baziProfileId, cancellationToken);
            if (profile == null)
                throw new InvalidOperationException("Ba Zi profile not found");

            var (strongest, weakest, suggestions) = AnalyzeWuXingBalance(
                profile.WoodCount,
                profile.FireCount,
                profile.EarthCount,
                profile.MetalCount,
                profile.WaterCount);

            return new WuXingBalanceDto
            {
                WoodCount = profile.WoodCount,
                FireCount = profile.FireCount,
                EarthCount = profile.EarthCount,
                MetalCount = profile.MetalCount,
                WaterCount = profile.WaterCount,
                StrongestElement = strongest,
                WeakestElement = weakest,
                BalancingSuggestions = suggestions
            };
        }

        // Helper methods (天干地支計算、五行計算等)
        private (string stem, string branch) GetStemBranch(int year)
        {
            var heavenlyStems = new[] { "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸" };
            var earthlyBranches = new[] { "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥" };

            var stemIndex = (year - 4) % 10;
            var branchIndex = (year - 4) % 12;

            return (heavenlyStems[stemIndex], earthlyBranches[branchIndex]);
        }

        private (string stem, string branch) GetStemBranch(int year, int month)
        {
            // 月份天干地支（基於日天干推算）
            // 此處簡化，實際應根據節氣計算
            var monthBranches = new[] { "", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑" };

            var (yearStem, _) = GetStemBranch(year);
            var heavenlyStems = new[] { "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸" };
            var yearStemIndex = Array.IndexOf(heavenlyStems, yearStem);

            // 月份天干 = 年天干 × 2 + 月份規律
            var monthStemIndex = (yearStemIndex * 2 + month - 1) % 10;

            return (heavenlyStems[monthStemIndex], monthBranches[month]);
        }

        private (string stem, string branch) GetStemBranch(int year, int month, int day)
        {
            // 日天干地支計算（基於尋周期性規律）
            var earthlyBranches = new[] { "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥" };
            var heavenlyStems = new[] { "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸" };

            // 簡化計算（實際應使用萬年曆演算法）
            var totalDays = CalculateTotalDays(year, month, day);
            var stemIndex = totalDays % 10;
            var branchIndex = totalDays % 12;

            return (heavenlyStems[stemIndex], earthlyBranches[branchIndex]);
        }

        private (string stem, string branch) GetStemBranch(int year, int month, int day, int? hour)
        {
            if (!hour.HasValue || hour < 0 || hour > 23)
                return ("", "");

            // 時柱地支（每2小時一個地支）
            var hourBranches = new[] { "子", "丑", "丑", "寅", "寅", "卯", "卯", "辰", "辰", "巳", "巳", "午", "午", "未", "未", "申", "申", "酉", "酉", "戌", "戌", "亥", "亥", "子" };
            var branch = hourBranches[hour.Value];

            // 時柱天干（基於日天干）
            var (dayStem, _) = GetStemBranch(year, month, day);
            var heavenlyStems = new[] { "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸" };
            var dayStemIndex = Array.IndexOf(heavenlyStems, dayStem);

            // 時天干 = 日天干 × 2 + 時辰規律
            var hourStemIndex = (dayStemIndex * 2 + (hour.Value / 2)) % 10;
            var stem = heavenlyStems[hourStemIndex];

            return (stem, branch);
        }

        private (int wood, int fire, int earth, int metal, int water) CalculateWuXing(
            string yearStem, string monthStem, string dayStem, string? hourStem)
        {
            var wuxingMap = new Dictionary<string, int[]>
            {
                { "甲", new[] { 1, 0, 0, 0, 0 } },  // 甲 = 木
                { "乙", new[] { 1, 0, 0, 0, 0 } },  // 乙 = 木
                { "丙", new[] { 0, 1, 0, 0, 0 } },  // 丙 = 火
                { "丁", new[] { 0, 1, 0, 0, 0 } },  // 丁 = 火
                { "戊", new[] { 0, 0, 1, 0, 0 } },  // 戊 = 土
                { "己", new[] { 0, 0, 1, 0, 0 } },  // 己 = 土
                { "庚", new[] { 0, 0, 0, 1, 0 } },  // 庚 = 金
                { "辛", new[] { 0, 0, 0, 1, 0 } },  // 辛 = 金
                { "壬", new[] { 0, 0, 0, 0, 1 } },  // 壬 = 水
                { "癸", new[] { 0, 0, 0, 0, 1 } }   // 癸 = 水
            };

            var branchWuxingMap = new Dictionary<string, int[]>
            {
                { "子", new[] { 0, 0, 0, 0, 1 } },
                { "丑", new[] { 0, 0, 1, 1, 0 } },
                { "寅", new[] { 1, 1, 0, 0, 0 } },
                { "卯", new[] { 1, 0, 0, 0, 0 } },
                { "辰", new[] { 0, 0, 1, 0, 0 } },
                { "巳", new[] { 0, 1, 0, 0, 0 } },
                { "午", new[] { 0, 1, 0, 0, 0 } },
                { "未", new[] { 0, 0, 1, 0, 0 } },
                { "申", new[] { 0, 0, 0, 1, 0 } },
                { "酉", new[] { 0, 0, 0, 1, 0 } },
                { "戌", new[] { 0, 0, 1, 0, 0 } },
                { "亥", new[] { 0, 0, 0, 0, 1 } }
            };

            var totals = new[] { 0, 0, 0, 0, 0 };

            // 累加天干五行
            foreach (var stem in new[] { yearStem, monthStem, dayStem, hourStem }.Where(s => !string.IsNullOrEmpty(s)))
            {
                if (wuxingMap.TryGetValue(stem, out var values))
                {
                    for (int i = 0; i < 5; i++)
                        totals[i] += values[i];
                }
            }

            // 簡化：每個四柱地支各计1
            // 實際應按納音五行更細緻計算

            return (totals[0], totals[1], totals[2], totals[3], totals[4]);
        }

        private (int lunar_year, int lunar_month, int lunar_day, bool is_leap) CalculateLunarDate(
            int year, int month, int day)
        {
            // 調用農曆轉換庫（如使用第三方庫 LunarCalendar）
            // 此處簡化，實際應使用完整演算法
            return (year, month, day, false);
        }

        private int CalculateTotalDays(int year, int month, int day)
        {
            // 計算從某個基准日期到該日期的總天數
            var baseDate = new DateTime(1900, 1, 1);
            var targetDate = new DateTime(year, month, day);
            return (int)(targetDate - baseDate).TotalDays;
        }

        private (string strongest, string weakest, List<string> suggestions) AnalyzeWuXingBalance(
            int wood, int fire, int earth, int metal, int water)
        {
            var wuxingCounts = new Dictionary<string, int>
            {
                { "木", wood },
                { "火", fire },
                { "土", earth },
                { "金", metal },
                { "水", water }
            };

            var strongest = wuxingCounts.OrderByDescending(x => x.Value).First().Key;
            var weakest = wuxingCounts.OrderBy(x => x.Value).First().Key;

            var suggestions = GenerateWuXingBalancingSuggestions(strongest, weakest);

            return (strongest, weakest, suggestions);
        }

        private List<string> GenerateWuXingBalancingSuggestions(string strongest, string weakest)
        {
            // 返回平衡建議（改善衣著顏色、居住方向、職業等）
            return new List<string>
            {
                $"增強{weakest}元素：穿著與{weakest}相關的顏色",
                $"居住在有利於{weakest}的方向",
                $"選擇與{weakest}相關的職業",
                $"避免過度增強{strongest}元素"
            };
        }

        private string GenerateBasicAnalysisPrompt(BaZiProfile profile)
        {
            return $@"
你是一位資深的命理師，具備 30 年的八字和紫微斗數分析經驗。

請根據以下八字信息，提供完整的命盤分析：

出生日期：{profile.BirthYear}年{profile.BirthMonth}月{profile.BirthDay}日{profile.BirthHour}時{profile.BirthMinute}分
八字：{profile.YearStem}{profile.YearBranch} {profile.MonthStem}{profile.MonthBranch} {profile.DayStem}{profile.DayBranch} {profile.HourStem}{profile.HourBranch}

五行強弱：
- 木：{profile.WoodCount} 個
- 火：{profile.FireCount} 個
- 土：{profile.EarthCount} 個
- 金：{profile.MetalCount} 個
- 水：{profile.WaterCount} 個

請提供以下內容的詳細分析：
1. 人格特質和性格描述
2. 命運走勢（大致分為三個階段）
3. 職業適合度和發展方向
4. 財富運勢和理財建議
5. 婚姻感情和人際關係
6. 健康狀況和養生建議
7. 吉祥方向、顏色和幸運數字
8. 本命宮和事業宮的具體解讀

請以親切但專業的語氣撰寫分析，內容應該是鼓勵性的，同時提供實際的建議。
";
        }

        private string GenerateAnnualForecastPrompt(
            BaZiProfile profile,
            int forecastYear,
            string lunarStem,
            string lunarBranch,
            string majorPeriod)
        {
            return $@"
作為經驗豐富的命理師，請根據以下信息提供 {forecastYear} 年的詳細運勢預測：

個人八字：{profile.YearStem}{profile.YearBranch} {profile.MonthStem}{profile.MonthBranch} {profile.DayStem}{profile.DayBranch} {profile.HourStem}{profile.HourBranch}
預測年份：{forecastYear} 年（流年：{lunarStem}{lunarBranch}）
當前大限：{majorPeriod}

請提供以下方面的詳細分析，並給出具體的幸運指引：：
1. 整體運勢評估（1-100 分）
2. 事業運勢（具體月份的高低點）
3. 財運分析（收入、投資、消費建議）
4. 感情運勢（單身、已婚等不同情況）
5. 人際關係（貴人、小人提示）
6. 健康狀況（應注意的時期）
7. 幸運方向、顏色和吉祥數字
8. 重要日期和需要避免的時段
9. 改運建議（如何趨吉避凶）

用戶信息：{profile.Gender} | {profile.BirthPlace}

請以列點方式清晰地組織內容，確保信息易於理解和應用。
";
        }

        private string GenerateFiveYearForecastPrompt(BaZiProfile profile, int startYear)
        {
            return $@"
請根據以下八字信息，提供從 {startYear} 到 {startYear + 5} 年的 5 年運勢預測：

八字：{profile.YearStem}{profile.YearBranch} {profile.MonthStem}{profile.MonthBranch} {profile.DayStem}{profile.DayBranch}

主要分析維度：
1. 整體大趨勢
2. 年年度重點事項
3. 事業發展軌跡
4. 財運變化週期
5. 感情和家庭
6. 健康提醒

請提供一份結構清晰的 5 年運勢指南。
";
        }

        private string GenerateTenYearForecastPrompt(BaZiProfile profile, int startYear)
        {
            return $@"
請根據以下八字信息，提供從 {startYear} 到 {startYear + 10} 年的 10 年大運勢分析：

八字：{profile.YearStem}{profile.YearBranch} {profile.MonthStem}{profile.MonthBranch} {profile.DayStem}{profile.DayBranch}

分析重點：
1. 此 10 年週期的整體格局
2. 事業和財富的主要發展階段
3. 人生轉折點的預示
4. 長期規劃建議
5. 大限交界處的特殊關注

請提供一份有深度的 10 年運勢藍圖。
";
        }

        private async Task<ForecastDto> GenerateLifetimeForecastAsync(
            Guid baziProfileId,
            CancellationToken cancellationToken)
        {
            var profile = await _baziRepository.GetByIdAsync(baziProfileId, cancellationToken);
            if (profile == null)
                throw new InvalidOperationException("Ba Zi profile not found");

            var prompt = $@"
請根據以下八字，提供一份終身的命運預測和人生指引：

八字：{profile.YearStem}{profile.YearBranch} {profile.MonthStem}{profile.MonthBranch} {profile.DayStem}{profile.DayBranch} {profile.HourStem}{profile.HourBranch}

請分析：
1. 人生各階段的主要特徵（童年、青年、中年、晚年）
2. 命運的總體走勢圖
3. 人生中的關鍵轉折點
4. 最終的成就和貢獻方向
5. 整體建議和修養建議

請以鼓勵和啟發的方式撰寫這份終身指引。
";

            var llmResponse = await _llmService.GenerateAnalysisAsync(
                prompt,
                "lifetime_forecast",
                cancellationToken);

            var (summary, detailed, keyDates, luckyInfo, unluckyInfo, scores) =
                ParseAnnualForecastResponse(llmResponse);

            var forecast = new Forecast
            {
                BaZiProfileId = baziProfileId,
                Type = ForecastType.Lifetime,
                ForecastYear = DateTime.Now.Year,
                Summary = summary,
                DetailedForecast = detailed,
                KeyDates = JsonSerializer.Serialize(keyDates),
                LuckyInfo = JsonSerializer.Serialize(luckyInfo),
                UnluckyInfo = JsonSerializer.Serialize(unluckyInfo),
                OverallLuckScore = scores.Overall,
                CareerLuckScore = scores.Career,
                WealthLuckScore = scores.Wealth,
                RelationshipLuckScore = scores.Relationship,
                HealthLuckScore = scores.Health
            };

            await _forecastRepository.AddAsync(forecast, cancellationToken);

            return MapToDto(forecast);
        }

        private (string title, string content, List<string> keyPoints) ParseLlmResponse(
            LlmGenerationResponse response)
        {
            // 解析 LLM 響應
            // 假設格式為 Markdown
            var lines = response.Content.Split('\n');

            var title = lines.FirstOrDefault(l => l.StartsWith("#"))?.TrimStart('#').Trim()
                ?? "命盤分析";
            var content = response.Content;
            var keyPoints = ExtractKeyPoints(content);

            return (title, content, keyPoints);
        }

        private (string summary, string detailed, List<string> keyDates,
            LuckyInfoDto luckyInfo, UnluckyInfoDto unluckyInfo, LuckScoresDto scores)
            ParseAnnualForecastResponse(LlmGenerationResponse response)
        {
            // 解析年度預測響應
            var contentSections = response.Content.Split(new[] { "##" }, StringSplitOptions.RemoveEmptyEntries);

            var summary = contentSections.Length > 0 ? contentSections[0].Trim() : "";
            var detailed = response.Content;
            var keyDates = ExtractKeyDates(detailed);

            var luckyInfo = new LuckyInfoDto
            {
                LuckyDirections = ExtractLuckyDirections(detailed),
                LuckyColors = ExtractLuckyColors(detailed),
                LuckyNumbers = ExtractLuckyNumbers(detailed)
            };

            var unluckyInfo = new UnluckyInfoDto
            {
                UnluckyDirections = ExtractUnluckyDirections(detailed),
                UnluckyColors = ExtractUnluckyColors(detailed),
                UnluckyActivities = ExtractUnluckyActivities(detailed)
            };

            var scores = ExtractLuckScores(detailed);

            return (summary, detailed, keyDates, luckyInfo, unluckyInfo, scores);
        }

        private List<string> ExtractKeyPoints(string content)
        {
            var points = new List<string>();
            var lines = content.Split('\n');

            foreach (var line in lines.Where(l => l.StartsWith("- ")))
            {
                points.Add(line.Substring(2).Trim());
            }

            return points;
        }

        private List<string> ExtractKeyDates(string content)
        {
            var dates = new List<string>();
            var regex = new Regex(@"(\d{1,2}月\d{1,2}日|[一二三四五六七八九十月])");

            foreach (Match match in regex.Matches(content))
            {
                dates.Add(match.Value);
            }

            return dates.Distinct().ToList();
        }

        private List<string> ExtractLuckyDirections(string content)
        {
            // 簡化實現，實際應使用更精確的提取
            var directions = new[] { "東", "南", "西", "北", "東北", "東南", "西北", "西南" };
            return directions.Where(d => content.Contains(d)).ToList();
        }

        private List<string> ExtractLuckyColors(string content)
        {
            var colors = new[] { "紅", "綠", "黃", "青", "藍", "紫", "白", "黑" };
            return colors.Where(c => content.Contains(c)).ToList();
        }

        private List<int> ExtractLuckyNumbers(string content)
        {
            var numbers = new List<int>();
            var regex = new Regex(@"\d+");

            foreach (Match match in regex.Matches(content))
            {
                if (int.TryParse(match.Value, out var num) && num >= 0 && num <= 99)
                {
                    numbers.Add(num);
                }
            }

            return numbers.Distinct().ToList();
        }

        private List<string> ExtractUnluckyDirections(string content)
        {
            // 類似幸運方向的提取邏輯
            return new List<string>();
        }

        private List<string> ExtractUnluckyColors(string content)
        {
            return new List<string>();
        }

        private List<string> ExtractUnluckyActivities(string content)
        {
            return new List<string>();
        }

        private LuckScoresDto ExtractLuckScores(string content)
        {
            // 從內容中提取運勢評分
            return new LuckScoresDto
            {
                Overall = 70,
                Career = 75,
                Wealth = 65,
                Relationship = 70,
                Health = 75
            };
        }

        private string CalculateMajorPeriod(string dayStem, int year)
        {
            // 計算大限（10年一個大限）
            // 簡化實現
            return "未知";
        }

        private BaZiProfileDto MapToDto(BaZiProfile profile)
        {
            return new BaZiProfileDto
            {
                Id = profile.Id,
                BirthYear = profile.BirthYear,
                BirthMonth = profile.BirthMonth,
                BirthDay = profile.BirthDay,
                YearStem = profile.YearStem,
                YearBranch = profile.YearBranch,
                MonthStem = profile.MonthStem,
                MonthBranch = profile.MonthBranch,
                DayStem = profile.DayStem,
                DayBranch = profile.DayBranch,
                HourStem = profile.HourStem ?? "",
                HourBranch = profile.HourBranch ?? "",
                WoodCount = profile.WoodCount,
                FireCount = profile.FireCount,
                EarthCount = profile.EarthCount,
                MetalCount = profile.MetalCount,
                WaterCount = profile.WaterCount
            };
        }

        private AnalysisResultDto MapToDto(AnalysisResult analysis)
        {
            var keyPoints = string.IsNullOrEmpty(analysis.KeyPoints)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(analysis.KeyPoints) ?? new List<string>();

            return new AnalysisResultDto
            {
                Id = analysis.Id,
                Title = analysis.Title,
                Content = analysis.Content,
                Type = analysis.Type,
                KeyPoints = keyPoints,
                CreatedAt = analysis.CreatedAt
            };
        }

        private ForecastDto MapToDto(Forecast forecast)
        {
            var luckyInfo = string.IsNullOrEmpty(forecast.LuckyInfo)
                ? null
                : JsonSerializer.Deserialize<LuckyInfoDto>(forecast.LuckyInfo);

            var unluckyInfo = string.IsNullOrEmpty(forecast.UnluckyInfo)
                ? null
                : JsonSerializer.Deserialize<UnluckyInfoDto>(forecast.UnluckyInfo);

            return new ForecastDto
            {
                Id = forecast.Id,
                Type = forecast.Type,
                ForecastYear = forecast.ForecastYear,
                ForecastMonth = forecast.ForecastMonth,
                Summary = forecast.Summary,
                DetailedForecast = forecast.DetailedForecast,
                OverallLuckScore = forecast.OverallLuckScore,
                CareerLuckScore = forecast.CareerLuckScore,
                WealthLuckScore = forecast.WealthLuckScore,
                RelationshipLuckScore = forecast.RelationshipLuckScore,
                HealthLuckScore = forecast.HealthLuckScore,
                LuckyInfo = luckyInfo,
                UnluckyInfo = unluckyInfo
            };
        }
    }

    public class LlmGenerationResponse
    {
        public string Content { get; set; } = string.Empty;
        public int TokensUsed { get; set; }
    }

    public class LuckScoresDto
    {
        public int Overall { get; set; }
        public int Career { get; set; }
        public int Wealth { get; set; }
        public int Relationship { get; set; }
        public int Health { get; set; }
    }
}
```

---

## 🤖 LLM 整合服務

### 介面定義

```csharp
namespace MyWeb.Application.Interfaces
{
    public interface ILlmIntegrationService
    {
        /// <summary>
        /// 生成命理分析
        /// </summary>
        Task<LlmGenerationResponse> GenerateAnalysisAsync(
            string prompt,
            string analysisType,
            CancellationToken cancellationToken);

        /// <summary>
        /// 緩存檢查（避免重複調用昂貴的 API）
        /// </summary>
        Task<string?> GetCachedAnalysisAsync(
            string promptHash,
            CancellationToken cancellationToken);

        /// <summary>
        /// 評估響應品質
        /// </summary>
        Task<bool> IsResponseQualityAcceptableAsync(
            string response,
            CancellationToken cancellationToken);
    }
}
```

### OpenAI/Claude 實現

```csharp
namespace MyWeb.Infrastructure.External.Llm
{
    public class OpenAiLlmService : ILlmIntegrationService
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly ICacheService _cacheService;
        private readonly ILogger<OpenAiLlmService> _logger;

        private const string OpenAiApi = "https://api.openai.com/v1/chat/completions";

        public OpenAiLlmService(
            IConfiguration configuration,
            HttpClient httpClient,
            ICacheService cacheService,
            ILogger<OpenAiLlmService> logger)
        {
            _configuration = configuration;
            _httpClient = httpClient;
            _cacheService = cacheService;
            _logger = logger;

            var apiKey = _configuration["OpenAI:ApiKey"];
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", apiKey);
        }

        public async Task<LlmGenerationResponse> GenerateAnalysisAsync(
            string prompt,
            string analysisType,
            CancellationToken cancellationToken)
        {
            try
            {
                // 計算 Prompt 哈希用於緩存檢查
                var promptHash = ComputeHash(prompt);

                // 檢查緩存
                var cached = await GetCachedAnalysisAsync(promptHash, cancellationToken);
                if (cached != null)
                {
                    _logger.LogInformation($"LLM analysis cache hit for {analysisType}");
                    return new LlmGenerationResponse { Content = cached };
                }

                // 構建請求
                var request = new OpenAiChatRequest
                {
                    Model = "gpt-4-turbo",
                    Messages = new[]
                    {
                        new { role = "system", content = GetSystemPrompt(analysisType) },
                        new { role = "user", content = prompt }
                    },
                    Temperature = 0.7,
                    MaxTokens = 2000,
                    TopP = 0.9
                };

                var requestJson = JsonSerializer.Serialize(request);
                var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

                // 調用 OpenAI API
                var response = await _httpClient.PostAsync(
                    OpenAiApi,
                    content,
                    cancellationToken);

                response.EnsureSuccessStatusCode();

                var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
                var openAiResponse = JsonSerializer.Deserialize<OpenAiChatResponse>(responseJson);

                if (openAiResponse?.Choices == null || openAiResponse.Choices.Count == 0)
                    throw new InvalidOperationException("OpenAI returned empty response");

                var analysisContent = openAiResponse.Choices[0].Message.Content;
                var tokensUsed = openAiResponse.Usage?.TotalTokens ?? 0;

                // 驗證響應品質
                if (!await IsResponseQualityAcceptableAsync(analysisContent, cancellationToken))
                {
                    _logger.LogWarning($"Low quality LLM response detected for {analysisType}");
                    // 可以重試或提示用戶
                }

                // 緩存結果
                await _cacheService.SetAsync(
                    $"llm_cache_{promptHash}",
                    analysisContent,
                    TimeSpan.FromDays(30),
                    cancellationToken);

                _logger.LogInformation($"LLM analysis generated for {analysisType}, tokens used: {tokensUsed}");

                return new LlmGenerationResponse
                {
                    Content = analysisContent,
                    TokensUsed = tokensUsed
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating LLM analysis for {analysisType}");
                throw;
            }
        }

        public async Task<string?> GetCachedAnalysisAsync(
            string promptHash,
            CancellationToken cancellationToken)
        {
            return await _cacheService.GetAsync<string>(
                $"llm_cache_{promptHash}",
                cancellationToken);
        }

        public async Task<bool> IsResponseQualityAcceptableAsync(
            string response,
            CancellationToken cancellationToken)
        {
            // 檢查響應長度
            if (response.Length < 200)
                return false;

            // 檢查是否包含必要的關鍵字
            var requiredKeywords = new[] { "分析", "運勢", "建議", "宮", "星", "五行" };
            var keywordCount = requiredKeywords.Count(kw => response.Contains(kw));

            return keywordCount >= 3;  // 至少3个关键词
        }

        private string GetSystemPrompt(string analysisType)
        {
            return analysisType switch
            {
                "basic_analysis" => @"
你是一位資深的命理師，具有 30 年的八字和紫微斗數分析經驗。
你的分析應該：
1. 專業但易於理解
2. 提供實際而有建設性的建議
3. 使用傳統命理術語，但解釋清楚
4. 鼓勵且積極，但不失實事求是
5. 格式清晰，使用 markdown 排版
",
                "annual_forecast" => @"
你是一位經驗豐富的命理分析師。
提供年度預測時，請：
1. 分析整體運勢趨勢（高峰和低谷時期）
2. 提供具體的月份指引
3. 識別關鍵的轉折日期
4. 提供明確的建議和改運方法
5. 評估各個生活領域的運勢
",
                "multi_year_forecast" => @"
你是一位具有深厚經驗的命理專家。
在提供多年期預測時，請：
1. 描繪整個時期的大趨勢
2. 清晰地識別不同階段的特徵
3. 預測可能的轉折點和關鍵年份
4. 提供長期的戰略性建議
5. 強調主要的要點
",
                _ => @"
你是一位資深的命理師。
請提供準確、實用且積極的命理分析。
"
            };
        }

        private string ComputeHash(string text)
        {
            using (var sha = System.Security.Cryptography.SHA256.Create())
            {
                var hash = sha.ComputeHash(Encoding.UTF8.GetBytes(text));
                return Convert.ToBase64String(hash);
            }
        }
    }

    public class OpenAiChatRequest
    {
        [JsonPropertyName("model")]
        public string Model { get; set; }

        [JsonPropertyName("messages")]
        public object[] Messages { get; set; }

        [JsonPropertyName("temperature")]
        public double Temperature { get; set; }

        [JsonPropertyName("max_tokens")]
        public int MaxTokens { get; set; }

        [JsonPropertyName("top_p")]
        public double TopP { get; set; }
    }

    public class OpenAiChatResponse
    {
        [JsonPropertyName("choices")]
        public List<Choice> Choices { get; set; } = new();

        [JsonPropertyName("usage")]
        public Usage? Usage { get; set; }
    }

    public class Choice
    {
        [JsonPropertyName("message")]
        public Message Message { get; set; }
    }

    public class Message
    {
        [JsonPropertyName("content")]
        public string Content { get; set; }
    }

    public class Usage
    {
        [JsonPropertyName("total_tokens")]
        public int TotalTokens { get; set; }
    }
}
```

---

## 🔌 API 端點

### Controllers

```csharp
namespace MyWeb.Api.Controllers
{
    [ApiController]
    [Route("api/bazi")]
    [Authorize]
    public class BaZiAnalysisController : ControllerBase
    {
        private readonly IBaZiAnalysisService _baziService;
        private readonly IMapper _mapper;

        [HttpPost("profile")]
        public async Task<IActionResult> CreateBaZiProfile(
            [FromBody] CreateBaZiProfileRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var profile = await _baziService.CreateBaZiProfileAsync(
                    Guid.Parse(userId),
                    request,
                    cancellationToken);

                return Ok(new { success = true, data = profile });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetBaZiProfile(CancellationToken cancellationToken)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var profile = await _baziService.GetBaZiProfileAsync(
                Guid.Parse(userId),
                cancellationToken);

            if (profile == null)
                return NotFound(new { success = false, error = "Ba Zi profile not found" });

            return Ok(new { success = true, data = profile });
        }

        [HttpPost("{baziProfileId}/analysis/basic")]
        public async Task<IActionResult> GenerateBasicAnalysis(
            Guid baziProfileId,
            CancellationToken cancellationToken)
        {
            try
            {
                var analysis = await _baziService.GenerateBasicAnalysisAsync(
                    baziProfileId,
                    cancellationToken);

                return Ok(new { success = true, data = analysis });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpPost("{baziProfileId}/forecast/annual/{year}")]
        public async Task<IActionResult> GenerateAnnualForecast(
            Guid baziProfileId,
            int year,
            CancellationToken cancellationToken)
        {
            try
            {
                var forecast = await _baziService.GenerateAnnualForecastAsync(
                    baziProfileId,
                    year,
                    cancellationToken);

                return Ok(new { success = true, data = forecast });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpPost("{baziProfileId}/forecast/5year")]
        public async Task<IActionResult> GenerateFiveYearForecast(
            Guid baziProfileId,
            CancellationToken cancellationToken)
        {
            var forecast = await _baziService.GenerateMultiYearForecastAsync(
                baziProfileId,
                ForecastType.FiveYear,
                cancellationToken);

            return Ok(new { success = true, data = forecast });
        }

        [HttpPost("{baziProfileId}/forecast/10year")]
        public async Task<IActionResult> GenerateTenYearForecast(
            Guid baziProfileId,
            CancellationToken cancellationToken)
        {
            var forecast = await _baziService.GenerateMultiYearForecastAsync(
                baziProfileId,
                ForecastType.TenYear,
                cancellationToken);

            return Ok(new { success = true, data = forecast });
        }

        [HttpPost("{baziProfileId}/forecast/lifetime")]
        public async Task<IActionResult> GenerateLifetimeForecast(
            Guid baziProfileId,
            CancellationToken cancellationToken)
        {
            var forecast = await _baziService.GenerateMultiYearForecastAsync(
                baziProfileId,
                ForecastType.Lifetime,
                cancellationToken);

            return Ok(new { success = true, data = forecast });
        }

        [HttpGet("{baziProfileId}/wuxing-balance")]
        public async Task<IActionResult> GetWuXingBalance(
            Guid baziProfileId,
            CancellationToken cancellationToken)
        {
            var balance = await _baziService.CalculateWuXingBalanceAsync(
                baziProfileId,
                cancellationToken);

            return Ok(new { success = true, data = balance });
        }

        [HttpGet("analyses")]
        public async Task<IActionResult> GetUserAnalyses(CancellationToken cancellationToken)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var analyses = await _baziService.GetUserAnalysesAsync(
                Guid.Parse(userId),
                cancellationToken);

            return Ok(new { success = true, data = analyses });
        }
    }
}
```

---

## 📋 實現檢查清單（Phase 1）

- [ ] PostgreSQL Schema 創建和遷移
- [ ] Ba Zi Profile 實體和 Repository
- [ ] ZiWei Palace 實體存儲（可選，Phase 2 優化）
- [ ] Analysis Result 實體和 Repository
- [ ] Forecast 實體和 Repository
- [ ] IBaZiAnalysisService 介面
- [ ] BaZiAnalysisService 實現（基礎版）
- [ ] ILlmIntegrationService 介面
- [ ] OpenAiLlmService 實現
- [ ] BaZiAnalysisController API 端點
- [ ] Frontend 上傳 Ba Zi 命盤組件
- [ ] Frontend 顯示分析結果頁面
- [ ] Frontend 顯示運勢預測頁面
- [ ] 集成到諮詢預約流程（使用 Ba Zi 分析）
- [ ] 單位測試（關鍵服務）
- [ ] 集成測試（API 端點）

---

## 🚀 后续优化（Phase 2+）

1. **更精確的天干地支計算**
   - 使用完整的農曆轉換算法
   - 納音五行詳細計算

2. **紫微斗數整合**
   - 完整的 14 主星位置計算
   - 12 宮位詳細分析
   - 四化星推導

3. **用戶反饋循環**
   - 評分和反饋收集
   - LLM Prompt 優化
   - 分析結果改進

4. **性能優化**
   - 批量分析生成
   - LLM 調用優化（成本控制）
   - 緩存策略完善

5. **報告生成**
   - PDF 報告自動生成
   - 個性化報告模板
   - 印刷版本優化

---

此架構為您的核心競爭力提供了完整的技術基礎。LLM 與傳統命理的結合，配合 PostgreSQL 的結構化存儲，可以創造獨特的用戶體驗。
