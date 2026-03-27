# security-best-practices.md

本檔案定義 MyWeb 應用程式的安全最佳實踐和防禦措施，涵蓋常見漏洞和解決方案。

---

## 🔒 OWASP Top 10 風險和防禦

### 1. **注入 (Injection) 攻擊**

#### SQL 注入風險

```typescript
// ❌ 危險 - 直接串聯 SQL
const userId = req.body.id;
const query = `SELECT * FROM users WHERE id = ${userId}`;
// 攻擊者可以發送：id = 1 OR 1=1

// ✅ 正確 - 使用參數化查詢
const query = 'SELECT * FROM users WHERE id = ?';
const result = await db.query(query, [userId]);

// ✅ 使用 ORM（如 Prisma）
const user = await prisma.user.findUnique({
  where: { id: parseInt(userId) },
});
```

#### XSS（跨網站指令碼）防禦

```typescript
// ❌ 危險 - 直接渲染用戶輸入
export default function UserProfile({ userName }: { userName: string }) {
  return <div dangerouslySetInnerHTML={{ __html: userName }} />;
}

// ✅ 正確 - React 自動轉義
export default function UserProfile({ userName }: { userName: string }) {
  return <div>{userName}</div>;
}

// ✅ 使用專門的清理庫（如需要 HTML 內容）
import DOMPurify from 'dompurify';

export default function UserBio({ bio }: { bio: string }) {
  const cleanHtml = DOMPurify.sanitize(bio);
  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}
```

### 2. **驗證和認證缺陷**

#### 密碼安全

```typescript
// ❌ 危險 - 以明文儲存密碼
async function registerUser(email: string, password: string) {
  await db.users.insert({ email, password });
}

// ✅ 正確 - 使用 bcrypt 雜湊密碼
import bcrypt from 'bcrypt';

async function registerUser(email: string, password: string) {
  // 驗證密碼強度
  if (password.length < 8) {
    throw new Error('密碼至少 8 個字符');
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error('密碼必須包含大寫字母');
  }

  if (!/[0-9]/.test(password)) {
    throw new Error('密碼必須包含數字');
  }

  // 雜湊密碼
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.users.insert({ email, password: hashedPassword });
}

// 驗證密碼
async function loginUser(email: string, password: string) {
  const user = await db.users.findOne({ email });

  if (!user) {
    throw new Error('使用者不存在');
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error('密碼不正確');
  }

  return user;
}
```

#### JWT Token 安全

```typescript
// ✅ 正確的 JWT 設定
import jwt from 'jsonwebtoken';
import Cookies from 'js-cookie';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '7d';

// 生成 Token
function generateToken(userId: string) {
  return jwt.sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

// 設定安全 Cookie
function setAuthToken(token: string) {
  Cookies.set('jwtToken', token, {
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    httpOnly: true, // 無法通過 JavaScript 訪問（伺服器端設定）
    sameSite: 'Strict', // 防止 CSRF
    expires: 7,
  });
}

// 驗證 Token
function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('無效或過期的 Token');
  }
}

// ❌ 不要在 localStorage 中儲存 JWT（易受 XSS 攻擊）
// localStorage.setItem('token', token);

// ✅ 改用 httpOnly cookie（由伺服器端設定）
```

### 3. **易受攻擊的和過期的元件**

```typescript
// ✅ 定期更新依賴
npm audit
npm audit fix    // 自動修復
npm update       // 更新到新版本

// ✅ 檢查依賴的已知漏洞
npm audit --json

// 在 CI/CD 中自動檢查
// .github/workflows/security.yml
name: Security Check
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm audit --audit-level=moderate
```

### 4. **CSRF（跨站請求偽造）防禦**

```typescript
// ✅ 使用 SameSite Cookie（默認在現代瀏覽器中）
Cookies.set('jwtToken', token, {
  sameSite: 'Strict',  // 或 'Lax'
  secure: true,
});

// ✅ CSRF Token（用於表單）
// 在伺服器端生成
const csrfToken = crypto.randomBytes(32).toString('hex');

// 發送給客戶端
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.session.csrfToken });
});

// 在表單中驗證
app.post('/api/action', (req, res) => {
  const { csrfToken } = req.body;

  if (csrfToken !== req.session.csrfToken) {
    return res.status(403).json({ error: 'CSRF Token 無效' });
  }

  // 執行操作
});
```

---

## 🛡️ 應用程式級別的安全性

### 1. **環境變數保護**

```typescript
// ❌ 危險 - 在代碼中硬編碼敏感信息
const API_KEY = 'sk-1234567890abcdef';
const DATABASE_URL = 'mongodb://user:password@host/db';

// ✅ 正確 - 使用環境變數
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;

// .env.local（勿提交到 Git）
NEXT_PUBLIC_API_BASE_URL=https://ecanapi.fly.dev
DATABASE_URL=mongodb://...
JWT_SECRET=your-secret-key-here

// .gitignore（確保敏感檔案不被提交）
.env.local
.env.*.local
*.key
secrets.json
```

### 2. **輸入驗證和清理**

```typescript
// ✅ 驗證所有用戶輸入
import { isEmail, isLength } from 'validator';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

function validateRegisterInput(data: unknown): RegisterRequest {
  // 型別檢查
  if (typeof data !== 'object' || data === null) {
    throw new Error('無效的請求');
  }

  const { name, email, password } = data as any;

  // 驗證名稱
  if (!isLength(name, { min: 2, max: 50 })) {
    throw new Error('名稱長度必須在 2-50 個字符之間');
  }

  // 驗證電郵
  if (!isEmail(email)) {
    throw new Error('無效的電郵地址');
  }

  // 驗證密碼
  if (!isLength(password, { min: 8 })) {
    throw new Error('密碼至少 8 個字符');
  }

  return { name, email, password };
}

// 在 API 路由中使用
app.post('/api/register', async (req, res) => {
  try {
    const validated = validateRegisterInput(req.body);
    // 處理註冊
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### 3. **速率限制（Rate Limiting）**

```typescript
// lib/rateLimit.ts
class RateLimiter {
  private attempts = new Map<string, number[]>();
  private maxAttempts = 5;
  private windowMs = 15 * 60 * 1000; // 15 分鐘

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const timestamps = this.attempts.get(identifier) || [];

    // 移除超過時間窗的嘗試
    const recentAttempts = timestamps.filter((ts) => now - ts < this.windowMs);

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);

    return true;
  }
}

export const loginLimiter = new RateLimiter();

// 在登入端點使用
app.post('/api/login', (req, res) => {
  const ip = req.ip;

  if (!loginLimiter.isAllowed(ip)) {
    return res.status(429).json({
      error: '嘗試次數過多，請稍後再試',
    });
  }

  // 執行登入
});
```

### 4. **內容安全策略 (CSP)**

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              connect-src 'self' https://ecanapi.fly.dev;
              font-src 'self' data: https://fonts.googleapis.com;
            `.replace(/\s+/g, ' '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## 🔐 API 安全性

### 1. **認證和授權**

```typescript
// middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // 獲取 Token（從 Cookie）
  const token = request.cookies.get('jwtToken')?.value;

  // 受保護的路由
  if (request.nextUrl.pathname.startsWith('/api/protected')) {
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: '未授權' }),
        { status: 401 }
      );
    }

    try {
      const decoded = verifyToken(token);
      // 將用戶信息添加到請求
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.userId);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: 'Token 無效' }),
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/protected/:path*'],
};
```

### 2. **CORS 配置**

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production'
              ? 'https://myweb.fly.dev'
              : 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### 3. **API 響應安全性**

```typescript
// ✅ 不返回敏感信息
export async function GET(request: Request) {
  const user = await getUser();

  // ❌ 不好 - 返回所有信息，包括密碼雜湊
  return Response.json(user);

  // ✅ 好 - 只返回必要信息
  const { password, ...safeUser } = user;
  return Response.json(safeUser);
}

// ✅ 使用錯誤信息的通用訊息（避免洩露實施細節）
export async function POST(request: Request) {
  try {
    // 業務邏輯
  } catch (error) {
    // ❌ 不好
    return Response.json(
      { error: error.message },  // 可能泄露敏感信息
      { status: 500 }
    );

    // ✅ 好
    console.error('詳細錯誤:', error);
    return Response.json(
      { error: '操作失敗，請稍後重試' },
      { status: 500 }
    );
  }
}
```

---

## 🔍 數據安全和隱私

### 1. **数据加密**

```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 字符的十六進制字符串

export function encryptData(data: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted = cipher.update(data, 'utf-8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

export function decryptData(encryptedData: string): string {
  const [iv, encrypted] = encryptedData.split(':');

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  );

  let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
}

// 使用
const sensitiveData = '使用者的私人信息';
const encrypted = encryptData(sensitiveData);
// 儲存 encrypted 到數據庫

const decrypted = decryptData(encrypted);
// 使用 decrypted
```

### 2. **PII 保護（個人可識別信息）**

```typescript
// ✅ 不記錄敏感信息
export function sanitizeForLogging(data: any): any {
  const sensitiveFields = ['password', 'token', 'apiKey', 'ssn', 'creditCard'];

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

// 使用
logger.info('使用者登入', sanitizeForLogging({ email: 'user@example.com', password: '...' }));
// 輸出：使用者登入 { email: 'user@example.com', password: '[REDACTED]' }
```

---

## 📋 安全性檢查清單

### 開發時

```markdown
[ ] 不在代碼中硬編碼敏感信息
[ ] 使用 bcrypt 雜湊密碼
[ ] 驗證所有用戶輸入
[ ] 清理用戶輸入（防止 XSS）
[ ] 使用參數化查詢（防止 SQL 注入）
[ ] 設定安全的 Cookie 標誌
[ ] 使用 HTTPS/TLS
[ ] 實施速率限制
```

### 提交代碼時

```markdown
[ ] 沒有敏感信息在提交中
[ ] npm audit 檢查通過
[ ] 沒有已知的安全漏洞
[ ] Code review 已完成
[ ] 安全檢查通過
```

### 部署前

```markdown
[ ] 環境變數已正確設定
[ ] JWT_SECRET 使用強密碼
[ ] 資料庫密碼已更改
[ ] CORS 正確配置
[ ] CSP 標頭已設定
[ ] HTTPS 已啟用
[ ] Cookie 設定為 secure 和 httpOnly
[ ] API 端點有認證檢查
```

### 部署後

```markdown
[ ] 定期更新依賴
[ ] 監控安全告警
[ ] 檢查 404 日誌（可能的目錄枚舉嘗試）
[ ] 審計訪問日誌
[ ] 使用 Web Application Firewall (WAF)
[ ] 定期進行安全審計
```

---

## 🚨 常見漏洞修復指南

### 漏洞 1：XSS（跨網站指令碼）

```typescript
// ❌ 危險
return <div dangerouslySetInnerHTML={{ __html: userInput }} />;

// ✅ 修復
return <div>{userInput}</div>;

// 如需要 HTML，使用 sanitize 庫
import sanitizeHtml from 'sanitize-html';
const cleanHtml = sanitizeHtml(userInput);
return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
```

### 漏洞 2：CSRF (跨站請求偽造)

```typescript
// ✅ 使用 SameSite Cookie
Cookies.set('token', token, {
  sameSite: 'Strict',
  secure: true,
  httpOnly: true,
});
```

### 漏洞 3：敏感數據暴露

```typescript
// ❌ 危險 - 返回所有用戶數據
const users = await User.find({});
res.json(users);

// ✅ 修復 - 只返回必要字段
const users = await User.find({}, 'id name email');
res.json(users);
```

---

## 📚 參考資源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Next.js 安全最佳實踐](https://nextjs.org/docs/building-your-application/data-fetching/patterns-and-best-practices)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
