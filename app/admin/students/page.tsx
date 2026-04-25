'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';

interface WhiteListEntry {
  id: number;
  email: string;
  note: string | null;
  addedByEmail: string;
  addedAt: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  alreadyAdded: boolean;
}

export default function AdminStudentsPage() {
  const { token } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5013/api'
    : 'https://ecanapi.fly.dev/api';

  const [whitelist, setWhitelist] = useState<WhiteListEntry[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const [memberSearch, setMemberSearch] = useState('');
  const [memberSearchLoading, setMemberSearchLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [note, setNote] = useState('');
  const [addMsg, setAddMsg] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchWhitelist = async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/Student/whitelist`, { headers });
    if (res.status === 403) { setForbidden(true); setLoading(false); return; }
    if (res.ok) setWhitelist(await res.json());
    setLoading(false);
  };

  const searchMembers = async (q: string) => {
    if (!token) return;
    setMemberSearchLoading(true);
    try {
      const res = await fetch(`${API_URL}/Student/members?search=${encodeURIComponent(q)}`, { headers });
      if (res.ok) setMembers(await res.json());
    } finally {
      setMemberSearchLoading(false);
    }
  };

  useEffect(() => { fetchWhitelist(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => {
      if (memberSearch.length >= 1) searchMembers(memberSearch);
      else setMembers([]);
    }, 400);
    return () => clearTimeout(t);
  }, [memberSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = async () => {
    if (!selectedUserId) { setAddMsg('請先從下方選取一位會員'); return; }
    setAddLoading(true);
    setAddMsg('');
    try {
      const res = await fetch(`${API_URL}/Student/whitelist`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, note }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddMsg(`已加入：${data.email}`);
        setSelectedUserId('');
        setNote('');
        setMemberSearch('');
        setMembers([]);
        await fetchWhitelist();
      } else {
        setAddMsg(data.error ?? '加入失敗');
      }
    } catch { setAddMsg('加入時發生錯誤'); } finally { setAddLoading(false); }
  };

  const handleDelete = async (id: number, email: string) => {
    if (!confirm(`確定要移除 ${email}？`)) return;
    const res = await fetch(`${API_URL}/Student/whitelist/${id}`, { method: 'DELETE', headers });
    if (res.ok) setWhitelist(prev => prev.filter(e => e.id !== id));
    else alert('刪除失敗');
  };

  if (forbidden) {
    return <div className="p-8 text-red-400">無存取權限（僅限管理員）</div>;
  }

  if (loading) {
    return <div className="p-8 text-neutral-400">載入中...</div>;
  }

  const selectedMember = members.find(m => m.id === selectedUserId);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">&larr; 後台首頁</Link>
          <h1 className="text-xl font-bold text-amber-300">學生白名單管理</h1>
        </div>

        {/* Add section */}
        <div className="bg-neutral-800 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-amber-200 mb-3">新增學生</h2>

          <div className="mb-3">
            <label className="text-xs text-neutral-400 mb-1 block">搜尋已註冊會員（email 或姓名）</label>
            <input
              type="text"
              value={memberSearch}
              onChange={e => { setMemberSearch(e.target.value); setSelectedUserId(''); }}
              placeholder="輸入 email 或姓名..."
              className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Member list */}
          {(members.length > 0 || memberSearchLoading) && (
            <div className="border border-neutral-700 rounded-lg mb-3 max-h-48 overflow-y-auto">
              {memberSearchLoading ? (
                <div className="p-3 text-xs text-neutral-400">搜尋中...</div>
              ) : members.map(m => (
                <div
                  key={m.id}
                  onClick={() => { if (!m.alreadyAdded) setSelectedUserId(m.id); }}
                  className={`flex items-center justify-between px-3 py-2 text-sm border-b border-neutral-700 last:border-0
                    ${m.alreadyAdded ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-neutral-700'}
                    ${selectedUserId === m.id ? 'bg-amber-900/40' : ''}`}
                >
                  <div>
                    <span className="font-medium">{m.name}</span>
                    <span className="text-neutral-400 ml-2 text-xs">{m.email}</span>
                  </div>
                  {m.alreadyAdded
                    ? <span className="text-xs text-amber-500">已加入</span>
                    : selectedUserId === m.id && <span className="text-xs text-emerald-400">已選取</span>
                  }
                </div>
              ))}
            </div>
          )}

          {selectedMember && (
            <div className="text-xs text-emerald-300 mb-2">已選取：{selectedMember.name} ({selectedMember.email})</div>
          )}

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs text-neutral-400 mb-1 block">備註（課程/班別）</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="例：2026春季班"
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={addLoading || !selectedUserId}
              className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap"
            >
              {addLoading ? '加入中...' : '加入白名單'}
            </button>
          </div>
          {addMsg && (
            <p className={`text-xs mt-2 ${addMsg.startsWith('已加入') ? 'text-emerald-400' : 'text-red-400'}`}>{addMsg}</p>
          )}
        </div>

        {/* Whitelist table */}
        <div className="bg-neutral-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-amber-200 mb-3">目前白名單（{whitelist.length} 人）</h2>
          {whitelist.length === 0 ? (
            <p className="text-neutral-500 text-sm">尚無學生</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-neutral-400 text-xs border-b border-neutral-700">
                    <th className="text-left pb-2">Email</th>
                    <th className="text-left pb-2">備註</th>
                    <th className="text-left pb-2">加入時間</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {whitelist.map(entry => (
                    <tr key={entry.id} className="border-b border-neutral-700/50 hover:bg-neutral-700/30">
                      <td className="py-2 pr-3">{entry.email}</td>
                      <td className="py-2 pr-3 text-neutral-400">{entry.note ?? '-'}</td>
                      <td className="py-2 pr-3 text-neutral-400 text-xs">{entry.addedAt}</td>
                      <td className="py-2">
                        <button
                          onClick={() => handleDelete(entry.id, entry.email)}
                          className="text-red-500 hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-900/30 transition"
                        >
                          移除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
