// app/disk/page.tsx
"use client";
import { useState } from 'react';

// --- Helper Functions and Data (輔助函數和數據) ---

// 生成年份選項 (從當前年往前推 100 年)
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 100; i--) {
    years.push(i);
  }
  return years;
};

// 生成月份選項
const months = Array.from({ length: 12 }, (_, i) => i + 1);

// 生成日期選項 (最大 31 天)
const days = Array.from({ length: 31 }, (_, i) => i + 1);

// 生成小時選項 (0 到 23)
const hours = Array.from({ length: 24 }, (_, i) => i);

// 生成分鐘選項 (0 到 59，以便精確輸入)
const minutes = Array.from({ length: 60 }, (_, i) => i); 

// --- 主元件 ---

export default function DiskPage() {
  const [formData, setFormData] = useState({
    dateType: 'solar',
    year: 1973, 
    month: 10,   
    day: 18,     
    hour: 15,   
    minute: 56, 
    gender: '1',
    name: '吉祥名',
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false); // 下載狀態

  // 輔助函數：構造後端所需的 AstrologyRequest 請求體
  const buildRequestBody = () => {
    // 構造後端期望的請求體
    return {
      year: formData.year,
      month: formData.month,
      day: formData.day,
      hour: formData.hour,
      minute: formData.minute,
      gender: parseInt(formData.gender, 10),
      name: formData.name || '命盤',
      // dateType (solar/lunar) 目前未在後端 AstrologyRequest 中，故不傳遞。
    };
  };

  // --- 【新增下載函數】handleDownload ---
  const handleDownload = async () => {
    setError('');
    
    if (!formData.name || !formData.year || !formData.month || !formData.day) {
        setError('請先輸入完整的姓名和生日資訊。');
        return;
    }

    setDownloading(true);
    const requestBody = buildRequestBody();
    
    try {
        // const url = process.env.NEXT_PUBLIC_API_URL + '/api/Astrology/export';
        const url = 'https://ecanapi.fly.dev' + '/api/Astrology/export';       
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody), 
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API 檔案匯出錯誤 (${response.status}): ${errorText.substring(0, 100)}...`);
        }

        const blob = await response.blob();
        
        // 嘗試從 Content-Disposition 獲取檔名，並處理中文編碼
        let filename = `${requestBody.name}_AstrologyChart.xls`; 
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
            const match = contentDisposition.match(/filename\*?=\"?([^;"]+)\"?/i);
            if (match) {
                // 嘗試解碼 RFC 5987 格式的檔名，否則直接使用
                filename = match[1].startsWith('utf-8') ? decodeURIComponent(match[1].split("'").pop() as string) : match[1];
            }
        }

        const urlBlob = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlBlob;
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(urlBlob);
        
        // 可選擇顯示一個成功訊息
        // alert(`命盤已成功下載為 ${filename}`);

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '未知下載錯誤';
        setError(`下載命盤失敗: ${errorMessage}`);
    } finally {
        setDownloading(false);
    }
  };


  // --- 排盤計算函數 handleSubmit ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    if (!formData.name || !formData.year || !formData.month || !formData.day) {
        setError('請先輸入完整的姓名和生日資訊。');
        setLoading(false);
        return;
    }

    const requestBody = buildRequestBody();

    try {
      const url = process.env.NEXT_PUBLIC_API_URL + '/api/Astrology/calculate';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody), // 發送轉換後的 requestBody
      });
      
      // 增強錯誤處理：檢查 HTTP 狀態碼
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 錯誤 (${response.status} ${response.statusText}): ${errorText.substring(0, 100)}...`);
      }

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        // --- 輸出符合 Ecanapi 格式的詳細數據 (包含六神修正) ---
        
        const bazi = data.bazi;
        // 檢查八字數據是否存在，並使用正確的 timePillar 屬性
        const isBaziComplete = bazi && bazi.yearPillar && bazi.monthPillar && bazi.dayPillar && bazi.timePillar; 
        
        const mainInfo = `
          <p><strong>姓名:</strong> ${requestBody.name} &nbsp;&nbsp;|&nbsp;&nbsp; 
          <strong>生日:</strong> ${requestBody.year}-${String(requestBody.month).padStart(2, '0')}-${String(requestBody.day).padStart(2, '0')} ${String(requestBody.hour).padStart(2, '0')}:${String(requestBody.minute).padStart(2, '0')}
          </p>
          <p><strong>五行局:</strong> ${data.wuXingJuText} &nbsp;&nbsp;|&nbsp;&nbsp; 
          <strong>命主:</strong> ${data.mingZhu} &nbsp;&nbsp;|&nbsp;&nbsp; 
          <strong>身主:</strong> ${data.shenZhu}
          </p>
        `;

        const baziPillars = isBaziComplete
          ? `
            <p><strong>日主:</strong> ${bazi.dayMaster}</p>
            <table class="w-full text-left border-collapse mt-2">
              <thead>
                <tr>
                  <th class="border p-2"></th>
                  <th class="border p-2">年柱</th>
                  <th class="border p-2">月柱</th>
                  <th class="border p-2">日柱</th>
                  <th class="border p-2">時柱</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="border p-2">天干 (六神)</td>
                  <td class="border p-2">${bazi.yearPillar.heavenlyStem} (${bazi.yearPillar.heavenlyStemLiuShen})</td>
                  <td class="border p-2">${bazi.monthPillar.heavenlyStem} (${bazi.monthPillar.heavenlyStemLiuShen})</td>
                  <td class="border p-2">${bazi.dayPillar.heavenlyStem} (日主)</td>
                  <td class="border p-2">${bazi.timePillar.heavenlyStem} (${bazi.timePillar.heavenlyStemLiuShen})</td>
                </tr>
                <tr>
                  <td class="border p-2">地支 (藏干六神)</td>
                  <td class="border p-2">${bazi.yearPillar.earthlyBranch} (${bazi.yearPillar.hiddenStemLiuShen.join('/')})</td>
                  <td class="border p-2">${bazi.monthPillar.earthlyBranch} (${bazi.monthPillar.hiddenStemLiuShen.join('/')})</td>
                  <td class="border p-2">${bazi.dayPillar.earthlyBranch} (${bazi.dayPillar.hiddenStemLiuShen.join('/')})</td>
                  <td class="border p-2">${bazi.timePillar.earthlyBranch} (${bazi.timePillar.hiddenStemLiuShen.join('/')})</td>
                </tr>
                <tr>
                  <td class="border p-2">納音</td>
                  <td class="border p-2">${bazi.yearPillar.naYin}</td>
                  <td class="border p-2">${bazi.monthPillar.naYin}</td>
                  <td class="border p-2">${bazi.dayPillar.naYin}</td>
                  <td class="border p-2">${bazi.timePillar.naYin}</td>
                </tr>
              </tbody>
            </table>
          ` : '<p><strong>八字數據缺失。</strong></p>';

        setResult(mainInfo + baziPillars); // 組合主要資訊和八字表
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知錯誤';
      setError(`排盤請求失敗: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">線上排盤</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block">姓名</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 rounded w-full"
            placeholder="請輸入姓名"
            required
          />
        </div>
        <div>
          <label className="block">日期類型</label>
          <select
            value={formData.dateType}
            onChange={(e) => setFormData({ ...formData, dateType: e.target.value })}
            className="border p-2 rounded w-full"
            disabled // 暫時禁用，因為後端模型只處理西曆
          >
            <option value="solar">西曆 (暫時鎖定)</option>
            <option value="lunar">農曆</option>
          </select>
        </div>
        
        {/* 日期下拉選單 */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block">年</label>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value, 10) })}
              className="border p-2 rounded w-full"
            >
              {generateYears().map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block">月</label>
            <select
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value, 10) })}
              className="border p-2 rounded w-full"
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block">日</label>
            <select
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value, 10) })}
              className="border p-2 rounded w-full"
            >
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* 時間下拉選單 */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block">時 (HH)</label>
            <select
              value={formData.hour}
              onChange={(e) => setFormData({ ...formData, hour: parseInt(e.target.value, 10) })}
              className="border p-2 rounded w-full"
            >
              {hours.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
            </select>
          </div>
          <div>
            <label className="block">分 (MM)</label>
            <select
              value={formData.minute}
              onChange={(e) => setFormData({ ...formData, minute: parseInt(e.target.value, 10) })}
              className="border p-2 rounded w-full"
            >
              {minutes.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block">性別</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="border p-2 rounded w-full"
          >
            <option value="1">男</option>
            <option value="2">女</option>
          </select>
        </div>
        
        {/* 雙按鈕：生成命盤 和 下載命盤 */}
        <div className="grid grid-cols-2 gap-2">
            <button
                type="submit"
                className="bg-amber-600 text-white p-2 rounded w-full disabled:bg-gray-400"
                disabled={loading || downloading}
            >
                {loading ? '生成中...' : '生成命盤'}
            </button>
            
            <button
                type="button" 
                onClick={handleDownload} // 新增的下載功能
                className="bg-green-600 text-white p-2 rounded w-full disabled:bg-gray-400"
                disabled={downloading || loading}
            >
                {downloading ? '下載中...' : '下載命盤 (XLS)'}
            </button>
        </div>

        {error && <div className="text-red-500 mt-2">{error}</div>}
        {/* 使用 dangerouslySetInnerHTML 渲染 HTML 格式的結果 */}
        {result && <div className="mt-4 p-4 bg-gray-100 rounded" dangerouslySetInnerHTML={{ __html: result }} />}
      </form>
    </div>
  );
}