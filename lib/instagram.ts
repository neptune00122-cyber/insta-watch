/**
 * Instagram Account Status Checker
 * 
 * 실제 운영 시에는 매크로 시스템(Selenium, Playwright 등)으로 교체해야 합니다.
 * MVP에서는 공개 Instagram 프로필 URL로 기본 상태를 확인합니다.
 */

export type InstagramStatus = 'private' | 'public' | 'unknown' | 'failed';

export async function checkInstagramStatus(username: string): Promise<InstagramStatus> {
  try {
    const cleanUsername = username.toLowerCase().replace('@', '').trim();
    
    // Instagram 공개 프로필 페이지 요청
    const response = await fetch(`https://www.instagram.com/${cleanUsername}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 404) {
      return 'failed'; // 계정 없음
    }

    if (response.status !== 200) {
      return 'unknown';
    }

    const html = await response.text();

    // Instagram HTML에서 비공개 여부 판단
    if (html.includes('"is_private":true') || html.includes('"isPrivate":true')) {
      return 'private';
    }
    
    if (html.includes('"is_private":false') || html.includes('"isPrivate":false')) {
      return 'public';
    }

    // 추가 휴리스틱: 비공개 계정 표시
    if (html.includes('This Account is Private') || html.includes('비공개')) {
      return 'private';
    }

    // 프로필 데이터가 존재하면 공개 가능성 높음
    if (html.includes('"ProfilePage"') || html.includes('og:image')) {
      return 'public';
    }

    return 'unknown';
  } catch (error) {
    console.error(`Failed to check Instagram status for ${username}:`, error);
    return 'failed';
  }
}

/**
 * 알림 DM 발송 (매크로 시스템 연동 포인트)
 * 실제 운영 시 Selenium/Playwright 기반 DM 발송 로직으로 교체
 */
export async function sendNotificationDM(
  toUsername: string,
  targetUsername: string
): Promise<boolean> {
  try {
    // TODO: 실제 인스타그램 DM 발송 매크로 연동
    // 현재는 콘솔 로그로 대체
    const message = `등록하신 계정 @${targetUsername} 가 공개 계정으로 전환되었습니다.`;
    console.log(`[DM 발송] To: @${toUsername} | Message: ${message}`);
    
    // 실제 구현 예시:
    // await instagramMacro.sendDM(toUsername, message);
    
    return true;
  } catch (error) {
    console.error(`DM 발송 실패 (to: ${toUsername}):`, error);
    return false;
  }
}
