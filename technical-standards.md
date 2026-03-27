# technical-standards.md

此檔案定義 MyWeb 專案的詳細技術規範和開發標準。

---

## 📘 TypeScript 規範

### 型別定義原則

所有 TypeScript 檔案應遵循 `strict: true` 模式，禁止使用 `any` 類型。

#### 1. **介面定義**

對所有 API 響應和主要資料結構定義介面：

```typescript
// ✅ 好的做法
interface User {
  id: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
  createdAt: Date;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  status: number;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

// ❌ 避免
const response: any = await fetch(url);  // 禁止使用 any！
```

#### 2. **泛型使用**

在可重用函式中使用泛型確保型別安全：

```typescript
// ✅ 好的做法 - 使用泛型
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(endpoint, options);
  return response.json();
}

// 使用時指定類型
const userResponse = await apiCall<User>('/api/users/1');
const users = await apiCall<User[]>('/api/users');
```

#### 3. **const 斷言**

對不會改變的物件使用 `as const`：

```typescript
// ✅ 好的做法
const API_ENDPOINTS = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
} as const;

type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
```

#### 4. **事件處理型別**

```typescript
// ✅ 好的做法
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // 表單提交邏輯
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.currentTarget.value;
  // 輸入變更邏輯
};

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // 按鈕點擊邏輯
};
```

---

## 🌐 API 呼叫規範

### 環境變數配置

```typescript
// ✅ 標準做法 - 在 .env.local 中設定
NEXT_PUBLIC_API_BASE_URL=https://ecanapi.fly.dev
NEXT_PUBLIC_API_URL=https://ecanapi.fly.dev/api

// 在程式碼中使用
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_URL = process.env.NEXT_PUBLIC_API_URL || `${API_BASE_URL}/api`;
```

### API 呼叫模式

#### 1. **建立統一的 API 服務層**

```typescript
// lib/api.ts
export interface ApiErrorResponse {
  success: false;
  message: string;
  status: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  status: number;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // 移除尾部斜線
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: responseData.message || '請求失敗',
          status: response.status,
        };
      }

      return {
        success: true,
        data: responseData,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '未知錯誤',
        status: 500,
      };
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(
    endpoint: string,
    body: unknown,
    headers?: Record<string, string>
  ) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    });
  }

  async put<T>(
    endpoint: string,
    body: unknown,
    headers?: Record<string, string>
  ) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers,
    });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'https://ecanapi.fly.dev/api'
);
```

#### 2. **在元件中使用 API**

```typescript
// ✅ 好的做法 - 使用 async/await
'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import type { User } from '@/types/user';

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (userId: string) => {
    setLoading(true);
    setError(null);

    const response = await apiClient.get<User>(`/users/${userId}`);

    if (response.success) {
      setUser(response.data);
    } else {
      setError(response.message);
    }

    setLoading(false);
  };

  return (
    <div>
      {loading && <p>載入中...</p>}
      {error && <p className="text-red-600">錯誤：{error}</p>}
      {user && <p>使用者：{user.name}</p>}
    </div>
  );
}
```

#### 3. **認證標頭設定**

```typescript
// ✅ 好的做法 - 使用 JWT Token
'use client';

import { useAuth } from '@/components/AuthContext';
import { apiClient } from '@/lib/api';

export default function ProtectedComponent() {
  const { token } = useAuth();

  const fetchProtectedData = async () => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.get('/protected-endpoint', headers);
    // 處理響應
  };

  return <div>受保護的內容</div>;
}
```

---

## 🔒 HTTP/HTTPS 配置

### 環境設定

#### 開發環境

```typescript
// .env.local (本地開發)
NEXT_PUBLIC_API_BASE_URL=https://localhost:32801  // 或開發後端地址
NEXT_PUBLIC_API_URL=https://localhost:32801/api

// 開發時允許 self-signed 憑證（僅限開發）
```

#### 正式環境

```typescript
// Fly.io 部署配置
// 在 Fly.io 儀表板設定環境變數
NEXT_PUBLIC_API_BASE_URL=https://ecanapi.fly.dev
NEXT_PUBLIC_API_URL=https://ecanapi.fly.dev/api

// 所有連線將自動使用 HTTPS
// 相關設定在 fly.toml 中配置
```

### 安全設定

#### 1. **Cookie 安全配置**

```typescript
// 在認證上下文中設定 Cookies
import Cookies from 'js-cookie';

const setAuthToken = (token: string) => {
  Cookies.set('jwtToken', token, {
    secure: process.env.NODE_ENV === 'production', // 正式環境強制 HTTPS
    sameSite: 'Strict',
    expires: 7, // 7 天過期
  });
};

const removeAuthToken = () => {
  Cookies.remove('jwtToken');
};
```

#### 2. **CORS 處理**

```typescript
// 後端應設定 CORS，前端需要確認
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // 認證標頭
    'Authorization': `Bearer ${token}`,
  },
  credentials: 'include', // 包含 cookies
  body: JSON.stringify(data),
});
```

---

## 🧩 元件開發規範

### 頁面元件結構

```typescript
// app/example/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';
import { apiClient } from '@/lib/api';

interface PageData {
  id: string;
  title: string;
  content: string;
}

export default function ExamplePage() {
  // 1. 狀態管理
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. 上下文使用
  const { isAuthenticated, token } = useAuth();

  // 3. 副作用
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const response = await apiClient.get<PageData>('/example/data', headers);

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message);
      }

      setLoading(false);
    };

    fetchData();
  }, [isAuthenticated, token]);

  // 4. 條件渲染
  if (!isAuthenticated) {
    return <div>請先登入</div>;
  }

  if (loading) {
    return <div>載入中...</div>;
  }

  if (error) {
    return <div className="text-red-600">錯誤：{error}</div>;
  }

  // 5. 主要標記
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-6">{data?.title}</h1>
          <p className="text-lg text-gray-600">{data?.content}</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

### 受控元件模式

```typescript
// ✅ 好的做法 - 受控表單
'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 驗證邏輯
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.email.includes('@')) {
      newErrors.email = '請輸入有效的電子郵件';
    }

    if (formData.password.length < 6) {
      newErrors.password = '密碼至少 6 個字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交處理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const response = await apiClient.post('/auth/login', {
      email: formData.email,
      password: formData.password,
    });

    if (response.success) {
      // 登入成功
      console.log('登入成功');
    } else {
      setErrors({ email: response.message });
    }

    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block mb-2">
          電子郵件
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
          disabled={isSubmitting}
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block mb-2">
          密碼
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
          disabled={isSubmitting}
        />
        {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
      </div>

      <label className="flex items-center">
        <input
          type="checkbox"
          name="rememberMe"
          checked={formData.rememberMe}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <span className="ml-2">記住我</span>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-amber-600 text-white py-2 rounded hover:bg-amber-700 disabled:opacity-50"
      >
        {isSubmitting ? '登入中...' : '登入'}
      </button>
    </form>
  );
}
```

### 可重用元件模式

```typescript
// components/Button.tsx
import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
}: ButtonProps) {
  const baseClasses = 'font-semibold rounded-full transition-all duration-300';

  const variantClasses = {
    primary: 'bg-amber-600 hover:bg-amber-700 text-white',
    secondary: 'bg-white hover:bg-gray-100 text-amber-600 border border-amber-600',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-8 py-3 text-base',
    lg: 'px-10 py-4 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

---

## 🔄 常見開發流程

### 新增 API 端點的完整流程

#### 步驟 1：定義型別

```typescript
// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}
```

#### 步驟 2：在 API 服務層添加方法

```typescript
// lib/api.ts
export class UserApi {
  static async getUser(userId: string) {
    return apiClient.get<User>(`/users/${userId}`);
  }

  static async createUser(data: CreateUserRequest) {
    return apiClient.post<User>('/users', data);
  }

  static async updateUser(userId: string, data: Partial<User>) {
    return apiClient.put<User>(`/users/${userId}`, data);
  }

  static async deleteUser(userId: string) {
    return apiClient.delete(`/users/${userId}`);
  }
}
```

#### 步驟 3：在元件中使用

```typescript
// app/users/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { UserApi } from '@/lib/api';
import type { User } from '@/types/user';

export default function UserPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const response = await UserApi.getUser(params.id);
      if (response.success) {
        setUser(response.data);
      }
      setLoading(false);
    };
    fetch();
  }, [params.id]);

  if (loading) return <div>載入中...</div>;
  if (!user) return <div>找不到使用者</div>;

  return <div>{user.name}</div>;
}
```

---

## ⚠️ 常見錯誤和解決方案

### 1. **使用 `any` 類型**

```typescript
// ❌ 錯誤
const data: any = await response.json();

// ✅ 正確
interface ApiData {
  // 定義結構
}
const data: ApiData = await response.json();
```

### 2. **忘記檢查認證狀態**

```typescript
// ❌ 錯誤 - 可能造成 undefined 錯誤
const token = useAuth().token;
const headers = { Authorization: `Bearer ${token}` };

// ✅ 正確
const { token, isAuthenticated } = useAuth();
if (!isAuthenticated) return <div>請登入</div>;
const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
```

### 3. **未處理 API 錯誤**

```typescript
// ❌ 錯誤 - 忽略錯誤
const response = await fetch(url);
const data = await response.json(); // 可能會失敗

// ✅ 正確 - 完整錯誤處理
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
} catch (error) {
  console.error('API 錯誤:', error);
  // 顯示使用者友善的錯誤信息
}
```

### 4. **環聚在 useEffect 中沒有依賴陣列**

```typescript
// ❌ 錯誤 - 無限迴圈
useEffect(() => {
  fetchData();
});

// ✅ 正確 - 明確依賴陣列
useEffect(() => {
  fetchData();
}, [userId]); // 只在 userId 改變時執行
```

---

## 📦 新增功能的標準檢查清單

在新增任何功能前，確保完成以下項目：

### 設計階段
- [ ] 明確定義功能需求和使用者故事
- [ ] 決定需要的 API 端點
- [ ] 規劃頁面或元件結構
- [ ] 列出需要的狀態和上下文

### 開發階段
- [ ] 定義所有必要的 TypeScript 介面
- [ ] 實作 API 服務方法
- [ ] 建立元件和頁面
- [ ] 添加適當的錯誤處理
- [ ] 實作認證檢查（如需要）

### 測試階段
- [ ] 在開發伺服器上測試功能
- [ ] 測試各種網路狀態（正常、緩慢、離線）
- [ ] 測試錯誤情況（無效輸入、API 失敗）
- [ ] 檢查響應式設計（行動、平板、桌面）
- [ ] 驗證 Tailwind CSS 樣式正確應用

### 風格和品質
- [ ] 執行 ESLint 檢查：`npm run lint`
- [ ] 確保 TypeScript 編譯無誤
- [ ] 審查代碼是否符合命名規範
- [ ] 檢查是否有未使用的變數或導入

### 部署準備
- [ ] 確認環境變數配置正確
- [ ] 檢查是否使用了正確的 API 端點
- [ ] 驗證 HTTPS 配置
- [ ] 檢查 Cookie 安全設定
