import { NextRequest, NextResponse } from 'next/server';
import { runMonitorCycle } from '@/lib/monitor';

export async function POST() {
  try {
    const result = await runMonitorCycle();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Monitor error:', error);
    return NextResponse.json({ error: '모니터링 실행 중 오류 발생' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (process.env.NODE_ENV === 'production' && token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runMonitorCycle();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: '오류 발생' }, { status: 500 });
  }
}
