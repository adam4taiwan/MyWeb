"use client";
import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Header from '@/components/Header';
import { useAuth } from '@/components/AuthContext';

// 時間選單生成器
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 121 }, (_, i) => currentYear - i);
};
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 60 }, (_, i) => i);

export default function DiskPage() {
  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : (typeof window !== 'undefined' && window.location.hostname === 'localhost')
      ? 'http://localhost:5013/api'
      : 'https://ecanapi.fly.dev/api';

  const [formData, setFormData] = useState({
    dateType: 'solar', name: '吉祥名', gender: '1',
    year: 2026, month: 1, day: 1, hour: 1, minute: 0
  });

  const [report, setReport] = useState('');
  const [remainingPoints, setRemainingPoints] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [loadingText, setLoadingText] = useState('命理鑑定計算中...');
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const syncPoints = async () => {
    try {
      if (!token) return;
      const res = await fetch(`${API_URL}/Consultation/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: '同步查詢', chartRequest: formData })
      });
      if (res.ok) {
        const data = await res.json();
        setRemainingPoints(data.remainingPoints ?? data.points ?? 0);
      }
    } catch (err) { console.error("同步失敗", err); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (token) syncPoints(); }, [token]);

  // 過濾特殊符號
  const cleanReport = (text: string) => {
    return text.replace(/[#*]/g, '').replace(/\n\s*\n/g, '\n');
  };

  const handleAnalysis = async () => {
    if (remainingPoints !== null && remainingPoints < 10) return alert("點數不足");
    setLoadingText('命理鑑定計算中...');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/Consultation/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: '綜合鑑定', chartRequest: formData })
      });
      const data = await res.json();
      if (res.ok) { 
        setReport(cleanReport(data.result || data.analysis || '')); 
        setRemainingPoints(data.remainingPoints); 
      }
    } catch { alert('鑑定失敗'); } finally { setIsLoading(false); }
  };

  // 🚩 優化後的 PDF 生成邏輯：解決亂碼與截斷
  const generatePDF = async () => {
    const element = document.getElementById('report-paper');
    if (!element) return;
    
    setLoadingText('正在生成 PDF 鑑定書...'); // 明確提示，避免誤會是重新鑑定
    setIsLoading(true);
    
    try {
      // 使用更高精度的渲染配置
      const canvas = await html2canvas(element, { 
        scale: 2,           // 2倍清晰度
        useCORS: true,      // 跨域支持
        logging: false,     // 減少負擔
        backgroundColor: '#F9F3E9' // 確保背景色一致
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.8); // 使用 JPEG 壓縮減少檔案大小
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // 如果鑑定書太長，自動分頁處理（或調整比例）
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formData.name}_命理鑑定書.pdf`);
    } catch {
      alert("PDF 儲存失敗，請嘗試手動截圖");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportXLS = async () => {
    if (!token) return alert("請先登入");
    setLoadingText('正在導出命盤資料...');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/Astrology/Export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${formData.name}_命盤.xls`;
        document.body.appendChild(a); a.click(); a.remove();
      }
    } catch { alert("下載失敗"); } finally { setIsLoading(false); }
  };

  const handlePurchase = async () => {
    setPurchaseLoading(true);
    try {
      const userEmail = localStorage.getItem('email');
      if (!userEmail) {
        alert("請先登入，系統才能同步您的帳號資訊進行儲值。");
        setPurchaseLoading(false);
        return;
      }
      const res = await fetch(`${API_URL}/Payment/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ points: 50, price: 500, userName: userEmail })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { alert("支付跳轉失敗"); } finally { setPurchaseLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col relative">
      <div className="fixed top-0 left-0 right-0 z-[100] bg-white shadow-md"><Header /></div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/30 z-[9999] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-700 mb-4"></div>
            <p className="text-amber-900 font-bold text-xl tracking-widest text-center">{loadingText}</p>
          </div>
        </div>
      )}

      <main className="flex-1 pt-24 px-4 pb-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          <div className="md:col-span-4 bg-white p-5 rounded-3xl shadow-sm border border-orange-100 text-sm">
            <h2 className="text-lg font-bold text-amber-950 mb-4">命主資料</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-600 mb-1 font-bold text-xs">姓名</label>
                <input type="text" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full px-3 py-1.5 rounded-xl border border-gray-200 outline-none focus:border-amber-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-2 items-end">
                <div>
                  <label className="block text-gray-600 mb-1 font-bold text-xs">性別</label>
                  <select value={formData.gender} onChange={(e)=>setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-1.5 rounded-xl border border-gray-200">
                    <option value="1">乾造 (男)</option><option value="0">坤造 (女)</option>
                  </select>
                </div>
                <div className="text-amber-700 font-bold bg-amber-50 px-3 py-1.5 rounded-xl text-center text-xs border border-amber-100">
                  餘額：{remainingPoints !== null ? remainingPoints : '--'} 點
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div><label className="text-[10px] text-gray-400">西元年</label><select value={formData.year} onChange={(e)=>setFormData({...formData, year: parseInt(e.target.value)})} className="w-full border rounded p-1 text-xs">{generateYears().map(y => <option key={y} value={y}>{y}年</option>)}</select></div>
                <div><label className="text-[10px] text-gray-400">月</label><select value={formData.month} onChange={(e)=>setFormData({...formData, month: parseInt(e.target.value)})} className="w-full border rounded p-1 text-xs">{months.map(m => <option key={m} value={m}>{m}月</option>)}</select></div>
                <div><label className="text-[10px] text-gray-400">日</label><select value={formData.day} onChange={(e)=>setFormData({...formData, day: parseInt(e.target.value)})} className="w-full border rounded p-1 text-xs">{days.map(d => <option key={d} value={d}>{d}日</option>)}</select></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[10px] text-gray-400">小時</label><select value={formData.hour} onChange={(e)=>setFormData({...formData, hour: parseInt(e.target.value)})} className="w-full border rounded p-1 text-xs">{hours.map(h => <option key={h} value={h}>{h}時</option>)}</select></div>
                <div><label className="text-[10px] text-gray-400">分鐘</label><select value={formData.minute} onChange={(e)=>setFormData({...formData, minute: parseInt(e.target.value)})} className="w-full border rounded p-1 text-xs">{minutes.map(m => <option key={m} value={m}>{m}分</option>)}</select></div>
              </div>

              <div className="pt-2 space-y-2">
                <button onClick={handleExportXLS} className="w-full bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs shadow-md">📥 下載數位命盤 (XLS)</button>
                <button onClick={handleAnalysis} className="w-full bg-amber-800 text-white font-bold py-3 rounded-2xl text-sm shadow-md">✨ 啟動深度鑑定 (10點)</button>
              </div>
            </div>
          </div>

          <div className="md:col-span-8">
            <div className="mb-4 bg-gradient-to-r from-amber-800 to-amber-950 p-4 rounded-[2rem] text-white flex justify-between items-center shadow-lg">
              <div><p className="text-xs opacity-70">PREMIUM CREDITS</p><p className="font-bold">NT$ 500 / 50 點</p></div>
              <button onClick={handlePurchase} disabled={purchaseLoading} className="bg-white text-amber-900 px-6 py-2 rounded-full font-bold text-sm shadow-sm active:scale-95 transition-all">{purchaseLoading ? "處理中..." : "立即儲值"}</button>
            </div>

            {report ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={generatePDF} className="bg-amber-100 text-amber-900 border border-amber-300 px-5 py-2 rounded-full text-xs font-bold hover:bg-amber-200 transition-all shadow-sm flex items-center gap-2">
                    💾 儲存 PDF 鑑定書
                  </button>
                </div>
                <div className="bg-white p-1 shadow-2xl border border-red-50 rounded-sm overflow-hidden">
                  <div 
                    id="report-paper" 
                    className="p-12 relative bg-[#F9F3E9]"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(255, 0, 0, 0.15) 1px, transparent 1px)',
                      backgroundSize: '100% 40px',
                      border: '18px double #4a3721',
                      lineHeight: '40px'
                    }}
                  >
                    <h2 className="text-3xl font-bold text-center text-amber-950 mb-8 border-b-2 border-red-800 pb-4 tracking-[1em]">命理鑑定書</h2>
                    <div 
                      className="whitespace-pre-wrap text-xl text-gray-800 text-justify tracking-[0.1em]"
                      style={{ 
                        fontFamily: '"標楷體", "Kaiti", "BiauKai", "DFKai-SB", "STKaiti", serif',
                        paddingTop: '2px'
                      }}
                    >
                      {report}
                    </div>
                    <div className="mt-20 text-right text-amber-900/40 italic text-sm font-serif">玉洞子 謹誌</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[500px] border-2 border-dashed border-amber-100 rounded-[3rem] flex items-center justify-center bg-white/40 font-bold text-amber-200 text-xl italic tracking-widest">請輸入資料後開啟深度鑑定</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}