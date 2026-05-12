'use client';

import { useState, useEffect, useCallback } from 'react';

interface WatchRequest {
  id: number;
  target_instagram_username: string;
  user_instagram_username: string;
  current_status: string;
  last_checked_at: string | null;
  notification_sent: number;
  notified_at: string | null;
  created_at: string;
}

interface Stats {
  total: number;
  private: number;
  public: number;
  unknown: number;
  failed: number;
  notified: number;
}

const STATUS_LABEL: Record<string, string> = {
  private: '비공개',
  public: '공개',
  unknown: '확인중',
  failed: '실패',
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function AdminPage() {
  const [requests, setRequests] = useState<WatchRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [monitorLoading, setMonitorLoading] = useState(false);
  const [monitorResult, setMonitorResult] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (search) params.set('search', search);

    const [reqRes, statsRes] = await Promise.all([
      fetch(`/api/admin/requests?${params}`),
      fetch('/api/admin/stats'),
    ]);

    const reqData = await reqRes.json();
    const statsData = await statsRes.json();
    setRequests(reqData.requests || []);
    setStats(statsData);
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const runMonitor = async () => {
    setMonitorLoading(true);
    setMonitorResult(null);
    try {
      const res = await fetch('/api/monitor', { method: 'POST' });
      const data = await res.json();
      setMonitorResult(`완료: ${data.checked}개 확인, ${data.statusChanged}개 변경, ${data.notified}개 알림 발송`);
      fetchData();
    } catch {
      setMonitorResult('오류가 발생했습니다.');
    } finally {
      setMonitorLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', padding: '0 0 48px' }}>
      {/* Header */}
      <header style={{
        padding: '20px 32px',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
        background: 'rgba(10, 10, 15, 0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13 }}>← 메인</a>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 700 }}>관리자 페이지</span>
        </div>
        <button
          className="btn-primary"
          onClick={runMonitor}
          disabled={monitorLoading}
          style={{ fontSize: 13, padding: '10px 20px' }}
        >
          {monitorLoading ? '실행 중...' : '▶ 수동 체크 실행'}
        </button>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {monitorResult && (
          <div style={{
            background: 'rgba(123,97,255,0.1)', border: '1px solid rgba(123,97,255,0.3)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 24,
            fontSize: 13, color: '#a78bfa',
          }}>
            {monitorResult}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
            {[
              { label: '전체', value: stats.total, color: 'var(--text-primary)' },
              { label: '비공개', value: stats.private, color: '#ff6b8a' },
              { label: '공개', value: stats.public, color: '#4ade80' },
              { label: '확인중', value: stats.unknown, color: '#facc15' },
              { label: '실패', value: stats.failed, color: '#9ca3af' },
              { label: '알림 발송', value: stats.notified, color: '#a78bfa' },
            ].map((s) => (
              <div key={s.label} className="card" style={{ padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            className="input-field"
            type="text"
            placeholder="아이디 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 240, padding: '10px 14px', fontSize: 13 }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'private', 'public', 'unknown', 'failed'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '8px 14px', borderRadius: 8, border: '1px solid',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif',
                  borderColor: statusFilter === s ? 'var(--accent)' : 'var(--border)',
                  background: statusFilter === s ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                  color: statusFilter === s ? 'var(--accent)' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}
              >
                {s === 'all' ? '전체' : STATUS_LABEL[s] || s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['ID', '상대방 아이디', '본인 아이디', '현재 상태', '마지막 확인', '알림 발송', '등록일'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      color: 'var(--text-muted)', fontWeight: 500, fontSize: 11,
                      textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>로딩 중...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>등록된 신청이 없습니다.</td></tr>
                ) : requests.map((r, i) => (
                  <tr key={r.id} style={{
                    borderBottom: '1px solid var(--border)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)')}
                  >
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{r.id}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>@{r.target_instagram_username}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>@{r.user_instagram_username}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge badge-${r.current_status}`}>
                        {STATUS_LABEL[r.current_status] || r.current_status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(r.last_checked_at)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {r.notification_sent ? (
                        <span className="badge badge-public">✓ 발송 완료</span>
                      ) : (
                        <span className="badge badge-unknown">대기중</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(r.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
          총 {requests.length}건 표시
        </p>
      </div>
    </main>
  );
}
