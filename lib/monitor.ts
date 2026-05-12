import { getPendingRequests, updateWatchRequest } from './db';
import { checkInstagramStatus, sendNotificationDM } from './instagram';

let isRunning = false;

export async function runMonitorCycle(): Promise<{
  checked: number;
  statusChanged: number;
  notified: number;
  errors: number;
}> {
  if (isRunning) {
    console.log('[Monitor] 이미 실행 중입니다. 건너뜁니다.');
    return { checked: 0, statusChanged: 0, notified: 0, errors: 0 };
  }

  isRunning = true;
  const stats = { checked: 0, statusChanged: 0, notified: 0, errors: 0 };

  try {
    const pendingRequests = getPendingRequests();
    console.log(`[Monitor] 체크 시작: ${pendingRequests.length}개 요청`);

    for (const request of pendingRequests) {
      try {
        const now = new Date().toISOString();
        const newStatus = await checkInstagramStatus(request.target_instagram_username);
        
        stats.checked++;

        const statusChanged = newStatus !== request.current_status;
        const becamePublic = newStatus === 'public' && request.current_status !== 'public';

        // 상태 업데이트
        await updateWatchRequest(request.id, {
          current_status: newStatus,
          last_checked_at: now,
          ...(request.initial_status === 'unknown' && stats.checked === 1
            ? { initial_status: newStatus }
            : {}),
        });

        if (statusChanged) {
          stats.statusChanged++;
          console.log(
            `[Monitor] @${request.target_instagram_username}: ${request.current_status} → ${newStatus}`
          );
        }

        // 비공개 → 공개 전환 감지 및 DM 발송
        if (becamePublic && !request.notification_sent) {
          const dmSuccess = await sendNotificationDM(
            request.user_instagram_username,
            request.target_instagram_username
          );

          if (dmSuccess) {
            await updateWatchRequest(request.id, {
              notification_sent: 1,
              notified_at: now,
            });
            stats.notified++;
            console.log(
              `[Monitor] DM 발송 성공: @${request.user_instagram_username}`
            );
          } else {
            stats.errors++;
          }
        }

        // 요청 간 딜레이 (Instagram 봇 감지 방지)
        await new Promise((resolve) => setTimeout(resolve, 2000));
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

  console.log(`[Monitor] 완료: ${JSON.stringify(stats)}`);
  return stats;
}
