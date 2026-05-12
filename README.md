# 인스타 알리미 — MVP

비공개 인스타그램 계정이 공개로 전환되면 DM으로 알림을 보내는 서비스입니다.

## 실행

```bash
npm install
npm run dev   # http://localhost:3000
```

## 페이지

| 경로 | 설명 |
|------|------|
| `/` | 알림 신청 폼 |
| `/complete` | 신청 완료 |
| `/admin` | 관리자 (목록/통계/수동 체크) |

## API

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/register` | POST | 신청 등록 |
| `/api/admin/requests` | GET | 목록 조회 |
| `/api/admin/stats` | GET | 통계 |
| `/api/monitor` | POST | 수동 체크 실행 |

## 1시간 자동 체크 설정

**Vercel Cron (vercel.json):**
```json
{
  "crons": [{ "path": "/api/monitor?token=SECRET", "schedule": "0 * * * *" }]
}
```

**환경변수:** `CRON_SECRET=your-secret`

## 인스타그램 DM 연동

`lib/instagram.ts`의 두 함수를 실제 매크로로 교체:
- `checkInstagramStatus()` → Selenium/Playwright로 계정 상태 확인
- `sendNotificationDM()` → 실제 DM 발송

## 데이터베이스

현재: JSON 파일 (`./data/watch.db`)
운영 시: PostgreSQL/Supabase 교체 권장 (Vercel은 파일 시스템 비영속)

## 로드맵

- [ ] DM 매크로 연동
- [ ] 실패 로그
- [ ] 유료 플랜 (여러 계정 등록)
- [ ] Google AdSense
