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
  { key: '八字命書', label: '八字命書', cost: 50, desc: '12章科學化一生命運剖析' },
  { key: '大運命書', label: '大運命書', cost: 150, desc: '逐年吉凶大運推演' },
  { key: '流年命書', label: '流年命書', cost: 100, desc: '五術合一年度全方位推演' },
  { key: '問事', label: '問事鑑定', cost: 10, desc: '針對特定事項剖析' },
] as const;

const FORTUNE_DURATIONS = [
  { value: 5, label: '5年大運', cost: 150 },
  { value: 10, label: '10年大運', cost: 200 },
  { value: 20, label: '20年大運', cost: 250 },
  { value: 30, label: '30年大運', cost: 300 },
  { value: 0, label: '終身大運', cost: 500 },
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
  const [lifelongCycles, setLifelongCycles] = useState<Array<{stem:string;branch:string;liuShen:string;startAge:number;endAge:number;score:number;level:string}> | null>(null);
  const [annualForecasts, setAnnualForecasts] = useState<Array<{year:number;age:number;stemBranch:string;daiyunStem:string;daiyunBranch:string;baziScore:number;ziweiScore:number;crossClass:string;summary:string}> | null>(null);
  const [monthlyForecasts, setMonthlyForecasts] = useState<Array<{month:number;label:string;stemBranch:string;season:string;flowStar:string;baziHint:string;crossClass:string;baziScore:number;ziweiScore:number;tip:string}> | null>(null);
  const [baziTable, setBaziTable] = useState<{pillars:Array<{label:string;stem:string;branch:string;stemSS:string;naYin:string;hiddenPairs:Array<{ss:string;stem:string}>}>} | null>(null);
  const [yongJiTable, setYongJiTable] = useState<{
    stems: Array<{stem:string;elem:string;shiShen:string;cls:string}>;
    branches: Array<{branch:string;elem:string;shiShen:string;cls:string;inChart:boolean}>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('命理鑑定計算中...');
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

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

  // 儲存生辰 + 命盤（合併操作）
  const saveProfile = async () => {
    if (!token) return;
    setProfileSaving(true);
    setSaveMsg('');
    try {
      // 1. 儲存生辰資料
      const profileRes = await fetch(`${API_URL}/Auth/profile`, {
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
      if (!profileRes.ok) { setSaveMsg('生辰資料儲存失敗'); return; }

      // 2. 計算命盤
      const calcRes = await fetch(`${API_URL}/Astrology/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!calcRes.ok) { setSaveMsg('生辰已儲存，但命盤計算失敗'); return; }
      const chartData = await calcRes.json();

      // 3. 儲存命盤 JSON
      const saveRes = await fetch(`${API_URL}/Astrology/save-chart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(chartData),
      });
      const saveData = saveRes.ok ? await saveRes.json() : null;

      const starLabel = saveData?.mingGongMainStars ? `命宮主星：${saveData.mingGongMainStars}` : '';
      setSaveMsg(`生辰與命盤已儲存${starLabel ? '，' + starLabel : ''}`);
      setProfileLoaded(true);
    } catch { setSaveMsg('儲存失敗，請稍後再試'); } finally { setProfileSaving(false); }
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
    const allSegments: React.ReactNode[] = [];
    let tableRows: string[][] = [];
    let chapterContent: React.ReactNode[] = [];
    let chapterIdx = 0;
    let nodeIdx = 0;

    const flushTable = () => {
      if (tableRows.length === 0) return;
      chapterContent.push(
        <table key={`t${nodeIdx++}`} className="pdf-block w-full border-collapse my-2 text-sm">
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
    };

    const flushChapter = () => {
      flushTable();
      if (chapterContent.length > 0) {
        allSegments.push(
          <div key={`ch${chapterIdx}`} className="pdf-chapter">
            {chapterContent}
          </div>
        );
        chapterIdx++;
        chapterContent = [];
      }
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      const isChapterHeader = trimmed.startsWith('===') && trimmed.endsWith('===');
      const isTableRow = trimmed.startsWith('|') && trimmed.endsWith('|');
      const isSeparator = /^\|[\s:\-|]+\|$/.test(trimmed);

      if (isSeparator) return;

      if (isChapterHeader) {
        flushTable();
        flushChapter();
        chapterContent.push(
          <p key={`h${nodeIdx++}`} className="pdf-block whitespace-pre-wrap">{line}</p>
        );
        return;
      }

      if (isTableRow) {
        tableRows.push(trimmed.slice(1, -1).split('|').map(c => c.trim()));
      } else {
        flushTable();
        if (trimmed) {
          chapterContent.push(
            <p key={`p${nodeIdx++}`} className="pdf-block whitespace-pre-wrap">{line}</p>
          );
        } else {
          chapterContent.push(<div key={`e${nodeIdx++}`} className="h-1" />);
        }
      }
    });

    flushChapter();
    return allSegments;
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
    if ((reportType === '八字命書' || reportType === '大運命書' || reportType === '流年命書') && !profileLoaded) {
      return alert(`${reportType}需要先儲存生辰資料，請先填寫並儲存您的生辰。`);
    }
    if (remainingPoints !== null && remainingPoints < selected.cost) {
      return alert(`點數不足，此功能需要 ${selected.cost} 點`);
    }
    setLoadingText((reportType === '綜合性命書' || reportType === '八字命書') && profileLoaded
      ? '知識庫命書生成中，請稍候...'
      : reportType === '大運命書' && profileLoaded
      ? `大運命書（${fortuneDuration === 0 ? '終身' : fortuneDuration + '年'}）生成中，請稍候...`
      : reportType === '流年命書'
      ? `流年命書（${targetYear} 年，五術合一）生成中，請稍候...`
      : '命理鑑定計算中，複雜命書需 1-2 分鐘，請耐心等候...');
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

      // 路由邏輯：綜合命書/終身命書走 KB 端點，其餘走 Gemini
      let res: Response;
      if (reportType === '綜合性命書' && profileLoaded) {
        res = await fetch(`${API_URL}/Consultation/analyze-kb`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal
        });
      } else if (reportType === '八字命書' && profileLoaded) {
        res = await fetch(`${API_URL}/Consultation/analyze-lifelong`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal
        });
      } else if (reportType === '大運命書' && profileLoaded) {
        res = await fetch(`${API_URL}/Consultation/analyze-daiyun?years=${fortuneDuration}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal
        });
      } else if (reportType === '流年命書') {
        res = await fetch(`${API_URL}/Consultation/analyze-liunian?year=${targetYear}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal
        });
      } else {
        res = await fetch(`${API_URL}/Consultation/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(body),
          signal: controller.signal
        });
      }
      clearTimeout(timer);
      const data = await res.json();
      if (res.ok) {
        setReport(cleanReport(data.result || data.analysis || ''));
        setRemainingPoints(data.remainingPoints);
        if (data.luckCycles) setLifelongCycles(data.luckCycles);
        else setLifelongCycles(null);
        if (data.baziTable) setBaziTable(data.baziTable);
        else setBaziTable(null);
        if (data.yongJiTable) setYongJiTable(data.yongJiTable);
        else setYongJiTable(null);
        if (data.annualForecasts) setAnnualForecasts(data.annualForecasts);
        else setAnnualForecasts(null);
        if (data.monthlyForecasts) setMonthlyForecasts(data.monthlyForecasts);
        else setMonthlyForecasts(null);
        // 設定報告標題
        const durLabel = FORTUNE_DURATIONS.find(d => d.value === fortuneDuration)?.label ?? '大運';
        const titles: Record<ReportTypeKey, string> = {
          '綜合性命書': '綜合命理鑑定書',
          '八字命書': '八字命書',
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

  const generateDOC = () => {
    if (!report) return;
    const lines = report.split('\n');
    const bodyLines: string[] = [];

    const thDocStyle = 'border:1px solid #c8a96e;background:#fef3c7;padding:3pt 5pt;text-align:center;font-weight:bold;color:#7B3F00;font-size:9pt;';
    const tdDocStyle = 'border:1px solid #c8a96e;padding:3pt 5pt;text-align:center;font-size:9pt;';
    let tableBuffer: string[][] = [];

    const flushDocTable = () => {
      if (tableBuffer.length === 0) return;
      const rows = tableBuffer.map((cells, i) =>
        `<tr>${cells.map(c => `<${i === 0 ? 'th' : 'td'} style="${i === 0 ? thDocStyle : tdDocStyle}">${c}</${i === 0 ? 'th' : 'td'}>`).join('')}</tr>`
      ).join('');
      bodyLines.push(`<table style="border-collapse:collapse;margin:4pt 0 6pt;">${rows}</table>`);
      tableBuffer = [];
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      const isTableRow = trimmed.startsWith('|') && trimmed.endsWith('|');
      const isSeparator = /^\|[\s:\-|]+\|$/.test(trimmed);

      if (isSeparator) return;

      if (isTableRow) {
        tableBuffer.push(trimmed.slice(1, -1).split('|').map(c => c.trim()));
        return;
      }

      flushDocTable();

      if (!trimmed) { bodyLines.push('<p style="margin:2pt 0">&nbsp;</p>'); return; }
      if (trimmed.startsWith('===') && trimmed.endsWith('===')) {
        const title = trimmed.replace(/^=+\s*/, '').replace(/\s*=+$/, '');
        bodyLines.push(`<h2 style="font-size:14pt;color:#7B3F00;border-bottom:1px solid #c8a96e;margin:12pt 0 4pt;page-break-before:always">${title}</h2>`);
        return;
      }
      if (trimmed.startsWith('---') && trimmed.endsWith('---')) {
        const sub = trimmed.replace(/^-+\s*/, '').replace(/\s*-+$/, '');
        bodyLines.push(`<h3 style="font-size:12pt;color:#5C3317;margin:8pt 0 2pt">${sub}</h3>`);
        return;
      }
      const escaped = trimmed.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      bodyLines.push(`<p style="margin:3pt 0;line-height:1.6">${escaped}</p>`);
    });
    flushDocTable();

    // 第一章不要 page-break-before
    const bodyHtml = bodyLines.join('\n').replace('page-break-before:always', 'page-break-before:auto');

    // 八字命盤表格 HTML（僅八字命書有）
    let baziTableHtml = '';
    if (baziTable && baziTable.pillars) {
      const ps = [...baziTable.pillars].reverse(); // 時日月年
      const thStyle = 'border:1px solid #c8a96e;background:#fef3c7;padding:4pt 8pt;text-align:center;font-weight:bold;color:#7B3F00;';
      const tdStyle = 'border:1px solid #c8a96e;padding:4pt 8pt;text-align:center;';
      const tdLgStyle = 'border:1px solid #c8a96e;padding:6pt 8pt;text-align:center;font-size:14pt;font-weight:bold;';
      const tdSmStyle = 'border:1px solid #c8a96e;padding:3pt 8pt;text-align:center;font-size:9pt;color:#555;';
      const maxHidden = Math.max(...ps.map(p => p.hiddenPairs.length));
      const hiddenRows = Array.from({length: maxHidden}, (_, row) =>
        `<tr>${ps.map(p => {
          const hp = p.hiddenPairs[row];
          return hp ? `<td style="${tdSmStyle}"><span style="color:#7B3F00">${hp.ss}</span>${hp.stem}</td>` : `<td style="${tdSmStyle}"></td>`;
        }).join('')}</tr>`
      ).join('');
      baziTableHtml = `
<h3 style="font-size:12pt;color:#5C3317;margin:8pt 0 4pt">八字命盤結構</h3>
<table style="border-collapse:collapse;width:100%;margin-bottom:8pt;">
  <tr><th style="${thStyle}">時柱</th><th style="${thStyle}">日柱</th><th style="${thStyle}">月柱</th><th style="${thStyle}">年柱</th></tr>
  <tr>${ps.map(p=>`<td style="${tdStyle}color:#92400e">${p.stemSS||'-'}</td>`).join('')}</tr>
  <tr>${ps.map(p=>`<td style="${tdLgStyle}">${p.stem}</td>`).join('')}</tr>
  <tr>${ps.map(p=>`<td style="${tdLgStyle}">${p.branch}</td>`).join('')}</tr>
  ${hiddenRows}
  <tr>${ps.map(p=>`<td style="${tdSmStyle}color:#888">${p.naYin}</td>`).join('')}</tr>
</table>`;

      if (lifelongCycles && lifelongCycles.length > 0) {
        const cycles = [...lifelongCycles].reverse();
        baziTableHtml += `
<h3 style="font-size:12pt;color:#5C3317;margin:8pt 0 4pt">大運</h3>
<table style="border-collapse:collapse;width:100%;margin-bottom:12pt;">
  <tr>${cycles.map(c=>`<td style="${thStyle}font-size:9pt;">${c.startAge}</td>`).join('')}</tr>
  <tr>${cycles.map(c=>`<td style="${tdSmStyle}color:#92400e">${c.liuShen}</td>`).join('')}</tr>
  <tr>${cycles.map(c=>`<td style="${tdStyle}font-weight:bold">${c.stem}</td>`).join('')}</tr>
  <tr>${cycles.map(c=>`<td style="${tdStyle}font-weight:bold">${c.branch}</td>`).join('')}</tr>
</table>`;
      }
    }

    const docTitle = reportTitle.replace('終身命書（科學化規則版）', '八字命書');

    const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${formData.name} ${docTitle}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
<style>
  @page { size: A4; margin: 2cm 2.5cm; }
  body { font-family: "Microsoft JhengHei","PMingLiU",serif; font-size: 11pt; color: #2c1810; line-height: 1.6; }
  h2 { font-size: 14pt; color: #7B3F00; }
  h3 { font-size: 12pt; color: #5C3317; }
  p { margin: 3pt 0; }
</style>
</head>
<body>
<p style="text-align:center;font-size:18pt;font-weight:bold;color:#7B3F00;margin-bottom:6pt">${formData.name} ${docTitle}</p>
<p style="text-align:center;font-size:10pt;color:#888;margin-bottom:16pt">命理鑑定大師：玉洞子  |  修身齊家，命在人心。  v3.0</p>
${baziTableHtml}
${baziTableHtml ? '<p style="page-break-before:always;margin:0">&nbsp;</p>' : ''}
${bodyHtml}
</body>
</html>`;

    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.name}_${docTitle}.doc`;
    a.click();
    URL.revokeObjectURL(url);
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

  const handlePurchase = async (packageId = 'starter') => {
    setPurchaseLoading(true);
    try {
      const res = await fetch(`${API_URL}/Payment/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ packageId })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.message || '儲值失敗，請稍後再試');
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

      {profileSaving && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-amber-200 text-sm">儲存生辰與命盤資料中，請稍候...</p>
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
                    {profileLoaded ? '更新生辰' : '儲存生辰'}
                  </button>
                </div>
                {saveMsg && (
                  <p className={`text-xs text-center mt-1 ${saveMsg.includes('失敗') ? 'text-red-400' : 'text-green-400'}`}>
                    {saveMsg}
                  </p>
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
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                  <label className="block text-gray-600 font-bold text-xs">指定年份（僅限當年及未來）</label>
                  <select
                    value={targetYear}
                    onChange={(e) => setTargetYear(parseInt(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-sm"
                  >
                    {Array.from({ length: 6 }, (_, i) => currentYear + i).map(y => (
                      <option key={y} value={y}>{y} 年{y === currentYear ? '（今年）' : ''}</option>
                    ))}
                  </select>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800">
                    <div className="font-bold mb-0.5">流年命書計費說明</div>
                    <div>每選擇一個年份消耗 <span className="font-bold text-amber-900">100 點</span></div>
                    <div className="text-amber-600 mt-0.5">包含：八字·太歲·生肖·盲派·紫微四化 + 逐月分析</div>
                  </div>
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
              <div><p className="text-xs text-white/80">PREMIUM CREDITS</p><p className="font-bold text-white">NT$ 500 / 50 點</p></div>
              <button onClick={() => handlePurchase('starter')} disabled={purchaseLoading} className="bg-white text-amber-900 px-6 py-2 rounded-full font-bold text-sm shadow-sm active:scale-95 transition-all">{purchaseLoading ? "處理中..." : "立即儲值"}</button>
            </div>

            {report ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={generateDOC} className="bg-amber-100 text-amber-900 border border-amber-300 px-5 py-2 rounded-full text-xs font-bold hover:bg-amber-200 transition-all shadow-sm">
                    儲存 DOC 鑑定書
                  </button>
                </div>
                {/* 命盤結構表格（八字命書/大運命書共用，顯示在報告之前） */}
                {baziTable && baziTable.pillars && (
                  <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm overflow-x-auto">
                    <h3 className="text-base font-bold text-amber-900 mb-3">八字命盤</h3>
                    <table className="w-full border-collapse text-sm text-center">
                      <thead>
                        <tr className="bg-amber-50">
                          {['時柱','日柱','月柱','年柱'].map(l => (
                            <th key={l} className="border border-amber-300 px-3 py-1 font-bold text-amber-900">{l}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(() => { const rp = [...baziTable.pillars].reverse(); return (<>
                        <tr className="bg-amber-50/50">
                          {rp.map((p,i) => (
                            <td key={i} className="border border-amber-200 px-3 py-1 font-medium text-amber-700">{p.stemSS || '-'}</td>
                          ))}
                        </tr>
                        <tr>
                          {rp.map((p,i) => (
                            <td key={i} className="border border-amber-200 px-3 py-2 text-xl font-bold text-gray-800">{p.stem}</td>
                          ))}
                        </tr>
                        <tr>
                          {rp.map((p,i) => (
                            <td key={i} className="border border-amber-200 px-3 py-2 text-xl font-bold text-gray-800">{p.branch}</td>
                          ))}
                        </tr>
                        {[0,1,2].map(row => {
                          const hasData = rp.some(p => p.hiddenPairs[row]);
                          if (!hasData) return null;
                          return (
                            <tr key={`h${row}`} className="bg-stone-50">
                              {rp.map((p,i) => {
                                const hp = p.hiddenPairs[row];
                                return (
                                  <td key={i} className="border border-amber-200 px-3 py-1 text-xs text-gray-600">
                                    {hp ? <><span className="text-amber-700">{hp.ss}</span>{hp.stem}</> : ''}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                        <tr className="bg-amber-50/30">
                          {rp.map((p,i) => (
                            <td key={i} className="border border-amber-200 px-3 py-1 text-xs text-gray-500">{p.naYin}</td>
                          ))}
                        </tr>
                        </>); })()}
                      </tbody>
                    </table>
                    {/* 大運表格 */}
                    {lifelongCycles && lifelongCycles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-bold text-amber-900 mb-2">大運</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-xs text-center">
                            <tbody>
                              <tr className="bg-amber-50">
                                {[...lifelongCycles].reverse().map(c => (
                                  <td key={c.startAge} className="border border-amber-200 px-2 py-1 font-bold text-amber-800">{c.startAge}</td>
                                ))}
                              </tr>
                              <tr>
                                {[...lifelongCycles].reverse().map(c => (
                                  <td key={c.startAge} className="border border-amber-200 px-2 py-1 text-amber-700">{c.liuShen}</td>
                                ))}
                              </tr>
                              <tr>
                                {[...lifelongCycles].reverse().map(c => (
                                  <td key={c.startAge} className="border border-amber-200 px-2 py-1 font-bold text-gray-800">{c.stem}</td>
                                ))}
                              </tr>
                              <tr>
                                {[...lifelongCycles].reverse().map(c => (
                                  <td key={c.startAge} className="border border-amber-200 px-2 py-1 font-bold text-gray-800">{c.branch}</td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* 大運走勢圖（報告之前） */}
                {lifelongCycles && lifelongCycles.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm">
                    <h3 className="text-base font-bold text-amber-900 mb-3">大運走勢圖（百分制）</h3>
                    <div className="flex items-end gap-1 h-32">
                      {lifelongCycles.map((c) => {
                        const colorMap: Record<string, string> = {
                          '大吉運': 'bg-amber-500', '中吉運': 'bg-amber-300',
                          '平運': 'bg-gray-300', '中凶運': 'bg-orange-300', '大凶運': 'bg-red-400'
                        };
                        const barH = Math.max(4, Math.round(c.score * 0.9));
                        return (
                          <div key={c.startAge} className="flex flex-col items-center flex-1 min-w-0">
                            <div className="text-[9px] text-gray-500 mb-0.5 font-bold">{c.score}</div>
                            <div
                              className={`w-full rounded-t ${colorMap[c.level] || 'bg-gray-200'}`}
                              style={{ height: `${barH}px` }}
                              title={`${c.startAge}-${c.endAge}歲 ${c.stem}${c.branch} ${c.score}分 ${c.level}`}
                            />
                            <div className="text-[8px] text-gray-600 mt-0.5 truncate w-full text-center">{c.stem}{c.branch}</div>
                            <div className="text-[7px] text-gray-400 truncate w-full text-center">{c.startAge}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap text-[9px]">
                      {[['大吉運','bg-amber-500'],['中吉運','bg-amber-300'],['平運','bg-gray-300'],['中凶運','bg-orange-300'],['大凶運','bg-red-400']].map(([lv, cls]) => (
                        <div key={lv} className="flex items-center gap-1"><div className={`w-2.5 h-2.5 rounded ${cls}`} /><span className="text-gray-500">{lv}</span></div>
                      ))}
                    </div>
                  </div>
                )}
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
                {/* 天干地支喜忌對照表 */}
                {yongJiTable && (
                  <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm overflow-x-auto">
                    <h3 className="text-base font-bold text-amber-900 mb-3">天干地支喜忌對照</h3>
                    <div className="mb-3">
                      <h4 className="text-xs font-bold text-amber-700 mb-1">天干</h4>
                      <table className="border-collapse text-xs text-center">
                        <tbody>
                          <tr className="bg-amber-50">
                            {yongJiTable.stems.map(s => (
                              <td key={s.stem} className="border border-amber-200 px-2 py-1 font-bold text-amber-900">{s.stem}</td>
                            ))}
                          </tr>
                          <tr>
                            {yongJiTable.stems.map(s => (
                              <td key={s.stem} className="border border-amber-200 px-2 py-1 text-gray-600">{s.elem}</td>
                            ))}
                          </tr>
                          <tr>
                            {yongJiTable.stems.map(s => (
                              <td key={s.stem} className="border border-amber-200 px-2 py-1 text-gray-700">{s.shiShen}</td>
                            ))}
                          </tr>
                          <tr>
                            {yongJiTable.stems.map(s => (
                              <td key={s.stem} className={`border border-amber-200 px-2 py-1 font-bold ${s.cls === 'X' ? 'text-red-600 bg-red-50' : s.cls === '○' ? 'text-green-700 bg-green-50' : s.cls === '△忌' ? 'text-orange-600 bg-orange-50' : 'text-gray-500'}`}>{s.cls}</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-700 mb-1">地支（*=命局已有）</h4>
                      <table className="border-collapse text-xs text-center">
                        <tbody>
                          <tr className="bg-amber-50">
                            {yongJiTable.branches.map(b => (
                              <td key={b.branch} className={`border border-amber-200 px-2 py-1 font-bold ${b.inChart ? 'text-amber-900 bg-amber-100' : 'text-amber-700'}`}>{b.branch}{b.inChart ? '*' : ''}</td>
                            ))}
                          </tr>
                          <tr>
                            {yongJiTable.branches.map(b => (
                              <td key={b.branch} className="border border-amber-200 px-2 py-1 text-gray-600">{b.elem}</td>
                            ))}
                          </tr>
                          <tr>
                            {yongJiTable.branches.map(b => (
                              <td key={b.branch} className="border border-amber-200 px-2 py-1 text-gray-700">{b.shiShen}</td>
                            ))}
                          </tr>
                          <tr>
                            {yongJiTable.branches.map(b => (
                              <td key={b.branch} className={`border border-amber-200 px-2 py-1 font-bold ${b.cls === 'X' ? 'text-red-600 bg-red-50' : b.cls === '○' ? 'text-green-700 bg-green-50' : b.cls === '△忌' ? 'text-orange-600 bg-orange-50' : 'text-gray-500'}`}>{b.cls}</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">○=喜用  △忌=次忌（克用神）  △=中性  X=大忌（克身）</p>
                  </div>
                )}
                {/* 大運命書：逐年摘要 */}
                {annualForecasts && annualForecasts.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm">
                    <h3 className="text-base font-bold text-amber-900 mb-3">流年逐年摘要（{annualForecasts.length} 年）</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {annualForecasts.map(f => {
                        const clsMap: Record<string, string> = {
                          '大吉': 'bg-amber-500 text-white', '吉': 'bg-amber-300 text-amber-900',
                          '平': 'bg-gray-200 text-gray-700', '小凶': 'bg-orange-300 text-orange-900',
                          '大凶': 'bg-red-400 text-white'
                        };
                        const badgeClass = clsMap[f.crossClass] || 'bg-gray-200 text-gray-700';
                        return (
                          <div key={f.year} className="flex items-start gap-2 p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                            <div className="flex-shrink-0 text-center min-w-[48px]">
                              <div className="text-sm font-bold text-amber-800">{f.year}</div>
                              <div className="text-[10px] text-gray-500">{f.age}歲</div>
                            </div>
                            <div className="flex-shrink-0 text-center min-w-[36px]">
                              <div className="text-xs font-bold text-amber-700">{f.stemBranch}</div>
                              <div className="text-[9px] text-gray-400">{f.daiyunStem}{f.daiyunBranch}運</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-0.5">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badgeClass}`}>{f.crossClass}</span>
                                <span className="text-[10px] text-gray-500">八字{f.baziScore}·紫微{f.ziweiScore}</span>
                              </div>
                              <div className="text-[10px] text-gray-600 leading-tight">{f.summary}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* 流年命書：月曆卡片 */}
                {monthlyForecasts && monthlyForecasts.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm">
                    <h3 className="text-base font-bold text-amber-900 mb-1">流年逐月速覽（12個月）</h3>
                    <p className="text-xs text-gray-400 mb-3">月建以節氣約略日期區分，月曆卡供快速掌握吉凶月份</p>
                    <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
                      {monthlyForecasts.map(m => {
                        const borderCls = m.crossClass === '大吉' ? 'border-amber-500 bg-amber-900/10'
                          : m.crossClass === '吉' ? 'border-amber-400 bg-amber-50'
                          : m.crossClass === '大凶' ? 'border-red-600 bg-red-50'
                          : m.crossClass === '小凶' ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-300 bg-gray-50';
                        const badgeCls = m.crossClass === '大吉' ? 'bg-amber-500 text-white'
                          : m.crossClass === '吉' ? 'bg-amber-300 text-amber-900'
                          : m.crossClass === '大凶' ? 'bg-red-500 text-white'
                          : m.crossClass === '小凶' ? 'bg-orange-400 text-white'
                          : 'bg-gray-200 text-gray-600';
                        return (
                          <div key={m.month} className={`rounded-xl p-2.5 border ${borderCls}`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-amber-800 font-bold text-sm">{m.label.split('(')[0]}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeCls}`}>{m.crossClass}</span>
                            </div>
                            <div className="text-gray-500 text-[10px]">{m.stemBranch} · {m.season}季</div>
                            {m.flowStar && <div className="text-gray-600 text-[10px] mt-0.5 leading-tight truncate" title={m.flowStar}>{m.flowStar}</div>}
                            <div className="text-gray-500 text-[10px] mt-1">八字{m.baziScore}·紫微{m.ziweiScore}</div>
                            <div className="text-gray-700 text-[10px] mt-1 leading-tight">{m.tip.slice(0, 30)}{m.tip.length > 30 ? '...' : ''}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[500px] border-2 border-dashed border-amber-100 rounded-[3rem] flex items-center justify-center bg-white/40">
                <div className="text-amber-200 text-xl italic tracking-widest font-bold">請輸入資料後開啟鑑定</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
