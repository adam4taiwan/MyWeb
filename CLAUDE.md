# CLAUDE.md

此檔案為 Claude Code (claude.ai/code) 在此儲存庫中工作時提供指導。

## 專案概述

**MyWeb** 是一個基於 Next.js 的命理諮詢平台，提供八字、紫微斗數等運勢分析服務。應用程式提供講座、諮詢、書籍銷售和會員專屬的命盤分析功能，並配備會員認證系統。

**技術棧：**
- Next.js 15 搭配 App Router 和 React 19
- TypeScript
- Tailwind CSS 樣式框架
- 自定義字型：Geist 和 Pacifico
- 函式庫：recharts、html2canvas、jspdf、@react-google-maps/api、js-cookie
- 透過 Docker 部署至 Fly.io

## 常用開發指令

```bash
# 啟動開發伺服器 (http://localhost:3000)
npm run dev

# 為正式環境構建
npm run build

# 執行 ESLint
npm run lint

# 清理構建成品（必要時）
rm -rf .next
```

## 架構概述

### 應用程式結構 (Next.js App Router)

```
app/
├── layout.tsx           # 根佈局，包含 AuthProvider 包裝
├── page.tsx            # 首頁
├── not-found.tsx       # 404 頁面
├── globals.css         # 全域樣式
├── login/              # 登入頁面（公開路由）
├── disk/               # 會員限定的命盤分析儀表板（受保護）
├── heritage/           # 傳統文化/教育內容
├── books/              # 書籍資訊
├── bookstore/          # 書店和電商功能
├── consultation/       # 諮詢預約系統
└── lectures/           # 課程/講座列表

components/
├── AuthContext.tsx     # 認證上下文和受保護路由邏輯
├── Header.tsx          # 導航標題
└── Footer.tsx          # 頁腳元件
```

### 主要架構設計模式

#### 1. **認證系統 (AuthContext.tsx)**

應用程式使用 JWT 認證搭配根佈局中的 `AuthProvider` 包裝：

- **Token 儲存：** JWT token 儲存在 cookies 中（`jwtToken`）
- **受保護路由：** 定義在 `AuthContext.tsx` - 目前僅 `/disk` 受保護
- **路由守衛：** `AuthProvider` 中的邏輯檢查認證狀態並重新導向：
  - 未認證使用者試圖訪問受保護路由 → 重新導向至 `/login`
  - 已認證使用者在 `/login` → 重新導向至 `/`
  - 未認證使用者訪問公開路由 → 允許查看

若要新增受保護的路由，請更新 `components/AuthContext.tsx` 中的 `protectedRoutes` 陣列。

#### 2. **用戶端元件**

使用認證上下文的頁面會標記 `'use client'` 指令並匯入 `useAuth` hook：
```typescript
import { useAuth } from '@/components/AuthContext';
const { isAuthenticated, login, logout, token } = useAuth();
```

#### 3. **樣式**

- 所有樣式使用 Tailwind CSS（`tailwind.config.js` 中的設定）
- 自訂字型變數可用：`--font-geist-sans`、`--font-geist-mono`、`--font-pacifico`
- 色彩配置使用琥珀色調（例如 `amber-600`、`amber-300`）進行品牌設計

### 環境設定

- `.env.local` 包含：`NEXT_PUBLIC_API_BASE_URL=https://ecanapi.fly.dev`
- Next.js 設定（`next.config.ts`）使用 `output: "standalone"` 以最佳化 Docker 構建
- 圖片最佳化已停用（`unoptimized: true`）

## 正式環境部署

應用程式透過 Docker 部署至 **Fly.io**：

**關鍵檔案：**
- `Dockerfile` - 容器設定
- `fly.toml` - Fly.io 部署設定
- `next.config.ts` - 配置 `output: "standalone"` 供容器化使用

**部署流程：**
1. 構建：`npm run build`
2. Docker 構建：`docker build -t myweb-next-app .`
3. 使用 `fly deploy` 部署至 Fly.io（需要 Fly.io CLI）

## 程式碼風格和慣例

### 元件模式

頁面通常為「use client」元件，結構如下：
```typescript
'use client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '@/components/AuthContext';

export default function PageName() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* 頁面內容 */}
      <Footer />
    </div>
  );
}
```

### 認證用法

訪問認證狀態或登入/登出函式：
```typescript
const { isAuthenticated, login, logout, token } = useAuth();

// 登入（在 cookie 中設定 token 並更新上下文）
login(jwtToken);

// 登出（移除 token 並清除上下文）
logout();
```

### 受保護路由實作

若需保護新路由（例如 `/profile`）：
1. 將路由添加至 `AuthContext.tsx` 中的 `protectedRoutes` 陣列
2. 重新導向邏輯會自動處理未認證的訪問

## 常見開發任務

### 新增頁面
1. 在 `app/` 下建立目錄（例如 `app/newpage/`）
2. 新增 `page.tsx` 並撰寫元件代碼
3. 若使用 hooks，用 `'use client'` 包裝
4. 為保持一致性，使用 `Header` 和 `Footer` 元件
5. 若受保護，在 `AuthContext.tsx` 中新增至 `protectedRoutes`

### 新增樣式
- 所有樣式使用 Tailwind 工具類
- 在 CSS 中參考自訂字型變數以整合排版
- 色彩配置使用琥珀色調和深色背景

### 新增 API 整合
- 後端 API 基礎 URL：環境變數 `NEXT_PUBLIC_API_BASE_URL`
- 使用 fetch 或 axios 發出請求
- 透過 `useAuth()` hook 取得 JWT token 以進行認證標頭

## 跨專案規範

### Ecanapi 資料庫異動規範

每次變更 Ecanapi 資料庫結構，**必須同時**：
1. 建立 EF Core Migration：`dotnet ef migrations add <Name> --context ApplicationDbContext`
2. 在 `/home/adamtsai/projects/Ecanapi/sql/` 目錄新增 SQL 腳本（格式：`YYYYMMDD_<描述>.sql`）

SQL 腳本供生產環境手動執行（Fly.io 不自動 migrate）。

## 未來開發注意事項

- **README.md 中的合併衝突：** README 有未解決的英文和中文文檔合併衝突 - 待整合文檔時再解決
- **缺少測試套件：** 專案目前未設定測試
- **Cookie 安全性：** 在正式環境中，cookies 會設定 `secure` 旗標（`process.env.NODE_ENV === 'production'`）
- **構建輸出：** 生成的檔案位於 `/out` 目錄（靜態匯出）和 `.next` 目錄（伺服器構建）
