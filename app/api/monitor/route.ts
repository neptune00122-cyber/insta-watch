import { NextRequest, NextResponse } from 'next/server';
import { runMonitorCycle } from '@/lib/monitor';

// 수동으로 모니터링 사이클 실행 (관리자 전용)
export async function POST(req: NextRequest) {
  try {
    const result = await runMonitorCycle();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Monitor error:', error);
    return NextResponse.json({ error: '모니터링 실행 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// Vercel Cron Job 또는 외부 cron 서비스에서 GET으로 호출 가능
export async function GET(req: NextRequest) {
  // 간단한 토큰 인증
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  
  if (token !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runMonitorCycle();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: '오류 발생' }, { status: 500 });
  }
}
