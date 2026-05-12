import { NextRequest, NextResponse } from 'next/server';
import { createWatchRequest, updateWatchRequest } from '@/lib/db';
import { checkInstagramStatus } from '@/lib/instagram';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { target_username, user_username } = body;

    if (!target_username || !user_username) {
      return NextResponse.json(
        { error: '상대방 아이디와 본인 아이디를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    const instagramUsernameRegex = /^[a-zA-Z0-9._]{1,30}$/;
    const cleanTarget = target_username.replace('@', '').trim();
    const cleanUser = user_username.replace('@', '').trim();

    if (!instagramUsernameRegex.test(cleanTarget)) {
      return NextResponse.json(
        { error: '올바른 인스타그램 아이디 형식이 아닙니다. (영문, 숫자, ., _ 만 사용 가능)' },
        { status: 400 }
      );
    }

    if (!instagramUsernameRegex.test(cleanUser)) {
      return NextResponse.json(
        { error: '올바른 인스타그램 아이디 형식이 아닙니다. (영문, 숫자, ., _ 만 사용 가능)' },
        { status: 400 }
      );
    }

    const record = await createWatchRequest(cleanTarget, cleanUser);

    // 초기 상태 체크 (백그라운드)
    checkInstagramStatus(cleanTarget).then(async (status) => {
      await updateWatchRequest(record.id, {
        initial_status: status,
        current_status: status,
        last_checked_at: new Date().toISOString(),
      });
    }).catch(console.error);

    return NextResponse.json({ success: true, id: record.id });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
