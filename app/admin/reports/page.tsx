'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';

interface ReportItem {
  id: string;
  userId: string;
  reportType: string;
  title: string;
  status: string;
  createdAt: string;
  approvedAt?: string;
  adminNote?: string;
  contentPreview: string;
  hasApprovedDocx: boolean;
  approvedDocxFileName?: string;
  userEmail?: string;
  userName?: string;
}

interface FullReport extends ReportItem {
  content?: string;
  parameters?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_review: { label: '審核中', color: 'bg-amber-100 text-amber-800' },
  approved: { label: '已核准', color: 'bg-green-100 text-green-800' },
  rejected: { label: '已退回', color: 'bg-red-100 text-red-800' },
};

const REPORT_TYPE_LABELS: Record<string, string> = {
  'bazi': '八字命書',
  'bazi-ziwei': '玉洞子八字紫微命書',
  'daiyun': '大運命書',
  'liunian': '流年命書',
  'lifelong': '終身命書',
  'yudongzi': '玉洞子命書（內部）',
};

export default function AdminReportsPage() {
  const { token } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [selectedReport, setSelectedReport] = useState<FullReport | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingUploadId, setPendingUploadId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5013/api'
    : 'https://ecanapi.fly.dev/api';

  const fetchReports = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/Reports/admin/list?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setReports(await res.json());
    } finally { setLoading(false); }
  }, [token, statusFilter, API_URL]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const fetchFullReport = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/Reports/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSelectedReport(await res.json());
    } catch { /* silent */ }
  };

  // Download AI-draft DOCX via export-generic-docx
  const handleDownloadDraft = async (r: ReportItem) => {
    if (!token) return;
    setActionLoading(true);
    try {
      // Get full content from admin endpoint
      const infoRes = await fetch(`${API_URL}/Reports/admin/${r.id}/download-draft-docx`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!infoRes.ok) { alert('取得命書資料失敗'); return; }
      const ct = infoRes.headers.get('content-type') ?? '';
      if (ct.includes('application/vnd.openxmlformats')) {
        // Admin already uploaded a corrected version - return that file
        const blob = await infoRes.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = r.approvedDocxFileName ?? `${r.title}.docx`;
        document.body.appendChild(a); a.click(); a.remove();
        return;
      }
      const data = await infoRes.json();
      // Generate DOCX via export-generic-docx
      const docxRes = await fetch(`${API_URL}/Consultation/export-generic-docx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          reportText: data.content,
          personName: data.personName,
          bookTitle: data.bookTitle,
          skipTitle: data.skipTitle
        })
      });
      if (!docxRes.ok) { alert('DOCX 生成失敗'); return; }
      const blob = await docxRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `草稿_${data.personName}_${r.title}.docx`;
      document.body.appendChild(a); a.click(); a.remove();
    } catch (err) { alert('下載失敗：' + String(err)); }
    finally { setActionLoading(false); }
  };

  const handleUploadClick = (id: string) => {
    setPendingUploadId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingUploadId || !token) return;
    e.target.value = '';
    setUploadingId(pendingUploadId);
    setMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/Reports/admin/${pendingUploadId}/upload-docx`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`已上傳：${data.message}`);
        await fetchReports();
        if (selectedReport?.id === pendingUploadId) {
          await fetchFullReport(pendingUploadId);
        }
      } else {
        setMsg(`上傳失敗：${data.error}`);
      }
    } catch (err) { setMsg(`上傳失敗：${String(err)}`); }
    finally { setUploadingId(null); setPendingUploadId(null); }
  };

  const handleApprove = async (id: string) => {
    if (!token) return;
    if (!confirm('核准此命書並發送 Email 給用戶？')) return;
    setActionLoading(true);
    setMsg('');
    try {
      const res = await fetch(`${API_URL}/Reports/admin/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`已核准！Email 已發送。`);
        setSelectedReport(null);
        await fetchReports();
      } else {
        setMsg(`錯誤：${data.error || JSON.stringify(data)}`);
      }
    } finally { setActionLoading(false); }
  };

  const handleReject = async (id: string) => {
    if (!token) return;
    if (!rejectNote.trim()) { alert('請填寫退回原因'); return; }
    if (!confirm('確定退回此命書？')) return;
    setActionLoading(true);
    setMsg('');
    try {
      const res = await fetch(`${API_URL}/Reports/admin/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ note: rejectNote }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('已退回');
        setRejectNote('');
        setSelectedReport(null);
        await fetchReports();
      } else {
        setMsg(`錯誤：${data.error}`);
      }
    } finally { setActionLoading(false); }
  };

  const handleResend = async (id: string) => {
    if (!token) return;
    if (!confirm('重新發送 Email（產生新的 72hr 下載連結）？')) return;
    setActionLoading(true);
    setMsg('');
    try {
      const res = await fetch(`${API_URL}/Reports/admin/${id}/resend`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMsg(res.ok ? `Email 已重發。` : `錯誤：${data.error}`);
    } finally { setActionLoading(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">命書審核管理</h1>
      <p className="text-sm text-gray-500 mb-6">收到申請 → 下載草稿 → 本地修正 → 上傳修正版 → 核准送出</p>

      {/* Hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx"
        className="hidden"
        onChange={handleFileChange}
      />

      {msg && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm p-3 rounded-xl break-all">{msg}</div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {Object.entries({ pending_review: '待審核', approved: '已核准', rejected: '已退回', all: '全部' }).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setStatusFilter(val)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === val ? 'bg-amber-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-amber-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-100">
          目前沒有{STATUS_LABELS[statusFilter]?.label ?? ''}命書
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => {
            const statusMeta = STATUS_LABELS[r.status] ?? { label: r.status, color: 'bg-gray-100 text-gray-500' };
            return (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <div>
                    <span className="font-bold text-gray-800 text-sm">{r.title}</span>
                    <span className="ml-2 text-xs text-gray-400">{REPORT_TYPE_LABELS[r.reportType] ?? r.reportType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.hasApprovedDocx && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">已上傳修正版</span>
                    )}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusMeta.color}`}>{statusMeta.label}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-1">
                  用戶：{r.userName ?? r.userId}{r.userEmail ? ` (${r.userEmail})` : ''}
                </p>
                <p className="text-xs text-gray-400 mb-2">
                  申請：{new Date(r.createdAt).toLocaleString('zh-TW')}
                  {r.approvedAt && <span className="ml-3">核准：{new Date(r.approvedAt).toLocaleString('zh-TW')}</span>}
                </p>
                {r.adminNote && <p className="text-xs text-red-500 mb-2">退回原因：{r.adminNote}</p>}
                {r.approvedDocxFileName && (
                  <p className="text-xs text-blue-600 mb-2">修正版檔案：{r.approvedDocxFileName}</p>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                  {/* Step 1: View full content */}
                  <button
                    onClick={() => fetchFullReport(r.id)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200"
                  >
                    查看全文
                  </button>

                  {/* Step 2: Download draft DOCX */}
                  <button
                    onClick={() => handleDownloadDraft(r)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg hover:bg-amber-200 disabled:opacity-50"
                  >
                    {r.hasApprovedDocx ? '下載修正版' : '下載草稿'}
                  </button>

                  {/* Step 3: Upload corrected DOCX */}
                  <button
                    onClick={() => handleUploadClick(r.id)}
                    disabled={uploadingId === r.id}
                    className="px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-lg hover:bg-blue-200 disabled:opacity-50"
                  >
                    {uploadingId === r.id ? '上傳中...' : r.hasApprovedDocx ? '重新上傳' : '上傳修正版'}
                  </button>

                  {/* Step 4: Approve & send (only after upload) */}
                  {r.status !== 'approved' && (
                    <button
                      onClick={() => handleApprove(r.id)}
                      disabled={actionLoading || !r.hasApprovedDocx}
                      title={!r.hasApprovedDocx ? '請先上傳修正版 DOCX' : ''}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        r.hasApprovedDocx
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      } disabled:opacity-50`}
                    >
                      核准送出
                    </button>
                  )}

                  {/* Resend email */}
                  {r.status === 'approved' && (
                    <button
                      onClick={() => handleResend(r.id)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded-lg hover:bg-purple-200 disabled:opacity-50"
                    >
                      重發 Email
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full content modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedReport(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-bold text-gray-800">{selectedReport.title}</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedReport.userEmail ?? selectedReport.userId}
                  　申請：{new Date(selectedReport.createdAt).toLocaleString('zh-TW')}
                </p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold ml-4 leading-none">x</button>
            </div>
            <div className="p-5 space-y-4">
              {/* AI draft content */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 mb-2">AI 草稿內容（供審閱）</h3>
                <pre className="text-xs text-gray-700 bg-gray-50 rounded-xl p-4 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto font-mono">
                  {selectedReport.content ?? '（載入中）'}
                </pre>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                {/* Download draft */}
                <button
                  onClick={() => handleDownloadDraft(selectedReport)}
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 disabled:opacity-50"
                >
                  下載{selectedReport.hasApprovedDocx ? '修正版' : '草稿'} DOCX（本地修正）
                </button>

                {/* Upload corrected */}
                <button
                  onClick={() => handleUploadClick(selectedReport.id)}
                  disabled={uploadingId === selectedReport.id}
                  className="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploadingId === selectedReport.id ? '上傳中...'
                    : selectedReport.hasApprovedDocx ? '重新上傳修正版 DOCX' : '上傳修正版 DOCX'}
                </button>

                {selectedReport.hasApprovedDocx && (
                  <p className="text-xs text-green-600 text-center">已上傳：{selectedReport.approvedDocxFileName}</p>
                )}

                {/* Approve - only if DOCX uploaded */}
                {selectedReport.status !== 'approved' && (
                  <button
                    onClick={() => handleApprove(selectedReport.id)}
                    disabled={actionLoading || !selectedReport.hasApprovedDocx}
                    title={!selectedReport.hasApprovedDocx ? '請先上傳修正版 DOCX' : ''}
                    className={`w-full py-2.5 text-sm font-bold rounded-xl transition-colors ${
                      selectedReport.hasApprovedDocx
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    } disabled:opacity-50`}
                  >
                    核准送出（發 Email 給用戶）
                  </button>
                )}
                {!selectedReport.hasApprovedDocx && selectedReport.status !== 'approved' && (
                  <p className="text-xs text-amber-600 text-center">請先上傳修正後的命書 DOCX 才能核准送出</p>
                )}

                {selectedReport.status === 'approved' && (
                  <button
                    onClick={() => handleResend(selectedReport.id)}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50"
                  >
                    重發 Email（產生新 72hr 下載連結）
                  </button>
                )}

                {/* Reject */}
                <div className="border-t border-gray-100 pt-3">
                  <label className="text-xs text-gray-500 font-medium">退回原因：</label>
                  <textarea
                    value={rejectNote}
                    onChange={e => setRejectNote(e.target.value)}
                    rows={2}
                    className="w-full mt-1 border border-gray-200 rounded-lg p-2 text-sm"
                    placeholder="說明退回原因（用戶可見）..."
                  />
                  <button
                    onClick={() => handleReject(selectedReport.id)}
                    disabled={actionLoading}
                    className="mt-2 w-full py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 disabled:opacity-50"
                  >
                    退回命書
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
