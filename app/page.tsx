'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [targetId, setTargetId] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_username: targetId.replace('@', '').trim(),
          user_username: userId.replace('@', '').trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '오류가 발생했습니다.');
        return;
      }

      router.push('/complete');
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(10, 10, 15, 0.8)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), #ff6b35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>👁</div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>인스타 알리미</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
          베타
        </span>
      </header>

      {/* Hero */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px 40px' }}>
        <div style={{ maxWidth: 560, width: '100%' }}>
          {/* Hero Text */}
          <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--accent-soft)', border: '1px solid rgba(255,77,109,0.25)',
              borderRadius: 20, padding: '5px 14px', marginBottom: 20,
              fontSize: 12, color: 'var(--accent)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              1시간마다 자동 확인
            </div>

            <h1 className="font-display" style={{
              fontSize: 'clamp(42px, 10vw, 72px)',
              lineHeight: 1.05,
              marginBottom: 16,
              background: 'linear-gradient(135deg, #f0f0f8 30%, var(--accent) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              비공개 계정이<br />공개로 바뀌면<br />바로 알려드려요
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7, maxWidth: 420, margin: '0 auto' }}>
              궁금한 인스타그램 계정을 등록하면,<br />
              비공개 → 공개로 전환되는 순간<br />
              <strong style={{ color: 'var(--accent)' }}>인스타그램 DM</strong>으로 즉시 알림을 보내드립니다.
            </p>
          </div>

          {/* Form Card */}
          <div className="card animate-fade-up delay-2" style={{ padding: 32 }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                  알고 싶은 상대방 아이디
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', fontSize: 15, pointerEvents: 'none',
                  }}>@</span>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="instagram_username"
                    value={targetId}
                    onChange={e => setTargetId(e.target.value.replace('@', ''))}
                    required
                    style={{ paddingLeft: 34 }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  공개 전환 여부를 모니터링할 계정
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                  알림 받을 본인 아이디
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', fontSize: 15, pointerEvents: 'none',
                  }}>@</span>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="your_instagram_id"
                    value={userId}
                    onChange={e => setUserId(e.target.value.replace('@', ''))}
                    required
                    style={{ paddingLeft: 34 }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  전환 감지 시 DM 알림을 받을 본인 계정
                </p>
              </div>

              {error && (
                <div style={{
                  background: 'rgba(255,77,109,0.1)',
                  border: '1px solid rgba(255,77,109,0.3)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 16,
                  fontSize: 13,
                  color: '#ff6b8a',
                }}>
                  {error}
                </div>
              )}

              <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', fontSize: 15 }}>
                {loading ? '등록 중...' : '🔔 알림 신청하기'}
              </button>
            </form>

            <div style={{
              marginTop: 20,
              padding: '12px 16px',
              background: 'var(--bg-elevated)',
              borderRadius: 8,
              fontSize: 11,
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}>
              🔒 비밀번호나 로그인 정보는 절대 수집하지 않습니다.
            </div>
          </div>

          {/* How it works */}
          <div className="animate-fade-up delay-3" style={{ marginTop: 48 }}>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.1em' }}>작동 방식</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { icon: '📝', title: '등록', desc: '상대방 & 본인 아이디 입력' },
                { icon: '🔍', title: '모니터링', desc: '1시간마다 계정 상태 확인' },
                { icon: '📩', title: '알림', desc: '전환 즉시 인스타 DM 발송' },
              ].map((step) => (
                <div key={step.title} className="card" style={{ padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{step.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{step.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 32px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          © 2025 인스타 알리미 · 비밀번호 수집 없음 · 1시간 주기 모니터링
        </p>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </main>
  );
}
