# MyWeb 設計系統快速參考

## 🎨 色彩使用速查表

### 品牌色系
```
bg-brand-50    #f9f7f2  (極淡金)
bg-brand-100   #f0ebe2  (淡金)
bg-brand-200   #e4c4a0  (淺金)
bg-brand-300   #d4a574  ⭐ 主品牌色
bg-brand-400   #c48a4e
bg-brand-500   #a87535
bg-brand-600   #8B6F47  (深金)
bg-brand-700   #6b5436
bg-brand-800   #543e27
bg-brand-900   #3d2d1a  (深色)
```

### 使用示例
```tsx
{/* 金色文字 */}
<p className="text-brand-300">主要標題</p>

{/* 深色背景 + 金色強調 */}
<div className="bg-brand-900 border-2 border-brand-300">
  <h2 className="text-brand-300">深色卡片標題</h2>
</div>

{/* 懸停效果 */}
<button className="bg-brand-300 hover:bg-brand-400 transition-colors">
  點擊我
</button>
```

---

## 🔘 按鈕速查表

### 按鈕樣式
```tsx
// ✅ 主要按鈕 - 用於最重要的 CTA
<button className="btn-primary">
  立即加入會員
</button>

// ⚪ 次要按鈕 - 用於輔助操作
<button className="btn-secondary">
  瞭解更多
</button>

// 🟤 淺色按鈕 - 用於深色背景
<button className="btn-light">
  查看課程
</button>
```

### 按鈕在各部分的應用
| 部分 | 按鈕樣式 | 示例 |
|------|---------|------|
| Hero Section | `btn-primary` 主 + `btn-secondary` 輔 | 立即加入 + 瞭解更多 |
| CTA Section | `btn-primary` 主動 | 立即生成命盤 |
| Cards | `btn-secondary` 簡約 | 選擇此方案 |

---

## 📝 排版快速指南

### 標題層級
```tsx
// 最大 - 英雄標題 (Hero)
<h1 className="hero-title">
  看穿命運，掌握人生
</h1>

// 大 - 區域標題 (Section)
<h2 className="section-title">
  為什麼選擇 MyWeb
</h2>

// 中 - 普通標題
<h3 className="font-serif font-bold text-xl">
  精準排盤
</h3>

// 小 - 正文
<p className="text-base">
  結合天文曆法與現代計算...
</p>
```

### 字體家族
```tsx
// Sans Serif (正文)
<p className="font-sans">正常文本</p>

// Serif (標題 - 自動 Playfair Display)
<h1 className="font-serif">優雅標題</h1>

// Brand (品牌 LOGO - Pacifico)
<span className="font-brand">MyWeb</span>
```

---

## 📦 卡片樣式速查表

### 白色卡片
```tsx
<div className="card-base">
  <i className="ri-focus-3-line text-5xl text-brand-300"></i>
  <h3>標題</h3>
  <p>描述</p>
</div>
```
用於：FeaturesSection, TestimonialsSection, FAQSection

### 深色卡片
```tsx
<div className="card-dark">
  {/* 內容 */}
</div>
```
用於：深色背景上的卡片

### 定價卡片（特殊）
```tsx
<div className={`relative rounded-2xl ${
  plan.recommended
    ? 'ring-2 ring-brand-300 shadow-brand-lg bg-brand-50'
    : 'bg-white border border-gray-200'
}`}>
  {/* 定價卡片內容 */}
</div>
```

---

## 🎬 動畫和轉換速查表

### 常用轉換
```tsx
{/* 懸停時放大 */}
<button className="transform hover:scale-105 transition-transform duration-250">
  按鈕
</button>

{/* 懸停時改變顏色 */}
<button className="bg-brand-300 hover:bg-brand-400 transition-colors duration-250">
  按鈕
</button>

{/* 懸停時提升並改變陰影 */}
<div className="shadow-lg hover:shadow-brand-lg hover:-translate-y-2 transition-all duration-300">
  卡片
</div>

{/* 旋轉動畫（例如 FAQ 箭頭） */}
<i className="transition-transform duration-350 rotate-180">
  箭頭
</i>
```

---

## 🌓 深淺主題應用

### 白色背景頁面
```tsx
<section className="bg-white">
  <h2 className="text-gray-900">標題</h2>
  <p className="text-gray-700">段落文本</p>
  <button className="btn-primary">按鈕</button>
</section>
```

### 深色背景頁面
```tsx
<section className="bg-brand-900">
  <h2 className="text-white">標題</h2>
  <p className="text-brand-100">段落文本</p>
  <button className="btn-light">淺色按鈕</button>
</section>
```

### 灰色背景頁面
```tsx
<section className="bg-gray-50">
  <h2 className="text-gray-900">標題</h2>
  <p className="text-gray-700">段落文本</p>
  <button className="btn-primary">按鈕</button>
</section>
```

---

## 🔗 常用組件導入和使用

### 導入組件
```tsx
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import PricingSection from '@/components/PricingSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQSection from '@/components/FAQSection';
import FinalCTASection from '@/components/FinalCTASection';
```

### 在頁面中使用
```tsx
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
      </main>

      <Footer />
    </div>
  );
}
```

---

## 📐 間距規範（Padding & Margin）

### 標準間距類
```tsx
{/* 小間距 */}
className="p-4 m-2"  // Internal: 1rem padding, 0.5rem margin

{/* 中間距 */}
className="p-8 m-6"  // Internal: 2rem padding, 1.5rem margin

{/* 大間距 */}
className="p-12 m-8" // Internal: 3rem padding, 2rem margin

{/* 區域間距 */}
className="py-20 px-4"  // Vertical: 5rem, Horizontal: 1rem
}
```

### 常用組合
```tsx
{/* 標準卡片內間距 */}
<div className="p-8 rounded-brand">
  {/* 卡片內容 */}
</div>

{/* 標準區域外間距 */}
<section className="py-20 px-4">
  {/* 區域內容 */}
</section>
```

---

## 🎯 設計系統檢查清單

創建新組件/頁面時：
- [ ] 使用 `section-container` 或 `py-20 px-4` 進行外間距
- [ ] 使用 `max-w-6xl mx-auto` 限制內容寬度
- [ ] 標題使用合適的 `.hero-title`, `.section-title` 或 `font-serif`
- [ ] 使用 `btn-primary`, `btn-secondary`, 或 `btn-light` 替代自訂按鈕
- [ ] 卡片使用 `.card-base` 或 `.card-dark`
- [ ] 添加 `hover:` 效果提升互動性
- [ ] 添加 `transition-*` 使動畫流暢
- [ ] 確保文本顏色對比度足夠（4.5:1 以上）

---

## 💡 實用技巧

### 快速創建漸變背景
```tsx
<div className="bg-gradient-brand">
  {/* 自動深色品牌漸變 */}
</div>

<div className="bg-gradient-gold">
  {/* 自動金色漸變 */}
</div>
```

### 快速添加品牌陰影
```tsx
<div className="shadow-brand">
  {/* 金色品牌陰影 */}
</div>

<div className="shadow-brand-lg">
  {/* 較大的品牌陰影 */}
</div>
```

### 快速響應式設計
```tsx
{/* 手機版本 / 桌面版本 */}
<div className="text-sm md:text-base lg:text-lg">
  文本大小隨螢幕變化
</div>

{/* 網格布局響應 */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Item key={item.id} {...item} />)}
</div>
```

---

## 📖 相關文件

- **tailwind.config.js** - 完整的設計系統配置
- **app/globals.css** - CSS 變數和層級工具類定義
- **IMPLEMENTATION_STATUS.md** - 詳細的實施狀態報告
- **professional-website-design-guide.md** - 完整的設計指南

---

**最後更新：** 2025年3月4日
**用途：** 快速查詢和開發參考
