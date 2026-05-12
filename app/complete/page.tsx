'use client';

import { useRouter } from 'next/navigation';

export default function CompletePage() {
  const router = useRouter();

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div className="card animate-fade-up" style={{ padding: '48px 40px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 24px',
          }}>✓</div>

          <h1 className="font-display" style={{ fontSize: 36, marginBottom: 16, color: '#4ade80' }}>
            등록 완료
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
            등록이 완료되었습니다.<br />
            해당 계정이 공개로 전환되면<br />
            <strong style={{ color: 'var(--text-primary)' }}>인스타그램 DM</strong>으로 알려드릴게요.
          </p>

          <div style={{
            background: 'var(--bg-elevated)',
            borderRadius: 10,
            padding: '14px 18px',
            fontSize: 13,
            color: 'var(--text-muted)',
            marginBottom: 28,
            lineHeight: 1.6,
          }}>
            🕐 1시간마다 자동으로 상태를 확인하고 있습니다
          </div>

          <button
            className="btn-primary"
            onClick={() => router.push('/')}
            style={{ width: '100%' }}
          >
            추가 등록하기
          </button>
        </div>
      </div>
    </main>
  );
}
