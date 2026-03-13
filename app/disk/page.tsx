"use client";
import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Header from '@/components/Header';
import { useAuth } from '@/components/AuthContext';

const generateYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 121 }, (_, i) => currentYear - i);
};
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 60 }, (_, i) => i);

const REPORT_TYPES = [
  { key: '綜合性命書', label: '綜合命書', cost: 50, desc: '八字紫微全面鑑定' },
  { key: '大運命書', label: '大運命書', cost: 150, desc: '逐月吉凶大運推演' },
  { key: '流年命書', label: '流年命書', cost: 20, desc: '指定年份運勢推演' },
  { key: '問事', label: '問事鑑定', cost: 10, desc: '針對特定事項剖析' },
] as const;

const FORTUNE_DURATIONS = [
  { value: 5, label: '5年大運', cost: 150 },
  { value: 10, label: '10年大運', cost: 200 },
  { value: 20, label: '20年大運', cost: 250 },
  { value: 30, label: '30年大運', cost: 300 },
  { value: 0, label: '終身命書', cost: 500 },
];

const TOPICS = ['事業', '婚姻', '財運', '子女', '學業', '買房', '投資', '住宅風水', '合夥', '出國', '開店'];

type ReportTypeKey = typeof REPORT_TYPES[number]['key'];

export default function DiskPage() {
  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : (typeof window !== 'undefined' && window.location.hostname === 'localhost')
      ? 'http://localhost:5013/api'
      : 'https://ecanapi.fly.dev/api';

  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    dateType: 'solar', name: '吉祥名', gender: '1',
    year: 2000, month: 1, day: 1, hour: 1, minute: 0
  });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [reportType, setReportType] = useState<ReportTypeKey>('綜合性命書');
  const [targetYear, setTargetYear] = useState(currentYear);
  const [topic, setTopic] = useState('事業');
  const [fortuneDuration, setFortuneDuration] = useState(5);

  const [report, setReport] = useState('');
  const [reportTitle, setReportTitle] = useState('命理鑑定書');
  const [remainingPoints, setRemainingPoints] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('命理鑑定計算中...');
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [chartSaving, setChartSaving] = useState(false);
  const [chartSavedMsg, setChartSavedMsg] = useState('');

  // 登入後自動載入會員生辰資料
  const loadProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/Auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.hasBirthData) {
          setFormData({
            dateType: data.dateType ?? 'solar',
            name: data.chartName ?? data.name ?? '吉祥名',
            gender: String(data.birthGender ?? 1),
            year: data.birthYear,
            month: data.birthMonth,
            day: data.birthDay,
            hour: data.birthHour,
            minute: data.birthMinute ?? 0,
          });
        }
        setRemainingPoints(data.points ?? 0);
        setIsAdmin(data.isAdmin === true);
        setProfileLoaded(true);
      }
    } catch (err) { console.error("載入生辰失敗", err); }
  };

  // 儲存生辰至會員資料
  const saveProfile = async () => {
    if (!token) return;
    setProfileSaving(true);
    try {
      const res = await fetch(`${API_URL}/Auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          chartName: formData.name,
          birthYear: formData.year,
          birthMonth: formData.month,
          birthDay: formData.day,
          birthHour: formData.hour,
          birthMinute: formData.minute,
          birthGender: parseInt(formData.gender),
          dateType: formData.dateType,
        })
      });
      if (res.ok) alert('生辰資料已儲存至會員帳號');
      else alert('儲存失敗');
    } catch { alert('儲存失敗'); } finally { setProfileSaving(false); }
  };

  const saveChart = async () => {
    if (!token) return;
    setChartSaving(true);
    setChartSavedMsg('');
    try {
      const calcRes = await fetch(`${API_URL}/Astrology/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!calcRes.ok) { setChartSavedMsg('排盤失敗，請確認生辰資料'); return; }
      const chartData = await calcRes.json();
      const saveRes = await fetch(`${API_URL}/Astrology/save-chart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(chartData),
      });
      const saveData = await saveRes.json();
      if (saveRes.ok) {
        setChartSavedMsg(`命盤已儲存！命宮主星：${saveData.mingGongMainStars || '無主星'}`);
      } else {
        setChartSavedMsg('命盤儲存失敗');
      }
    } catch { setChartSavedMsg('連線失敗'); } finally { setChartSaving(false); }
  };

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
  useEffect(() => { if (token) loadProfile(); }, [token]);

  const cleanReport = (text: string) => {
    return text.replace(/[#*]/g, '').replace(/\n\s*\n/g, '\n')
      .replace(/（限\d+字[內以]?）/g, '').replace(/\(限\d+字[內以]?\)/g, '');
  };

  const renderReport = (text: string) => {
    const lines = text.split('\n');
    const segments: React.ReactNode[] = [];
    let tableRows: string[][] = [];
    let isFirstRow = true;

    const flushTable = (key: number) => {
      if (tableRows.length === 0) return;
      segments.push(
        <table key={`t${key}`} className="w-full border-collapse my-2 text-sm">
          <tbody>
            {tableRows.map((cells, i) => (
              <tr key={i}>
                {cells.map((c, j) =>
                  i === 0
                    ? <th key={j} className="border border-amber-700 bg-amber-100 p-1 text-center font-bold">{c}</th>
                    : <td key={j} className="border border-amber-600 p-1 text-center leading-snug">{c}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      );
      tableRows = [];
      isFirstRow = true;
    };

    let textBuffer = '';
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      const isTableRow = trimmed.startsWith('|') && trimmed.endsWith('|');
      const isSeparator = /^\|[\s:\-|]+\|$/.test(trimmed);

      if (isSeparator) return;

      if (isTableRow) {
        if (textBuffer) {
          segments.push(<span key={`s${idx}`} className="whitespace-pre-wrap">{textBuffer}</span>);
          textBuffer = '';
        }
        tableRows.push(trimmed.slice(1, -1).split('|').map(c => c.trim()));
      } else {
        if (tableRows.length > 0) flushTable(idx);
        textBuffer += line + '\n';
      }
    });

    if (tableRows.length > 0) flushTable(lines.length);
    if (textBuffer) segments.push(<span key="last" className="whitespace-pre-wrap">{textBuffer}</span>);

    return segments;
  };

  const getSelectedType = () => {
    const base = REPORT_TYPES.find(t => t.key === reportType)!;
    if (reportType === '大運命書') {
      const dur = FORTUNE_DURATIONS.find(d => d.value === fortuneDuration)!;
      return { ...base, cost: dur.cost, label: dur.label };
    }
    return base;
  };

  const handleAnalysis = async () => {
    const selected = getSelectedType();
    if (remainingPoints !== null && remainingPoints < selected.cost) {
      return alert(`點數不足，此功能需要 ${selected.cost} 點`);
    }
    setLoadingText('命理鑑定計算中，複雜命書需 1-2 分鐘，請耐心等候...');
    setIsLoading(true);
    try {
      const body: Record<string, unknown> = {
        type: reportType,
        chartRequest: formData,
      };
      if (reportType === '流年命書') body.targetYear = targetYear;
      if (reportType === '問事') body.topic = topic;
      if (reportType === '大運命書') body.fortuneDuration = fortuneDuration;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5 * 60 * 1000);
      const res = await fetch(`${API_URL}/Consultation/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timer);
      const data = await res.json();
      if (res.ok) {
        setReport(cleanReport(data.result || data.analysis || ''));
        setRemainingPoints(data.remainingPoints);
        // 設定報告標題
        const durLabel = FORTUNE_DURATIONS.find(d => d.value === fortuneDuration)?.label ?? '大運';
        const titles: Record<ReportTypeKey, string> = {
          '綜合性命書': '綜合命理鑑定書',
          '大運命書': `${durLabel}鑑定書`,
          '流年命書': `${targetYear} 年流年鑑定書`,
          '問事': `${topic} 問事鑑定書`,
        };
        setReportTitle(titles[reportType]);
      } else {
        const msg = data.error || '鑑定失敗';
        const detail = data.details ? `\n\n詳情：${data.details}` : '';
        alert(msg + detail);
      }
    } catch (err) { alert('鑑定失敗：' + String(err)); } finally { setIsLoading(false); }
  };

  const generatePDF = async () => {
    const element = document.getElementById('report-paper');
    if (!element) return;
    setLoadingText('正在生成 PDF 鑑定書...');
    setIsLoading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2, useCORS: true, logging: false, backgroundColor: '#F9F3E9'
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        encryption: {
          userPassword: '',
          ownerPassword: 'YuDongZi2026',
          userPermissions: ['print']
        }
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let position = 0;
      let remaining = imgHeight;
      while (remaining > 0) {
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        remaining -= pdfPageHeight;
        if (remaining > 0) {
          pdf.addPage();
          position -= pdfPageHeight;
        }
      }
      pdf.save(`${formData.name}_${reportTitle}.pdf`);
    } catch {
      alert("PDF 儲存失敗，請嘗試手動截圖");
    } finally { setIsLoading(false); }
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

  const handleExpertReport = async () => {
    if (!token) return alert("請先登入");
    if (remainingPoints !== null && remainingPoints < 200) return alert("點數不足，專家命書需要 200 點");
    setLoadingText('正在產製專家命書...');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/Astrology/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${formData.name}_專家命書.docx`;
        document.body.appendChild(a); a.click(); a.remove();
        setRemainingPoints(prev => prev !== null ? prev - 200 : null);
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.error || '專家命書產製失敗');
      }
    } catch (err) { alert('下載失敗：' + String(err)); } finally { setIsLoading(false); }
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

  const selected = getSelectedType();

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

          {/* 左側：命主資料 */}
          <div className="md:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-orange-100 text-sm">
              <h2 className="text-lg font-bold text-amber-950 mb-4">命主資料</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-600 mb-1 font-bold text-xs">姓名</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-1.5 rounded-xl border border-gray-200 outline-none focus:border-amber-500" />
                </div>

                <div className="grid grid-cols-2 gap-2 items-end">
                  <div>
                    <label className="block text-gray-600 mb-1 font-bold text-xs">性別</label>
                    <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-3 py-1.5 rounded-xl border border-gray-200">
                      <option value="1">乾造 (男)</option><option value="0">坤造 (女)</option>
                    </select>
                  </div>
                  <div className="text-amber-700 font-bold bg-amber-50 px-3 py-1.5 rounded-xl text-center text-xs border border-amber-100">
                    餘額：{remainingPoints !== null ? remainingPoints : '--'} 點
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div><label className="text-[10px] text-gray-400">西元年</label><select value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} className="w-full border rounded p-1 text-xs">{generateYears().map(y => <option key={y} value={y}>{y}年</option>)}</select></div>
                  <div><label className="text-[10px] text-gray-400">月</label><select value={formData.month} onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })} className="w-full border rounded p-1 text-xs">{months.map(m => <option key={m} value={m}>{m}月</option>)}</select></div>
                  <div><label className="text-[10px] text-gray-400">日</label><select value={formData.day} onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })} className="w-full border rounded p-1 text-xs">{days.map(d => <option key={d} value={d}>{d}日</option>)}</select></div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] text-gray-400">小時</label><select value={formData.hour} onChange={(e) => setFormData({ ...formData, hour: parseInt(e.target.value) })} className="w-full border rounded p-1 text-xs">{hours.map(h => <option key={h} value={h}>{h}時</option>)}</select></div>
                  <div><label className="text-[10px] text-gray-400">分鐘</label><select value={formData.minute} onChange={(e) => setFormData({ ...formData, minute: parseInt(e.target.value) })} className="w-full border rounded p-1 text-xs">{minutes.map(m => <option key={m} value={m}>{m}分</option>)}</select></div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handleExportXLS} className="w-full bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs shadow-md">下載命盤 XLS</button>
                  <button
                    onClick={saveProfile}
                    disabled={profileSaving}
                    className="w-full bg-sky-700 text-white font-bold py-2 rounded-xl text-xs shadow-md disabled:opacity-60"
                  >
                    {profileSaving ? '儲存中...' : (profileLoaded ? '更新生辰' : '儲存生辰')}
                  </button>
                </div>
                <button
                  onClick={saveChart}
                  disabled={chartSaving}
                  className="w-full bg-purple-700 text-white font-bold py-2 rounded-xl text-xs shadow-md mt-1 disabled:opacity-60"
                >
                  {chartSaving ? '同步中...' : '同步命盤至今日運勢'}
                </button>
                {chartSavedMsg && (
                  <p className="text-xs text-center text-amber-300 mt-1">{chartSavedMsg}</p>
                )}
                {isAdmin && (
                  <button
                    onClick={handleExpertReport}
                    className="w-full bg-amber-800 text-white font-bold py-2 rounded-xl text-xs shadow-md mt-1"
                  >
                    專家命書下載 (200點)
                  </button>
                )}
                {profileLoaded && (
                  <p className="text-[10px] text-green-600 text-center">已載入會員生辰資料</p>
                )}
              </div>
            </div>

            {/* 命書類型選擇 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-orange-100 text-sm">
              <h2 className="text-lg font-bold text-amber-950 mb-3">命書類型</h2>
              <div className="space-y-2">
                {REPORT_TYPES.map(rt => (
                  <button
                    key={rt.key}
                    onClick={() => setReportType(rt.key)}
                    className={`w-full text-left px-4 py-3 rounded-2xl border transition-all ${reportType === rt.key
                      ? 'bg-amber-800 text-white border-amber-800 shadow-md'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-sm">{rt.label}</div>
                        <div className={`text-xs mt-0.5 ${reportType === rt.key ? 'text-amber-200' : 'text-gray-400'}`}>{rt.desc}</div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${reportType === rt.key ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700'}`}>
                        {rt.cost} 點
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* 大運命書：年數選擇 */}
              {reportType === '大運命書' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <label className="block text-gray-600 mb-2 font-bold text-xs">鑑定年限（以目前年齡起算）</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {FORTUNE_DURATIONS.map(d => (
                      <button
                        key={d.value}
                        onClick={() => setFortuneDuration(d.value)}
                        className={`flex justify-between items-center px-3 py-2 rounded-xl border text-xs font-bold transition-all ${fortuneDuration === d.value
                          ? 'bg-amber-700 text-white border-amber-700'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-amber-300'
                          }`}
                      >
                        <span>{d.label}</span>
                        <span className={`px-2 py-0.5 rounded-full ${fortuneDuration === d.value ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600'}`}>{d.cost} 點</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">逐月依干支合沖刑害破、神煞、六神、紫微四化分析</p>
                </div>
              )}

              {/* 流年命書：年份選擇 */}
              {reportType === '流年命書' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <label className="block text-gray-600 mb-1 font-bold text-xs">指定年份</label>
                  <select
                    value={targetYear}
                    onChange={(e) => setTargetYear(parseInt(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-sm"
                  >
                    {Array.from({ length: 21 }, (_, i) => currentYear - 5 + i).map(y => (
                      <option key={y} value={y}>{y} 年{y === currentYear ? '（今年）' : ''}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 問事：主題選擇 */}
              {reportType === '問事' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <label className="block text-gray-600 mb-1 font-bold text-xs">問事主題</label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-sm"
                  >
                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}

              <button
                onClick={handleAnalysis}
                className="mt-4 w-full bg-amber-800 text-white font-bold py-3 rounded-2xl text-sm shadow-md hover:bg-amber-900 transition-all"
              >
                啟動{selected.label} ({selected.cost} 點)
              </button>
            </div>
          </div>

          {/* 右側：命書結果 */}
          <div className="md:col-span-8">
            <div className="mb-4 bg-gradient-to-r from-amber-800 to-amber-950 p-4 rounded-[2rem] text-white flex justify-between items-center shadow-lg">
              <div><p className="text-xs opacity-70">PREMIUM CREDITS</p><p className="font-bold">NT$ 500 / 50 點</p></div>
              <button onClick={handlePurchase} disabled={purchaseLoading} className="bg-white text-amber-900 px-6 py-2 rounded-full font-bold text-sm shadow-sm active:scale-95 transition-all">{purchaseLoading ? "處理中..." : "立即儲值"}</button>
            </div>

            {report ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={generatePDF} className="bg-amber-100 text-amber-900 border border-amber-300 px-5 py-2 rounded-full text-xs font-bold hover:bg-amber-200 transition-all shadow-sm">
                    儲存 PDF 鑑定書
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
                    <h2 className="text-3xl font-bold text-center text-amber-950 mb-8 border-b-2 border-red-800 pb-4 tracking-[1em]">{reportTitle}</h2>
                    <div
                      className="text-xl text-gray-800 text-justify tracking-[0.1em]"
                      style={{
                        fontFamily: '"標楷體", "Kaiti", "BiauKai", "DFKai-SB", "STKaiti", serif',
                        paddingTop: '2px'
                      }}
                    >
                      {renderReport(report)}
                    </div>
                    <div className="mt-20 text-right text-amber-900/40 italic text-sm font-serif">玉洞子 謹誌</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[500px] border-2 border-dashed border-amber-100 rounded-[3rem] flex flex-col items-center justify-center bg-white/40 gap-3">
                <div className="text-amber-200 text-xl italic tracking-widest font-bold">請輸入資料後開啟鑑定</div>
                <div className="flex gap-3">
                  {REPORT_TYPES.map(rt => (
                    <button
                      key={rt.key}
                      onClick={() => setReportType(rt.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${reportType === rt.key ? 'bg-amber-800 text-white border-amber-800' : 'bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-400'}`}
                    >
                      {rt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
