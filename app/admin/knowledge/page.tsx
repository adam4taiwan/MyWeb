'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5013/api'
  : 'https://ecanapi.fly.dev/api';

type Tab = 'upload' | 'rules' | 'documents';

interface ParsedRule {
  category: string;
  subcategory?: string;
  title?: string;
  conditionText?: string;
  resultText: string;
  sourceFile?: string;
  tags?: string;
}

interface UploadResult {
  fileName: string;
  fileType: string;
  category: string;
  subcategory?: string;
  count: number;
  preview: ParsedRule[];
  all: ParsedRule[];
}

interface FortuneRule {
  id: number;
  category: string;
  subcategory?: string;
  title?: string;
  conditionText?: string;
  resultText: string;
  sourceFile?: string;
  tags?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

interface KnowledgeDocument {
  id: number;
  fileName: string;
  fileType: string;
  category?: string;
  contentPreview?: string;
  ruleCount: number;
  status: string;
  uploadedAt: string;
  uploadedBy?: string;
}

const CATEGORIES = ['八字', '紫微', '通用'];
const SUBCATEGORIES: Record<string, string[]> = {
  '八字': ['基礎', '格局', '六親', '大運', '日主', '十天干', '十二地支', '象法', '直斷', '通則'],
  '紫微': ['四化', '格局', '星情', '宮位', '主星', '飛星', '大運', '通則'],
  '通用': ['通則', '其他'],
};

export default function KnowledgePage() {
  const { token } = useAuth();
  const [tab, setTab] = useState<Tab>('upload');

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('紫微');
  const [uploadSubcategory, setUploadSubcategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [editingRules, setEditingRules] = useState<ParsedRule[]>([]);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rules state
  const [rules, setRules] = useState<FortuneRule[]>([]);
  const [rulesTotal, setRulesTotal] = useState(0);
  const [rulesPage, setRulesPage] = useState(1);
  const [rulesSearch, setRulesSearch] = useState('');
  const [rulesCategory, setRulesCategory] = useState('');
  const [rulesLoading, setRulesLoading] = useState(false);
  const [editRule, setEditRule] = useState<FortuneRule | null>(null);
  const [editModal, setEditModal] = useState(false);

  // Documents state
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const loadRules = useCallback(async () => {
    setRulesLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(rulesPage),
        pageSize: '20',
        activeOnly: 'false',
      });
      if (rulesSearch) params.set('search', rulesSearch);
      if (rulesCategory) params.set('category', rulesCategory);
      const res = await fetch(`${API_URL}/Knowledge/rules?${params}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setRules(data.items);
        setRulesTotal(data.total);
      }
    } finally {
      setRulesLoading(false);
    }
  }, [rulesPage, rulesSearch, rulesCategory, token]);

  const loadDocuments = useCallback(async () => {
    setDocsLoading(true);
    try {
      const res = await fetch(`${API_URL}/Knowledge/documents`, { headers: authHeaders });
      if (res.ok) setDocuments(await res.json());
    } finally {
      setDocsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (tab === 'rules') loadRules();
    if (tab === 'documents') loadDocuments();
  }, [tab, loadRules, loadDocuments]);

  // File upload and parse
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadFile(e.target.files?.[0] || null);
    setUploadResult(null);
    setEditingRules([]);
    setImportMsg('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) { setUploadFile(f); setUploadResult(null); setEditingRules([]); setImportMsg(''); }
  };

  const handleParse = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setImportMsg('');
    try {
      const form = new FormData();
      form.append('file', uploadFile);
      form.append('category', uploadCategory);
      form.append('subcategory', uploadSubcategory);
      const res = await fetch(`${API_URL}/Knowledge/upload`, {
        method: 'POST',
        headers: authHeaders,
        body: form,
      });
      const data = await res.json();
      if (!res.ok) { setImportMsg(`解析失敗：${data.message}`); return; }
      setUploadResult(data);
      setEditingRules(data.all);
    } catch (err) {
      setImportMsg('解析失敗，請檢查檔案格式');
    } finally {
      setUploading(false);
    }
  };

  const handleImport = async () => {
    if (!uploadResult || editingRules.length === 0) return;
    setImporting(true);
    setImportMsg('');
    try {
      const res = await fetch(`${API_URL}/Knowledge/import`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: uploadResult.fileName,
          fileType: uploadResult.fileType,
          category: uploadCategory,
          rules: editingRules,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setImportMsg(`成功匯入 ${data.imported} 筆規則`);
        setUploadResult(null);
        setEditingRules([]);
        setUploadFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setImportMsg(`匯入失敗：${data.message}`);
      }
    } finally {
      setImporting(false);
    }
  };

  const removeEditingRule = (idx: number) => {
    setEditingRules(prev => prev.filter((_, i) => i !== idx));
  };

  const updateEditingRule = (idx: number, field: keyof ParsedRule, value: string) => {
    setEditingRules(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  // Rule CRUD
  const handleDeleteRule = async (id: number) => {
    if (!confirm('確定刪除此規則？')) return;
    const res = await fetch(`${API_URL}/Knowledge/rules/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (res.ok) loadRules();
  };

  const handleSaveRule = async () => {
    if (!editRule) return;
    const method = editRule.id === 0 ? 'POST' : 'PUT';
    const url = editRule.id === 0
      ? `${API_URL}/Knowledge/rules`
      : `${API_URL}/Knowledge/rules/${editRule.id}`;
    const res = await fetch(url, {
      method,
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(editRule),
    });
    if (res.ok) { setEditModal(false); setEditRule(null); loadRules(); }
  };

  const openEditModal = (rule?: FortuneRule) => {
    setEditRule(rule ?? {
      id: 0, category: '紫微', subcategory: '', title: '', conditionText: '',
      resultText: '', sourceFile: '', tags: '', isActive: true, sortOrder: 0, createdAt: '',
    });
    setEditModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">命理知識庫</h1>
        {tab === 'rules' && (
          <button
            onClick={() => openEditModal()}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
          >
            + 新增規則
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {([
          { key: 'upload', label: '上傳匯入' },
          { key: 'rules', label: `知識條目 (${rulesTotal})` },
          { key: 'documents', label: '已匯入文件' },
        ] as { key: Tab; label: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {tab === 'upload' && (
        <div className="max-w-3xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-700 mb-4">上傳命理文件</h2>
            <p className="text-sm text-gray-500 mb-4">
              支援格式：xlsx, xls, docx, doc, csv, txt（上傳後解析預覽，確認後匯入資料庫）
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">分類</label>
                <select
                  value={uploadCategory}
                  onChange={e => { setUploadCategory(e.target.value); setUploadSubcategory(''); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">子分類（可選）</label>
                <select
                  value={uploadSubcategory}
                  onChange={e => setUploadSubcategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">-- 自動偵測 --</option>
                  {(SUBCATEGORIES[uploadCategory] ?? []).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-amber-400 transition-colors mb-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.docx,.doc,.csv,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
              {uploadFile ? (
                <div>
                  <p className="text-amber-600 font-medium">{uploadFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 text-sm">拖放文件至此，或點擊選擇</p>
                  <p className="text-gray-400 text-xs mt-1">.xlsx .xls .docx .doc .csv .txt</p>
                </div>
              )}
            </div>

            <button
              onClick={handleParse}
              disabled={!uploadFile || uploading}
              className="w-full py-2.5 bg-amber-600 text-white rounded-lg font-medium text-sm hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? '解析中...' : '解析文件'}
            </button>

            {importMsg && (
              <p className={`mt-3 text-sm text-center font-medium ${importMsg.includes('失敗') ? 'text-red-600' : 'text-green-600'}`}>
                {importMsg}
              </p>
            )}
          </div>

          {/* Preview */}
          {uploadResult && editingRules.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-700">
                  解析結果：{editingRules.length} 筆（可在匯入前刪除/編輯）
                </h2>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {importing ? '匯入中...' : `確認匯入 ${editingRules.length} 筆`}
                </button>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {editingRules.map((rule, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-2 mb-1">
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                            {rule.category}
                          </span>
                          {rule.subcategory && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {rule.subcategory}
                            </span>
                          )}
                        </div>
                        {rule.title && (
                          <input
                            value={rule.title}
                            onChange={e => updateEditingRule(idx, 'title', e.target.value)}
                            className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded px-2 py-1 mb-1"
                          />
                        )}
                        <textarea
                          value={rule.resultText}
                          onChange={e => updateEditingRule(idx, 'resultText', e.target.value)}
                          rows={2}
                          className="w-full text-xs text-gray-600 bg-white border border-gray-200 rounded px-2 py-1"
                        />
                      </div>
                      <button
                        onClick={() => removeEditingRule(idx)}
                        className="text-gray-400 hover:text-red-500 flex-shrink-0 text-lg leading-none"
                        title="移除此條"
                      >
                        x
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rules Tab */}
      {tab === 'rules' && (
        <div>
          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="搜尋標題/內容..."
              value={rulesSearch}
              onChange={e => { setRulesSearch(e.target.value); setRulesPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 max-w-xs"
            />
            <select
              value={rulesCategory}
              onChange={e => { setRulesCategory(e.target.value); setRulesPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">全部分類</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <button onClick={loadRules} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700">
              搜尋
            </button>
          </div>

          {rulesLoading ? (
            <div className="text-center py-12 text-gray-400">載入中...</div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium w-20">ID</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium w-24">分類</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium w-24">子分類</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">標題</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium w-48">內容摘要</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium w-20">狀態</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium w-24">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rules.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-gray-400">尚無資料</td></tr>
                    ) : rules.map(rule => (
                      <tr key={rule.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500">{rule.id}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">{rule.category}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{rule.subcategory}</td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{rule.title || '-'}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[12rem]" title={rule.resultText}>
                          {rule.resultText.slice(0, 60)}{rule.resultText.length > 60 ? '...' : ''}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {rule.isActive ? '啟用' : '停用'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEditModal(rule)} className="text-blue-500 hover:text-blue-700 text-xs">編輯</button>
                            <button onClick={() => handleDeleteRule(rule.id)} className="text-red-400 hover:text-red-600 text-xs">刪除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                <span>共 {rulesTotal} 筆</span>
                <div className="flex gap-2">
                  <button
                    disabled={rulesPage === 1}
                    onClick={() => { setRulesPage(p => p - 1); }}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40"
                  >
                    上一頁
                  </button>
                  <span className="px-3 py-1">第 {rulesPage} 頁</span>
                  <button
                    disabled={rulesPage * 20 >= rulesTotal}
                    onClick={() => { setRulesPage(p => p + 1); }}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40"
                  >
                    下一頁
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {tab === 'documents' && (
        <div>
          {docsLoading ? (
            <div className="text-center py-12 text-gray-400">載入中...</div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">文件名稱</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium w-20">格式</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium w-20">分類</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium w-20">條目數</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium w-24">狀態</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium w-36">上傳時間</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">上傳者</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {documents.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">尚未匯入任何文件</td></tr>
                  ) : documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{doc.fileName}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">{doc.fileType}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{doc.category}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{doc.ruleCount}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{doc.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(doc.uploadedAt).toLocaleString('zh-TW')}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{doc.uploadedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Rule Modal */}
      {editModal && editRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <h3 className="font-bold text-gray-800 text-lg mb-4">
              {editRule.id === 0 ? '新增規則' : `編輯規則 #${editRule.id}`}
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">分類</label>
                  <select
                    value={editRule.category}
                    onChange={e => setEditRule({ ...editRule, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">子分類</label>
                  <input
                    value={editRule.subcategory ?? ''}
                    onChange={e => setEditRule({ ...editRule, subcategory: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="四化/格局..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">標題</label>
                <input
                  value={editRule.title ?? ''}
                  onChange={e => setEditRule({ ...editRule, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">觸發條件</label>
                <input
                  value={editRule.conditionText ?? ''}
                  onChange={e => setEditRule({ ...editRule, conditionText: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="何時成立此規則..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">論斷內容 *</label>
                <textarea
                  value={editRule.resultText}
                  onChange={e => setEditRule({ ...editRule, resultText: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">標籤（逗號分隔）</label>
                  <input
                    value={editRule.tags ?? ''}
                    onChange={e => setEditRule({ ...editRule, tags: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">狀態</label>
                  <select
                    value={editRule.isActive ? 'true' : 'false'}
                    onChange={e => setEditRule({ ...editRule, isActive: e.target.value === 'true' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="true">啟用</option>
                    <option value="false">停用</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSaveRule}
                disabled={!editRule.resultText}
                className="flex-1 py-2 bg-amber-600 text-white rounded-lg font-medium text-sm hover:bg-amber-700 disabled:opacity-50"
              >
                儲存
              </button>
              <button
                onClick={() => { setEditModal(false); setEditRule(null); }}
                className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
