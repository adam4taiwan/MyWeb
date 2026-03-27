# project-structure-guide.md

此檔案說明 MyWeb 專案的目錄結構和檔案組織規範。

---

## 📁 專案根目錄結構

```
MyWeb/
├── app/                          # Next.js 應用程式主目錄 (App Router)
├── components/                   # 可重用的 React 元件
├── lib/                          # 工具函式和服務
├── types/                        # TypeScript 型別定義
├── public/                       # 靜態資源（圖片、字體等）
├── .next/                        # Next.js 構建輸出（自動生成，勿提交）
├── node_modules/                 # npm 依賴（自動生成，勿提交）
│
├── .env.local                    # 本地環境變數（勿提交到 Git）
├── .gitignore                    # Git 忽略設定
├── Dockerfile                    # Docker 容器設定
├── fly.toml                      # Fly.io 部署配置
├── next.config.ts                # Next.js 設定檔
├── package.json                  # npm 套件定義
├── package-lock.json             # npm 依賴鎖定檔
├── tailwind.config.js            # Tailwind CSS 設定
├── tsconfig.json                 # TypeScript 設定
│
├── CLAUDE.md                     # Claude Code 開發指南
├── claude-instructions.md        # 常用指令和樣式規範
├── technical-standards.md        # 技術和代碼規範
├── feature-development-guide.md  # 功能開發指南
├── README.md                     # 專案說明（有合併衝突待解決）
└── LICENSE                       # 許可證

```

---

## 📂 詳細目錄說明

### `app/` - Next.js App Router 應用程式

```
app/
├── layout.tsx                    # 根佈局（所有頁面的基礎）
├── page.tsx                      # 首頁內容
├── globals.css                   # 全域樣式和 Tailwind 導入
├── not-found.tsx                 # 404 頁面
│
├── login/                        # 登入頁面
│   └── page.tsx
│
├── disk/                         # 命盤分析儀表板（受保護路由）
│   └── page.tsx
│
├── heritage/                     # 傳統文化/教育內容
│   └── page.tsx
│
├── books/                        # 書籍資訊頁面
│   └── page.tsx
│
├── bookstore/                    # 書店電商功能
│   ├── page.tsx
│   ├── SearchSection.tsx         # 搜尋元件
│   ├── BookCategories.tsx        # 分類元件
│   ├── ContactInfo.tsx           # 聯繫信息
│   └── CharityService.tsx        # 慈善服務說明
│
├── consultation/                 # 諮詢預約系統
│   ├── page.tsx
│   ├── ConsultationHero.tsx     # 英雄區域
│   ├── ServiceOptions.tsx        # 服務選項
│   ├── ContactMethods.tsx        # 聯繫方式
│   ├── MessageModal.tsx          # 訊息模態框
│   ├── EmailModal.tsx            # 電郵模態框
│   └── VideoCallModal.tsx        # 視訊通話模態框
│
└── lectures/                     # 講座課程列表
    ├── page.tsx
    ├── LectureHero.tsx          # 英雄區域
    ├── BookingSection.tsx        # 講座預訂
    ├── ServiceTypes.tsx          # 服務類型
    ├── ThemeEvents.tsx           # 專題活動
    └── PartnershipSection.tsx    # 合作夥伴
```

**說明：**
- 每個頁面路由對應一個目錄
- 每個目錄內包含 `page.tsx` 作為該路由的主要頁面
- 頁面專用的子元件放在該目錄內
- 使用 `'use client'` 指令標記客戶端元件

### `components/` - 可重用元件

```
components/
├── AuthContext.tsx               # 認證上下文和路由守衛
├── Header.tsx                    # 導航標題（所有頁面使用）
├── Footer.tsx                    # 頁腳（所有頁面使用）
│
├── Button.tsx                    # 通用按鈕元件
├── Card.tsx                      # 卡片元件
├── Modal.tsx                     # 模態框容器
├── LoadingSpinner.tsx            # 載入動畫
└── ErrorBoundary.tsx             # 錯誤邊界
```

**命名規則：**
- 檔案名必須使用 PascalCase（如 `Button.tsx`）
- 元件名必須與檔案名相同
- 可重用元件放在此目錄
- 頁面特定的元件放在頁面目錄內

### `lib/` - 工具和服務

```
lib/
├── api.ts                        # API 客戶端（統一的 HTTP 請求）
├── api/
│   ├── authApi.ts               # 認證相關 API
│   ├── userApi.ts               # 使用者相關 API
│   ├── lectureApi.ts            # 講座相關 API
│   ├── consultationApi.ts       # 諮詢相關 API
│   └── bookApi.ts               # 書籍相關 API
│
├── hooks/
│   ├── useLocalStorage.ts       # LocalStorage hook
│   ├── useAsync.ts              # 非同步操作 hook
│   └── useFetch.ts              # 資料獲取 hook
│
├── utils/
│   ├── validation.ts            # 驗證工具
│   ├── formatting.ts            # 格式化工具
│   ├── date.ts                  # 日期工具
│   └── string.ts                # 字串工具
│
└── constants.ts                  # 常數定義
```

**說明：**
- `api.ts` - 統一的 API 客戶端設定
- `api/` - API 服務分類（按功能區分）
- `hooks/` - 可重用的 React hooks
- `utils/` - 純函式工具集
- `constants.ts` - 全域常數、API 端點等

### `types/` - TypeScript 型別定義

```
types/
├── api.ts                        # API 型別（請求/響應）
├── user.ts                       # 使用者相關型別
├── lecture.ts                    # 講座相關型別
├── consultation.ts              # 諮詢相關型別
├── book.ts                       # 書籍相關型別
├── common.ts                     # 通用型別
└── ui.ts                         # UI 元件型別
```

**型別組織原則：**
- 按功能域分組
- 相關的介面和型別放在同一檔案
- 通用型別放在 `common.ts`

**範例 (`types/user.ts`)：**

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'admin';
  createdAt: Date;
}

export interface UserProfile extends User {
  avatar?: string;
  phone?: string;
  bio?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}
```

### `public/` - 靜態資源

```
public/
├── images/
│   ├── logo.png
│   ├── hero.jpg
│   └── icons/
│       ├── home.svg
│       ├── profile.svg
│       └── settings.svg
│
├── fonts/
│   └── custom-font.woff2
│
└── favicon.ico
```

**說明：**
- 所有靜態資源放在 `public/` 目錄
- 在代碼中引用：`/images/logo.png`
- Next.js 會自動優化和快取這些資源

---

## 📋 檔案命名規範

### TypeScript / JavaScript 檔案

| 檔案類型 | 命名規則 | 範例 |
|---------|--------|------|
| React 元件 | PascalCase | `Button.tsx`, `UserProfile.tsx` |
| 頁面元件 | PascalCase | page.tsx（固定名稱） |
| 工具函式 | camelCase | `validation.ts`, `formatDate.ts` |
| 常數檔案 | camelCase | `constants.ts`, `config.ts` |
| 型別定義 | camelCase | `user.ts`, `api.ts` |
| 服務類別 | PascalCase + Api | `UserApi.ts`, `LectureApi.ts` |
| Hooks | camelCase + use 前綴 | `useAuth.ts`, `useFetch.ts` |

### CSS 和樣式

| 檔案類型 | 命名規則 | 範例 |
|---------|--------|------|
| 全域樣式 | camelCase | `globals.css` |
| 模組樣式 | camelCase + .module | `button.module.css` |

---

## 🏗️ 新增功能時的檔案創建流程

### 假設新增「評論功能」

#### 步驟 1：創建型別定義

```
types/
└── comment.ts          # 新建評論型別
```

#### 步驟 2：創建 API 服務

```
lib/api/
└── commentApi.ts       # 新建評論 API 服務
```

#### 步驟 3：創建可重用元件

```
components/
└── CommentList.tsx     # 評論列表元件
```

#### 步驟 4：創建頁面路由

```
app/
└── comments/
    ├── page.tsx        # 評論列表頁面
    └── CommentForm.tsx # 評論表單（頁面專用元件）
```

#### 步驟 5：完整結構

```
types/
└── comment.ts

lib/api/
└── commentApi.ts

components/
└── CommentList.tsx

app/comments/
├── page.tsx
└── CommentForm.tsx
```

---

## 📝 檔案內容規範

### 頁面檔案結構

```typescript
// app/example/page.tsx
'use client'; // 如需使用 hooks

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';
import { someService } from '@/lib/api/someApi';
import type { SomeType } from '@/types/some';

export default function ExamplePage() {
  // 1. 狀態和上下文
  const [data, setData] = useState<SomeType | null>(null);
  const { isAuthenticated } = useAuth();

  // 2. 副作用
  useEffect(() => {
    // 初始化邏輯
  }, []);

  // 3. 事件處理
  const handleSomething = () => {
    // 處理邏輯
  };

  // 4. 條件渲染
  if (!isAuthenticated) return null;

  // 5. 主要標記
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">{/* 內容 */}</main>
      <Footer />
    </div>
  );
}
```

### 元件檔案結構

```typescript
// components/Example.tsx
import React from 'react';

interface ExampleProps {
  title: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function Example({ title, onClick }: ExampleProps) {
  return <div onClick={onClick}>{title}</div>;
}
```

### 工具函式結構

```typescript
// lib/utils/validation.ts
/**
 * 驗證電子郵件格式
 * @param email - 待驗證的電郵
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 驗證密碼強度
 * @param password - 待驗證的密碼
 * @returns 是否符合要求
 */
export function isStrongPassword(password: string): boolean {
  return password.length >= 6 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}
```

---

## 🚫 應避免的檔案組織方式

### ❌ 不要將所有東西放在一個檔案

```typescript
// ❌ 重，難以維護
components/
└── Everything.tsx  // 包含了 50 個不同的元件!
```

### ❌ 不要過度分散

```typescript
// ❌ 過度分散，難以導航
components/user/
├── UserNames.tsx
├── UserEmails.tsx
├── UserAvatars.tsx
├── UserBios.tsx
// ... 每個欄位一個檔案
```

### ❌ 不要混淆目錄和檔案

```typescript
// ❌ 混亂
Button/
├── button.tsx
├── button.styles.ts
├── button.utils.ts
└── button.types.ts
```

**更好的做法：**

```typescript
// ✅ 清晰
components/
├── Button.tsx      # 主要元件
└── index.ts        # (可選) 用於簡化導入
```

---

## 🔗 導入語句規範

### 使用路徑別名

```typescript
// ✅ 好的做法 - 使用 @ 別名
import Button from '@/components/Button';
import { apiClient } from '@/lib/api';
import type { User } from '@/types/user';

// ❌ 避免 - 相對路徑
import Button from '../../components/Button';
import { apiClient } from '../../../lib/api';
```

### 路徑別名配置

在 `tsconfig.json` 中已配置：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### 導入順序

```typescript
// 遵循以下順序：
// 1. 外部庫
import React from 'react';
import { useEffect } from 'react';

// 2. 專案內部
import Header from '@/components/Header';
import { useAuth } from '@/components/AuthContext';
import { apiClient } from '@/lib/api';

// 3. 型別定義
import type { User } from '@/types/user';
```

---

## 📚 相關文件

- **CLAUDE.md** - Claude Code 開發指南
- **claude-instructions.md** - 常用指令和樣式規範
- **technical-standards.md** - 技術和代碼規範
- **feature-development-guide.md** - 功能開發指南
