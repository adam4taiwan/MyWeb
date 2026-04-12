"use client";
import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import Link from 'next/link';
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
  { key: '綜合性命書', label: '綜合命書', desc: '八字紫微全面鑑定' },
  { key: '八字命書', label: '八字命書', desc: '12章科學化一生命運剖析' },
  { key: '大運命書', label: '大運命書', desc: '逐年吉凶大運推演' },
  { key: '流年命書', label: '流年命書', desc: '五術合一年度全方位推演' },
] as const;


type ReportTypeKey = typeof REPORT_TYPES[number]['key'];

const PRODUCT_CODE_MAP: Partial<Record<ReportTypeKey, string>> = {
  '綜合性命書': 'BOOK_BAZI',
  '八字命書': 'BOOK_BAZI',
  '大運命書': 'BOOK_DAIYUN',
  '流年命書': 'BOOK_LIUNIAN',
};

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
  const targetYear = currentYear;

  const [report, setReport] = useState('');
  const [reportTitle, setReportTitle] = useState('命理鑑定書');
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
  const [profileSaving, setProfileSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  type Palace = {
    palaceName: string; palaceStem: string; earthlyBranch: string;
    majorStars: string[]; secondaryStars: string[]; decadeAgeRange: string;
    palaceStemTransformations: string; annualStarTransformations: string[];
    goodStars: string[]; badStars: string[];
  };
  type ChartExport = {
    palaces: Palace[];
    bazi: { yearPillar:{heavenlyStem:string;earthlyBranch:string}; monthPillar:{heavenlyStem:string;earthlyBranch:string}; dayPillar:{heavenlyStem:string;earthlyBranch:string}; timePillar:{heavenlyStem:string;earthlyBranch:string} };
    wuXingJuText: string; mingZhu: string; shenZhu: string; userName: string;
  };
  const [exportChart, setExportChart] = useState<ChartExport | null>(null);
  const [captureMode, setCaptureMode] = useState(false);
  const ziweiGridRef = useRef<HTMLDivElement>(null);
  const exportChartJsonRef = useRef<string>('');

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
            gender: String(data.birthGender === 0 ? 2 : (data.birthGender ?? 1)),
            year: data.birthYear,
            month: data.birthMonth,
            day: data.birthDay,
            hour: data.birthHour,
            minute: data.birthMinute ?? 0,
          });
        }
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (token) loadProfile(); }, [token]);

  interface SubscriptionQuota {
    productCode: string;
    total: number;
    used: number;
    remaining: number;
  }
  interface SubStatus {
    isSubscribed: boolean;
    planCode?: string;
    planName?: string;
    startDate?: string;
    expiryDate?: string;
    birthdateLocked?: boolean;
    isInTrial?: boolean;
    trialDaysRemaining?: number;
    quotaStatus?: SubscriptionQuota[];
  }
  const [subStatus, setSubStatus] = useState<SubStatus | null>(null);

  // Preview chart state (free access for all users)
  const [previewChartData, setPreviewChartData] = useState<{ bazi: unknown; ziwei: unknown } | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/Subscription/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSubStatus(data); })
      .catch(() => {});
  }, [token, API_URL]);

  // Auto-activate trial on first visit for logged-in users
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/Subscription/activate-trial`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.ok ? r.json() : null).then(data => {
      if (data && !data.alreadyActivated) {
        // Refresh subscription status to show trial info
        fetch(`${API_URL}/Subscription/status`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.ok ? r.json() : null).then(d => { if (d) setSubStatus(d); }).catch(() => {});
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const canUseService = (key: ReportTypeKey): 'available' | 'used' | 'locked' | 'no_subscription' | 'cross_year' => {
    if (isAdmin) return 'available';
    if (!token || !subStatus || !subStatus.isSubscribed) return 'no_subscription';
    // Cross-year check for 流年 and 大運: subscription must have started in the current year
    if ((key === '流年命書' || key === '大運命書') && subStatus.startDate) {
      const subStartYear = new Date(subStatus.startDate).getFullYear();
      if (subStartYear < currentYear) return 'cross_year';
    }
    const productCode = PRODUCT_CODE_MAP[key];
    if (!productCode) return 'available';
    const quota = subStatus.quotaStatus?.find(q => q.productCode === productCode);
    if (!quota) return 'locked';
    if (quota.remaining <= 0) return 'used';
    return 'available';
  };

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
      return { ...base, label: '5年大運' };
    }
    return base;
  };

  const handleAnalysis = async () => {
    // 訂閱驗證
    const serviceStatus = canUseService(reportType);
    if (serviceStatus === 'no_subscription' || serviceStatus === 'locked') {
      window.location.href = '/subscribe';
      return;
    }
    if (serviceStatus === 'used') {
      return alert('本訂閱週期此服務已使用完畢，請升級方案或等待下一週期。');
    }

    // 執行前確認（扣配額不可逆）
    const lockWarning = !subStatus?.birthdateLocked
      ? '\n\n【重要提醒】命書列印啟動成功後，出生時辰將永久鎖定，不可再更改，請確認出生日時正確無誤。'
      : '';
    const confirmMessages: Record<string, string> = {
      '綜合性命書': `綜合命書本訂閱週期僅可使用 1 次。\n\n確認後即扣除本期使用次數，命書產生後可重複下載，但離開頁面後需再扣一次才可重新產生。${lockWarning}\n\n確定要執行嗎？`,
      '八字命書': `八字命書本訂閱週期僅可使用 1 次。\n\n確認後即扣除本期使用次數，命書產生後可重複下載，但離開頁面後需再扣一次才可重新產生。${lockWarning}\n\n確定要執行嗎？`,
      '大運命書': `大運命書（5年大運）本訂閱週期僅可使用 1 次。\n\n確認後即扣除本期使用次數，命書產生後可重複下載，但離開頁面後需再扣一次才可重新產生。${lockWarning}\n\n確定要執行嗎？`,
      '流年命書': `流年命書本訂閱週期僅可使用 1 次。\n鑑定年份：${targetYear} 年（今年）\n\n確認後即扣除本期使用次數，命書產生後可重複下載，但離開頁面後需再扣一次才可重新產生。${lockWarning}\n\n確定要執行嗎？`,
    };
    if (!window.confirm(confirmMessages[reportType] ?? '確定要執行嗎？')) return;

    if ((reportType === '八字命書' || reportType === '大運命書' || reportType === '流年命書') && !profileLoaded) {
      return alert(`${reportType}需要先儲存生辰資料，請先填寫並儲存您的生辰。`);
    }
    setLoadingText(reportType === '大運命書' && profileLoaded
      ? '大運命書（5年大運）生成中，請稍候...'
      : reportType === '流年命書'
      ? `流年命書（${targetYear} 年）生成中，請稍候...`
      : `${reportType}生成中，請稍候...`);
    setIsLoading(true);
    try {
      const body: Record<string, unknown> = {
        type: reportType,
        chartRequest: formData,
      };
      if (reportType === '流年命書') body.targetYear = targetYear;

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
        res = await fetch(`${API_URL}/Consultation/analyze-daiyun?years=5`, {
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
        setPreviewChartData(null);
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
        const titles: Record<ReportTypeKey, string> = {
          '綜合性命書': '綜合命理鑑定書',
          '八字命書': '八字命書',
          '大運命書': '5年大運鑑定書',
          '流年命書': `${targetYear} 年流年鑑定書`,
        };
        setReportTitle(titles[reportType]);
      } else {
        const msg = data.error || '鑑定失敗';
        const detail = data.details ? `\n\n詳情：${data.details}` : '';
        alert(msg + detail);
      }
    } catch (err) { alert('鑑定失敗：' + String(err)); } finally { setIsLoading(false); }
  };


  // Free chart preview (no auth required, no subscription needed)
  const handlePreviewChart = async () => {
    setLoadingText('命盤計算中...');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/Astrology/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) { alert('命盤計算失敗'); return; }
      const chartData = await res.json();
      setPreviewChartData(chartData);
      setReport('');
      setBaziTable(chartData.baziTable ?? null);
      setLifelongCycles(null);
      setAnnualForecasts(null);
      setMonthlyForecasts(null);
      setYongJiTable(null);
      setExportChart(chartData);
    } catch (err) { alert('命盤計算失敗：' + String(err)); } finally { setIsLoading(false); }
  };

  const handleExportXLS = async () => {
    if (!token) { alert("請先加入會員"); window.location.href = '/login'; return; }
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
      } else {
        const errText = await response.text().catch(() => '');
        alert(`下載失敗（${response.status}）${errText ? '：' + errText : ''}`);
      }
    } catch (err) { alert("下載失敗：" + String(err)); } finally { setIsLoading(false); }
  };


  const handleIgPostNow = async (testImageUrl?: string) => {
    const label = testImageUrl ? 'IG API 連線測試（小圖）' : 'Instagram 發文測試';
    if (!confirm(`確定觸發 ${label}？`)) return;
    setIsLoading(true);
    setLoadingText('Instagram 發文中...');
    try {
      const qs = testImageUrl ? `?testImageUrl=${encodeURIComponent(testImageUrl)}` : '';
      const res = await fetch(`${API_URL}/NineStar/ig-post-now${qs}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        alert(`${label} 成功！`);
      } else {
        alert(`${label} 失敗：` + (data.message ?? JSON.stringify(data)));
      }
    } catch (err) {
      alert(`${label} 失敗：` + String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushNow = async () => {
    if (!confirm('確定立即觸發每日 LINE 推播？（九星 + 訂閱會員）')) return;
    setIsLoading(true);
    setLoadingText('推播中...');
    try {
      const res = await fetch(`${API_URL}/NineStar/push-now`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const errDetail = data.errors?.map((e: {type:string; error:string; lineUserId?:string; userId?:string}) => `[${e.type}] ${e.lineUserId ?? e.userId}: ${e.error}`).join('\n') ?? '';
        alert(`推播完成\n成功：${data.pushedCount} 人\n失敗：${data.errorCount} 人\n\n${data.pushed.map((p: {type:string; name?:string; lineUserId?:string}) => `[${p.type}] ${p.name ?? p.lineUserId}`).join('\n')}${errDetail ? '\n\n錯誤詳情：\n' + errDetail : ''}`);
      } else {
        alert('推播失敗：' + (data.message ?? JSON.stringify(data)));
      }
    } catch (err) {
      alert('推播失敗：' + String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleYudongziReport = async () => {
    if (!profileLoaded) return alert('玉洞子命書需要先儲存生辰資料。');
    setLoadingText('玉洞子命書生成中，請稍候...');
    setIsLoading(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5 * 60 * 1000);
      const res = await fetch(`${API_URL}/Consultation/analyze-yudongzi`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        signal: controller.signal
      });
      clearTimeout(timer);
      const data = await res.json();
      if (!res.ok) return alert(data.error || '玉洞子命書生成失敗');
      setReport(data.result);
      if (data.baziTable) setBaziTable(data.baziTable); else setBaziTable(null);
      if (data.yongJiTable) setYongJiTable(data.yongJiTable); else setYongJiTable(null);
      if (data.luckCycles) setLifelongCycles(data.luckCycles); else setLifelongCycles(null);
      setReportTitle('玉洞子命書（內部版）');
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') alert('請求逾時，請稍後再試。');
      else alert('玉洞子命書生成失敗：' + String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportDocx = async () => {
    if (!report) return;
    // 封面顯示標題
    const bookTitleMap: Record<string, string> = {
      '八字命書':  '八 字 命 書',
      '大運命書':  '大 運 命 書',
      '流年命書':  '流 年 命 書',
      '綜合性命書': '命 理 鑑 定 書',
    };
    // report body 裡要略過的標題行（綜合命書內容來自 LfBuildReport，標題是「八 字 命 書」）
    const skipTitleMap: Record<string, string> = {
      '八字命書':  '八 字 命 書',
      '大運命書':  '大 運 命 書',
      '流年命書':  '流 年 命 書',
      '綜合性命書': '八 字 命 書',
    };
    const bookTitle = bookTitleMap[reportType] ?? '命書';
    const skipTitle = skipTitleMap[reportType] ?? bookTitle;
    try {
      setIsLoading(true);
      setLoadingText('生成命書 DOCX...');
      const res = await fetch(`${API_URL}/Consultation/export-generic-docx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reportText: report, personName: formData.name, bookTitle, skipTitle }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); alert(d.error || 'DOCX 生成失敗'); return; }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeTitle = reportTitle.replace(/[\s/\\:*?"<>|]/g, '_');
      a.href = url; a.download = `${formData.name}_${safeTitle}.docx`;
      document.body.appendChild(a); a.click(); a.remove();
    } catch (err) { alert('DOCX 生成失敗：' + String(err)); }
    finally { setIsLoading(false); }
  };

  const handleYudongziDocx = async () => {
    if (!profileLoaded) return alert('需要先儲存生辰資料。');
    setLoadingText('準備先天元神圖...');
    setIsLoading(true);
    try {
      const calcRes = await fetch(`${API_URL}/Astrology/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!calcRes.ok) { alert('命盤計算失敗'); return; }
      const chartData = await calcRes.json();
      exportChartJsonRef.current = JSON.stringify(chartData);
      setExportChart(chartData);
      setCaptureMode(true);
    } catch (err) {
      alert('發生錯誤：' + String(err));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!captureMode || !ziweiGridRef.current) return;
    let cancelled = false;
    (async () => {
      await new Promise(r => setTimeout(r, 200));
      if (cancelled || !ziweiGridRef.current) return;
      try {
        setLoadingText('生成玉洞子命書 DOCX...');
        const canvas = await html2canvas(ziweiGridRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgBase64 = canvas.toDataURL('image/png').split(',')[1];
        setCaptureMode(false);
        setExportChart(null);
        const res = await fetch(`${API_URL}/Consultation/export-yudongzi-docx`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            chartImageBase64: imgBase64,
            chartJson: exportChartJsonRef.current,
            personName: formData.name,
          }),
        });
        if (!res.ok) { const d = await res.json().catch(() => ({})); alert(d.error || 'DOCX 生成失敗'); return; }
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${formData.name}_玉洞子命書.docx`;
        document.body.appendChild(a); a.click(); a.remove();
      } catch (err) { alert('DOCX 生成失敗：' + String(err)); }
      finally { setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [captureMode]);


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
              {subStatus?.birthdateLocked && (
                <div className="mb-3 px-3 py-2 bg-gray-100 border border-gray-300 rounded-xl text-xs text-gray-500 text-center">
                  命書已產生，生辰資料已鎖定，不可更改
                </div>
              )}
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-600 mb-1 font-bold text-xs">姓名</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={subStatus?.birthdateLocked} className="w-full px-3 py-1.5 rounded-xl border border-gray-200 outline-none focus:border-amber-500 disabled:bg-gray-50 disabled:text-gray-400" />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1 font-bold text-xs">性別</label>
                  <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} disabled={subStatus?.birthdateLocked} className="w-full px-3 py-1.5 rounded-xl border border-gray-200 disabled:bg-gray-50 disabled:text-gray-400">
                    <option value="1">乾造 (男)</option><option value="2">坤造 (女)</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div><label className="text-[10px] text-gray-400">西元年</label><select value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} disabled={subStatus?.birthdateLocked} className="w-full border rounded p-1 text-xs disabled:bg-gray-50 disabled:text-gray-400">{generateYears().map(y => <option key={y} value={y}>{y}年</option>)}</select></div>
                  <div><label className="text-[10px] text-gray-400">月</label><select value={formData.month} onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })} disabled={subStatus?.birthdateLocked} className="w-full border rounded p-1 text-xs disabled:bg-gray-50 disabled:text-gray-400">{months.map(m => <option key={m} value={m}>{m}月</option>)}</select></div>
                  <div><label className="text-[10px] text-gray-400">日</label><select value={formData.day} onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })} disabled={subStatus?.birthdateLocked} className="w-full border rounded p-1 text-xs disabled:bg-gray-50 disabled:text-gray-400">{days.map(d => <option key={d} value={d}>{d}日</option>)}</select></div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] text-gray-400">小時</label><select value={formData.hour} onChange={(e) => setFormData({ ...formData, hour: parseInt(e.target.value) })} disabled={subStatus?.birthdateLocked} className="w-full border rounded p-1 text-xs disabled:bg-gray-50 disabled:text-gray-400">{hours.map(h => <option key={h} value={h}>{h}時</option>)}</select></div>
                  <div><label className="text-[10px] text-gray-400">分鐘</label><select value={formData.minute} onChange={(e) => setFormData({ ...formData, minute: parseInt(e.target.value) })} disabled={subStatus?.birthdateLocked} className="w-full border rounded p-1 text-xs disabled:bg-gray-50 disabled:text-gray-400">{minutes.map(m => <option key={m} value={m}>{m}分</option>)}</select></div>
                </div>

                <button
                  onClick={handlePreviewChart}
                  className="w-full bg-teal-700 text-white font-bold py-2 rounded-xl text-xs shadow-md hover:bg-teal-800 transition-all"
                >
                  免費預覽命盤（不消耗配額）
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handleExportXLS} className="w-full bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs shadow-md">下載命盤 XLS</button>
                  <button
                    onClick={saveProfile}
                    disabled={profileSaving || subStatus?.birthdateLocked || !token}
                    className="w-full bg-sky-700 text-white font-bold py-2 rounded-xl text-xs shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {!token ? '請先登入' : subStatus?.birthdateLocked ? '生辰已鎖定' : profileLoaded ? '更新生辰' : '儲存生辰'}
                  </button>
                </div>
                {saveMsg && (
                  <p className={`text-xs text-center mt-1 ${saveMsg.includes('失敗') ? 'text-red-400' : 'text-green-400'}`}>
                    {saveMsg}
                  </p>
                )}
                {isAdmin && (
                  <button
                    onClick={handleYudongziDocx}
                    className="w-full bg-amber-800 text-white font-bold py-2 rounded-xl text-xs shadow-md mt-1"
                  >
                    執行下載玉洞子命書docx
                  </button>
                )}
                {profileLoaded && !subStatus?.birthdateLocked && (
                  <p className="text-[10px] text-green-600 text-center">已載入會員生辰資料</p>
                )}
              </div>
            </div>

            {/* 命書類型選擇 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-orange-100 text-sm">
              <h2 className="text-lg font-bold text-amber-950 mb-3">命書類型</h2>
              <div className="space-y-2">
                {REPORT_TYPES.map(rt => {
                  const svcStatus = canUseService(rt.key);
                  const badge = svcStatus === 'available'
                    ? <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">可用</span>
                    : svcStatus === 'used'
                    ? <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full shrink-0">已使用</span>
                    : svcStatus === 'cross_year'
                    ? <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full shrink-0">跨年需重訂</span>
                    : svcStatus === 'locked'
                    ? <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full shrink-0">升級解鎖</span>
                    : <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full shrink-0">需訂閱</span>;
                  return (
                    <button
                      key={rt.key}
                      onClick={() => setReportType(rt.key)}
                      className={`w-full text-left px-4 py-3 rounded-2xl border transition-all ${reportType === rt.key
                        ? 'bg-amber-800 text-white border-amber-800 shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300'
                        }`}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-sm">{rt.label}</div>
                          <div className={`text-xs mt-0.5 ${reportType === rt.key ? 'text-amber-200' : 'text-gray-400'}`}>{rt.desc}</div>
                        </div>
                        {badge}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 大運命書：固定 5年大運 */}
              {reportType === '大運命書' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800">
                    <div className="font-bold mb-0.5">大運命書（5年大運）</div>
                    <div className="text-amber-600 mt-0.5">逐月依干支合沖刑害破、神煞、六神、紫微四化分析</div>
                  </div>
                </div>
              )}

              {/* 流年命書：固定今年 */}
              {reportType === '流年命書' && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800">
                    <div className="font-bold mb-0.5">流年命書（{currentYear} 年 · 今年）</div>
                    <div className="text-amber-600 mt-0.5">包含：八字·太歲·生肖·流星·紫微四化 + 逐月分析</div>
                  </div>
                </div>
              )}


              {(() => {
                const btnStatus = canUseService(reportType);
                const isDisabled = btnStatus === 'used' || btnStatus === 'cross_year';
                const isRedirect = btnStatus === 'locked' || btnStatus === 'no_subscription' || btnStatus === 'cross_year';
                const btnLabel = btnStatus === 'used' ? '本期已使用'
                  : btnStatus === 'cross_year' ? '訂閱已跨年，請重新訂閱'
                  : btnStatus === 'locked' ? '升級方案解鎖'
                  : btnStatus === 'no_subscription' ? '訂閱後使用'
                  : `啟動${selected.label}`;
                return (
                  <button
                    onClick={isDisabled ? undefined : isRedirect ? () => { window.location.href = '/subscribe'; } : handleAnalysis}
                    disabled={isDisabled}
                    className={`mt-4 w-full font-bold py-3 rounded-2xl text-sm shadow-md transition-all ${
                      isDisabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : btnStatus === 'locked' || btnStatus === 'no_subscription'
                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                        : 'bg-amber-800 text-white hover:bg-amber-900'
                    }`}
                  >
                    {btnLabel}
                  </button>
                );
              })()}

              {!subStatus?.birthdateLocked && subStatus?.isSubscribed && (
                <p className="mt-2 text-[10px] text-gray-400 text-center leading-relaxed">
                  請先確認出生日時正確。命書列印啟動成功後，出生時辰將永久鎖定不可更改。
                </p>
              )}

              {isAdmin && (
                <button
                  onClick={handleYudongziReport}
                  className="mt-2 w-full bg-stone-800 text-amber-200 font-bold py-2.5 rounded-2xl text-xs shadow-md hover:bg-stone-900 transition-all border border-amber-700"
                >
                  玉洞子命書（內部版）
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={handlePushNow}
                  className="mt-1 w-full bg-blue-900 text-blue-100 font-bold py-2.5 rounded-2xl text-xs shadow-md hover:bg-blue-950 transition-all border border-blue-700"
                >
                  立即觸發 LINE 推播測試
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={async () => {
                    setIsLoading(true); setLoadingText('IG 帳號診斷中...');
                    try {
                      const res = await fetch(`${API_URL}/NineStar/ig-check`, { headers: { Authorization: `Bearer ${token}` } });
                      const data = await res.json();
                      alert('IG 帳號診斷結果：\n\n' + JSON.stringify(data, null, 2));
                    } catch(e) { alert('診斷失敗：' + String(e)); }
                    finally { setIsLoading(false); }
                  }}
                  className="mt-1 w-full bg-purple-900 text-purple-100 font-bold py-2.5 rounded-2xl text-xs shadow-md hover:bg-purple-950 transition-all border border-purple-700"
                >
                  IG 帳號診斷
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => handleIgPostNow('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/1200px-Camponotus_flavomarginatus_ant.jpg')}
                  className="mt-1 w-full bg-pink-800 text-pink-100 font-bold py-2.5 rounded-2xl text-xs shadow-md hover:bg-pink-900 transition-all border border-pink-600"
                >
                  IG API 連線測試（小圖+正文）
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => handleIgPostNow()}
                  className="mt-1 w-full bg-pink-900 text-pink-100 font-bold py-2.5 rounded-2xl text-xs shadow-md hover:bg-pink-950 transition-all border border-pink-700"
                >
                  立即觸發 Instagram 發文測試（大圖）
                </button>
              )}
              {/* 原玉洞子命書DOCX按鈕（已移至左上方，此處暫停）
              {isAdmin && (
                <button
                  onClick={handleYudongziDocx}
                  className="mt-1 w-full bg-red-900 text-amber-100 font-bold py-2.5 rounded-2xl text-xs shadow-md hover:bg-red-950 transition-all border border-red-700"
                >
                  下載玉洞子命書 DOCX
                </button>
              )}
              */}
            </div>
          </div>

          {/* 右側：命書結果 */}
          <div className="md:col-span-8">
            {!token && (
              <div className="mb-4 bg-amber-50 border border-amber-200 p-4 rounded-[2rem] flex justify-between items-center">
                <p className="text-sm text-amber-800">登入後可儲存生辰、使用試用期及訂閱命書功能</p>
                <Link href="/login?redirect=/disk" className="bg-amber-700 text-white px-5 py-2 rounded-full font-bold text-sm">登入</Link>
              </div>
            )}
            {token && subStatus && !subStatus.isSubscribed && subStatus.isInTrial && (
              <div className="mb-4 bg-gradient-to-r from-teal-700 to-teal-900 p-4 rounded-[2rem] text-white flex justify-between items-center shadow-lg">
                <div>
                  <p className="text-xs text-white/80">7 天免費試用中</p>
                  <p className="font-bold text-white">剩餘 {subStatus.trialDaysRemaining} 天</p>
                </div>
                <Link href="/subscribe" className="bg-white text-teal-800 px-4 py-2 rounded-full font-bold text-sm hover:bg-teal-50">訂閱解鎖全功能</Link>
              </div>
            )}
            {token && subStatus && subStatus.isSubscribed && (
              <div className="mb-4 bg-gradient-to-r from-amber-800 to-amber-950 p-4 rounded-[2rem] text-white flex justify-between items-center shadow-lg">
                <div>
                  <p className="text-xs text-white/80">訂閱方案</p>
                  <p className="font-bold text-white">{subStatus.planName}</p>
                </div>
                <div className="text-right text-xs text-white/80 space-y-0.5">
                  {subStatus.quotaStatus?.map(q => (
                    <div key={q.productCode}>{
                      q.productCode === 'BOOK_BAZI' ? '八字命書' :
                      q.productCode === 'BOOK_LIUNIAN' ? '流年命書' :
                      q.productCode === 'BOOK_DAIYUN' ? '大運命書' : q.productCode
                    }：剩餘 {q.remaining}/{q.total}</div>
                  ))}
                </div>
              </div>
            )}
            {token && subStatus && !subStatus.isSubscribed && !subStatus.isInTrial && (
              <div className="mb-4 bg-gray-100 border border-amber-200 p-4 rounded-[2rem] flex justify-between items-center">
                <p className="text-sm text-gray-600">試用期已結束，訂閱後可使用命書功能</p>
                <Link href="/subscribe" className="bg-amber-700 text-white px-5 py-2 rounded-full font-bold text-sm">訂閱方案</Link>
              </div>
            )}

            {report ? (
              <div className="space-y-4">
                <div className="flex justify-end gap-2">
                  <button onClick={handleExportDocx} className="bg-amber-700 text-white border border-amber-600 px-5 py-2 rounded-full text-xs font-bold hover:bg-amber-800 transition-all shadow-sm">
                    下載命書 DOCX
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
            ) : previewChartData ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center">
                  <p className="text-amber-900 font-bold text-lg mb-1">命盤已計算完成</p>
                  <p className="text-sm text-amber-700 mb-3">以下為命盤結構視覺圖，完整命書報告需訂閱後使用</p>
                  <Link href="/subscribe" className="inline-block bg-amber-700 text-white px-8 py-2.5 rounded-full font-bold text-sm hover:bg-amber-800">訂閱解鎖完整命書</Link>
                </div>
                {/* Bazi + Ziwei chart visual displayed for free */}
                {exportChart?.bazi && (
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
                        <tr>
                          {[exportChart.bazi.timePillar, exportChart.bazi.dayPillar, exportChart.bazi.monthPillar, exportChart.bazi.yearPillar].map((p,i) => (
                            <td key={i} className="border border-amber-200 px-3 py-2 text-xl font-bold text-gray-800">{p.heavenlyStem}</td>
                          ))}
                        </tr>
                        <tr>
                          {[exportChart.bazi.timePillar, exportChart.bazi.dayPillar, exportChart.bazi.monthPillar, exportChart.bazi.yearPillar].map((p,i) => (
                            <td key={i} className="border border-amber-200 px-3 py-2 text-xl font-bold text-gray-800">{p.earthlyBranch}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
                {exportChart?.palaces && (
                  <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
                    <h3 className="text-base font-bold text-amber-900 px-4 pt-4 mb-2">紫微斗數命盤</h3>
                    <ZiweiGrid chartData={exportChart} gridRef={{ current: null }} />
                  </div>
                )}
                <div className="relative bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
                  <div className="p-8 text-center blur-sm select-none pointer-events-none opacity-40">
                    <p className="text-lg text-gray-700">命書內容計算完成...</p>
                    <p className="text-sm text-gray-500 mt-2">格局判斷 · 核心特質 · 關鍵斷語 · 具體建議</p>
                    <p className="text-sm text-gray-500 mt-1">一、格局判斷 · 二、核心特質 · 三、關鍵斷語 · 四、具體建議</p>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                    <p className="text-amber-900 font-bold text-xl mb-2">命書報告已鎖定</p>
                    <p className="text-sm text-amber-700 mb-4">訂閱會員方案後可查看完整命書</p>
                    <Link href="/subscribe" className="bg-amber-700 text-white px-8 py-3 rounded-full font-bold hover:bg-amber-800 transition-all shadow-lg">立即訂閱解鎖</Link>
                    {!token && <Link href="/login?redirect=/disk" className="mt-3 text-sm text-gray-500 underline hover:text-gray-700">已有帳號？登入</Link>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-[400px] border-2 border-dashed border-amber-100 rounded-[3rem] flex flex-col items-center justify-center bg-white/40 gap-4">
                  <div className="text-amber-200 text-xl italic tracking-widest font-bold">請輸入資料後開啟鑑定</div>
                  <p className="text-sm text-amber-400">或點擊「免費預覽命盤」查看八字命盤結構</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 隱藏的紫微十二宮格，供 html2canvas 截圖 */}
      {captureMode && exportChart && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0, width: 960, background: '#fff' }}>
          <ZiweiGrid chartData={exportChart} gridRef={ziweiGridRef} />
        </div>
      )}
    </div>
  );
}

const PALACE_COLORS: Record<string, string> = {
  '命宮':'#FFF9C4','兄弟宮':'#E8F5E9','夫妻宮':'#FCE4EC','子女宮':'#E3F2FD',
  '財帛宮':'#FFF3E0','疾厄宮':'#F3E5F5','遷移宮':'#E0F7FA','奴僕宮':'#F9FBE7',
  '官祿宮':'#E8EAF6','田宅宮':'#FBE9E7','福德宮':'#E0F2F1','父母宮':'#FFF8E1',
};

const BRANCH_POS: Record<string, [number,number]> = {
  '巳':[0,0],'午':[0,1],'未':[0,2],'申':[0,3],
  '辰':[1,0],            '酉':[1,3],
  '卯':[2,0],            '戌':[2,3],
  '寅':[3,0],'丑':[3,1],'子':[3,2],'亥':[3,3],
};

function ZiweiGrid({ chartData, gridRef }: { chartData: { palaces: Array<{palaceName:string;palaceStem:string;earthlyBranch:string;majorStars:string[];secondaryStars:string[];decadeAgeRange:string;palaceStemTransformations:string;annualStarTransformations:string[];goodStars:string[];badStars:string[]}>; bazi:{yearPillar:{heavenlyStem:string;earthlyBranch:string};monthPillar:{heavenlyStem:string;earthlyBranch:string};dayPillar:{heavenlyStem:string;earthlyBranch:string};timePillar:{heavenlyStem:string;earthlyBranch:string}}; wuXingJuText:string; mingZhu:string; shenZhu:string; userName:string }; gridRef: React.RefObject<HTMLDivElement | null> }) {
  const grid: (typeof chartData.palaces[0] | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null));
  for (const p of chartData.palaces) {
    const branch = p.earthlyBranch.trim().charAt(0);
    const pos = BRANCH_POS[branch];
    if (pos) grid[pos[0]][pos[1]] = p;
  }
  const bazi = chartData.bazi;
  const stems = [bazi.timePillar.heavenlyStem, bazi.dayPillar.heavenlyStem, bazi.monthPillar.heavenlyStem, bazi.yearPillar.heavenlyStem];
  const branches = [bazi.timePillar.earthlyBranch.trim().charAt(0), bazi.dayPillar.earthlyBranch.trim().charAt(0), bazi.monthPillar.earthlyBranch.trim().charAt(0), bazi.yearPillar.earthlyBranch.trim().charAt(0)];

  const cellStyle = (p: typeof chartData.palaces[0] | null): React.CSSProperties => {
    const name = p?.palaceName.replace('身','').trim() + '宮';
    const bg = PALACE_COLORS[name] || '#F8F8F8';
    return { background: bg, border: '1px solid #8B6914', padding: '4px 4px 4px 4px', verticalAlign: 'top', width: 220, height: 195, overflow: 'hidden', boxSizing: 'border-box' };
  };

  const centerStyle: React.CSSProperties = { background: '#FFFDF0', border: '1px solid #8B6914', padding: 8, boxSizing: 'border-box', textAlign: 'center', verticalAlign: 'middle' };

  const isCenter = (r: number, c: number) => r >= 1 && r <= 2 && c >= 1 && c <= 2;

  return (
    <div ref={gridRef} style={{ fontFamily: '"標楷體","DFKai-SB","BiauKai",serif', padding: 12, background: '#fff' }}>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 22, fontWeight: 'bold', color: '#8B0000' }}>三式命理</span>
        <span style={{ fontSize: 28, fontWeight: 'bold', color: '#CC0000', margin: '0 16px' }}>先天元神圖</span>
        <span style={{ fontSize: 13, color: '#333' }}>玉洞子</span>
      </div>
      <table style={{ borderCollapse: 'collapse', width: 880, tableLayout: 'fixed' }}>
        <tbody>
          {[0,1,2,3].map(row => (
            <tr key={row}>
              {[0,1,2,3].map(col => {
                if (isCenter(row, col)) {
                  if (row === 1 && col === 1) {
                    return (
                      <td key={col} colSpan={2} rowSpan={2} style={{ ...centerStyle, width: 440, height: 390 }}>
                        <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>{chartData.wuXingJuText}　命主星：{chartData.mingZhu}　身主星：{chartData.shenZhu}</div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 4 }}>
                          {stems.map((s,i) => <span key={i} style={{ fontSize: 40, fontWeight: 'bold', color: '#1a1a6e' }}>{s}</span>)}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
                          {branches.map((b,i) => <span key={i} style={{ fontSize: 40, fontWeight: 'bold', color: '#8B0000' }}>{b}</span>)}
                        </div>
                        <div style={{ fontSize: 11, color: '#333', marginTop: 6 }}>{chartData.userName}</div>
                      </td>
                    );
                  }
                  return null;
                }
                const p = grid[row][col];
                const palaceName = p?.palaceName ?? '';
                const branchDir = p?.earthlyBranch.trim().replace(/\s+/g, ' ') ?? '';
                return (
                  <td key={col} style={cellStyle(p)}>
                    {p && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Top row: age (left) | palaceName (center) | main stars (right) — all same line */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0, marginBottom: 2 }}>
                          <span style={{ fontSize: 9, color: '#666', minWidth: 28 }}>{p.decadeAgeRange}</span>
                          <span style={{ fontSize: 11, fontWeight: 'bold', color: '#222', flex: 1, textAlign: 'center' }}>{palaceName}</span>
                          <div style={{ textAlign: 'right', minWidth: 40 }}>
                            <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                              {p.majorStars.map((s, i) => (
                                <span key={i} style={{ fontSize: 18, fontWeight: 'bold', color: '#8B0000', lineHeight: 1 }}>{s}</span>
                              ))}
                            </div>
                            {p.annualStarTransformations && p.annualStarTransformations.length > 0 && (
                              <div style={{ fontSize: 8, color: '#8B0000', marginTop: 1 }}>
                                {p.annualStarTransformations.map((t, i) => <div key={i}>{t}</div>)}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Small stars */}
                        <div style={{ flex: 1, fontSize: 9, color: '#555', lineHeight: 1.4, overflow: 'hidden' }}>
                          {p.secondaryStars.length > 0 && <div>{p.secondaryStars.slice(0, 4).join(' ')}</div>}
                          {p.secondaryStars.length > 4 && <div>{p.secondaryStars.slice(4, 8).join(' ')}</div>}
                          {p.goodStars.length > 0 && <div style={{ color: '#006600' }}>{p.goodStars.join(' ')}</div>}
                          {p.badStars.length > 0 && <div style={{ color: '#AA0000' }}>{p.badStars.join(' ')}</div>}
                        </div>
                        {/* Bottom: 宮干+宮四化 above 地支方位 */}
                        <div style={{ flexShrink: 0, fontSize: 9, marginTop: 2 }}>
                          <div style={{ color: '#333' }}>
                            {p.palaceStem}{p.palaceStemTransformations ? <span style={{ color: '#0000AA' }}> {p.palaceStemTransformations}</span> : null}
                          </div>
                          <div style={{ color: '#555' }}>{branchDir}</div>
                        </div>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
