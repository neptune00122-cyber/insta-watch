import { getPendingRequests, updateWatchRequest } from './db';
import { checkInstagramStatus, sendNotificationDM } from './instagram';

let isRunning = false;

export async function runMonitorCycle() {
  if (isRunning) return { checked: 0, statusChanged: 0, notified: 0, errors: 0 };

  isRunning = true;
  const stats = { checked: 0, statusChanged: 0, notified: 0, errors: 0 };

  try {
    const pendingRequests = await getPendingRequests();
    console.log(`[Monitor] 체크 시작: ${pendingRequests.length}개`);

    for (const request of pendingRequests) {
      try {
        const now = new Date().toISOString();
        const newStatus = await checkInstagramStatus(request.target_instagram_username);
        stats.checked++;

        const becamePublic = newStatus === 'public' && request.current_status !== 'public';

        await updateWatchRequest(request.id, {
          current_status: newStatus,
          last_checked_at: now,
        });

        if (newStatus !== request.current_status) stats.statusChanged++;

        if (becamePublic && !request.notification_sent) {
          const ok = await sendNotificationDM(
            request.user_instagram_username,
            request.target_instagram_username
          );
          if (ok) {
            await updateWatchRequest(request.id, {
              notification_sent: true,
              notified_at: now,
            });
            stats.notified++;
          } else {
            stats.errors++;
          }
        }

        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        stats.errors++;
        console.error(`[Monitor] 오류 (id: ${request.id}):`, err);
        await updateWatchRequest(request.id, {
          current_status: 'failed',
          last_checked_at: new Date().toISOString(),
        });
      }
    }
  } finally {
    isRunning = false;
  }

  console.log(`[Monitor] 완료:`, stats);
  return stats;
}
