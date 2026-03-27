# claude-instructions.md

此檔案為 Claude Code 在此儲存庫中進行開發時的指令參考和風格規範。

## 📋 常用開發指令

### 開發環境

```bash
# 啟動開發伺服器
npm run dev

# 在瀏覽器中打開（通常是 http://localhost:3000）
# 搭配監視模式，修改文件會自動重新載入
```

### 構建與部署

```bash
# 為正式環境構建
npm run build

# 本地檢查構建結果（構建成功後執行）
npm start

# Docker 本地構建
docker build -t myweb-next-app .

# 部署至 Fly.io（需事先安裝 Fly.io CLI）
fly deploy
```

### 代碼質量

```bash
# 執行 ESLint 檢查代碼
npm run lint

# 清理構建成品
rm -rf .next out
```

### 其他有用的指令

```bash
# 清理 node_modules 並重新安裝
rm -rf node_modules package-lock.json && npm install

# 查看環境變數（開發環境）
cat .env.local
```

---

## 🎨 Tailwind CSS 使用規範

### 顏色色盤

所有新元件應遵循以下顏色體系：

#### 主色彩 - 琥珀色（品牌色）
- `amber-300` - 亮色文字和強調（用於深色背景）
- `amber-600` - 按鈕、主要互動元素
- `amber-700` - 按鈕懸停狀態
- `amber-50` - 卡片和淺色背景

#### 中性色
- 深色：`gray-800`, `gray-900`, `black`
- 淺色：`white`, `gray-50`, `gray-100`
- 文字：`gray-600`（次要文字），`gray-800`（主要文字）

#### 禁用顏色
- 深色背景：`bg-black/50`、`bg-gray-900/80`（透明黑色）
- 白色邊框：`border-white`、`text-white`

### 常見元件樣式模式

#### 按鈕

```typescript
// 主要按鈕（琥珀色）
<button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full
  text-lg font-semibold transition-transform duration-300 transform hover:scale-105">
  按鈕文字
</button>

// 次要按鈕（白色）
<button className="bg-white hover:bg-gray-100 text-amber-600 px-8 py-4 rounded-full
  text-lg font-semibold transition-transform duration-300 transform hover:scale-105">
  按鈕文字
</button>

// 按鈕組
<div className="space-x-4">
  <button>按鈕 1</button>
  <button>按鈕 2</button>
</div>
```

#### 卡片

```typescript
// 標準卡片
<div className="p-8 bg-amber-50 rounded-2xl shadow-lg transition-shadow hover:shadow-xl">
  <h3 className="text-2xl font-semibold text-gray-800 mb-3">標題</h3>
  <p className="text-gray-600">內容描述</p>
</div>

// 深色卡片
<div className="bg-gray-900 text-white p-8 rounded-lg shadow-lg">
  {/* 內容 */}
</div>
```

#### 容器與布局

```typescript
// 頁面容器
<div className="min-h-screen flex flex-col">
  <Header />
  {/* 頁面內容 */}
  <Footer />
</div>

// 內容容器
<div className="container mx-auto px-4">
  {/* 內容 */}
</div>

// 網格佈局（3 欄響應式）
<div className="grid grid-cols-1 md:grid-cols-3 gap-10">
  {/* 3 個卡片 */}
</div>

// 兩欄佈局（左右對齐）
<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
  {/* 左欄文字，右欄圖片 */}
</div>
```

#### 間距和對齐

```typescript
// 縱向間距
<div className="space-y-6">
  <div>項目 1</div>
  <div>項目 2</div>
</div>

// 橫向間距
<div className="space-x-4">
  <button>按鈕 1</button>
  <button>按鈕 2</button>
</div>

// Flex 佈局
<div className="flex items-center justify-between">
  {/* 內容 */}
</div>
```

#### 文字樣式

```typescript
// 大標題（Hero 區域）
className="text-5xl md:text-7xl font-extrabold leading-tight text-amber-300"

// 副標題
className="text-4xl font-bold text-gray-800"

// 一般文字
className="text-lg font-semibold text-gray-800"

// 次要文字
className="text-gray-600"

// 小字
className="text-sm text-gray-500"

// 文字陰影
className="drop-shadow-lg"  // 大陰影
className="drop-shadow-md"  // 中等陰影
```

### 響應式設計規則

- **行動優先**：先編寫行動版本，再添加響應式斷點
- **常用斷點**：
  - `md:` - 768px 及以上（平板）
  - `lg:` - 1024px 及以上（桌面）
  - `xl:` - 1280px 及以上（大螢幕）

```typescript
// 示例：1 欄行動版，3 欄桌面版
className="grid grid-cols-1 md:grid-cols-3 gap-10"

// 示例：行動版隱藏，桌面版顯示
className="hidden lg:block"

// 示例：文字大小響應式
className="text-2xl md:text-4xl lg:text-6xl"
```

### 互動效果

```typescript
// 懸停效果
className="hover:bg-amber-700"
className="hover:shadow-xl"

// 轉換動畫
className="transition-transform duration-300"
className="transition-shadow duration-200"

// 縮放效果
className="transform hover:scale-105"

// 持續時間選項
duration-200   // 較快
duration-300   // 標準
duration-500   // 較慢
```

### 不推薦的做法

❌ **避免內聯樣式**
```typescript
// 不好
<div style={{ color: 'red', fontSize: '20px' }}>文字</div>

// 好
<div className="text-red-500 text-lg">文字</div>
```

❌ **避免硬編碼顏色值**
```typescript
// 不好
<div className="text-[#FFA500]">文字</div>

// 好
<div className="text-amber-500">文字</div>
```

❌ **避免過度嵌套 className**
```typescript
// 不好 - className 超過 50 個字符
className="flex items-center justify-between w-full h-full p-4 bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"

// 好 - 使用中間變數或組件
const buttonClasses = "bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full"
```

---

## 📁 專案特定規範

### 頁面結構

所有頁面應包含：
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

### 受保護路由

若頁面需要認證：
1. 在 `components/AuthContext.tsx` 中的 `protectedRoutes` 陣列添加路由
2. 在頁面頂部使用 `useAuth()` hook 檢查 `isAuthenticated`

### 環境變數

- `.env.local`：本地開發環境變數
- 公開變數應使用 `NEXT_PUBLIC_` 前綴
- 生產環境的變數應在 Fly.io 儀表板中配置

---

## 🐛 常見問題

**Q：為什麼頁面沒有更新？**
A：清理構建成品並重啟開發伺服器：
```bash
rm -rf .next && npm run dev
```

**Q：Tailwind 樣式沒有應用？**
A：確認文件在 `tailwind.config.js` 的 `content` 配置中：
```
content: ["./{app,components,libs,pages,hooks}/**/*.{html,js,ts,jsx,tsx}"]
```

**Q：如何在正式環境測試？**
A：執行 `npm run build && npm start` 於本地模擬正式環境。
