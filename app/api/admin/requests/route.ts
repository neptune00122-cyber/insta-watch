import { NextRequest, NextResponse } from 'next/server';
import { getAllWatchRequests } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'all';
  const search = searchParams.get('search') || '';

  try {
    const requests = await getAllWatchRequests({ status, search });
    return NextResponse.json({ requests });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'DB 오류' }, { status: 500 });
  }
}
