# performance-optimization-guide.md

本檔案提供 MyWeb Next.js 應用程式的性能優化指南和最佳實踐。

---

## 📊 性能指標概述

### 關鍵性能指標 (Core Web Vitals)

| 指標 | 目標 | 說明 |
|------|------|------|
| **LCP (Largest Contentful Paint)** | < 2.5s | 最大內容元素繪製時間 |
| **FID (First Input Delay)** | < 100ms | 首次互動延遲（現已被 INP 替代） |
| **CLS (Cumulative Layout Shift)** | < 0.1 | 累積布局位移 |
| **INP (Interaction to Next Paint)** | < 200ms | 互動到下一幀的時間 |
| **TTFB (Time to First Byte)** | < 600ms | 首字節時間 |

### 測試工具

```bash
# 本地測試
npm run build
npm start

# 在瀏覽器中測試
# Chrome DevTools > Lighthouse > Analytics
# 或訪問 https://pagespeed.web.dev

# 命令行測試
npm install -g lighthouse
lighthouse https://myweb.fly.dev --view
```

---

## 🚀 Next.js 級別的優化

### 1. **Image 元件優化**

Next.js 的 Image 元件自動優化圖片，但需要正確使用：

```typescript
// ✅ 好的做法 - 使用 Next.js Image 元件
import Image from 'next/image';

export default function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero image"
      width={1200}
      height={600}
      quality={80}  // 降低質量以減少檔案大小
      priority    // 為 LCP 圖片設定 priority
      sizes="(max-width: 768px) 100vw, 90vw"
    />
  );
}

// ❌ 避免 - 使用 HTML img 標籤
<img src="/hero.jpg" alt="Hero" />
```

### 2. **動態導入 (Code Splitting)**

```typescript
// ✅ 為非關鍵元件使用動態導入
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>載入中...</div>,
  ssr: false,  // 用於瀏覽器專用的元件（如圖表庫）
});

export default function Dashboard() {
  return (
    <div>
      <h1>儀表板</h1>
      <Suspense fallback={<div>載入圖表...</div>}>
        <HeavyChart />
      </Suspense>
    </div>
  );
}
```

### 3. **字型優化**

```typescript
// app/layout.tsx
import { Geist, Geist_Mono, Pacifico } from 'next/font/google';

// 預加載字型
const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  preload: true,
  display: 'swap',  // 防止 FOUT（無樣式文字閃爍）
});

const pacifico = Pacifico({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pacifico',
  preload: true,
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" className={`${geistSans.variable} ${pacifico.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### 4. **CSS 最小化和 Tailwind 優化**

```javascript
// tailwind.config.js
export default {
  content: [
    './{app,components,lib,types}/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

// production 模式下 Tailwind 會自動最小化未使用的 CSS
// 在 next.config.ts 中確保正確配置
```

### 5. **打包分析**

```bash
# 安裝 webpack 分析工具
npm install --save-dev @next/bundle-analyzer

# 分析構建產物
cross-env ANALYZE=true npm run build

# 識別大型依賴並考慮替代方案
```

---

## ⚡ 運行時性能優化

### 1. **React 元件優化**

#### 使用 memo 防止不必要的重新渲染

```typescript
// ✅ 分離不需要經常更新的元件
import { memo } from 'react';

interface HeaderProps {
  title: string;
}

const Header = memo(function Header({ title }: HeaderProps) {
  // 只在 title 改變時重新渲染
  return <h1>{title}</h1>;
});

export default Header;
```

#### 使用 useMemo 和 useCallback

```typescript
'use client';

import { useMemo, useCallback } from 'react';

interface ListProps {
  items: string[];
  onItemClick: (item: string) => void;
}

export default function List({ items, onItemClick }: ListProps) {
  // ✅ 避免每次渲染時重新計算或重新建立函式
  const sortedItems = useMemo(() => {
    console.log('排序中...');
    return [...items].sort();
  }, [items]);

  const handleClick = useCallback((item: string) => {
    onItemClick(item);
  }, [onItemClick]);

  return (
    <ul>
      {sortedItems.map((item) => (
        <li key={item}>
          <button onClick={() => handleClick(item)}>{item}</button>
        </li>
      ))}
    </ul>
  );
}
```

### 2. **API 呼叫優化**

#### 請求去重和快取

```typescript
// lib/api/cache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // 檢查是否過期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new ApiCache();
```

#### 使用 SWR 或 React Query

```typescript
// 使用 React Query（或 TanStack Query）進行更好的快取管理
// 但 MyWeb 目前未安裝，可作為未來優化方案

// 簡單的 hook 實現
import { useState, useEffect } from 'react';

function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');

        const result = await response.json();
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Error');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return { data, loading, error };
}
```

### 3. **布局穩定性 (CLS) 優化**

```typescript
// ✅ 為動態內容設定預留空間
'use client';

import { useState } from 'react';

export default function DynamicContent() {
  const [data, setData] = useState<string | null>(null);

  return (
    <div>
      {/* 預留空間，防止布局位移 */}
      <div style={{ minHeight: '100px', width: '100%' }}>
        {data ? (
          <p>{data}</p>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100px',
              backgroundColor: '#f0f0f0',
              animation: 'pulse 2s infinite',
            }}
          />
        )}
      </div>
    </div>
  );
}
```

### 4. **懶載入 (Lazy Loading)**

```typescript
// ✅ 為非關鍵圖片使用懶載入
import Image from 'next/image';

export default function ImageGallery() {
  return (
    <div>
      {/* 立即載入的圖片 */}
      <Image
        src="/hero.jpg"
        alt="Hero"
        width={800}
        height={400}
        priority
      />

      {/* 在進入視窗時才載入 */}
      <Image
        src="/gallery-1.jpg"
        alt="Gallery 1"
        width={800}
        height={600}
        loading="lazy"
      />

      {/* 更詳細的懶載入控制 */}
      <img
        src="gallery-2.jpg"
        alt="Gallery 2"
        loading="lazy"
        decoding="async"  // 非同步解碼
      />
    </div>
  );
}
```

---

## 📦 資料庫和伺服器端優化

### 1. **API 端點優化**

```typescript
// ✅ 只返回必要的資料
// 不好的做法：返回所有使用者信息
app.get('/api/users', (req, res) => {
  User.find({}, (err, users) => {
    res.json(users);  // 包含所有欄位
  });
});

// 好的做法：只返回必要的欄位
app.get('/api/users', (req, res) => {
  User.find({}, 'id name email avatar', (err, users) => {
    res.json(users);  // 僅包含必要欄位
  });
});
```

### 2. **分頁和限制**

```typescript
// ✅ 使用分頁減少每次請求的數據量
async function getUsers(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const users = await User.find()
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await User.countDocuments();

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
```

### 3. **查詢優化（資料庫索引）**

```javascript
// 在資料庫中建立索引以加快查詢
// MongoDB 示例
db.users.createIndex({ email: 1 });
db.lectures.createIndex({ date: 1 });
db.consultations.createIndex({ userId: 1 });

// 避免 N+1 查詢問題 - 使用 populate 或 joins
const consultations = await Consultation.find()
  .populate('userId')  // 一次性載入使用者信息
  .exec();
```

---

## 🔍 Lighthouse 優化清單

### LCP (Largest Contentful Paint) 優化

```markdown
[ ] 為 LCP 圖片設定 priority
[ ] 最小化主線程 JavaScript
[ ] 移除未使用的 CSS
[ ] 使用 CDN 加速資源
[ ] 啟用 GZIP 壓縮
[ ] 考慮使用 Preconnect 預連接
```

### FID/INP (互動延遲) 優化

```markdown
[ ] 分解長任務為更小的任務
[ ] 使用 Web Workers 進行繁重計算
[ ] 優化事件監聽器
[ ] 避免大型同步操作
```

### CLS (布局位移) 優化

```markdown
[ ] 為圖片和影片設定寬度和高度
[ ] 避免在已有內容上方插入內容
[ ] 使用 transform 而非 top/left 調整位置
[ ] 為動態內容預留空間
```

---

## 🛠️ 性能監控

### 1. **使用 Performance API**

```typescript
// 在元件中測量性能
'use client';

import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // 測量頁面加載時間
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime =
        perfData.loadEventEnd - perfData.navigationStart;

      console.log(`頁面加載時間：${pageLoadTime}ms`);

      // 將數據發送到分析服務
      sendPerformanceMetrics({
        pageLoadTime,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
      });
    });
  }, []);

  return null;
}

function sendPerformanceMetrics(metrics: Record<string, number>) {
  // 發送到分析服務（如 Google Analytics、Sentry 等）
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/metrics', JSON.stringify(metrics));
  }
}
```

### 2. **Web Vitals 監控**

```typescript
// lib/webVitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // 發送到您的分析後端
  const body = JSON.stringify(metric);

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/web-vitals', body);
  }
}

export function trackWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

在 app/layout.tsx 中使用：

```typescript
import { trackWebVitals } from '@/lib/webVitals';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    trackWebVitals();
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

---

## 📈 性能優化檢查清單

### 構建階段

```markdown
[ ] 運行 Lighthouse 測試
[ ] 檢查 bundle 大小：`npm run build`
[ ] 分析未使用的依賴
[ ] 檢查 CSS 是否被最小化
[ ] 檢查 JavaScript 是否被最小化
```

### 部署前

```markdown
[ ] 優化所有圖片（格式、壓縮、響應式）
[ ] 使用 Next.js Image 元件
[ ] 設定圖片 priority 屬性
[ ] 啟用字型優化
[ ] 檢查 API 響應時間
[ ] 測試不同網速條件（使用 DevTools Throttling）
```

### 部署後

```markdown
[ ] 監控 Core Web Vitals
[ ] 追蹤頁面加載時間
[ ] 監控 API 響應時間
[ ] 設定效能告警
[ ] 定期檢查 Lighthouse 分數
```

---

## 🐛 常見性能問題和解決方案

### 問題 1：LCP 時間過長

**原因**：
- 大型影像未優化
- CSS 和 JavaScript 阻塞渲染
- 伺服器響應緩慢

**解決方案**：
```typescript
// 優化影像
<Image priority src={...} />

// 延遲載入非關鍵 CSS
<link rel="preload" as="style" href="/css/lazy-styles.css" />

// 使用 dynamic import 延遲載入重型元件
const HeavyComponent = dynamic(() => import('@/components/Heavy'));
```

### 問題 2：CLS（布局位移）過高

**原因**：
- 遲延載入的廣告或嵌入元素
- 無尺寸的圖片
- 動態注入的內容

**解決方案**：
```typescript
// 為圖片設定尺寸
<Image width={800} height={600} src={...} />

// 為動態內容預留空間
<div style={{ minHeight: '200px' }}>
  {/* 內容 */}
</div>
```

### 問題 3：首次互動延遲高

**原因**：
- 主線程被 JavaScript 阻塞
- 大型事件監聽器
- 複雜的 DOM 操作

**解決方案**：
```typescript
// 使用 debounce 或 throttle
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
) {
  let timeout: ReturnType<typeof setTimeout>;

  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 使用
const handleScroll = debounce(() => {
  // 昂貴的計算
}, 200);

window.addEventListener('scroll', handleScroll);
```

---

## 📚 參考資源

- [Next.js 優化指南](https://nextjs.org/docs/guides/production)
- [Web Vitals](https://web.dev/vitals/)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Chrome DevTools 性能分析](https://developer.chrome.com/docs/devtools/performance/)
