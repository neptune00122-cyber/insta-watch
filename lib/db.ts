import { getSupabase } from './supabase';

export interface WatchRequest {
  id: number;
  target_instagram_username: string;
  user_instagram_username: string;
  initial_status: 'private' | 'public' | 'unknown' | 'failed';
  current_status: 'private' | 'public' | 'unknown' | 'failed';
  last_checked_at: string | null;
  notification_sent: boolean;
  notified_at: string | null;
  created_at: string;
}

export async function createWatchRequest(
  target_instagram_username: string,
  user_instagram_username: string
): Promise<WatchRequest> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('watch_requests')
    .insert({
      target_instagram_username: target_instagram_username.toLowerCase().replace('@', ''),
      user_instagram_username: user_instagram_username.toLowerCase().replace('@', ''),
      initial_status: 'unknown',
      current_status: 'unknown',
      notification_sent: false,
    })
    .select()
    .single();

  if (error) throw new Error(`DB insert 오류: ${error.message}`);
  return data as WatchRequest;
}

export async function getAllWatchRequests(filters?: {
  status?: string;
  search?: string;
}): Promise<WatchRequest[]> {
  const supabase = getSupabase();
  let query = supabase
    .from('watch_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('current_status', filters.status);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    query = query.or(
      `target_instagram_username.ilike.%${q}%,user_instagram_username.ilike.%${q}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(`DB select 오류: ${error.message}`);
  return (data || []) as WatchRequest[];
}

export async function getWatchRequestById(id: number): Promise<WatchRequest | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('watch_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as WatchRequest;
}

export async function updateWatchRequest(
  id: number,
  updates: Partial<WatchRequest>
): Promise<WatchRequest | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('watch_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`DB update 오류: ${error.message}`);
  return data as WatchRequest;
}

export async function getPendingRequests(): Promise<WatchRequest[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('watch_requests')
    .select('*')
    .neq('current_status', 'public')
    .eq('notification_sent', false);

  if (error) throw new Error(`DB select 오류: ${error.message}`);
  return (data || []) as WatchRequest[];
}

export async function getStats() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('watch_requests')
    .select('current_status, notification_sent');

  if (error) throw new Error(`DB stats 오류: ${error.message}`);
  const all = data || [];

  return {
    total: all.length,
    private: all.filter(r => r.current_status === 'private').length,
    public: all.filter(r => r.current_status === 'public').length,
    unknown: all.filter(r => r.current_status === 'unknown').length,
    failed: all.filter(r => r.current_status === 'failed').length,
    notified: all.filter(r => r.notification_sent === true).length,
  };
}
