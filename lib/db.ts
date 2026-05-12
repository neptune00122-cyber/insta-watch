import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'watch.db');
const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface WatchRequest {
  id: number;
  target_instagram_username: string;
  user_instagram_username: string;
  initial_status: 'private' | 'public' | 'unknown' | 'failed';
  current_status: 'private' | 'public' | 'unknown' | 'failed';
  last_checked_at: string | null;
  notification_sent: number; // 0 or 1
  notified_at: string | null;
  created_at: string;
}

// Simple JSON-based persistence as sql.js requires WASM
interface DBData {
  watch_requests: WatchRequest[];
  next_id: number;
}

function loadDB(): DBData {
  if (!fs.existsSync(DB_PATH)) {
    return { watch_requests: [], next_id: 1 };
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { watch_requests: [], next_id: 1 };
  }
}

function saveDB(data: DBData): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function createWatchRequest(
  target_instagram_username: string,
  user_instagram_username: string
): WatchRequest {
  const db = loadDB();
  const now = new Date().toISOString();
  const newRecord: WatchRequest = {
    id: db.next_id++,
    target_instagram_username: target_instagram_username.toLowerCase().replace('@', ''),
    user_instagram_username: user_instagram_username.toLowerCase().replace('@', ''),
    initial_status: 'unknown',
    current_status: 'unknown',
    last_checked_at: null,
    notification_sent: 0,
    notified_at: null,
    created_at: now,
  };
  db.watch_requests.push(newRecord);
  saveDB(db);
  return newRecord;
}

export function getAllWatchRequests(filters?: {
  status?: string;
  search?: string;
}): WatchRequest[] {
  const db = loadDB();
  let results = [...db.watch_requests];

  if (filters?.status && filters.status !== 'all') {
    results = results.filter((r) => r.current_status === filters.status);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (r) =>
        r.target_instagram_username.includes(q) ||
        r.user_instagram_username.includes(q)
    );
  }

  return results.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getWatchRequestById(id: number): WatchRequest | null {
  const db = loadDB();
  return db.watch_requests.find((r) => r.id === id) || null;
}

export function updateWatchRequest(
  id: number,
  updates: Partial<WatchRequest>
): WatchRequest | null {
  const db = loadDB();
  const idx = db.watch_requests.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  db.watch_requests[idx] = { ...db.watch_requests[idx], ...updates };
  saveDB(db);
  return db.watch_requests[idx];
}

export function getPendingRequests(): WatchRequest[] {
  const db = loadDB();
  return db.watch_requests.filter(
    (r) => r.current_status !== 'public' && r.notification_sent === 0
  );
}

export function getStats() {
  const db = loadDB();
  const all = db.watch_requests;
  return {
    total: all.length,
    private: all.filter((r) => r.current_status === 'private').length,
    public: all.filter((r) => r.current_status === 'public').length,
    unknown: all.filter((r) => r.current_status === 'unknown').length,
    failed: all.filter((r) => r.current_status === 'failed').length,
    notified: all.filter((r) => r.notification_sent === 1).length,
  };
}
