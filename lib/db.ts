import { kv } from '@vercel/kv';

export interface WatchRequest {
  id: number;
  target_instagram_username: string;
  user_instagram_username: string;
  initial_status: 'private' | 'public' | 'unknown' | 'failed';
  current_status: 'private' | 'public' | 'unknown' | 'failed';
  last_checked_at: string | null;
  notification_sent: number;
  notified_at: string | null;
  created_at: string;
}

// 고유 ID 생성
async function getNextId(): Promise<number> {
  const id = await kv.incr('watch:next_id');
  return id;
}

export async function createWatchRequest(
  target_instagram_username: string,
  user_instagram_username: string
): Promise<WatchRequest> {
  const id = await getNextId();
  const now = new Date().toISOString();

  const record: WatchRequest = {
    id,
    target_instagram_username: target_instagram_username.toLowerCase().replace('@', ''),
    user_instagram_username: user_instagram_username.toLowerCase().replace('@', ''),
    initial_status: 'unknown',
    current_status: 'unknown',
    last_checked_at: null,
    notification_sent: 0,
    notified_at: null,
    created_at: now,
  };

  // 개별 레코드 저장
  await kv.set(`watch:req:${id}`, JSON.stringify(record));
  // 전체 ID 목록에 추가
  await kv.zadd('watch:ids', { score: id, member: String(id) });

  return record;
}

export async function getAllWatchRequests(filters?: {
  status?: string;
  search?: string;
}): Promise<WatchRequest[]> {
  // 전체 ID 목록 조회 (최신순)
  const ids = await kv.zrange('watch:ids', 0, -1, { rev: true });
  if (!ids || ids.length === 0) return [];

  // 각 레코드 조회
  const keys = (ids as string[]).map(id => `watch:req:${id}`);
  const records = await kv.mget<string[]>(...keys);

  let results: WatchRequest[] = records
    .filter(Boolean)
    .map(r => JSON.parse(r as string) as WatchRequest);

  if (filters?.status && filters.status !== 'all') {
    results = results.filter(r => r.current_status === filters.status);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      r =>
        r.target_instagram_username.includes(q) ||
        r.user_instagram_username.includes(q)
    );
  }

  return results;
}

export async function getWatchRequestById(id: number): Promise<WatchRequest | null> {
  const raw = await kv.get<string>(`watch:req:${id}`);
  if (!raw) return null;
  return JSON.parse(raw as string) as WatchRequest;
}

export async function updateWatchRequest(
  id: number,
  updates: Partial<WatchRequest>
): Promise<WatchRequest | null> {
  const existing = await getWatchRequestById(id);
  if (!existing) return null;

  const updated = { ...existing, ...updates };
  await kv.set(`watch:req:${id}`, JSON.stringify(updated));
  return updated;
}

export async function getPendingRequests(): Promise<WatchRequest[]> {
  const all = await getAllWatchRequests();
  return all.filter(r => r.current_status !== 'public' && r.notification_sent === 0);
}

export async function getStats() {
  const all = await getAllWatchRequests();
  return {
    total: all.length,
    private: all.filter(r => r.current_status === 'private').length,
    public: all.filter(r => r.current_status === 'public').length,
    unknown: all.filter(r => r.current_status === 'unknown').length,
    failed: all.filter(r => r.current_status === 'failed').length,
    notified: all.filter(r => r.notification_sent === 1).length,
  };
}
