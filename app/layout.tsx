import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '인스타 알리미 — 비공개 계정 공개 전환 알림',
  description: '상대방 인스타그램 계정이 비공개에서 공개로 전환되는 순간을 실시간으로 알려드립니다.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="blob-bg">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
