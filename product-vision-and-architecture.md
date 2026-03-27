# product-vision-and-architecture.md

此檔案定義 MyWeb 命理諮詢平台的完整產品願景、商業模式和技術架構。

---

## 🎯 產品願景

### 使命
將個人30年的命理經驗數字化，透過線上平台幫助需要的客人獲得專業的命理諮詢服務，建立可持續的、高性價比的諮詢生態。

### 核心價值
- **專業性** - 基於30年深厚的命理經驗
- **可及性** - 24/7 線上服務，打破地理限制
- **多樣性** - 文章、互動、諮詢、教學多元內容
- **可持續性** - 清晰的商業模式確保長期發展

---

## 💼 商業模式

### 收入來源

```
┌─────────────────────────────────────────┐
│         MyWeb 命理諮詢平台               │
├─────────────────────────────────────────┤
├─ 1. 點數服務 (70%)                      │
│   ├─ 一對一諮詢 (40%)                   │
│   ├─ 線上課程 (15%)                     │
│   ├─ 專業報告生成 (10%)                 │
│   └─ 優質文章訂閱 (5%)                  │
├─ 2. 會員訂閱 (20%)                      │
│   ├─ 基礎會員 (8%)                      │
│   ├─ 進階會員 (8%)                      │
│   └─ VIP 會員 (4%)                      │
├─ 3. 廣告和聯盟 (10%)                    │
│   ├─ 命理用品推薦                       │
│   └─ 品牌合作                          │
└─────────────────────────────────────────┘
```

### 定價策略

#### 點數系統

```
┌──────────────────────────────────────┐
│         點數套餐規劃                   │
├──────────────────────────────────────┤
│ 套餐 A: 500 點   NT$ 1,500  (優惠 0%)  │
│ 套餐 B: 1,200 點 NT$ 3,300  (優惠 10%) │
│ 套餐 C: 3,000 點 NT$ 8,700  (優惠 15%) │
│ 套餐 D: 5,000 點 NT$ 14,000 (優惠 20%) │
├──────────────────────────────────────┤
│ 有效期：1 年
│ 有效期前 30 天可續費保留到期點數
│ 平台費率：1 點 = NT$ 3 (基準價格)
└──────────────────────────────────────┘
```

#### 服務扣點表

| 服務類型 | 扣點 | 時長 | 說明 |
|---------|------|------|------|
| **文字諮詢** | 50 點 | 24h 回覆 | 簡短建議 |
| **語音諮詢** | 200 點 | 15 分鐘 | 即時語音 |
| **視訊諮詢** | 300 點 | 15 分鐘 | 高清視訊 |
| **深度分析** | 500 點 | 咨詢 + 報告 | 完整八字/紫微分析 |
| **線上課程** | 100-300 點 | 依課程 | 預錄或直播 |
| **優質文章** | 30 點 | 永久閱讀 | 獨家內容 |

#### 會員訂閱方案

| 方案 | 月費 | 功能 | 點數額度 |
|------|------|------|---------|
| **基礎會員** | NT$ 299 | 基本功能 | 每月 50 點 |
| **進階會員** | NT$ 699 | 優先排隊 | 每月 150 點 |
| **VIP 會員** | NT$ 1,999 | 專屬通道 | 每月 500 點 + 優惠 |

---

## 🏗️ 平台架構

### 系統組件

```
┌─────────────────────────────────────────────────────┐
│                  客戶端層                            │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │  網頁應用 (Next.js)    │    行動應用 (React Native) │ │
│ └─────────────────────────────────────────────────┘ │
└──────────────────────┬────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────┐
│              API 閘道層 (API Gateway)             │
├───────────────────────────────────────────────────┤
│ 認證 (OAuth/JWT) │ 限流 │ 日誌 │ 監控           │
└──────────────────────┬────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────┐
│              業務邏輯層 (Services)                │
├───────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐ ┌─────────────┐│
│ │ 認證服務      │  │ 點數管理      │ │ 諮詢管理    ││
│ │              │  │              │ │             ││
│ │ 用戶管理      │  │ 訂單生成      │ │ 排程管理    ││
│ │ 個人資料      │  │ 支付處理      │ │ 評價管理    ││
│ └──────────────┘  └──────────────┘ └─────────────┘│
│ ┌──────────────┐  ┌──────────────┐ ┌─────────────┐│
│ │ 內容管理      │  │ 通知服務      │ │ 分析服務    ││
│ │              │  │              │ │             ││
│ │ 文章發佈      │  │ 郵件/短信     │ │ 數據分析    ││
│ │ 課程管理      │  │ 推送通知      │ │ 報表生成    ││
│ └──────────────┘  └──────────────┘ └─────────────┘│
└──────────────────────┬────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────┐
│              數據存儲層 (Data Layer)              │
├───────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌──────────────┐ ┌──────────────┐│
│ │ PostgreSQL  │ │ Redis Cache  │ │ MongoDB      ││
│ │ (用戶、訂單)  │ │ (會話、緩存)  │ │ (文章、日誌) ││
│ └─────────────┘ └──────────────┘ └──────────────┘│
│ ┌─────────────┐ ┌──────────────┐                 │
│ │  S3 儲存    │ │ Elasticsearch│                 │
│ │ (圖片、文件) │ │ (全文搜尋)    │                 │
│ └─────────────┘ └──────────────┘                 │
└───────────────────────────────────────────────────┘
```

### 第三方集成

```
┌──────────────────────────────────────┐
│         支付網關集成                   │
├──────────────────────────────────────┤
│ ├─ Visa / Mastercard (Stripe)       │
│ ├─ PayPay                           │
│ ├─ LINE Pay                         │
│ ├─ 綠界金流 (台灣在地)              │
│ └─ ApplePay / GooglePay             │
│                                      │
│         通知服務                      │
├──────────────────────────────────────┤
│ ├─ SendGrid (郵件)                  │
│ ├─ Twilio (短信)                    │
│ └─ Firebase (推送)                  │
│                                      │
│         其他服務                      │
├──────────────────────────────────────┤
│ ├─ AWS S3 (檔案儲存)                │
│ ├─ Cloudflare (CDN)                 │
│ ├─ Sentry (錯誤追蹤)                │
│ ├─ Datadog (監控)                   │
│ └─ Analytics (數據分析)              │
└──────────────────────────────────────┘
```

---

## 📱 核心功能模塊

### 1. 用戶管理模塊

```typescript
interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: 'member' | 'consultant' | 'admin';
  profile: {
    avatar: string;
    bio: string;
    birthDate: Date;
    consultationHistory: string[];
  };
  membership: {
    type: 'free' | 'basic' | 'advanced' | 'vip';
    startDate: Date;
    endDate: Date;
  };
  points: {
    balance: number;
    history: PointTransaction[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. 點數系統模塊

```typescript
interface PointTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'consumption' | 'reward' | 'refund' | 'expiry';
  amount: number;
  amount_in_rmb: number;
  orderId?: string;
  description: string;
  expiryDate?: Date;
  createdAt: Date;
}

interface PointPlan {
  id: string;
  name: string; // 套餐 A, B, C, D
  points: number;
  price: number; // 台幣
  discount: number; // 折扣百分比
  validity: number; // 天數
  description: string;
}
```

### 3. 諮詢管理模塊

```typescript
interface Consultation {
  id: string;
  consultantId: string;
  userId: string;
  type: 'text' | 'voice' | 'video';
  service: '八字' | '紫微斗數' | '風水' | '婚配' | '事業運' | '其他';
  pointsUsed: number;
  status: 'pending' | 'ongoing' | 'completed' | 'cancelled';
  scheduledTime?: Date;
  duration: number; // 分鐘
  content: {
    userInput: string;
    consultantNotes: string;
    recording?: string; // 視訊/語音 URL
  };
  rating?: {
    score: number; // 1-5
    comment: string;
    createdAt: Date;
  };
  createdAt: Date;
  completedAt?: Date;
}
```

### 4. 支付模塊

```typescript
interface Order {
  id: string;
  userId: string;
  orderType: 'point_purchase' | 'membership_subscription' | 'course_purchase';
  amount: number; // 台幣
  currency: 'TWD' | 'JPY' | 'CNY';
  paymentMethod: 'credit_card' | 'paypay' | 'linepay' | 'unionpay';
  status: 'pending' | 'completed' | 'failed' | 'refunded';

  // 點數購買特定
  pointsPlan?: {
    planId: string;
    points: number;
    discount: number;
  };

  // 會員訂閱特定
  subscription?: {
    type: string;
    period: 'monthly' | 'quarterly' | 'yearly';
    autoRenew: boolean;
  };

  transactionId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
  expiryDate?: Date;
}
```

### 5. 內容管理模塊

```typescript
interface Article {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  category: '八字入門' | '紫微斗數' | '風水知識' | '案例分享' | '命理百科';
  content: string; // Markdown
  featured: boolean;
  isPaid: boolean;
  pointsRequired?: number;
  thumbnail: string;
  views: number;
  likes: number;
  comments: Comment[];
  tags: string[];
  estimatedReadTime: number; // 分鐘
  publishedAt: Date;
  updatedAt: Date;
}

interface Course {
  id: string;
  instructorId: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  pointsRequired: number;
  duration: number; // 總分鐘數
  chapters: Chapter[];
  students: number;
  rating: number;
  thumbnail: string;
  createdAt: Date;
}
```

---

## 🔄 用戶旅程

### 新用戶註冊流程

```
1. 訪問網站 (首頁)
   ↓
2. 選擇「註冊」/「免費試用」
   ↓
3. 填寫基本信息
   - 郵箱、密碼
   - 手機號碼
   ↓
4. 郵箱驗證
   ↓
5. 完善個人資料
   - 姓名、出生日期
   - 頭像、個人簡介
   ↓
6. 選擇初始操作
   - 瀏覽文章
   - 試用文字諮詢 (免費 50 點)
   - 購買點數
   - 開通會員
   ↓
7. 進入平台
```

### 點數購買流程

```
1. 點擊「購買點數」
   ↓
2. 選擇套餐 (A/B/C/D)
   ↓
3. 確認價格和折扣
   ↓
4. 選擇支付方式
   - Visa/Mastercard
   - PayPay
   - LINE Pay
   - 其他本地方案
   ↓
5. 完成支付
   ↓
6. 點數立即到賬
   ↓
7. 郵件確認 + 應用內通知
```

### 諮詢預約流程

```
1. 查看可用的諮詢師
   ↓
2. 選擇諮詢型別和服務
   ↓
3. 選擇時間槽
   ↓
4. 填寫預約信息（生日、具體問題等）
   ↓
5. 驗證點數餘額
   ↓
6. 確認預約
   ↓
7. 接收確認郵件和日曆邀請
   ↓
8. 諮詢時間前 1 小時提醒
   ↓
9. 進入諮詢室
```

---

## 🎯 目標用戶

### 用戶畫像 1: 尋求人生指引的上班族
- **年齡**: 25-45 歲
- **特徵**: 工作繁忙，想了解運勢和人生方向
- **使用場景**: 下班後、午休時間進行文字或語音諮詢
- **支付能力**: 中等到高等
- **預期年花費**: NT$ 2,000-5,000

### 用戶畫像 2: 命理愛好者
- **年齡**: 35-65 歲
- **特徵**: 對命理有興趣，想深入學習
- **使用場景**: 閱讀文章、參加線上課程
- **支付能力**: 高等
- **預期年花費**: NT$ 3,000-8,000

### 用戶畫像 3: 企業管理人士
- **年齡**: 40-60 歲
- **特徵**: 決策者，尋求商業諮詢
- **使用場景**: VIP 會員，頻繁視訊諮詢
- **支付能力**: 很高
- **預期年花費**: NT$ 20,000+

---

## 📊 初期目標和 KPIs

### Year 1 目標
- **用戶** : 10,000 註冊用戶，1,000 活躍用戶
- **收入** : NT$ 500,000
- **月活躍** : 30%
- **轉化率** : 免費到付費 15%

### Year 2 目標
- **用戶** : 50,000 註冊用戶，5,000 活躍用戶
- **收入** : NT$ 3,000,000
- **月活躍** : 40%
- **轉化率** : 免費到付費 20%

### Year 3+ 目標
- **用戶** : 200,000+ 註冊用戶
- **收入** : NT$ 10,000,000+
- **月活躍** : 50%+
- **員工** : 招聘支援團隊

---

## 🔐 競爭優勢

### 1. **專業深度**
- 30 年實踐經驗
- 準確率和滿意度高
- 口碑傳播優勢

### 2. **平台創新**
- AI 輔助初級諮詢（未來）
- 24/7 可用性
- 多模態服務（文字、語音、視訊）

### 3. **價格競爭力**
- 相比線下諮詢便宜 50-70%
- 靈活的點數制度

### 4. **社區構建**
- 用戶評論和分享
- 案例展示
- 學習社區

---

## ⚠️ 風險評估和應對

| 風險 | 影響 | 應對策略 |
|------|------|--------|
| 用戶增長緩慢 | 高 | 加強市場營銷、SEO、社媒推廣 |
| 支付方式失敗 | 高 | 與多個支付提供商合作 |
| 監管風險 | 中 | 遵守金融監管、數據隱私法規 |
| 競爭加劇 | 中 | 強化專業性、社區粘性 |
| 技術故障 | 中 | 99.9% SLA、完善備份 |
| 用戶隱私洩露 | 高 | GDPR 合規、加密通信 |

---

## 🚀 成功指標

### 短期 (3 個月)
- [ ] 平台上線，基本功能完整
- [ ] 100+ 註冊用戶
- [ ] 第一筆交易完成
- [ ] 支付方式穩定運作

### 中期 (6 個月)
- [ ] 1,000+ 註冊用戶
- [ ] 100+ 付費用戶
- [ ] NT$ 50,000+ 月收入
- [ ] 用戶滿意度 > 4.5/5

### 長期 (1 年)
- [ ] 10,000+ 註冊用戶
- [ ] 1,000+ 活躍用戶
- [ ] NT$ 500,000+ 年收入
- [ ] 建立品牌認知度
- [ ] 本地媒體報導

---

## 📚 相關文檔

- **product-roadmap.md** - 詳細的分階段發佈計劃
- **membership-points-system.md** - 會員和點數系統詳解
- **payment-integration-guide.md** - 支付集成技術指南
- **feature-requirements.md** - 所有功能的詳細需求
