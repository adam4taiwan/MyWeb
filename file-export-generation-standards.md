# file-export-generation-standards.md

此檔案定義 MyWeb 專案中檔案導出和生成（PDF、圖片等）的技術規範。

---

## 📦 相關函式庫

MyWeb 使用以下函式庫進行檔案導出和生成：

| 函式庫 | 版本 | 用途 |
|-------|------|------|
| **html2canvas** | ^1.4.1 | 將 HTML 元素轉換為圖片 |
| **jspdf** | ^4.1.0 | 生成 PDF 文檔 |
| **js-cookie** | ^3.0.5 | Cookie 管理（用於下載設定） |

---

## 🖼️ 圖片導出 (html2canvas)

### 基本使用

`html2canvas` 將任何 HTML 元素轉換為 Canvas，然後可以導出為圖片。

#### 安裝

```bash
npm install html2canvas
```

#### 基本範例

```typescript
import html2canvas from 'html2canvas';

// 獲取要導出的元素
const element = document.getElementById('chart-container');

// 轉換為圖片
const canvas = await html2canvas(element);

// 下載圖片
const link = document.createElement('a');
link.href = canvas.toDataURL('image/png');
link.download = 'chart.png';
link.click();
```

### 實際應用範例：命盤分析頁面

```typescript
// components/DiskAnalysis/DiskChart.tsx
'use client';

import { useRef } from 'react';
import html2canvas from 'html2canvas';

interface DiskChartProps {
  data: ChartData;
  chartName: string;
}

export default function DiskChart({ data, chartName }: DiskChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // 導出為 PNG
  const exportAsImage = async () => {
    if (!chartRef.current) return;

    try {
      // 配置選項
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,  // 提高解析度
        logging: false,
        useCORS: true,  // 允許跨域圖片
      });

      // 建立下載連結
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${chartName}-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('匯出圖片失敗:', error);
      alert('匯出失敗，請重試');
    }
  };

  // 複製到剪貼板
  const copyToClipboard = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);

        alert('圖片已複製到剪貼板');
      });
    } catch (error) {
      console.error('複製失敗:', error);
      alert('複製失敗，請重試');
    }
  };

  return (
    <div>
      {/* 圖表容器 */}
      <div
        ref={chartRef}
        className="bg-white p-8 rounded-lg shadow"
        style={{
          width: '800px',
          height: '600px',
        }}
      >
        {/* 您的圖表內容 */}
        <h2 className="text-2xl font-bold mb-4">{chartName} 分析</h2>
        {/* 圖表內容... */}
      </div>

      {/* 操作按鈕 */}
      <div className="space-x-4 mt-4">
        <button
          onClick={exportAsImage}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg"
        >
          下載為圖片 (PNG)
        </button>

        <button
          onClick={copyToClipboard}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          複製到剪貼板
        </button>
      </div>
    </div>
  );
}
```

### html2canvas 高級配置

```typescript
const canvas = await html2canvas(element, {
  // 背景顏色
  backgroundColor: '#ffffff',

  // 擴大尺寸以提高解析度
  // 1 = 原始解析度，2 = 2 倍，3 = 3 倍
  scale: 2,

  // 日誌輸出
  logging: false,

  // 允許跨域圖片
  useCORS: true,

  // 允許使用代理（需要後端支持）
  proxy: null,

  // 超時時間（毫秒）
  timeout: 0,

  // 渲染寬度
  width: 800,
  height: 600,

  // 排除元素
  // 將 data-html2canvas-ignore 添加到 HTML 中的元素會被忽略
});
```

### 最佳實踐

#### 1. **指定寬度和高度**

```typescript
const canvas = await html2canvas(chartRef.current, {
  width: 800,
  height: 600,
  scale: 2,
});

// 這確保輸出大小一致
```

#### 2. **處理跨域資源**

```typescript
// 在圖片上添加 crossOrigin 屬性
<img
  src="image-url"
  alt="description"
  crossOrigin="anonymous"
/>
```

#### 3. **排除某些元素**

```typescript
// 在 HTML 中添加特殊屬性
<div data-html2canvas-ignore="true">
  {/* 這個元素不會被包含在匯出中 */}
</div>

// 或在配置中使用 filter
const canvas = await html2canvas(element, {
  filter: (node) => {
    // 排除某些類名的元素
    return !node.className?.includes('no-export');
  },
});
```

---

## 📄 PDF 生成 (jsPDF)

### 基本使用

```bash
npm install jspdf
```

#### 簡單的 PDF 生成

```typescript
import jsPDF from 'jspdf';

// 建立新 PDF 文檔
const pdf = new jsPDF();

// 添加文字
pdf.text('命盤分析報告', 20, 20);
pdf.text('製作日期：' + new Date().toLocaleDateString('zh-TW'), 20, 30);

// 保存 PDF
pdf.save('report.pdf');
```

### 實際應用：結合命盤圖表

```typescript
// lib/export/diskReportGenerator.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { DiskAnalysisData } from '@/types/disk';

/**
 * 生成命盤分析 PDF 報告
 * @param chartElement - 包含圖表的 HTML 元素
 * @param data - 分析數據
 * @returns Promise<void>
 */
export async function generateDiskReport(
  chartElement: HTMLElement,
  data: DiskAnalysisData
): Promise<void> {
  try {
    // 1. 將圖表轉換為圖片
    const chartCanvas = await html2canvas(chartElement, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });

    const chartImage = chartCanvas.toDataURL('image/png');

    // 2. 建立 PDF 文檔
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let currentY = margin;

    // 3. 添加標題
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('命盤分析報告', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // 4. 添加基本信息
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');

    pdf.text(`姓名：${data.name}`, margin, currentY);
    currentY += 8;

    pdf.text(`出生日期：${data.birthDate}`, margin, currentY);
    currentY += 8;

    pdf.text(`性別：${data.gender}`, margin, currentY);
    currentY += 12;

    // 5. 添加分析結果標題
    pdf.setFont(undefined, 'bold');
    pdf.text('分析結果', margin, currentY);
    currentY += 10;

    // 6. 添加命盤圖表
    const imgWidth = pageWidth - 2 * margin;
    const imgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;

    // 檢查是否需要新頁面
    if (currentY + imgHeight > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }

    pdf.addImage(chartImage, 'PNG', margin, currentY, imgWidth, imgHeight);
    currentY += imgHeight + 10;

    // 7. 添加分析文字
    if (currentY + 30 > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }

    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(11);

    const analysisText = pdf.splitTextToSize(
      data.analysis,
      pageWidth - 2 * margin
    );

    pdf.text(analysisText, margin, currentY);

    // 8. 添加頁腳
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.text(
        `第 ${i} 頁，共 ${totalPages} 頁`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      pdf.text(
        `製作日期：${new Date().toLocaleDateString('zh-TW')}`,
        margin,
        pageHeight - 10
      );
    }

    // 9. 保存 PDF
    pdf.save(`命盤報告-${data.name}-${new Date().getTime()}.pdf`);
  } catch (error) {
    console.error('PDF 生成失敗:', error);
    throw new Error('無法生成 PDF 報告');
  }
}
```

### 在頁面元件中使用

```typescript
// app/disk/page.tsx
'use client';

import { useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { generateDiskReport } from '@/lib/export/diskReportGenerator';
import DiskChart from './DiskChart';
import Button from '@/components/Button';
import type { DiskAnalysisData } from '@/types/disk';

export default function DiskPage() {
  const { isAuthenticated } = useAuth();
  const chartRef = useRef<HTMLDivElement>(null);

  const analysisData: DiskAnalysisData = {
    // 您的數據...
  };

  const handleExportPDF = async () => {
    if (!chartRef.current) return;

    try {
      await generateDiskReport(chartRef.current, analysisData);
      // 成功訊息自動通過 PDF 下載提示
    } catch (error) {
      alert('導出 PDF 失敗，請重試');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">命盤分析</h1>

          {/* 圖表容器 */}
          <div
            ref={chartRef}
            className="bg-white p-8 rounded-lg shadow mb-8"
          >
            <DiskChart data={analysisData} />
          </div>

          {/* 導出按鈕 */}
          <div className="flex gap-4">
            <Button variant="primary" onClick={handleExportPDF}>
              下載 PDF 報告
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
    </div>
  );
}
```

### jsPDF 進階用法

#### 1. **分頁處理**

```typescript
const pdf = new jsPDF();
const pageHeight = pdf.internal.pageSize.getHeight();
const margin = 15;

let currentY = margin;

// 為每個項目添加內容
for (const item of items) {
  // 如果內容超過當前頁面，添加新頁面
  if (currentY + 20 > pageHeight - margin) {
    pdf.addPage();
    currentY = margin;
  }

  pdf.text(item.title, margin, currentY);
  currentY += 20;
}
```

#### 2. **自訂字型**

```typescript
// 注意：jsPDF 默認支持基本字型
// 標準字型：Helvetica, Times, Courier

pdf.setFont('times', 'italic');
pdf.text('這是斜體文本', 20, 30);

pdf.setFont('courier', 'bold');
pdf.text('這是粗體 Courier 文本', 20, 40);
```

#### 3. **添加表格**

```typescript
// 需要 jspdf-autotable 外掛
import 'jspdf-autotable';

const pdf = new jsPDF();

pdf.autoTable({
  head: [['姓名', '分析類型', '日期']],
  body: [
    ['張三', '八字分析', '2025-03-04'],
    ['李四', '紫微斗數', '2025-03-03'],
  ],
  startY: 20,
});

pdf.save('table.pdf');
```

---

## 📊 導出為其他格式

### CSV 導出（用於數據）

```typescript
/**
 * 將數據導出為 CSV
 */
export function exportAsCSV(
  data: Record<string, any>[],
  filename: string = 'export.csv'
): void {
  // 提取標題
  const headers = Object.keys(data[0] || {});

  // 建立 CSV 內容
  let csvContent = headers.join(',') + '\n';

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      // 處理包含逗號的值
      return typeof value === 'string' && value.includes(',')
        ? `"${value}"`
        : value;
    });
    csvContent += values.join(',') + '\n';
  }

  // 下載檔案
  const link = document.createElement('a');
  link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
  link.download = filename;
  link.click();
}

// 使用範例
const data = [
  { name: '講座 1', date: '2025-03-10', attendees: 50 },
  { name: '講座 2', date: '2025-03-15', attendees: 75 },
];
exportAsCSV(data, 'lectures.csv');
```

### JSON 導出

```typescript
export function exportAsJSON(
  data: any,
  filename: string = 'export.json'
): void {
  const jsonString = JSON.stringify(data, null, 2);

  const link = document.createElement('a');
  link.href = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
  link.download = filename;
  link.click();
}
```

---

## 🔒 安全和性能注意事項

### 1. **檔案大小限制**

```typescript
// 限制導出內容大小，避免浏覽器卡頓
const MAX_CANVAS_SIZE = 4096; // 像素
const MAX_PDF_SIZE = 50; // MB

async function validateExportSize(element: HTMLElement): Promise<boolean> {
  if (element.scrollWidth > MAX_CANVAS_SIZE) {
    alert(`導出元素過寬（最大 ${MAX_CANVAS_SIZE}px）`);
    return false;
  }

  return true;
}
```

### 2. **非同步操作和進度反饋**

```typescript
async function exportLargeFile(element: HTMLElement) {
  // 顯示進度指示器
  setIsExporting(true);

  try {
    // 執行耗時操作
    const canvas = await html2canvas(element);
    // ... 生成 PDF

    setIsExporting(false);
    alert('導出成功！');
  } catch (error) {
    setIsExporting(false);
    alert('導出失敗：' + error.message);
  }
}
```

### 3. **敏感信息過濾**

```typescript
// 在導出前移除或隱藏敏感信息
<div>
  <p>公開信息</p>
  <p data-html2canvas-ignore="true">
    隱私信息（不會被匯出）
  </p>
</div>
```

### 4. **瀏覽器相容性**

```typescript
// 檢查浏覽器支持
function canExport(): boolean {
  // 檢查是否支持 Canvas
  const canvas = document.createElement('canvas');
  return canvas.getContext('2d') !== null;
}

if (!canExport()) {
  alert('您的瀏覽器不支持檔案匯出功能');
}
```

---

## 📋 導出功能檢查清單

### 開發時

```markdown
[ ] 為 html2canvas 和 jspdf 安裝依賴
[ ] 建立匯出工具函式（在 lib/export/ 中）
[ ] 測試各種元素的匯出（圖表、表格、圖片）
[ ] 測試跨域資源（添加 CORS 屬性）
[ ] 測試不同檔案大小
```

### 功能實作

```markdown
[ ] 添加導出按鈕到相關頁面
[ ] 實現進度指示器
[ ] 添加錯誤處理和用戶提示
[ ] 支援多種格式（PNG、PDF、CSV 等）
[ ] 實現檔案命名規範（包含日期和使用者名稱）
```

### 測試

```markdown
[ ] 導出的檔案大小合理
[ ] 導出的檔案能正常打開
[ ] 圖片品質清晰
[ ] PDF 分頁正確
[ ] 在不同瀏覽器中測試
[ ] 測試大型內容導出
```

### 安全性

```markdown
[ ] 敏感信息已被排除
[ ] 文件名不包含敏感信息
[ ] 導出操作受到認證保護
[ ] 記錄了導出操作（用於審計）
```

---

## 🐛 常見問題和解決方案

### 問題 1：html2canvas 導出的圖片模糊

```typescript
// 解決方案：增加 scale
const canvas = await html2canvas(element, {
  scale: 3,  // 而不是 2
});
```

### 問題 2：跨域圖片無法加載

```typescript
// 確保圖片有 CORS 屬性
<img
  src="external-image.jpg"
  crossOrigin="anonymous"
/>

// 或在 html2canvas 配置中
const canvas = await html2canvas(element, {
  useCORS: true,
  proxy: 'your-proxy-server', // 如果需要代理
});
```

### 問題 3：PDF 中文字亂碼

```typescript
// jsPDF 預設不支持中文
// 解決方案：使用 custom font 或 rendering library
// 目前建議：在 PDF 中嵌入圖片而不是文字

const chartImage = await html2canvas(element);
pdf.addImage(chartImage, 'PNG', 10, 10, 190, 100);
```

### 問題 4：大型元素超時

```typescript
// 增加超時時間
const canvas = await html2canvas(element, {
  timeout: 30000,  // 30 秒
  scale: 1,  // 降低解析度以加快導出
});
```

---

## 📚 參考資源

- [html2canvas 官方文檔](https://html2canvas.hertzen.com/)
- [jsPDF 官方文檔](https://github.com/parallax/jsPDF)
- [Browser Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
